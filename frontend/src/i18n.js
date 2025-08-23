import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appTitle: 'Artist Showcase',
      dashboard: 'Dashboard',
      gallery: 'Gallery',
      uploadArt: 'Upload Art',
      styleTransfer: 'Style Transfer',
      aiDrawGame: 'AI Draw Game',
      cart: 'Cart',
      welcome: 'Welcome, {{name}}!',
      logout: 'Logout',
      enhance: 'Enhance',
      exportCompliance: 'Export Compliance',
      artists: 'Artists',
      profile: 'My Profile',
    }
  },
  hi: {
    translation: {
      appTitle: 'कलाकार प्रदर्शन',
      dashboard: 'डैशबोर्ड',
      gallery: 'गैलरी',
      uploadArt: 'कला अपलोड करें',
      styleTransfer: 'स्टाइल ट्रांसफर',
      aiDrawGame: 'एआई ड्रॉ गेम',
      cart: 'कार्ट',
      welcome: 'स्वागत है, {{name}}!',
      logout: 'लॉगआउट',
      enhance: 'इन्हांस',
      exportCompliance: 'निर्यात अनुपालन',
      artists: 'कलाकार',
      profile: 'मेरी प्रोफाइल',
    }
  },
  kn: {
    translation: {
      appTitle: 'ಕಲಾವಿದ ಪ್ರದರ್ಶನ',
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      gallery: 'ಗ್ಯಾಲರಿ',
      uploadArt: 'ಕಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      styleTransfer: 'ಶೈಲಿ ವರ್ಗಾವಣೆ',
      aiDrawGame: 'AI ಡ್ರಾ ಗೇಮ್',
      cart: 'ಕಾರ್ಟ್',
      welcome: 'ಸ್ವಾಗತ, {{name}}!',
      logout: 'ಲಾಗ್ ಔಟ್',
      enhance: 'ಎನ್ಹಾನ್ಸ್',
      exportCompliance: 'ರಫ್ತು ಅನುಸರಣೆ',
      artists: 'ಕಲಾವಿದರು',
      profile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
