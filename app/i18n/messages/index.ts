import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {ar} from "./ar";
import {am} from "./am";
import {bn} from "./bn";
import {de} from "./de";
import {en} from "./en";
import {es} from "./es";
import {fil} from "./fil";
import {fr} from "./fr";
import {ha} from "./ha";
import {he} from "./he";
import {hi} from "./hi";
import {id} from "./id";
import {it} from "./it";
import {ja} from "./ja";
import {ko} from "./ko";
import {ms} from "./ms";
import {nl} from "./nl";
import {pl} from "./pl";
import {pt} from "./pt";
import {ptPT} from "./pt-PT";
import {ru} from "./ru";
import {sw} from "./sw";
import {ta} from "./ta";
import {th} from "./th";
import {tr} from "./tr";
import {uk} from "./uk";
import {ur} from "./ur";
import {vi} from "./vi";
import {zh} from "./zh";
import {zhHant} from "./zh-Hant";
import {zu} from "./zu";

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
  th,
  id,
  vi,
  tr,
  bn,
  sw,
  "zh-Hant": zhHant,
  it,
  ms,
  ta,
  uk,
  nl,
  pl,
  he,
  ur,
  "pt-PT": ptPT,
  ha,
  zu,
  am,
};

export {
  am,
  ar,
  bn,
  de,
  en,
  es,
  fil,
  fr,
  ha,
  he,
  hi,
  id,
  it,
  ja,
  ko,
  ms,
  nl,
  pl,
  pt,
  ptPT,
  ru,
  sw,
  ta,
  th,
  tr,
  uk,
  ur,
  vi,
  zh,
  zhHant,
  zu,
};
