import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {en} from "./en";
import {zh} from "./zh";

export const messageCatalogs: Record<SupportedLocale, MessageTree> = {
  en,
  zh,
};

export {en, zh};
