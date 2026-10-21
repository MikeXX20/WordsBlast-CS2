const defaultBaseUrl = "https://mikexx20.github.io/WordsBlast-CS2/";
const rasterImageExtension = /\.(?:png|jpe?g|webp|gif|avif)$/i;

function trimmed(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseUrl(value, baseUrl) {
  try {
    const url = baseUrl ? new URL(value, baseUrl) : new URL(value);
    return url.username || url.password ? null : url;
  } catch {
    return null;
  }
}

function paymentLink(value) {
  const url = parseUrl(value);
  if (url?.protocol !== "https:") return "";

  const isAlipay = url.hostname === "alipay.com" || url.hostname.endsWith(".alipay.com");
  return isAlipay ? url.href : "";
}

function paymentAccount(value) {
  const phone = /^1[3-9]\d{9}$/;
  const email = /^[a-z\d._%+-]+@[a-z\d](?:[a-z\d-]*[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]*[a-z\d])?)+$/i;
  return value.length <= 254 && (phone.test(value) || email.test(value)) ? value : "";
}

function qrImage(value, baseUrl) {
  if (!value || value.startsWith("//") || value.includes("\\")) return "";

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value);
  const base = parseUrl(baseUrl);
  const url = hasScheme ? parseUrl(value) : parseUrl(value, base?.href);
  if (!url || !rasterImageExtension.test(url.pathname)) return "";

  if (hasScheme) return url.protocol === "https:" ? url.href : "";

  const isWebImage = url.protocol === "https:" || url.protocol === "http:";
  return isWebImage && url.origin === base?.origin ? url.href : "";
}

/** Resolve public donation settings. This does not create or verify a payment. */
export function getAlipayPayment(config, baseUrl = globalThis.location?.href || defaultBaseUrl) {
  const account = paymentAccount(trimmed(config?.account));
  const paymentUrl = paymentLink(trimmed(config?.paymentUrl));
  const qrImageUrl = qrImage(trimmed(config?.qrImageUrl), baseUrl);

  return {
    configured: Boolean(account || paymentUrl || qrImageUrl),
    account,
    paymentUrl,
    qrImageUrl,
    recipient: trimmed(config?.recipient),
  };
}
