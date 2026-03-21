import { Request, Response, NextFunction } from 'express';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, isSupportedLanguage } from '../i18n';

/**
 * Parse Accept-Language header and inject req.locale.
 * Picks the first supported language from the header, falls back to DEFAULT_LANGUAGE.
 */
export function localeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const acceptLanguage = req.headers['accept-language'];

  if (acceptLanguage) {
    // Parse Accept-Language header: e.g. "en-US,en;q=0.9,zh-TW;q=0.8"
    const candidates = acceptLanguage
      .split(',')
      .map((part) => {
        const [lang, qPart] = part.trim().split(';');
        const q = qPart ? parseFloat(qPart.replace('q=', '')) : 1;
        return { lang: lang.trim(), q };
      })
      .sort((a, b) => b.q - a.q);

    for (const candidate of candidates) {
      // Exact match
      if (isSupportedLanguage(candidate.lang)) {
        req.locale = candidate.lang;
        next();
        return;
      }
      // Try prefix match (e.g. "en-US" -> "en")
      const prefix = candidate.lang.split('-')[0];
      const matched = SUPPORTED_LANGUAGES.find(
        (supported) => supported === prefix || supported.startsWith(prefix + '-')
      );
      if (matched) {
        req.locale = matched;
        next();
        return;
      }
    }
  }

  req.locale = DEFAULT_LANGUAGE;
  next();
}
