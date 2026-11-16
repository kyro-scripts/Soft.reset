# softreset website

A static site with no build step. Open `index.html` through a local server (see Testing) or upload the whole folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home: hero, promises, process, services overview, contact |
| `services.html` | Five services, each with the problem it helps with and the work included |
| `pricing.html` | Prices and a comparison of what each service includes |
| `how-it-works.html` | Step-by-step session process, what we can and can't access, staying safe |
| `faq.html` | Frequently asked questions |
| `contact.html` | TikTok, Instagram, and Discord, what to include, and how we handle information |
| `book.html` | Request a session: pick one or more services, an optional time, and describe the problem |
| `products.html` | "Coming soon" until `productsOpen` is `true` in `config.js`, then the physical products with shipping notes |
| `terms.html` | Terms of Service: what we do, what you approve, what we can't promise, and your responsibilities |
| `privacy.html` | Privacy Policy: what we collect, how it's used, and what we never ask for |
| `refunds.html` | Refunds and returns: sessions and, once they're available, products |
| `landing.html` | Facebook landing page. Not indexed (`noindex`), and excluded from `sitemap.xml` |
| `assets/js/config.js` | **Edit this.** Services, prices, contact channels, policies, FAQ, products, reviews, booking settings |
| `assets/js/common.js` | Shared header, footer, and helpers. Edit the navigation or footer links here once |
| `assets/js/site.js` | Fills pages from `config.js`: services, prices, FAQ, channels, products, copy buttons |
| `assets/js/booking.js` | Request form: time slots, validation, and the result panel |
| `assets/css/styles.css` | All styling |
| `robots.txt`, `sitemap.xml` | Search engine files. Domain is `https://softreset.cc`, to be confirmed before launch |

## Before going live

Work through this list in order. Every item marked **owner decision** has working wording in `assets/js/config.js`. Visitors see that wording as final, so check each line against what you actually do.

### 1. Confirm the basics (`config.js`)
- `siteUrl`: your real domain. Canonical links and `sitemap.xml` use `https://softreset.cc`. If that changes, update `siteUrl`, the `canonical` and `og:url` tags on each page, and `sitemap.xml` and `robots.txt`.
- `contactChannels`: confirm the TikTok, Instagram, and Discord URLs open the right accounts. The Discord link is `https://discord.gg/snYQn8Pwk8`. Delete an entry to hide that channel everywhere.
- `contactEmail`: left as `""`, so no email address appears. Add one if you want it shown.
- `timezone`, `workDays`, `workHours`, `minLeadHours`: your availability. Times are offered in Central Time.

### 2. Check the policies (owner decision)
Each policy in `policies` in `assets/js/config.js` holds working wording, written so it makes no specific promises. Visitors see it as final text, so edit any sentence that doesn't match what you do. A policy set to `""` hides every FAQ item or line that uses it, so nothing half-written shows:

- `installSoftware`: whether anything is installed on the customer's PC.
- `sessionLength`: how long a session typically takes.
- `paymentTiming`: how and when payment is taken.
- `refunds`: your refund policy for services.
- `productReturns`: returns for physical products.
- `unresolvedIssues`: what happens if an issue can't be fixed.
- `retention`: how long request details are kept.

The FAQ entries that depend on these are marked with a `policy` key, so they pick up your answer automatically. The remote support tool is deliberately not named anywhere on the site. Keep it that way.

### 3. Set up payments for products (Stripe Payment Links)
The site takes no payment for services right now. Visitors request a service and you confirm the price and time by message. How and when you collect payment for services is the `paymentTiming` decision in section 2. Only physical products use Stripe on the site.

1. In Stripe, create a Product and Price for each item, then a **Payment Link**.
2. Paste the link into that item's `stripeLink` in `config.js`. An item without a link shows an "Ask about this item" button that goes to the contact page.
3. Shipping: keep `shipping: true` on physical items. In each Payment Link, turn on shipping address collection and add your rates in Stripe. Make sure `shippingNote` matches what you charge.
4. Quantity: turn on the option that lets buyers change the quantity. Each checkout covers one item.
5. After payment: set the Payment Link's confirmation redirect to `https://softreset.cc/products.html?order=1`. The thank-you text comes from `orderThanksMessage`.
6. Stock: the site doesn't track inventory. Set `soldOut: true` yourself when an item runs out. Until you do, buyers can still order it.
7. Sales tax: decide whether you must collect it for the places you ship to, and set that up in Stripe. Confirm the rules with an accountant.
8. Optional: set `image` to a path such as `assets/img/my-product.jpg`. Without one, the product shows a tile with its first letter.

A multi-item cart needs a server to create Stripe Checkout Sessions. The site doesn't do that yet.

### 4. Decide what happens to requests (`bookingEndpoint`)
The request form has two behaviours, chosen by `bookingEndpoint` in `config.js`:

- **`bookingEndpoint` is `""` (current setting):** nothing is saved or sent. The form shows the visitor a ready-to-send message, with a copy button and a button to open the channel they chose. The page says plainly that nothing has been sent yet. Visitors send the message themselves.
- **`bookingEndpoint` is a URL:** the form sends a JSON `POST` to that URL. It shows "Request received" only if the server replies with a success status. Otherwise it shows "We couldn't send your request" and the message to copy.

If you set an endpoint:
- Use an API route on your own server, a webhook from Zapier or Make, or a form service.
- If the endpoint is on another domain, it must allow CORS requests from `softreset.cc`.
- Update the **Request form** line on `contact.html` (in "How we handle your information") and the note under the form on `book.html`. Both currently say nothing is sent to us by the form.
- Availability is not checked against your calendar yet. Two people could pick the same hour. Have the endpoint reject taken slots, or check the slot before confirming.

The payload looks like this:

```json
{
  "source": "website",
  "services": [{ "id": "advanced", "name": "Advanced", "price": 35 }],
  "total": 35,
  "currency": "USD",
  "preferredTime": { "startsAt": "2026-11-16T15:00:00.000Z", "label": "Monday, November 16 at 9:00 AM CST", "timezone": "America/Chicago" },
  "customer": { "name": "…", "replyOn": "discord", "handle": "…" },
  "issue": "…",
  "submittedAt": "…"
}
```

`preferredTime` is `null` when the visitor doesn't pick a time. The form never asks for passwords, payment card details, codes sent to a phone or email, or sensitive files. The one session code is requested only during a session the customer has booked.

### 5. Reviews (consent required)
`testimonials` is empty, so the reviews section stays hidden. Add a review only after the customer agrees in writing to it being published:

```js
{ quote: "Their words, exactly as sent.", name: "First name, town", date: "2026-12-01", consentRecorded: true, disclosure: "" }
```

- `consentRecorded: true` is required. Without it, the entry is ignored.
- If the customer got a free or discounted session, put that in `disclosure`.
- Never write a review for someone, and never invent a rating or a count.

### 6. Analytics (optional)
`analytics.provider` is `"none"`, so nothing is loaded and no tracking happens. If you add analytics:
- Set `provider` to `"plausible"` or `"gtag"`, and add that tool's script to each page.
- Check whether you need consent before it loads in your region. Then update the privacy line on `contact.html`.
- The site currently says it uses no advertising trackers. Keep that line accurate.

The site's own calls to `SR.track()` do nothing unless a provider is set.

### 7. Headline test
`experiments.homeHeadline` shows one of two headlines on the home page. A visitor keeps the same headline for the rest of the browser tab, stored in `sessionStorage`. The variant is reported through `SR.track("headline_view")`, which does nothing until analytics is set up. To stop the test, delete `experiments.homeHeadline` from `config.js`. The page then keeps its default headline.

### 8. Copy review
Before launch, reread these against what you actually do:
- Service summaries, the "What we do" lists, and the "Best for" lines in `config.js`.
- The FAQ answers that are fixed text (not policy-based).
- The "Our promises" notice on `services.html` and the safety text on `how-it-works.html`.

Do not add promises about speed, frame rate, certification, years of experience, or customer numbers unless they are true and you can show evidence.

### 9. Facebook landing page
`landing.html` has the headline, description, and trust line you specified, and a single message button to the contact page. It's `noindex`. Point your Facebook ads at `https://softreset.cc/landing.html`. If you'd rather it be indexed, remove the `robots` meta tag and add it to `sitemap.xml`.

### 10. Legal pages (review before launch)
`terms.html`, `privacy.html`, and `refunds.html` are linked from every footer. They use the policy wording in `config.js` plus standard terms. They are not legal advice and have not been reviewed by a lawyer. Before launch, confirm:
- The business name the terms are issued under. The site doesn't name a legal entity.
- The governing law and where disputes are handled. The terms don't set this yet.
- The liability limit (capped at what the visitor paid for each service) and the under-18 clause in the terms.
- The privacy promise that information isn't sold or used for advertising.
- The privacy page if you change `bookingEndpoint` or turn analytics on. Both pages say so today.
- The refund and return wording in `config.js` (`refunds`, `productReturns`).

## Changing the site

- **Prices, services, FAQ, channels, products:** edit `config.js` only. Pages update themselves.
- **Navigation or footer links:** edit `common.js`. Every page updates.
- **Adding a page:** copy an existing page, keep the `data-page` attribute on `<body>` unique, add the page to `NAV` in `common.js` if it belongs in the menu, and add it to `sitemap.xml`.

## Testing locally

Some browsers block `fetch` and local scripts from `file://`, so serve the folder:

```bash
cd softreset
python3 -m http.server 8080
# then open http://localhost:8080
```

Check each page on a phone-sized screen. Check that the menu opens and closes, and that every link goes somewhere. Check the request form end to end with no endpoint set: choose a service, choose a time, fill in the details, submit, and copy the message.

## Notes
- Fonts load from Google Fonts. Everything else is local.
- Prices are formatted with `Intl` using `currency` from `config.js`.
- No cookies are set by the site itself.
