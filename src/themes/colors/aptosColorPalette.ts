/**
 * @deprecated This file is maintained for backward compatibility during migration.
 * New code should import from './index' or './aptosBrandColors' instead.
 * This file will be removed after migration is complete.
 */

import {legacyColorMappings} from "./aptosBrandColors";

// Grey Palette - mapped to new brand colors
export const grey = legacyColorMappings.grey;

// Primary Palette - mapped to new brand colors
export const primary = legacyColorMappings.primary;

export const aptosColor = legacyColorMappings.aptosColor;
export const negativeColor: string = legacyColorMappings.negativeColor;
export const warningColor: string = legacyColorMappings.warningColor;

// code block colors - mapped to new brand colors
export const codeBlockColor: string = legacyColorMappings.codeBlockColor;
export const codeBlockColorClickableOnHover: string =
  legacyColorMappings.codeBlockColorClickableOnHover;
// use rgb for codeblock in modal otherwise it will be transparent and not very visible
export const codeBlockColorRgbLight: string =
  legacyColorMappings.codeBlockColorRgbLight;
export const codeBlockColorRgbDark: string =
  legacyColorMappings.codeBlockColorRgbDark;
