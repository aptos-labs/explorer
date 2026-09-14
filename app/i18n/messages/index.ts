import type {SupportedLocale} from "../locales";
import type {MessageTree} from "../translate";
import {en} from "./en";

export const messageCatalogs: Record<SupportedLocale, MessageTree> = {
  en,
};

export {en};
