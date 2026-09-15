import {createTranslator} from "./I18nProvider";
import {DEFAULT_LOCALE} from "./locales";

/** English translator for non-React helpers and tests. */
export const {t: englishT, tList: englishTList} =
  createTranslator(DEFAULT_LOCALE);
