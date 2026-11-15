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
