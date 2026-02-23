export type UiPalette = {
  background: string;
  card: string;
  cardBorder: string;
  field: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  iconInactive: string;
  primary: string;
  primaryText: string;
  pastelBlue: string;
  pastelGreen: string;
  pastelYellow: string;
  // compatibility aliases while native parity is in progress
  title: string;
  body: string;
  muted: string;
  cardBg: string;
  fieldBg: string;
};

export const UI_LAYOUT = {
  pagePadding: 24,
  tabPageTopPadding: 8,
  sectionGap: 24,
  cardRadiusLg: 32,
  cardRadiusMd: 24,
  chipRadius: 12,
  pillRadius: 999,
} as const;

export function getUiPalette(isDark: boolean): UiPalette {
  if (isDark) {
    const dark = {
      background: '#0C0A09',
      card: '#1C1917',
      cardBorder: '#292524',
      field: '#292524',
      textPrimary: '#FAFAF9',
      textSecondary: '#D6D3D1',
      textMuted: '#A8A29E',
      iconInactive: '#78716C',
      primary: '#FAFAF9',
      primaryText: '#0C0A09',
      pastelBlue: '#CBE4F9',
      pastelGreen: '#CDF5E3',
      pastelYellow: '#FDF4C4',
    };
    return {
      ...dark,
      title: dark.textPrimary,
      body: dark.textSecondary,
      muted: dark.textMuted,
      cardBg: dark.card,
      fieldBg: dark.field,
    };
  }

  const light = {
    background: '#F8F9FB',
    card: '#FFFFFF',
    cardBorder: '#FAFAF9',
    field: '#F5F5F4',
    textPrimary: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#A8A29E',
    iconInactive: '#D6D3D1',
    primary: '#1C1917',
    primaryText: '#FFFFFF',
    pastelBlue: '#CBE4F9',
    pastelGreen: '#CDF5E3',
    pastelYellow: '#FDF4C4',
  };
  return {
    ...light,
    title: light.textPrimary,
    body: light.textSecondary,
    muted: light.textMuted,
    cardBg: light.card,
    fieldBg: light.field,
  };
}
