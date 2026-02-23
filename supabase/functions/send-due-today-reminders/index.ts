import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.96.0';

type DueRow = {
  user_id: string;
  subscription_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  pending_count: number;
  last_sent_on: string | null;
};

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
    ...init,
  });
}

function toDateOnlyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@dosebase.app';
    const cronSecret = Deno.env.get('CRON_SECRET');

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }
    if (!vapidPublicKey || !vapidPrivateKey) {
      return json({ error: 'Missing VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY' }, { status: 500 });
    }

    if (cronSecret) {
      const got = req.headers.get('x-cron-secret');
      if (!got || got !== cronSecret) return json({ error: 'Unauthorized' }, { status: 401 });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const url = new URL(req.url);
    const date = url.searchParams.get('date') || toDateOnlyUTC(new Date());

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabaseAdmin.rpc('get_users_with_due_protocols', { p_date: date });
    if (error) return json({ error: error.message }, { status: 500 });

    const rows = (data ?? []) as DueRow[];

    let attempted = 0;
    let sent = 0;
    let skipped = 0;
    let deleted = 0;
    const errors: Array<{ endpoint: string; error: string; statusCode?: number }> = [];

    for (const row of rows) {
      if (row.last_sent_on === date) {
        skipped++;
        continue;
      }

      attempted++;
      const subscription = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth_key },
      };

      const payload = JSON.stringify({
        title: 'Dosebase reminder',
        body: `You have ${row.pending_count} protocol${row.pending_count === 1 ? '' : 's'} due today.`,
      });

      try {
        await webpush.sendNotification(subscription as unknown as webpush.PushSubscription, payload, {
          TTL: 60 * 60,
        });

        await supabaseAdmin
          .from('push_subscriptions')
          .update({ last_sent_on: date })
          .eq('id', row.subscription_id);

        sent++;
      } catch (err) {
        const anyErr = err as { statusCode?: number; body?: string; message?: string };
        const statusCode = anyErr.statusCode;

        // Subscription is gone/expired: delete it.
        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', row.subscription_id);
          deleted++;
          continue;
        }

        errors.push({
          endpoint: row.endpoint,
          error: anyErr.message ?? anyErr.body ?? 'Failed to send',
          statusCode,
        });
      }
    }

    return json({ date, attempted, sent, skipped, deleted, errors, total_due_rows: rows.length });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
});

