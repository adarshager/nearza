import assert from 'node:assert/strict';
import {
  normalizePhoneNumber,
  isValidPhoneNumber,
  formatPhoneForTel,
  formatPhoneForDisplay,
  formatPriceForMessage,
  buildProductWhatsAppLink,
  buildShopWhatsAppLink,
  buildCallLink,
  buildDirectionsLink,
} from './merchant-contact.js';

console.log('--- Running Merchant Contact Unit Tests ---\n');

// 1. Valid numbers
console.log('Test 1: Valid numbers normalization');
assert.equal(normalizePhoneNumber('+916363984209'), '916363984209');
assert.equal(normalizePhoneNumber('6363984209'), '916363984209');
assert.equal(normalizePhoneNumber('06363984209'), '916363984209');
assert.equal(normalizePhoneNumber('916363984209'), '916363984209');
assert.equal(normalizePhoneNumber('+91 63639 84209'), '916363984209');
assert.equal(normalizePhoneNumber('+91-6363-984209'), '916363984209');
assert.equal(normalizePhoneNumber(6363984209), '916363984209');
assert.equal(isValidPhoneNumber('+916363984209'), true);
console.log('✓ Valid numbers passed');

// 2. Missing numbers
console.log('Test 2: Missing numbers');
assert.equal(normalizePhoneNumber(null), null);
assert.equal(normalizePhoneNumber(undefined), null);
assert.equal(normalizePhoneNumber(''), null);
assert.equal(normalizePhoneNumber('   '), null);
assert.equal(isValidPhoneNumber(null), false);
assert.equal(buildCallLink(null), null);
assert.equal(buildShopWhatsAppLink(null), null);
assert.equal(buildProductWhatsAppLink(undefined, { productName: 'Test' }), null);
console.log('✓ Missing numbers handled safely');

// 3. Invalid numbers
console.log('Test 3: Invalid numbers');
assert.equal(normalizePhoneNumber('12345'), null);
assert.equal(normalizePhoneNumber('abc'), null);
assert.equal(normalizePhoneNumber('0000000000'), null);
assert.equal(normalizePhoneNumber('+'), null);
assert.equal(normalizePhoneNumber('1111111111'), null);
assert.equal(isValidPhoneNumber('12345'), false);
assert.equal(buildCallLink('invalid-number'), null);
console.log('✓ Invalid numbers rejected');

// 4. Call link generation
console.log('Test 4: Call links');
assert.equal(buildCallLink('+916363984209'), 'tel:+916363984209');
assert.equal(buildCallLink('6363984209'), 'tel:+916363984209');
assert.equal(buildCallLink('06363984209'), 'tel:+916363984209');
assert.equal(formatPhoneForDisplay('6363984209'), '+91 63639 84209');
console.log('✓ Call links verified');

// 5. Price formatting with decimals
console.log('Test 5: Price formatting with decimals');
assert.equal(formatPriceForMessage(14999), '₹14999');
assert.equal(formatPriceForMessage(14999.5), '₹14999.50');
assert.equal(formatPriceForMessage('14999.50'), '₹14999.50');
assert.equal(formatPriceForMessage('₹14999.50'), '₹14999.50');
assert.equal(formatPriceForMessage(99.95), '₹99.95');
console.log('✓ Price formatting with decimals passed');

// 6. WhatsApp Product Message (Contextual, Special Chars, Unicode)
console.log('Test 6: WhatsApp product deep link with contextual message & Unicode');
const waProductLink = buildProductWhatsAppLink('+916363984209', {
  productName: 'Samsung Galaxy M15',
  price: 14999,
  shopName: 'Krishna Electronics',
});
assert.ok(waProductLink.startsWith('https://wa.me/916363984209?text='));
const decodedProductMsg = decodeURIComponent(waProductLink.split('?text=')[1]);
assert.equal(
  decodedProductMsg,
  'Hi, I found Samsung Galaxy M15 on Nearza at Krishna Electronics. Is it currently available at ₹14999?'
);

// Decimals in product price
const waDecimalLink = buildProductWhatsAppLink('6363984209', {
  productName: 'Organic Honey',
  price: 249.50,
  unit: '500g',
  shopName: 'Nature Fresh',
});
const decodedDecimalMsg = decodeURIComponent(waDecimalLink.split('?text=')[1]);
assert.equal(
  decodedDecimalMsg,
  'Hi, I found Organic Honey (500g) on Nearza at Nature Fresh. Is it currently available at ₹249.50?'
);

// Unicode Hindi / Bengali / Telugu & Special Characters
const waUnicodeLink = buildProductWhatsAppLink('6363984209', {
  productName: 'सैमसंग गैलेक्सी M15 5G & इयरबड्स (Black) [128GB] #Offer',
  price: 13499.75,
  shopName: 'सुपर स्टोर',
});
const decodedUnicodeMsg = decodeURIComponent(waUnicodeLink.split('?text=')[1]);
assert.equal(
  decodedUnicodeMsg,
  'Hi, I found सैमसंग गैलेक्सी M15 5G & इयरबड्स (Black) [128GB] #Offer on Nearza at सुपर स्टोर. Is it currently available at ₹13499.75?'
);
console.log('✓ WhatsApp product deep links, special characters & Unicode verified');

// 7. WhatsApp Shop General Message
console.log('Test 7: WhatsApp shop general deep link');
const waShopLink = buildShopWhatsAppLink('+916363984209');
const decodedShopMsg = decodeURIComponent(waShopLink.split('?text=')[1]);
assert.equal(
  decodedShopMsg,
  'Hi, I found your shop on Nearza. I would like to know about product availability.'
);
console.log('✓ WhatsApp shop general message verified');

// 8. Google Maps Directions Link
console.log('Test 8: Google Maps directions link');
const dirWithCoords = buildDirectionsLink({ destLat: 12.9716, destLng: 77.5946 });
assert.equal(dirWithCoords, 'https://www.google.com/maps/dir/?api=1&destination=12.9716,77.5946');

const dirWithOrigin = buildDirectionsLink({
  destLat: 12.9716,
  destLng: 77.5946,
  originLat: 12.9279,
  originLng: 77.6271,
});
assert.equal(dirWithOrigin, 'https://www.google.com/maps/dir/12.9279,77.6271/12.9716,77.5946');

const dirWithAddress = buildDirectionsLink({ shopName: 'TechHub', address: 'Indiranagar, Bengaluru' });
assert.equal(
  dirWithAddress,
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('TechHub, Indiranagar, Bengaluru')
);
console.log('✓ Directions links verified');

console.log('\n--- ALL MERCHANT CONTACT TESTS PASSED SUCCESSFULLY! ---');
