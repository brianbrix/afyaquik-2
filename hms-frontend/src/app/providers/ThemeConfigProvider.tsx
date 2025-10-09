import React, { useEffect } from 'react';
import { useTenantTheme } from '../../services/configApi';

export const ThemeConfigProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { data: theme } = useTenantTheme();

  useEffect(() => {
    if (theme?.primaryColor) {
      document.documentElement.style.setProperty('--aq-primary', theme.primaryColor);
    }
  }, [theme?.primaryColor]);

  return <>{children}</>;
};
