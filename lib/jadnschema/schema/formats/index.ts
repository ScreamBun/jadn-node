/*
 * JADN Validation Format Functions
 */
import * as GeneralFormats from './general';
import * as IDNA_Formats from './idna';
import * as NetworkFormats from './network';
import * as RFC3339_Formats from './rfc_3339';
import * as RFC3986_Formats from './rfc_3986';
import * as RFC3987_Formats from './rfc_3987';

export default {
  ...GeneralFormats,
  ...IDNA_Formats,
  ...NetworkFormats,
  ...RFC3339_Formats,
  ...RFC3986_Formats,
  ...RFC3987_Formats
};