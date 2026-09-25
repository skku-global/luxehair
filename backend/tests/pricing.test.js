/**
 * Pricing guard checks.
 *
 * These cover the two inputs a shopper's browser can tamper with: the price of
 * the chosen variant, and the shipping fee. Run with: node backend/tests/pricing.test.js
 */
const assert = require('assert');
const { resolveUnitPriceNgn, resolveShippingFee, resolveDiscount } = require('../routes/orderRoutes');

let passed = 0;
function check(label, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

const product = {
  price: 500000,
  variants: [
    { _id: 'v1', name: '24" / 200% / Natural Black', length: '24', density: '200%', color: 'Natural Black', price: 650000 },
    { _id: 'v2', name: '30" / 250% / Honey Blonde', length: '30', density: '250%', color: 'Honey Blonde', price: 900000 }
  ]
};

console.log('\nVariant pricing');

check('uses the product price when no variant is chosen', () => {
  assert.strictEqual(resolveUnitPriceNgn(product, null).unitPriceNgn, 500000);
});

check('uses our stored price for a variant matched by id', () => {
  assert.strictEqual(resolveUnitPriceNgn(product, { _id: 'v2' }).unitPriceNgn, 900000);
});

check('uses our stored price for a variant matched by name', () => {
  const r = resolveUnitPriceNgn(product, { name: '24" / 200% / Natural Black' });
  assert.strictEqual(r.unitPriceNgn, 650000);
});

check('IGNORES a price supplied by the client', () => {
  const tampered = { _id: 'v2', name: '30" / 250% / Honey Blonde', price: 1 };
  assert.strictEqual(resolveUnitPriceNgn(product, tampered).unitPriceNgn, 900000);
});

check('falls back to the product price for an unknown variant', () => {
  assert.strictEqual(resolveUnitPriceNgn(product, { name: 'does-not-exist', price: 1 }).unitPriceNgn, 500000);
});

check('never echoes a client price field back onto the order', () => {
  const r = resolveUnitPriceNgn(product, { _id: 'v1', price: 1 });
  assert.strictEqual(r.variant.price, undefined);
});

console.log('\nShipping fees');

check('accepts a legitimate NGN fee', () => {
  assert.strictEqual(resolveShippingFee(7500, false, 100000), 7500);
});

check('accepts a legitimate USD fee', () => {
  assert.strictEqual(resolveShippingFee(35, true, 100), 35);
});

check('rejects a negative fee that would cut the total', () => {
  assert.strictEqual(resolveShippingFee(-50000, false, 100000), 3500);
});

check('rejects an invented fee', () => {
  assert.strictEqual(resolveShippingFee(1, false, 100000), 3500);
});

check('rejects a non-numeric fee', () => {
  assert.strictEqual(resolveShippingFee('free', false, 100000), 3500);
});

check('honours free shipping above the NGN threshold', () => {
  assert.strictEqual(resolveShippingFee(3500, false, 250000), 0);
});

check('honours free shipping above the USD threshold', () => {
  assert.strictEqual(resolveShippingFee(35, true, 200), 0);
});

check('does not give free shipping below the threshold', () => {
  assert.strictEqual(resolveShippingFee(0, false, 249999), 3500);
});

console.log('\nPromo codes');

check('grants the LUXE10 percentage', () => {
  assert.strictEqual(resolveDiscount('LUXE10', 100000).discount, 10000);
});

check('grants the FIRSTLUXE percentage', () => {
  assert.strictEqual(resolveDiscount('FIRSTLUXE', 100000).discount, 15000);
});

check('is case- and whitespace-insensitive', () => {
  assert.strictEqual(resolveDiscount('  luxe10 ', 100000).discount, 10000);
});

check('IGNORES an invented code', () => {
  assert.strictEqual(resolveDiscount('FREESTUFF', 100000).discount, 0);
});

check('IGNORES a percentage supplied by the client', () => {
  // Only the code travels; an object carrying percentOff must not be honoured
  assert.strictEqual(resolveDiscount({ code: 'LUXE10', percentOff: 100 }, 100000).discount, 0);
});

check('grants nothing when no code is sent', () => {
  assert.strictEqual(resolveDiscount('', 100000).discount, 0);
  assert.strictEqual(resolveDiscount(null, 100000).discount, 0);
  assert.strictEqual(resolveDiscount(undefined, 100000).discount, 0);
});

check('never exceeds the subtotal', () => {
  assert.ok(resolveDiscount('LUXE10', 100000).discount <= 100000);
});

check('grants nothing on an empty or negative basket', () => {
  assert.strictEqual(resolveDiscount('LUXE10', 0).discount, 0);
  assert.strictEqual(resolveDiscount('LUXE10', -5000).discount, 0);
});

check('rounds USD discounts to cents', () => {
  assert.strictEqual(resolveDiscount('LUXE10', 99.99).discount, 10);
});

check('reports the code it actually honoured', () => {
  assert.strictEqual(resolveDiscount('luxe10', 100000).couponCode, 'LUXE10');
  assert.strictEqual(resolveDiscount('NOPE', 100000).couponCode, '');
});

console.log(`\n${passed} checks passed\n`);
