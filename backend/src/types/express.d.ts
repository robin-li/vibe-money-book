import { SupportedLanguage } from '../i18n';

declare global {
  namespace Express {
    interface Request {
      locale?: SupportedLanguage;
    }
  }
}
