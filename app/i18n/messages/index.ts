import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {ar} from "./ar";
import {bn} from "./bn";
import {de} from "./de";
import {en} from "./en";
import {es} from "./es";
import {fil} from "./fil";
import {fr} from "./fr";
import {hi} from "./hi";
import {id} from "./id";
import {ja} from "./ja";
import {ko} from "./ko";
import {pt} from "./pt";
import {ru} from "./ru";
import {sw} from "./sw";
import {th} from "./th";
import {tr} from "./tr";
import {vi} from "./vi";
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
  th,
  id,
  vi,
  tr,
  bn,
  sw,
};

export {
  ar,
  bn,
  de,
  en,
  es,
  fil,
  fr,
  hi,
  id,
  ja,
  ko,
  pt,
  ru,
  sw,
  th,
  tr,
  vi,
  zh,
};
