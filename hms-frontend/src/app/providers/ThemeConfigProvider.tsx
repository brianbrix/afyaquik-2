import React, { useEffect } from 'react';
import { useTenantTheme } from '../../services/configApi';

export const ThemeConfigProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { data: theme } = useTenantTheme();

  useEffect(() => {
    if (theme?.primaryColor) {
      document.documentElement.style.setProperty('--aq-primary', theme.primaryColor);
      
      // Convert hex to RGB for better CSS support
      const hex = theme.primaryColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      document.documentElement.style.setProperty('--aq-primary-rgb', `${r}, ${g}, ${b}`);
    } else {
      // Set fallback colors for rgb(10,111,253) if no theme is loaded
      document.documentElement.style.setProperty('--aq-primary', 'rgb(10, 111, 253)');
      document.documentElement.style.setProperty('--aq-primary-rgb', '10, 111, 253');
    }
  }, [theme?.primaryColor]);

  return <>{children}</>;
};
