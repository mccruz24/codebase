// Supabase Edge Function: push-reminders
// Schedule: daily cron (configure via Supabase Dashboard → Edge Functions → Schedules)
// Recommended cron: "0 13 * * *" (13:00 UTC ≈ 8 AM EST / 9 AM CST)
//
// This function:
// 1. Queries all users with push enabled + protocols due today + not yet logged
// 2. Sends Web Push notifications to each user's subscribed browsers

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:help@aestheticlog.com";

// ─── Web Push crypto helpers (minimal, no npm dependency) ─────

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importVapidKeys() {
  const rawPrivate = base64UrlDecode(VAPID_PRIVATE_KEY);
  const rawPublic = base64UrlDecode(VAPID_PUBLIC_KEY);

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    await buildPkcs8(rawPrivate, rawPublic),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  return { privateKey, rawPublic };
}

/** Build PKCS8 DER from raw 32-byte private key + 65-byte uncompressed public key */
async function buildPkcs8(
  rawPrivate: Uint8Array,
  rawPublic: Uint8Array
): Promise<ArrayBuffer> {
  // Import as JWK first, then export as PKCS8 — most compatible approach
  const x = base64UrlEncode(rawPublic.slice(1, 33));
  const y = base64UrlEncode(rawPublic.slice(33, 65));
  const d = base64UrlEncode(rawPrivate);

  const jwk = { kty: "EC", crv: "P-256", x, y, d };
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );
  return crypto.subtle.exportKey("pkcs8", key);
}

/** Create a signed VAPID JWT */
async function createVapidJwt(
  audience: string,
  privateKey: CryptoKey
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 60 * 60 * 12, // 12 hours
    sub: VAPID_SUBJECT,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsigned)
  );

  // Convert DER signature to raw r||s (64 bytes)
  const rawSig = derToRaw(new Uint8Array(sig));
  return `${unsigned}.${base64UrlEncode(rawSig)}`;
}

function derToRaw(der: Uint8Array): Uint8Array {
  // DER: 0x30 <len> 0x02 <rlen> <r> 0x02 <slen> <s>
  const raw = new Uint8Array(64);
  let offset = 2; // skip 0x30 + total length
  const rLen = der[offset + 1];
  const rStart = offset + 2 + (rLen - 32 > 0 ? rLen - 32 : 0);
  const rEnd = offset + 2 + rLen;
  raw.set(der.slice(rStart, rEnd), 32 - (rEnd - rStart));

  offset = rEnd;
  const sLen = der[offset + 1];
  const sStart = offset + 2 + (sLen - 32 > 0 ? sLen - 32 : 0);
  const sEnd = offset + 2 + sLen;
  raw.set(der.slice(sStart, sEnd), 64 - (sEnd - sStart));

  return raw;
}

/** Send a single Web Push message */
async function sendWebPush(
  endpoint: string,
  p256dh: string,
  authKey: string,
  payload: string,
  vapidPrivateKey: CryptoKey,
  vapidPublicRaw: Uint8Array
): Promise<{ ok: boolean; status: number }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await createVapidJwt(audience, vapidPrivateKey);

  // Encrypt payload using Web Push encryption (aes128gcm)
  const encrypted = await encryptPayload(p256dh, authKey, payload);

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${base64UrlEncode(vapidPublicRaw)}`,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      Urgency: "normal",
    },
    body: encrypted,
  });

  return { ok: resp.ok, status: resp.status };
}

/** Encrypt the push payload with aes128gcm per RFC 8291 */
async function encryptPayload(
  p256dhB64: string,
  authB64: string,
  plaintext: string
): Promise<Uint8Array> {
  const userPublicKeyBytes = base64UrlDecode(p256dhB64);
  const userAuthBytes = base64UrlDecode(authB64);

  // Generate ephemeral ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  const localPublicRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  // Import user's public key
  const userPublicKey = await crypto.subtle.importKey(
    "raw",
    userPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: userPublicKey },
      localKeyPair.privateKey,
      256
    )
  );

  // HKDF: auth_secret → IKM
  const authInfo = new TextEncoder().encode("WebPush: info\0");
  const authInfoFull = new Uint8Array(authInfo.length + userPublicKeyBytes.length + localPublicRaw.length);
  authInfoFull.set(authInfo);
  authInfoFull.set(userPublicKeyBytes, authInfo.length);
  authInfoFull.set(localPublicRaw, authInfo.length + userPublicKeyBytes.length);

  const ikm = await hkdf(userAuthBytes, sharedSecret, authInfoFull, 32);

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive CEK and nonce
  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
  const cek = await hkdf(salt, ikm, cekInfo, 16);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // Pad plaintext (1 byte delimiter + padding)
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const padded = new Uint8Array(plaintextBytes.length + 1);
  padded.set(plaintextBytes);
  padded[plaintextBytes.length] = 2; // delimiter

  // AES-128-GCM encrypt
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, padded)
  );

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const rs = padded.length + 16; // record size = plaintext + tag(16)
  const header = new Uint8Array(16 + 4 + 1 + localPublicRaw.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, rs, false);
  header[20] = localPublicRaw.length;
  header.set(localPublicRaw, 21);

  const result = new Uint8Array(header.length + ciphertext.length);
  result.set(header);
  result.set(ciphertext, header.length);
  return result;
}

async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

// ─── Main handler ─────────────────────────────────────────────

const CRON_SECRET = Deno.env.get("CRON_SECRET");

Deno.serve(async (req) => {
  // Allow manual trigger via POST or cron invocation
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verify cron secret to prevent unauthorized invocations
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { privateKey, rawPublic } = await importVapidKeys();

  // Get all users with due protocols and push subscriptions
  const { data: rows, error } = await supabase.rpc("get_users_with_due_protocols");
  if (error) {
    console.error("RPC error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return Response.json({ sent: 0, message: "No notifications to send" });
  }

  const today = new Date().toISOString().split("T")[0];
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];
  const sentSubscriptionIds: string[] = [];

  for (const row of rows) {
    // De-dupe: skip if already sent today
    if (row.last_sent_on === today) {
      skipped++;
      continue;
    }

    const payload = JSON.stringify({
      title: "Dosebase reminder",
      body: `You have ${row.pending_count} protocol${row.pending_count === 1 ? "" : "s"} due today.`,
    });

    try {
      const result = await sendWebPush(
        row.endpoint,
        row.p256dh,
        row.auth_key,
        payload,
        privateKey,
        rawPublic
      );

      if (result.ok) {
        sent++;
        sentSubscriptionIds.push(row.subscription_id);
      } else if (result.status === 404 || result.status === 410) {
        // Subscription expired or unsubscribed — clean up
        staleEndpoints.push(row.endpoint);
        failed++;
      } else {
        console.error(`Push failed for ${row.endpoint}: HTTP ${result.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`Push error for ${row.endpoint}:`, err);
      failed++;
    }
  }

  // Mark successfully sent subscriptions with today's date
  if (sentSubscriptionIds.length > 0) {
    await supabase
      .from("push_subscriptions")
      .update({ last_sent_on: today })
      .in("id", sentSubscriptionIds);
  }

  // Clean up stale subscriptions
  if (staleEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", staleEndpoints);
  }

  return Response.json({ sent, skipped, failed, cleaned: staleEndpoints.length });
});
