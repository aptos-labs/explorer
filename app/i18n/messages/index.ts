import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {en} from "./en";
import {ja} from "./ja";
import {ko} from "./ko";
import {zh} from "./zh";

export const messageCatalogs: Record<SupportedLocale, MessageTree> = {
  en,
  ja,
  zh,
  ko,
};

export {en, zh, ko, ja};
