import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAlipayPayment } from "./alipay.js";

const baseUrl = "https://mikexx20.github.io/WordsBlast-CS2/index.html";

describe("Alipay payment configuration", () => {
  it("stays unconfigured when no payment destination is supplied", () => {
    assert.deepEqual(getAlipayPayment(), {
      account: "",
      configured: false,
      paymentUrl: "",
      qrImageUrl: "",
      recipient: "",
    });
  });

  it("accepts the confirmed phone account for manual donations", () => {
    const result = getAlipayPayment({ account: " 18681006482 " });
    assert.equal(result.configured, true);
    assert.equal(result.account, "18681006482");
    assert.equal(result.paymentUrl, "");
  });

  it("accepts an email account without creating a payment link", () => {
    const result = getAlipayPayment({ account: "donor@example.com" });
    assert.equal(result.account, "donor@example.com");
    assert.equal(result.configured, true);
    assert.equal(result.paymentUrl, "");
  });

  it("rejects malformed account identifiers", () => {
    for (const account of [18681006482, null, {}, "123", "186 81006482", "18681006482\nother", "<b>18681006482</b>", "name@", "name@@example.com"]) {
      const result = getAlipayPayment({ account });
      assert.equal(result.configured, false);
      assert.equal(result.account, "");
    }
  });

  it("accepts a payment link alone and trims the recipient", () => {
    assert.deepEqual(getAlipayPayment({
      paymentUrl: "  https://qr.alipay.com/example-code  ",
      recipient: "  WordsBlast 作者  ",
    }, baseUrl), {
      account: "",
      configured: true,
      paymentUrl: "https://qr.alipay.com/example-code",
      qrImageUrl: "",
      recipient: "WordsBlast 作者",
    });
  });

  it("accepts an image alone and preserves the GitHub Pages repository path", () => {
    assert.deepEqual(getAlipayPayment({
      qrImageUrl: "  assets/alipay-qr.png  ",
    }, baseUrl), {
      account: "",
      configured: true,
      paymentUrl: "",
      qrImageUrl: "https://mikexx20.github.io/WordsBlast-CS2/assets/alipay-qr.png",
      recipient: "",
    });
  });

  it("resolves a relative image from a repository URL ending in a slash", () => {
    assert.equal(getAlipayPayment({
      qrImageUrl: "./assets/alipay-qr.png",
    }, "https://mikexx20.github.io/WordsBlast-CS2/").qrImageUrl,
    "https://mikexx20.github.io/WordsBlast-CS2/assets/alipay-qr.png");
  });

  it("accepts an HTTPS image hosted outside the site", () => {
    assert.equal(getAlipayPayment({
      qrImageUrl: "https://images.example.com/alipay-qr.webp?version=2",
    }, baseUrl).qrImageUrl,
    "https://images.example.com/alipay-qr.webp?version=2");
  });

  it("accepts the Alipay root host and normalizes an official subdomain", () => {
    for (const [input, expected] of [
      ["https://alipay.com/pay", "https://alipay.com/pay"],
      ["https://QR.ALIPAY.COM/pay", "https://qr.alipay.com/pay"],
    ]) {
      assert.equal(getAlipayPayment({ paymentUrl: input }, baseUrl).paymentUrl, expected);
    }
  });

  it("rejects spoofed, non-Alipay, insecure, credentialed and malformed payment links", () => {
    for (const paymentUrl of [
      "https://alipay.com.evil.example/pay",
      "https://fakealipay.com/pay",
      "https://example.com/alipay.com",
      "https://alipayobjects.com/pay",
      "https://qr.alipay.com@evil.example/pay",
      "https://owner:secret@qr.alipay.com/pay",
      "http://qr.alipay.com/pay",
      "javascript:alert(1)",
      "data:text/html,example",
      "//qr.alipay.com/pay",
      "/pay",
      "not a URL",
    ]) {
      const result = getAlipayPayment({ paymentUrl }, baseUrl);
      assert.equal(result.paymentUrl, "", paymentUrl);
      assert.equal(result.configured, false, paymentUrl);
    }
  });

  it("rejects unsafe or non-image QR sources", () => {
    for (const qrImageUrl of [
      "http://images.example.com/qr.png",
      "javascript:alert(1)",
      "data:image/png;base64,example",
      "https://owner:secret@images.example.com/qr.png",
      "//images.example.com/qr.png",
      "https://images.example.com/qr.svg",
      "assets/qr.SVG",
      "https://images.example.com/payment.html",
      "https://images.example.com/qr.png/checkout",
    ]) {
      const result = getAlipayPayment({ qrImageUrl }, baseUrl);
      assert.equal(result.qrImageUrl, "", qrImageUrl);
      assert.equal(result.configured, false, qrImageUrl);
    }
  });

  it("keeps a valid image usable when the payment link is invalid", () => {
    assert.deepEqual(getAlipayPayment({
      paymentUrl: "https://evil.example/pay",
      qrImageUrl: "assets/alipay-qr.png",
      recipient: "  作者  ",
    }, baseUrl), {
      account: "",
      configured: true,
      paymentUrl: "",
      qrImageUrl: "https://mikexx20.github.io/WordsBlast-CS2/assets/alipay-qr.png",
      recipient: "作者",
    });
  });

  it("keeps a valid payment link usable when the image is invalid", () => {
    assert.deepEqual(getAlipayPayment({
      paymentUrl: "https://qr.alipay.com/example-code",
      qrImageUrl: "data:image/png;base64,example",
    }, baseUrl), {
      account: "",
      configured: true,
      paymentUrl: "https://qr.alipay.com/example-code",
      qrImageUrl: "",
      recipient: "",
    });
  });

  it("treats absent and non-string settings as empty values", () => {
    for (const config of [null, {}, {
      paymentUrl: { href: "https://qr.alipay.com/example-code" },
      qrImageUrl: 12,
      recipient: ["作者"],
    }]) {
      assert.deepEqual(getAlipayPayment(config, baseUrl), {
        account: "",
      configured: false,
        paymentUrl: "",
        qrImageUrl: "",
        recipient: "",
      });
    }
  });
});
