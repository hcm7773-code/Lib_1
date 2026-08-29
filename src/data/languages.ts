import { LanguageOption, LanguageCode } from '../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'zh-TW',
    name: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    speechCode: 'zh-TW',
  },
  {
    code: 'en',
    name: '英文',
    nativeName: 'English',
    flag: '🇺🇸',
    speechCode: 'en-US',
  },
  {
    code: 'ja',
    name: '日文',
    nativeName: '日本語',
    flag: '🇯🇵',
    speechCode: 'ja-JP',
  },
  {
    code: 'fr',
    name: '法文',
    nativeName: 'Français',
    flag: '🇫🇷',
    speechCode: 'fr-FR',
  },
  {
    code: 'es',
    name: '西班牙文',
    nativeName: 'Español',
    flag: '🇪🇸',
    speechCode: 'es-ES',
  },
  {
    code: 'de',
    name: '德文',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    speechCode: 'de-DE',
  },
  {
    code: 'ko',
    name: '韓文',
    nativeName: '한국어',
    flag: '🇰🇷',
    speechCode: 'ko-KR',
  },
  {
    code: 'vi',
    name: '越南文',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    speechCode: 'vi-VN',
  },
];

export const getLanguageByCode = (code: string): LanguageOption => {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
};
