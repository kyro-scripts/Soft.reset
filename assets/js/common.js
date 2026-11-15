/* Shared pieces used on every page:
   - Header and footer (edit the links here once and every page updates).
   - SR helpers: escaping, money formatting, copy-to-clipboard, and an analytics hook that does nothing unless configured.
   Every page has <div id="site-header"></div> and <div id="site-footer"></div>. */
(function () {
  "use strict";

  var cfg = window.SOFTRESET_CONFIG || {};
  var page = document.body.getAttribute("data-page") || "";
  var SR = (window.SR = window.SR || {});

  SR.cfg = cfg;

  SR.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  SR.money = function (n) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cfg.currency || "USD",
      maximumFractionDigits: 0,
    }).format(n);
  };

  SR.channel = function (id) {
    return (cfg.contactChannels || []).filter(function (c) { return c.id === id; })[0] || null;
  };

  SR.service = function (id) {
    return (cfg.services || []).filter(function (s) { return s.id === id; })[0] || null;
  };

  /* Icons: simple outlined shapes on a 24-unit grid, drawn in the current text colour.
     They are decorative (aria-hidden), so every icon sits next to words that say the same thing. */
  var ICONS = {
    sparkles: '<path d="M12 3.5l1.6 4.9 4.9 1.6-4.9 1.6L12 16.5l-1.6-4.9L5.5 10l4.9-1.6z"/><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    gauge: '<path d="M4.5 16a7.5 7.5 0 1 1 15 0"/><path d="M12 16l3.5-4"/><circle cx="12" cy="16" r="1"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-.9 2-1.9 0-.5-.2-.9-.5-1.2-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H17a4.5 4.5 0 0 0 4.5-4.5c0-4.1-3.9-6.7-9.5-6.7z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
    folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8.5"/><path d="M4 4.5v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 15.5"/><path d="M20 19.5v-4h-4"/>',
    layers: '<path d="M12 3.5l8.5 4.5L12 12.5 3.5 8z"/><path d="M3.5 12.5l8.5 4.5 8.5-4.5"/><path d="M3.5 16.5L12 21l8.5-4.5"/>',
    shield: '<path d="M12 3.5l7 2.8v5.2c0 4.3-2.9 8-7 9-4.1-1-7-4.7-7-9V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "check-circle": '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.4 2.4 4.6-4.8"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    message: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V16H6a2 2 0 0 1-2-2z"/><path d="M8.5 10h7"/>',
    chat: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V16H6a2 2 0 0 1-2-2z"/><path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01"/>',
    camera: '<rect x="3.5" y="4.5" width="17" height="15" rx="4.5"/><circle cx="12" cy="12" r="3.5"/><path d="M16.8 7.7h.01"/>',
    music: '<path d="M9 17.5V5.5l10-2v12"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    monitor: '<rect x="3" y="4.5" width="18" height="12" rx="2.5"/><path d="M8.5 20.5h7M12 16.5v4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    tag: '<path d="M3.5 12.3V4.5h7.8l9.2 9.2-7.8 7.8z"/><circle cx="8" cy="8.5" r="1.2"/>',
    eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    package: '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>',
    layout: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M9.5 9.5v10"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.4 2.4 0 1 1 3.4 2.2c-.6.3-1 .8-1 1.5v.4"/><path d="M12 16.8h.01"/>',
    user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/>',
    alert: '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4M12 17h.01"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };

  /* Returns the markup for a named icon, or an empty string for an unknown name. */
  SR.icon = function (name) {
    if (!name || !Object.prototype.hasOwnProperty.call(ICONS, name)) return "";
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + "</svg>";
  };

  /* Analytics hook. Does nothing unless analytics.provider is set in config.js. Never throws. */
  SR.track = function (name, props) {
    var provider = cfg.analytics && cfg.analytics.provider;
    try {
      if (provider === "plausible" && typeof window.plausible === "function") {
        window.plausible(name, { props: props || {} });
      } else if (provider === "gtag" && typeof window.gtag === "function") {
        window.gtag("event", name, props || {});
      }
    } catch (e) { /* analytics must never break the page */ }
  };

  /* Copy text to the clipboard. Resolves true on success, false if the visitor has to copy by hand. */
  SR.copy = function (text) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(); });
    }
    return Promise.resolve(fallback());
  };

  /* ---------- Header ---------- */

  var LOGO =
    '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">' +
    '<path d="M8.5 23.5h15a5.2 5.2 0 0 0 .6-10.36A7.7 7.7 0 0 0 9.6 11.9a6 6 0 0 0-1.1 11.6Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M12.5 19.2c1.7-1.9 4-1.9 5.6 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
    "</svg>";

  var NAV = [
    { key: "services", label: "Services", href: "services.html" },
    { key: "pricing", label: "Pricing", href: "pricing.html" },
    { key: "how", label: "How It Works", href: "how-it-works.html" },
    { key: "faq", label: "FAQ", href: "faq.html" },
    { key: "products", label: "Products", href: "products.html" },
  ];

  function header() {
    var links = NAV.map(function (n) {
      var current = n.key === page;
      return '<a href="' + n.href + '"' + (current ? ' class="is-active" aria-current="page"' : "") + ">" + n.label + "</a>";
    }).join("");

    return (
      '<header class="site-header"><div class="container nav-wrap">' +
      '<a href="index.html" class="logo" aria-label="' + SR.esc(cfg.brand) + ' home">' + LOGO + "<span>" + SR.esc(cfg.brand) + "</span></a>" +
      '<nav id="site-nav" class="site-nav" aria-label="Main">' + links +
      '<a class="btn btn-primary mobile-only" href="contact.html">Message Us</a></nav>' +
      '<a class="btn btn-primary nav-cta" href="contact.html">Message Us</a>' +
      '<a class="nav-services" href="services.html"' + (page === "services" ? ' aria-current="page"' : "") + ">Services</a>" +
      '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' +
      '<svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '<svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button>" +
      "</div></header>"
    );
  }

  /* ---------- Footer ---------- */

  function footer() {
    var channels = (cfg.contactChannels || [])
      .map(function (c) {
        return '<li><a href="' + SR.esc(c.url) + '" target="_blank" rel="noopener">' + SR.esc(c.label) + " <span class=\"muted-inline\">" + SR.esc(c.handle) + "</span></a></li>";
      })
      .join("");
    var email = cfg.contactEmail
      ? '<li><a href="mailto:' + SR.esc(cfg.contactEmail) + '">' + SR.esc(cfg.contactEmail) + "</a></li>"
      : "";

    return (
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
      '<div><a href="index.html" class="logo">' + LOGO + "<span>" + SR.esc(cfg.brand) + "</span></a>" +
      '<p class="footer-tagline">' + SR.esc(cfg.tagline || "") + "</p></div>" +
      '<nav aria-label="Footer"><p class="footer-h">Explore</p><ul class="footer-links">' +
      '<li><a href="services.html">Services</a></li>' +
      '<li><a href="pricing.html">Pricing</a></li>' +
      '<li><a href="how-it-works.html">How It Works</a></li>' +
      '<li><a href="faq.html">FAQ</a></li>' +
      '<li><a href="products.html">Products</a></li>' +
      '<li><a href="book.html">Request a session</a></li>' +
      "</ul></nav>" +
      '<div><p class="footer-h">Message us</p><ul class="footer-links">' + channels + email + "</ul>" +
      '<p class="footer-small"><a href="contact.html#privacy">How we handle your information</a></p></div>' +
      "</div>" +
      '<p class="fine-print">&copy; ' + new Date().getFullYear() + " " + SR.esc(cfg.brand) + ". All rights reserved.</p>" +
      "</div></footer>"
    );
  }

  var headerMount = document.getElementById("site-header");
  if (headerMount) headerMount.innerHTML = header();
  var footerMount = document.getElementById("site-footer");
  if (footerMount) footerMount.innerHTML = footer();
})();
