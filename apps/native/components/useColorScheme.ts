import { useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { ProfileContext } from '@/contexts/ProfileContext';

export function useColorScheme() {
  const system = useSystemColorScheme();
  const profileCtx = useContext(ProfileContext);
  const theme = profileCtx?.profile?.theme ?? 'system';
  if (theme === 'system') return system;
  return theme;
}
