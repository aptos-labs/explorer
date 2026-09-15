import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {en} from "./en";
import {ko} from "./ko";
import {zh} from "./zh";

export const messageCatalogs: Record<SupportedLocale, MessageTree> = {
  en,
  zh,
  ko,
};

export {en, zh, ko};
