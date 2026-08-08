globalThis.__timing__.logStart('Load chunks/routes/api/gold.get');import { k as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue-router';
import '@iconify/utils';
import 'consola';

const gold_get = defineEventHandler(async () => {
  var _a, _b, _c, _d;
  let currentPricePerOunce = 0;
  let usdToSarRate = 3.75;
  try {
    const goldData = await $fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/GC=F",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        }
      }
    );
    const meta = (_c = (_b = (_a = goldData == null ? void 0 : goldData.chart) == null ? void 0 : _a.result) == null ? void 0 : _b[0]) == null ? void 0 : _c.meta;
    currentPricePerOunce = (meta == null ? void 0 : meta.regularMarketPrice) || 0;
  } catch (err) {
    console.warn("Yahoo Finance fetch failed, attempting fallback...", err);
  }
  if (!currentPricePerOunce) {
    try {
      const fallbackData = await $fetch("https://api.gold-api.com/price/XAU");
      if (fallbackData == null ? void 0 : fallbackData.price) {
        currentPricePerOunce = fallbackData.price;
      }
    } catch (fallbackErr) {
      console.warn("Fallback Gold API failed as well:", fallbackErr);
    }
  }
  try {
    const ratesData = await $fetch("https://api.frankfurter.app/latest", {
      query: { from: "USD", to: "SAR" }
    });
    if ((_d = ratesData == null ? void 0 : ratesData.rates) == null ? void 0 : _d.SAR) {
      usdToSarRate = ratesData.rates.SAR;
    }
  } catch (err) {
    console.warn("Frankfurter API fetch failed, using default SAR rate (3.75):", err);
  }
  const pricePerGramUSD = currentPricePerOunce > 0 ? currentPricePerOunce / 31.1035 : 0;
  return {
    usdToSar: usdToSarRate,
    ounceUSD: currentPricePerOunce,
    gram24USD: pricePerGramUSD,
    gram24SAR: pricePerGramUSD * usdToSarRate,
    gram21SAR: pricePerGramUSD * (21 / 24) * usdToSarRate,
    gram18SAR: pricePerGramUSD * (18 / 24) * usdToSarRate
  };
});

export { gold_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/gold.get');
//# sourceMappingURL=gold.get.mjs.map
