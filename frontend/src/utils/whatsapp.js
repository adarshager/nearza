/**
 * Nearza — WhatsApp Deep Link Builder (Legacy Compat)
 * Re-exports from the unified merchant-contact utility.
 * All new code should import directly from '../utils/merchant-contact'.
 */

export {
  buildProductWhatsAppLink as buildWhatsAppLink,
  buildShopWhatsAppLink,
} from './merchant-contact';
