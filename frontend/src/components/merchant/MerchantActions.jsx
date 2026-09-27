/**
 * Nearza — Merchant Communication Action Buttons
 * Provides unified, accessible, and attractive actions:
 * [📞 Call] [💬 WhatsApp] [📍 Directions]
 *
 * Compliance & Features:
 * - Tel: deep links with international E.164 normalization (+91...)
 * - WhatsApp: wa.me deep links with contextual messages and URL encoding
 * - Google Maps: turn-by-turn directions from user location or coordinates
 * - Desktop fallback: copies phone number to clipboard with feedback
 * - Mobile responsive: touch-friendly tap targets (>= 40px)
 * - Safe & Private: No automatic messaging, no secret leakage, no message tracking
 */

import { useState } from 'react';
import { Phone, MessageSquare, Navigation, Copy, Check } from 'lucide-react';
import {
  buildCallLink,
  buildProductWhatsAppLink,
  buildShopWhatsAppLink,
  buildDirectionsLink,
  isValidPhoneNumber,
  formatPhoneForDisplay,
} from '../../utils/merchant-contact';
import { useLocation } from '../../contexts/LocationContext';
import { useToast } from '../../contexts/ToastContext';
import { trackEvent } from '../../services/merchant';

/**
 * @param {object} props
 * @param {object} [props.shop] - Shop object containing name, phone, whatsapp_number, latitude, longitude, address, city
 * @param {string|number} [props.phone] - Direct phone override
 * @param {string|number} [props.whatsappNumber] - Direct WhatsApp number override
 * @param {string} [props.shopName] - Direct shop name override
 * @param {object} [props.product] - Product object { name, price, unit } for contextual WhatsApp inquiry
 * @param {object} [props.location] - { latitude, longitude, address } override
 * @param {'default'|'compact'|'hero'|'card'|'row'} [props.variant='default'] - Visual style variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.showLabels=true] - Whether to show text labels
 * @param {string} [props.className=''] - Additional container classes
 * @param {function} [props.onAction] - Anonymous action callback (type: 'call'|'whatsapp'|'directions')
 */
export function MerchantActions({
  shop,
  phone: directPhone,
  whatsappNumber: directWhatsapp,
  shopName: directShopName,
  product,
  location: directLocation,
  variant = 'default',
  size = 'md',
  showLabels = true,
  className = '',
  onAction,
}) {
  const { latitude: userLat, longitude: userLng } = useLocation() || {};
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  // Extract resolved values
  const shopName = directShopName || shop?.name || '';
  const rawPhone = directPhone ?? shop?.phone;
  // WhatsApp defaults to whatsapp_number, then falls back to phone
  const rawWhatsapp = directWhatsapp ?? shop?.whatsapp_number ?? rawPhone;

  const destLat = directLocation?.latitude ?? shop?.latitude;
  const destLng = directLocation?.longitude ?? shop?.longitude;
  const address = directLocation?.address ?? shop?.address;
  const city = directLocation?.city ?? shop?.city;
  const fullAddress = [address, city].filter(Boolean).join(', ');

  // Compute communication links
  const hasValidPhone = isValidPhoneNumber(rawPhone);
  const callLink = buildCallLink(rawPhone);
  const displayPhone = formatPhoneForDisplay(rawPhone);

  const hasValidWhatsapp = isValidPhoneNumber(rawWhatsapp);
  const whatsappLink = product
    ? buildProductWhatsAppLink(rawWhatsapp, {
        productName: product.name,
        price: product.price,
        unit: product.unit,
        shopName,
      })
    : buildShopWhatsAppLink(rawWhatsapp, shopName);

  const directionsLink = buildDirectionsLink({
    destLat,
    destLng,
    originLat: userLat,
    originLng: userLng,
    address: fullAddress,
    shopName,
  });

  // Handle Call button click (dialer on mobile, copy fallback on desktop)
  const handleCallClick = (e) => {
    if (!hasValidPhone) {
      e.preventDefault();
      return;
    }

    if (onAction) onAction('call', { shopName });
    trackEvent({ event_type: 'call_click', shop_id: shop?.id, product_id: product?.id });

    // Copy to clipboard as a helpful fallback for desktop users
    if (navigator?.clipboard?.writeText && displayPhone) {
      navigator.clipboard.writeText(displayPhone).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (toast?.info) {
          toast.info(`Dialing merchant (${displayPhone}). Number copied.`);
        }
      }).catch(() => {});
    }
  };

  const handleWhatsappClick = (e) => {
    if (!hasValidWhatsapp) {
      e.preventDefault();
      return;
    }
    if (onAction) onAction('whatsapp', { shopName, hasProduct: Boolean(product) });
    trackEvent({ event_type: 'whatsapp_click', shop_id: shop?.id, product_id: product?.id });
  };

  const handleDirectionsClick = (e) => {
    if (!directionsLink) {
      e.preventDefault();
      return;
    }
    if (onAction) onAction('directions', { shopName });
    trackEvent({ event_type: 'directions_click', shop_id: shop?.id, product_id: product?.id });
  };

  // Size mappings
  const sizeStyles = {
    sm: {
      btn: 'px-2.5 py-1.5 text-[11px] gap-1.5 rounded-lg min-h-[32px]',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      btn: 'px-3 py-2 text-xs gap-1.5 rounded-xl min-h-[38px]',
      icon: 'w-4 h-4',
    },
    lg: {
      btn: 'px-4 py-2.5 text-sm gap-2 rounded-xl min-h-[44px]',
      icon: 'w-4.5 h-4.5',
    },
  }[size] || {
    btn: 'px-3 py-2 text-xs gap-1.5 rounded-xl min-h-[38px]',
    icon: 'w-4 h-4',
  };

  // Variant mappings
  if (variant === 'hero') {
    return (
      <div className={`flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}>
        {/* Call Button */}
        {hasValidPhone ? (
          <a
            href={callLink}
            onClick={handleCallClick}
            className={`inline-flex items-center font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 hover:text-sky-800 border border-sky-200/80 active:scale-95 transition-all shadow-xs ${sizeStyles.btn}`}
            title={`Call merchant: ${displayPhone}`}
          >
            {copied ? <Check className={`${sizeStyles.icon} text-emerald-600`} /> : <Phone className={sizeStyles.icon} />}
            {showLabels && <span>Call Merchant</span>}
          </a>
        ) : (
          <span
            className={`inline-flex items-center font-medium text-slate-400 bg-slate-100 border border-slate-200/60 cursor-not-allowed opacity-60 ${sizeStyles.btn}`}
            title="Merchant phone not listed"
          >
            <Phone className={sizeStyles.icon} />
            {showLabels && <span>Call Merchant</span>}
          </span>
        )}

        {/* WhatsApp Button */}
        {hasValidWhatsapp ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsappClick}
            className={`inline-flex items-center font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20 ${sizeStyles.btn}`}
            title={`Chat on WhatsApp with ${shopName || 'merchant'}`}
          >
            <MessageSquare className={sizeStyles.icon} />
            {showLabels && <span>WhatsApp</span>}
          </a>
        ) : (
          <span
            className={`inline-flex items-center font-medium text-slate-400 bg-slate-100 border border-slate-200/60 cursor-not-allowed opacity-60 ${sizeStyles.btn}`}
            title="WhatsApp not available"
          >
            <MessageSquare className={sizeStyles.icon} />
            {showLabels && <span>WhatsApp</span>}
          </span>
        )}

        {/* Directions Button */}
        {directionsLink && (
          <a
            href={directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDirectionsClick}
            className={`inline-flex items-center font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 active:scale-95 transition-all ${sizeStyles.btn}`}
            title={`Get directions to ${shopName || 'store'}`}
          >
            <Navigation className={sizeStyles.icon} />
            {showLabels && <span>Directions</span>}
          </a>
        )}
      </div>
    );
  }

  // Default & Card / Compact Variant
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      {/* Call Button */}
      {hasValidPhone ? (
        <a
          href={callLink}
          onClick={handleCallClick}
          className={`inline-flex items-center justify-center font-semibold text-sky-700 bg-sky-50/90 hover:bg-sky-100 border border-sky-200/60 active:scale-95 transition-all cursor-pointer ${sizeStyles.btn}`}
          title={`Call merchant: ${displayPhone}`}
          aria-label={`Call merchant: ${displayPhone}`}
        >
          {copied ? <Check className={`${sizeStyles.icon} text-emerald-600`} /> : <Phone className={sizeStyles.icon} />}
          {showLabels && <span className="hidden sm:inline">Call</span>}
        </a>
      ) : (
        <span
          className={`inline-flex items-center justify-center text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed ${sizeStyles.btn}`}
          title="Phone not available"
          aria-label="Phone not available"
        >
          <Phone className={sizeStyles.icon} />
          {showLabels && <span className="hidden sm:inline">Call</span>}
        </span>
      )}

      {/* WhatsApp Button */}
      {hasValidWhatsapp ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsappClick}
          className={`inline-flex items-center justify-center font-semibold text-emerald-700 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/60 active:scale-95 transition-all cursor-pointer ${sizeStyles.btn}`}
          title={`WhatsApp inquiry with ${shopName || 'merchant'}`}
          aria-label={`WhatsApp inquiry with ${shopName || 'merchant'}`}
        >
          <MessageSquare className={sizeStyles.icon} />
          {showLabels && <span className="hidden sm:inline">WhatsApp</span>}
        </a>
      ) : (
        <span
          className={`inline-flex items-center justify-center text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed ${sizeStyles.btn}`}
          title="WhatsApp not available"
          aria-label="WhatsApp not available"
        >
          <MessageSquare className={sizeStyles.icon} />
          {showLabels && <span className="hidden sm:inline">WhatsApp</span>}
        </span>
      )}

      {/* Directions Button */}
      {directionsLink ? (
        <a
          href={directionsLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDirectionsClick}
          className={`inline-flex items-center justify-center font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-sky-700 border border-slate-200/60 active:scale-95 transition-all cursor-pointer ${sizeStyles.btn}`}
          title={`Get directions to ${shopName || 'merchant'}`}
          aria-label={`Get directions to ${shopName || 'merchant'}`}
        >
          <Navigation className={sizeStyles.icon} />
          {showLabels && <span className="hidden sm:inline">Directions</span>}
        </a>
      ) : (
        <span
          className={`inline-flex items-center justify-center text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed ${sizeStyles.btn}`}
          title="Location not available"
          aria-label="Location not available"
        >
          <Navigation className={sizeStyles.icon} />
          {showLabels && <span className="hidden sm:inline">Directions</span>}
        </span>
      )}
    </div>
  );
}

export default MerchantActions;
