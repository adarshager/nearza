/**
 * Nearza — Merchant Contact Utilities
 * Robust phone normalization, validation, WhatsApp deep links, call links,
 * and Google Maps directions URL generation.
 *
 * Security & Privacy:
 * - Never exposes backend secrets
 * - All message queries are safely URL-encoded (RFC 3986 compliant)
 * - No automatic message sending — WhatsApp only opens on explicit user click
 * - No storage or reading of private customer-merchant WhatsApp conversations
 *
 * Phone normalization:
 * - Handles +91, 91, 0-prefixed, space/dash formatted, and bare 10-digit Indian numbers
 * - Validates length and structural integrity
 * - Returns null for invalid, incomplete, or placeholder numbers
 */

// ===================================================================
// Phone Number Normalization & Validation
// ===================================================================

/**
 * Normalize a phone number to international format (digits only, with country code).
 * Returns null if the number is invalid, empty, or a known placeholder.
 *
 * @param {string|number|null|undefined} rawNumber - Raw phone input
 * @returns {string|null} Normalized digits (e.g. "916363984209") or null if invalid
 */
export function normalizePhoneNumber(rawNumber) {
  if (rawNumber == null) return null;

  // Convert to string and trim
  const str = String(rawNumber).trim();
  if (!str) return null;

  // Strip everything except digits and leading +
  let cleaned = str.replace(/[^\d+]/g, '');

  // Remove leading +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // Remove leading zeros (common in Indian local format: 0XXXXXXXXXX)
  cleaned = cleaned.replace(/^0+/, '');

  // If all zeros, all identical digits (e.g. 1111111111, 9999999999), or too short, it's invalid
  if (!cleaned || /^(\d)\1+$/.test(cleaned) || cleaned.length < 10) {
    return null;
  }

  // 1. Indian 12-digit number starting with 91 (e.g., 916363984209)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    const localPart = cleaned.slice(2);
    // Indian mobile numbers start with 6, 7, 8, or 9
    // Indian landline/special numbers start with 1-9
    if (/^[1-9]\d{9}$/.test(localPart)) {
      return cleaned;
    }
  }

  // 2. Standard 10-digit Indian number (e.g., 6363984209)
  if (cleaned.length === 10) {
    // Standard 10-digit number
    if (/^[1-9]\d{9}$/.test(cleaned)) {
      return `91${cleaned}`;
    }
    return null;
  }

  // 3. Indian number with 91 prefix and 11-13 digits
  if (cleaned.startsWith('91') && cleaned.length >= 11 && cleaned.length <= 13) {
    return cleaned;
  }

  // 4. Other valid international numbers (10 to 15 digits as per E.164)
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    // Ensure not all repeating same digit (like 1111111111, 9999999999) if obvious test
    if (/^(\d)\1{9,}$/.test(cleaned)) {
      return null;
    }
    return cleaned;
  }

  // Invalid format or length
  return null;
}

/**
 * Validate whether a phone number is usable for contact.
 *
 * @param {string|number|null|undefined} rawNumber
 * @returns {boolean}
 */
export function isValidPhoneNumber(rawNumber) {
  return normalizePhoneNumber(rawNumber) !== null;
}

/**
 * Format a phone number for display as a tel: link.
 * Returns the number in +XXXXXXXXXXX format.
 *
 * @param {string|number|null|undefined} rawNumber
 * @returns {string|null} E.164 formatted number with + (e.g., "+916363984209") or null
 */
export function formatPhoneForTel(rawNumber) {
  const normalized = normalizePhoneNumber(rawNumber);
  if (!normalized) return null;
  return `+${normalized}`;
}

/**
 * Format a phone number for clean human-readable display.
 * e.g., "916363984209" -> "+91 63639 84209"
 *
 * @param {string|number|null|undefined} rawNumber
 * @returns {string}
 */
export function formatPhoneForDisplay(rawNumber) {
  const normalized = normalizePhoneNumber(rawNumber);
  if (!normalized) return String(rawNumber || '');

  if (normalized.startsWith('91') && normalized.length === 12) {
    const country = normalized.slice(0, 2);
    const part1 = normalized.slice(2, 7);
    const part2 = normalized.slice(7);
    return `+${country} ${part1} ${part2}`;
  }

  return `+${normalized}`;
}

// ===================================================================
// Price Formatter Helper
// ===================================================================

/**
 * Format a price value cleanly, supporting decimals, numbers, and strings.
 * e.g. 14999 -> "₹14999", 14999.5 -> "₹14999.50", "₹14999" -> "₹14999"
 *
 * @param {number|string|null|undefined} price
 * @returns {string} Formatted price string or empty string
 */
export function formatPriceForMessage(price) {
  if (price == null || price === '') return '';
  const priceStr = String(price).trim();
  if (priceStr.startsWith('₹')) return priceStr;

  // Check if it's a numeric value
  const num = Number(priceStr);
  if (!Number.isNaN(num)) {
    // If it has decimals, format with appropriate decimals
    if (num % 1 !== 0) {
      return `₹${num.toFixed(2)}`;
    }
    return `₹${num}`;
  }

  return `₹${priceStr}`;
}

// ===================================================================
// WhatsApp Deep Links
// ===================================================================

/**
 * Build a WhatsApp deep link for a product inquiry at a specific shop.
 * Generates a contextual, human-readable message.
 *
 * Example:
 * "Hi, I found Samsung Galaxy M15 on Nearza at TechHub. Is it currently available at ₹14999?"
 *
 * @param {string|number} whatsappNumber - Shop's WhatsApp number
 * @param {object} options
 * @param {string} options.productName - Product name (supports Unicode & special characters)
 * @param {number|string} [options.price] - Product price (supports decimals)
 * @param {string} [options.unit] - Product unit (e.g., "5 kg")
 * @param {string} [options.shopName] - Shop name
 * @returns {string|null} WhatsApp deep link URL, or null if number is invalid
 */
export function buildProductWhatsAppLink(whatsappNumber, { productName, price, unit, shopName } = {}) {
  const normalized = normalizePhoneNumber(whatsappNumber);
  if (!normalized) return null;

  const formattedPrice = formatPriceForMessage(price);
  const cleanProductName = (productName || '').trim();
  const unitSuffix = unit ? ` (${unit.trim()})` : '';
  const productLabel = `${cleanProductName}${unitSuffix}`;

  // Build contextual message
  let message;
  if (productLabel && shopName && formattedPrice) {
    message = `Hi, I found ${productLabel} on Nearza at ${shopName.trim()}. Is it currently available at ${formattedPrice}?`;
  } else if (productLabel && shopName) {
    message = `Hi, I found ${productLabel} on Nearza at ${shopName.trim()}. Is it currently available?`;
  } else if (productLabel && formattedPrice) {
    message = `Hi, I found ${productLabel} on Nearza. Is it currently available at ${formattedPrice}?`;
  } else if (productLabel) {
    message = `Hi, I found ${productLabel} on Nearza. Is it currently available?`;
  } else if (shopName) {
    message = `Hi, I found your shop on Nearza. I would like to know about product availability.`;
  } else {
    message = `Hi, I found your shop on Nearza. I would like to know about product availability.`;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/**
 * Build a WhatsApp deep link for a general shop inquiry.
 *
 * Example:
 * "Hi, I found your shop on Nearza. I would like to know about product availability."
 *
 * @param {string|number} whatsappNumber
 * @param {string} [shopName]
 * @returns {string|null} WhatsApp deep link URL, or null if number is invalid
 */
export function buildShopWhatsAppLink(whatsappNumber, shopName) {
  const normalized = normalizePhoneNumber(whatsappNumber);
  if (!normalized) return null;

  const message = shopName
    ? `Hi, I found ${shopName.trim()} on Nearza. I would like to know about product availability.`
    : `Hi, I found your shop on Nearza. I would like to know about product availability.`;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

// ===================================================================
// Call Links
// ===================================================================

/**
 * Build a tel: link that opens the phone dialer.
 * Example: tel:+916363984209
 *
 * @param {string|number|null|undefined} phoneNumber
 * @returns {string|null} tel: URI, or null if number is invalid
 */
export function buildCallLink(phoneNumber) {
  const formatted = formatPhoneForTel(phoneNumber);
  if (!formatted) return null;
  return `tel:${formatted}`;
}

// ===================================================================
// Directions Links
// ===================================================================

/**
 * Build a Google Maps directions URL.
 *
 * @param {object} options
 * @param {number|string} [options.destLat] - Destination latitude
 * @param {number|string} [options.destLng] - Destination longitude
 * @param {number|string} [options.originLat] - Origin latitude (user location)
 * @param {number|string} [options.originLng] - Origin longitude (user location)
 * @param {string} [options.address] - Fallback address if coordinates not available
 * @param {string} [options.shopName] - Fallback shop name for query
 * @returns {string|null} Google Maps directions URL, or null if no destination
 */
export function buildDirectionsLink({ destLat, destLng, originLat, originLng, address, shopName } = {}) {
  // If coordinates are available
  if (destLat != null && destLng != null && !Number.isNaN(Number(destLat)) && !Number.isNaN(Number(destLng))) {
    const destination = `${destLat},${destLng}`;

    if (originLat != null && originLng != null && !Number.isNaN(Number(originLat)) && !Number.isNaN(Number(originLng))) {
      return `https://www.google.com/maps/dir/${originLat},${originLng}/${destination}`;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  }

  // Fallback to address or shopName search query
  const query = [shopName, address].filter(Boolean).join(', ').trim();
  if (query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  return null;
}
