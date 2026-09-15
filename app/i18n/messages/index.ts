import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {en} from "./en";
import {vi} from "./vi";
import {pt} from "./pt";
import {es} from "./es";
import {ja} from "./ja";
import {ko} from "./ko";
import {zh} from "./zh";

export const messageCatalogs: Record<SupportedLocale, MessageTree> = {
  en,
  vi,
  pt,
  es,
  ja,
  zh,
  ko,
};

export {en, zh, ko, ja, es, pt, vi};
