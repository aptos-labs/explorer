/**
 * Optional explorer branding for addresses listed in knownAddresses (per network).
 */
export type KnownAddressBranding = {
  /** Site-relative path or absolute URL */
  icon: string;
  /** Shown on the account page and in page metadata when set */
  description?: string;
};
