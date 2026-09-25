/**
 * Central Brand Configuration
 * All store branding, contact details, currency formatting, and business policies
 * are defined in this single source of truth.
 */
module.exports = {
  brandName: 'LUXE HAIR CO',
  tagline: 'Couture Virgin Hair & Luxury Formulations',
  shortDescription: 'Exclusively curated 100% unprocessed raw virgin hair, bespoke HD lace frontals, and botanical hair care designed for the discerning individual.',
  currency: {
    symbol: '₦',
    code: 'NGN',
    name: 'Nigerian Naira'
  },
  // Dual currency support: all catalog prices are stored in NGN, with manual exchange rate to USD
  currencies: {
    NGN: {
      code: 'NGN',
      symbol: '₦',
      name: 'Nigerian Naira',
      rate: 1
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      rate: 1500 // ₦1,500 = $1.00 USD (manually set in brand config)
    }
  },
  /**
   * Server-side copy of the shipping table.
   *
   * The checkout form sends a shipping fee, and an order's total is built from
   * it -- so it has to be checked against a trusted list here rather than
   * taken at face value. Keep this in sync with `frontend/src/config/brand.js`.
   */
  shippingOptions: [
    { id: 'standard-lagos',    fee: 3500,  feeUsd: 5 },
    { id: 'nationwide-dhl',    fee: 7500,  feeUsd: 10 },
    { id: 'international-dhl', fee: 45000, feeUsd: 35 },
    { id: 'vip-same-day',      fee: 12000, feeUsd: 15 }
  ],

  // Subtotal at or above which shipping is complimentary
  freeShippingThreshold: {
    NGN: 250000,
    USD: 200
  },

  contact: {
    email: 'concierge@luxehairco.com',
    phone: '+234 800 589 3424',
    address: 'Victoria Island, Lagos, Nigeria',
    hours: 'Mon - Sat: 9:00 AM - 7:00 PM WAT'
  },
  categories: [
    { id: 'wigs', name: 'Raw & Virgin Wigs', slug: 'wigs', desc: 'Bespoke HD lace frontals, glueless units & full lace masterpieces.' },
    { id: 'attachments', name: 'Hair Attachments', slug: 'attachments', desc: 'Seamless clip-ins, tape-ins, bulk braiding hair & luxury ponytails.' },
    { id: 'hair-care', name: 'Hair Care & Maintenance', slug: 'hair-care', desc: 'Botanical elixirs, silk melting sprays, and keratin hydration serums.' }
  ],
  paymentMethods: {
    paystack: {
      enabled: true,
      supportedCurrencies: ['NGN'],
      isPrimaryCardMethod: true,
      title: 'Debit / Credit Card (Nigerian-Issued Cards via Paystack)',
      supportedCards: ['Mastercard', 'Visa', 'Verve'],
      description: 'Primary card settlement for Nigerian-issued cards. Instant authorization for cards from GTBank, Zenith, Access, First Bank, and all Nigerian banks (+ USSD & Transfer).'
    },
    stripe: {
      enabled: true,
      supportedCurrencies: ['USD'],
      isPrimaryCardMethod: true,
      title: 'Debit / Credit Card (International Cards via Stripe)',
      supportedCards: ['Visa', 'Mastercard', 'American Express', 'Apple Pay'],
      description: 'Primary card settlement for international & overseas cards issued outside Nigeria (US, UK, Canada, Europe, Global) with fraud protection.'
    },
    bankTransfer: {
      enabled: true,
      supportedCurrencies: ['NGN'],
      title: 'Direct Bank Transfer',
      description: 'Make a direct bank payment to our verified corporate tier-1 accounts with immediate dispatch upon confirmation.',
      bankDetails: {
        bankName: 'Zenith Bank PLC',
        accountName: 'LUXE HAIR VENTURES LTD',
        accountNumber: '1018992019'
      }
    },
    payOnDelivery: {
      enabled: true,
      supportedCurrencies: ['NGN'],
      title: 'Pay on Delivery (Lagos & Abuja Only)',
      description: 'Available for orders up to ₦350,000 within Lagos & Abuja metropolis. Card or cash accepted upon rider arrival.'
    }
  },
  socials: {
    instagram: 'https://instagram.com/luxehairco',
    tiktok: 'https://tiktok.com/@luxehairco',
    whatsapp: 'https://wa.me/2348005893424'
  }
};
