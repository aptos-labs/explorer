import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {ar} from "./ar";
import {de} from "./de";
import {en} from "./en";
import {es} from "./es";
import {fil} from "./fil";
import {fr} from "./fr";
import {hi} from "./hi";
import {ja} from "./ja";
import {ko} from "./ko";
import {pt} from "./pt";
import {ru} from "./ru";
import {zh} from "./zh";

export const messageCatalogs: Record<SupportedLocale, MessageTree> = {
  en,
  zh,
  fil,
  es,
  fr,
  de,
  ja,
  ko,
  ru,
  pt,
  ar,
  hi,
};

export {ar, de, en, es, fil, fr, hi, ja, ko, pt, ru, zh};
