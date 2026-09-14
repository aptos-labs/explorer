export const GUIDE_SECTIONS = [
  {id: "overview", messageKey: "guide.overview"},
  {id: "getting-around", messageKey: "guide.chrome"},
  {id: "search", messageKey: "guide.search"},
  {id: "networks", messageKey: "guide.networks"},
  {id: "transactions", messageKey: "guide.transactions"},
  {id: "accounts", messageKey: "guide.accounts"},
  {id: "modules", messageKey: "guide.modules"},
  {id: "blocks", messageKey: "guide.blocks"},
  {id: "validators", messageKey: "guide.validators"},
  {id: "assets", messageKey: "guide.assets"},
  {id: "analytics", messageKey: "guide.analytics"},
  {id: "releases", messageKey: "guide.releases"},
  {id: "run-script", messageKey: "guide.runScript"},
  {id: "configure", messageKey: "guide.configure"},
  {id: "wallet", messageKey: "guide.wallet"},
  {id: "verification", messageKey: "guide.verification"},
  {id: "urls", messageKey: "guide.urls"},
  {id: "glossary", messageKey: "guide.glossary"},
  {id: "troubleshooting", messageKey: "guide.troubleshooting"},
] as const;

export type GuideSectionId = (typeof GUIDE_SECTIONS)[number]["id"];
