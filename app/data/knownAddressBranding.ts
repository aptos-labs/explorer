/**
 * Optional explorer branding for addresses listed in knownAddresses (per network).
 */
export type KnownAddressBranding = {
  /** Site-relative path or absolute URL */
  icon: string;
  /** Shown on the account page and in page metadata when set */
  description?: string;
  /**
   * Short label drawn above the icon (e.g. framework id `0x1`) for quick recognition
   * at small sizes and in the account banner.
   */
  iconBadge?: string;
};
