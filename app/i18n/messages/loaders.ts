import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {en} from "./en";

/**
 * Runtime catalog loading. Only English ships in the initial bundle (SSR and
 * the first client render are always English); every other catalog is its own
 * chunk, fetched when that locale becomes active. Do not import
 * `messageCatalogs` from `./index` in client code — it pulls all catalogs in.
 */
const messageCatalogLoaders: Record<
  Exclude<SupportedLocale, "en">,
  () => Promise<MessageTree>
> = {
  zh: () => import("./zh").then((m) => m.zh),
  fil: () => import("./fil").then((m) => m.fil),
  es: () => import("./es").then((m) => m.es),
  fr: () => import("./fr").then((m) => m.fr),
  de: () => import("./de").then((m) => m.de),
  ja: () => import("./ja").then((m) => m.ja),
  ko: () => import("./ko").then((m) => m.ko),
  ru: () => import("./ru").then((m) => m.ru),
  pt: () => import("./pt").then((m) => m.pt),
  ar: () => import("./ar").then((m) => m.ar),
  hi: () => import("./hi").then((m) => m.hi),
  th: () => import("./th").then((m) => m.th),
  id: () => import("./id").then((m) => m.id),
  vi: () => import("./vi").then((m) => m.vi),
  tr: () => import("./tr").then((m) => m.tr),
  bn: () => import("./bn").then((m) => m.bn),
  sw: () => import("./sw").then((m) => m.sw),
  "zh-Hant": () => import("./zh-Hant").then((m) => m.zhHant),
  it: () => import("./it").then((m) => m.it),
  ms: () => import("./ms").then((m) => m.ms),
  ta: () => import("./ta").then((m) => m.ta),
  uk: () => import("./uk").then((m) => m.uk),
  nl: () => import("./nl").then((m) => m.nl),
  pl: () => import("./pl").then((m) => m.pl),
  he: () => import("./he").then((m) => m.he),
  ur: () => import("./ur").then((m) => m.ur),
  "pt-PT": () => import("./pt-PT").then((m) => m.ptPT),
  ha: () => import("./ha").then((m) => m.ha),
  zu: () => import("./zu").then((m) => m.zu),
  am: () => import("./am").then((m) => m.am),
};

export function loadMessageCatalog(
  locale: SupportedLocale,
): Promise<MessageTree> {
  if (locale === "en") {
    return Promise.resolve(en);
  }
  return messageCatalogLoaders[locale]();
}
