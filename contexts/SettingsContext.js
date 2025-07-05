import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [companyName, setCompanyName] = useState('Ma Société Ferroviaire');
  const [companySlogan, setCompanySlogan] = useState('Le transport ferroviaire simplifié');
  const [companyDescription, setCompanyDescription] = useState('Description de la société ferroviaire...');
  const [primaryColor, setPrimaryColor] = useState('#007bff');
  const [secondaryColor, setSecondaryColor] = useState('#6c757d');
  const [accentColor, setAccentColor] = useState('#28a745');
  const [appName, setAppName] = useState('Train Schedule Management');
  const [logoUrl, setLogoUrl] = useState('/images/logo-ter-mobigo.svg');
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [buttonStyle, setButtonStyle] = useState('rounded');
  const [headerStyle, setHeaderStyle] = useState('default');
  const [footerContent, setFooterContent] = useState('© 2024 Ma Société Ferroviaire');
  const [footerRegions, setFooterRegions] = useState([]);
  const [customCss, setCustomCss] = useState('');
  const [servedStationsLines, setServedStationsLines] = useState(2);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/entreprise');
        if (response.ok) {
          const data = await response.json();
          const settings = data.entrepriseSettings || {};
          setCompanyName(settings.company_name || 'Ma Société Ferroviaire');
          setCompanySlogan(settings.company_slogan || 'Le transport ferroviaire simplifié');
          setCompanyDescription(settings.company_description || 'Description de la société ferroviaire...');
          setPrimaryColor(settings.primary_color || '#007bff');
          setSecondaryColor(settings.secondary_color || '#6c757d');
          setAccentColor(settings.accent_color || '#28a745');
          setAppName(settings.app_name || 'Train Schedule Management');
          setLogoUrl(settings.logo_url || '/images/logo-ter-mobigo.svg');
          setFaviconUrl(settings.favicon_url || '/favicon.ico');
          setFontFamily(settings.font_family || 'Inter');
          setButtonStyle(settings.button_style || 'rounded');
          setHeaderStyle(settings.header_style || 'default');
          setFooterContent(settings.footer_content || '© 2024 Ma Société Ferroviaire');
          setFooterRegions(data.footerRegions || []);
          setCustomCss(settings.custom_css || '');
          setServedStationsLines(settings.served_stations_lines !== undefined ? settings.served_stations_lines : 2);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    }
    fetchSettings();
  }, []);

  // Apply custom CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--font-family', fontFamily);
    
    // Apply custom CSS if any
    let styleElement = document.getElementById('custom-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = customCss;
  }, [primaryColor, secondaryColor, accentColor, fontFamily, customCss]);

  return (
    <SettingsContext.Provider
      value={{
        companyName,
        setCompanyName,
        companySlogan,
        setCompanySlogan,
        companyDescription,
        setCompanyDescription,
        primaryColor,
        setPrimaryColor,
        secondaryColor,
        setSecondaryColor,
        accentColor,
        setAccentColor,
        appName,
        setAppName,
        logoUrl,
        setLogoUrl,
        faviconUrl,
        setFaviconUrl,
        fontFamily,
        setFontFamily,
        buttonStyle,
        setButtonStyle,
        headerStyle,
        setHeaderStyle,
        footerContent,
        setFooterContent,
        footerRegions,
        setFooterRegions,
        customCss,
        setCustomCss,
        servedStationsLines,
        setServedStationsLines,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
