/**
 * LUXE HAIR CO — Central Brand Configuration
 * Single source of truth for branding, typography, currency, contact,
 * and categories across all frontend views.
 */
export const BRAND = {
  name: 'LUXE HAIR CO',
  shortName: 'LUXE',
  tagline: 'Couture Virgin Hair & Botanical Formulations',
  editorialTitle: 'Haute Coiffure & Bespoke Units',
  description: 'Exclusively curated 100% unprocessed raw virgin hair, bespoke HD lace frontals, and botanical hair care designed for the discerning individual.',
  
  currency: {
    symbol: '₦',
    code: 'NGN',
    name: 'Nigerian Naira'
  },

  currencies: {
    NGN: {
      code: 'NGN',
      symbol: '₦',
      name: 'Nigerian Naira',
      flag: '🇳🇬',
      rate: 1
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      flag: '🌐',
      rate: 1500 // ₦1,500 = $1.00 USD
    }
  },

  contact: {
    email: 'concierge@luxehairco.com',
    phone: '+234 800 589 3424',
    address: 'Victoria Island, Lagos, Nigeria',
    hours: 'Mon - Sat: 9:00 AM - 7:00 PM WAT'
  },

  categories: [
    {
      id: 'wigs',
      name: 'Virgin Wigs',
      fullName: 'Raw & Virgin Wigs',
      slug: 'wigs',
      description: 'Bespoke HD lace frontals, glueless units & full lace masterpieces.',
      image: '/images/products/wig-bone-straight-1.jpg'
    },
    {
      id: 'attachments',
      name: 'Hair Attachments',
      fullName: 'Luxury Hair Attachments',
      slug: 'attachments',
      description: 'Seamless clip-ins, invisible tape-ins, and couture ponytails.',
      image: '/images/products/attachment-clipin-1.jpg'
    },
    {
      id: 'hair-care',
      name: 'Hair Care',
      fullName: 'Hair Care & Maintenance',
      slug: 'hair-care',
      description: 'Botanical elixirs, lace melting mists, and restorative masques.',
      image: '/images/products/care-elixir-1.jpg'
    }
  ],

  paymentMethods: {
    paystack: {
      id: 'paystack',
      currency: 'NGN',
      isPrimaryCardMethod: true,
      title: 'Debit / Credit Card (Nigerian-Issued Cards)',
      processor: 'Paystack',
      supportedCards: ['Mastercard', 'Visa', 'Verve'],
      description: 'Primary method for Nigerian-issued cards (GTBank, Zenith, Access, First Bank, etc.) with instant authorization (+ USSD & Bank Transfer).',
      badge: 'Primary Card Method'
    },
    stripe: {
      id: 'stripe',
      currency: 'USD',
      isPrimaryCardMethod: true,
      title: 'Debit / Credit Card (International Cards)',
      processor: 'Stripe',
      supportedCards: ['Visa', 'Mastercard', 'American Express', 'Apple Pay'],
      description: 'Primary method for international & overseas cards issued outside Nigeria (US, UK, Canada, Europe, Global) with fraud defense.',
      badge: 'Primary Card Method'
    },
    bankTransfer: {
      id: 'bankTransfer',
      currency: 'NGN',
      title: 'Direct Bank Wire (Zenith Bank NGN)',
      description: 'Corporate bank transfer for Nigerian accounts with concierge dispatch upon confirmation.'
    },
    payOnDelivery: {
      id: 'payOnDelivery',
      currency: 'NGN',
      title: 'Pay on Delivery (Lagos & Abuja)',
      description: 'Card POS or cash upon courier arrival within Lagos & Abuja.'
    }
  },

  bankDetails: {
    bankName: 'Zenith Bank PLC',
    accountName: 'LUXE HAIR VENTURES LTD',
    accountNumber: '1018992019',
    sortCode: '057150013'
  },

  shippingOptions: [
    {
      id: 'standard-lagos',
      name: 'Lagos Express Courier',
      deliveryTime: '24 - 48 Hours',
      fee: 3500,
      feeUsd: 5,
      eligibleRegions: ['Lagos']
    },
    {
      id: 'nationwide-dhl',
      name: 'Nationwide DHL Express',
      deliveryTime: '2 - 4 Business Days',
      fee: 7500,
      feeUsd: 10,
      eligibleRegions: ['All States']
    },
    {
      id: 'international-dhl',
      name: 'DHL Worldwide Express (US, UK, Europe, Global)',
      deliveryTime: '3 - 5 Business Days',
      fee: 45000,
      feeUsd: 35,
      eligibleRegions: ['International', 'United States', 'United Kingdom', 'Canada', 'Europe', 'Worldwide']
    },
    {
      id: 'vip-same-day',
      name: 'Luxe VIP Same-Day Concierge',
      deliveryTime: 'Under 4 Hours (Order before 2 PM)',
      fee: 12000,
      feeUsd: 15,
      eligibleRegions: ['Lagos Island', 'Ikoyi', 'Victoria Island', 'Lekki']
    }
  ],

  socials: {
    instagram: 'https://instagram.com/luxehairco',
    tiktok: 'https://tiktok.com/@luxehairco',
    whatsapp: 'https://wa.me/2348005893424'
  }
};

/**
 * Convert base price from NGN to target currency
 */
export const convertPrice = (ngnAmount, targetCurrency = 'NGN') => {
  if (ngnAmount === undefined || ngnAmount === null || isNaN(ngnAmount)) return 0;
  if (targetCurrency === 'USD') {
    const rate = BRAND.currencies.USD.rate || 1500;
    return Math.round((Number(ngnAmount) / rate) * 100) / 100;
  }
  return Number(ngnAmount);
};

/**
 * Format price in either NGN or USD
 * e.g., formatPrice(320000, 'NGN') -> "₦320,000"
 *       formatPrice(213.33, 'USD') -> "$213.33"
 */
export const formatPrice = (amount, currency = 'NGN') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return currency === 'USD' ? '$0.00' : '₦0';
  }

  const num = Number(amount);

  if (currency === 'USD') {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${BRAND.currency.symbol}${num.toLocaleString('en-NG')}`;
};
