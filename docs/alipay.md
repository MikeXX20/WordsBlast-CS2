# Alipay voluntary support

The Alipay entry lets users voluntarily support the author. It does not purchase Pro, unlock features, or change game progress. GitHub Pages cannot verify that a payment was received.

## Configure the recipient

Edit `payment-config.js` in the repository root:

- `account`: the owner's Alipay account for manual transfers. The owner supplied the current phone account. The dialog displays it with a copy button; donors open Alipay and verify the recipient and amount there. Mainland Chinese mobile numbers and email addresses are accepted. No collection URL is generated from the account.
- `paymentUrl`: your genuine HTTPS Alipay payment link, usually starting with `https://qr.alipay.com/`. Only `alipay.com` and its subdomains are accepted.
- `qrImageUrl`: your genuine collection QR image. Save a PNG in `assets/alipay-qr.png` and set this field to `assets/alipay-qr.png`, or provide an HTTPS image URL. Supported extensions: PNG, JPG, JPEG, WebP, GIF and AVIF. SVG, data URLs, HTTP image URLs and URLs containing credentials are rejected. Relative paths retain the GitHub Pages repository path.
- `recipient`: the recipient name users should check in Alipay. This is optional display text.

An account, valid link or valid QR image is enough. Keep unused settings blank. Invalid destinations are ignored, and the entry stays unconfigured if none is valid. No example payment destination or collection QR is included.

Use only a QR or payment link issued for the actual recipient, and confirm that the merchant's selected Alipay product permits the intended use. Check the displayed recipient and test the destination before publishing. These settings are public; never add private keys or account credentials.

## Payment confirmation

Users should confirm payment in Alipay. Opening the link, closing the support dialog, returning to the website or pressing a button cannot prove payment. This interface never records a successful payment or grants paid access. Collection receipts must be checked by the recipient.

For automatic order verification, add a backend or serverless service that stores the application private key as a server secret, creates signed orders, verifies Alipay notifications, checks the order number, amount, recipient and transaction status, and processes repeated notifications without duplicate fulfillment. The browser should display the verified server order status. Never bundle a private key into this static website.

Official references:

- [Alipay Node.js SDK: server integration, checkout URL/form generation and notification verification](https://github.com/alipay/alipay-sdk-nodejs-all/blob/master/README.md)
- [Alipay collection QR and API integration overview](https://open.alipay.com/paymentServicer/paymentServicer.htm)
- [Alipay notification guidance: completion pages are not payment proof](https://aipay.alipay.com/article/318)
