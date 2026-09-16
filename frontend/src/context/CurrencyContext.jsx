import React, { createContext, useContext, useState, useEffect } from 'react';
import { BRAND, convertPrice, formatPrice } from '../config/brand';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('luxehair_currency');
      return (saved === 'USD' || saved === 'NGN') ? saved : 'NGN';
    } catch {
      return 'NGN';
    }
  });

  const setCurrency = (curr) => {
    if (curr === 'NGN' || curr === 'USD') {
      setCurrencyState(curr);
      try {
        localStorage.setItem('luxehair_currency', curr);
      } catch {
        // ignore
      }
    }
  };

  const currencyConfig = BRAND.currencies[currency] || BRAND.currencies.NGN;

  // Converts an NGN base amount into active currency amount
  const convert = (ngnAmount) => {
    return convertPrice(ngnAmount, currency);
  };

  // Formats an NGN base amount directly into active currency formatted string
  // e.g. format(320000) -> "₦320,000" (if NGN) or "$213.33" (if USD)
  const format = (ngnAmount) => {
    const converted = convert(ngnAmount);
    return formatPrice(converted, currency);
  };

  // Formats an already converted amount in the current currency
  const formatDirect = (amountInCurrentCurrency) => {
    return formatPrice(amountInCurrentCurrency, currency);
  };

  const value = {
    currency,
    setCurrency,
    currencyConfig,
    convert,
    format,
    formatDirect,
    isUsd: currency === 'USD',
    isNgn: currency === 'NGN'
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
