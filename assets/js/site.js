/* Page behaviour. Depends on common.js (window.SR).
   Everything shown here comes from config.js, so prices and copy are only edited in one place. */
(function () {
  "use strict";

  var SR = window.SR;
  if (!SR) return;
  var cfg = SR.cfg;
  var esc = SR.esc;
  var money = SR.money;

  /* ---------- Simple fills ---------- */

  document.querySelectorAll("[data-brand]").forEach(function (el) { el.textContent = cfg.brand; });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-email]").forEach(function (el) {
    if (!cfg.contactEmail) { el.hidden = true; return; }
    el.textContent = cfg.contactEmail;
    el.href = "mailto:" + cfg.contactEmail;
  });

  // Policy text. A policy with no answer hides the line that uses it, so nothing unfinished shows.
  document.querySelectorAll("[data-policy]").forEach(function (el) {
    var value = cfg.policies && cfg.policies[el.getAttribute("data-policy")];
    var line = el.closest("li, p");
    if (value) {
      el.textContent = value;
    } else if (line) {
      line.hidden = true;
    }
  });

  /* ---------- Contact channels ---------- */

  function renderChannels(el) {
    var channels = cfg.contactChannels || [];
    if (!channels.length) {
      el.innerHTML = '<p class="muted">Contact details will appear here.</p>';
      return;
    }
    el.innerHTML = channels
      .map(function (c) {
        return (
          '<article class="channel-card reveal">' +
          '<span class="icon-badge">' + SR.icon(c.icon) + "</span>" +
          "<h3>" + esc(c.label) + "</h3>" +
          '<p class="handle">' + esc(c.handle) + "</p>" +
          '<div class="channel-actions">' +
          '<a class="btn btn-primary" href="' + esc(c.url) + '" target="_blank" rel="noopener" data-track="contact_click" data-channel="' + esc(c.id) + '">Open ' + esc(c.label) + "</a>" +
          '<button type="button" class="btn btn-ghost" data-copy="intro" data-channel="' + esc(c.id) + '">Copy a starting message</button>' +
          "</div></article>"
        );
      })
      .join("");
  }

  document.querySelectorAll("[data-render='channels']").forEach(renderChannels);

  /* ---------- Services ---------- */

  // Home page: one line per service, linking to its section on the services page.
  var homeServices = document.getElementById("home-services");
  if (homeServices) {
    homeServices.innerHTML = cfg.services
      .map(function (s) {
        return (
          '<li class="service-row reveal">' +
          '<span class="icon-badge">' + SR.icon(s.icon) + "</span>" +
          '<div class="service-main"><a class="service-name" href="services.html#' + esc(s.id) + '">' + esc(s.name) + "</a>" +
          '<p class="muted">' + esc(s.problem) + "</p></div>" +
          '<p class="service-price">' + money(s.price) + "</p></li>"
        );
      })
      .join("");
  }

  // Services page: problem, expected work, and both ways to start.
  var serviceSections = document.getElementById("service-sections");
  if (serviceSections) {
    serviceSections.innerHTML = cfg.services
      .map(function (s) {
        return (
          '<section class="service-detail reveal" id="' + esc(s.id) + '" aria-labelledby="h-' + esc(s.id) + '">' +
          '<div class="service-intro">' +
          '<span class="icon-badge icon-badge--lg">' + SR.icon(s.icon) + "</span>" +
          '<p class="service-price-tag">' + money(s.price) + "</p>" +
          '<h2 id="h-' + esc(s.id) + '">' + esc(s.name) + "</h2>" +
          '<p class="service-summary">' + esc(s.summary) + "</p>" +
          '<p class="service-problem"><strong>When this helps:</strong> ' + esc(s.problem) + "</p>" +
          '<p class="muted"><strong>Best for:</strong> ' + esc(s.bestFor) + "</p>" +
          "</div>" +
          '<div class="service-work">' +
          "<h3>What we do</h3>" +
          '<ul class="checks">' + s.work.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul>" +
          (s.note ? '<p class="service-note">' + esc(s.note) + "</p>" : "") +
          (s.separate ? '<p class="service-note">' + esc(s.separate) + "</p>" : "") +
          '<div class="service-actions">' +
          '<a class="btn btn-primary" href="book.html?service=' + encodeURIComponent(s.id) + '">Request this service</a>' +
          '<a class="btn btn-ghost" href="contact.html">Message us first</a>' +
          "</div></div></section>"
        );
      })
      .join("");
  }

  /* ---------- Pricing ---------- */

  var pricingCards = document.getElementById("pricing-cards");
  if (pricingCards) {
    pricingCards.innerHTML = cfg.services
      .map(function (s) {
        return (
          '<article class="card price-card reveal">' +
          '<span class="icon-badge">' + SR.icon(s.icon) + "</span>" +
          "<h3>" + esc(s.name) + "</h3>" +
          '<p class="price">' + money(s.price) + "</p>" +
          '<p class="muted">' + esc(s.summary) + "</p>" +
          '<p class="price-best"><strong>Best for:</strong> ' + esc(s.bestFor) + "</p>" +
          '<p class="price-includes-label">Includes</p>' +
          '<ul class="checks">' + s.work.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul>" +
          (s.separate ? '<p class="service-note">' + esc(s.separate) + "</p>" : "") +
          '<div class="price-actions">' +
          '<a class="btn btn-primary btn-block" href="book.html?service=' + encodeURIComponent(s.id) + '">Request this service</a>' +
          '<a class="btn btn-ghost btn-block" href="contact.html">Ask a question first</a>' +
          "</div></article>"
        );
      })
      .join("");
  }

  // Comparison table: which parts of the work each service covers.
  var compareTable = document.getElementById("compare-table");
  if (compareTable) {
    var rows = [
      { key: "cleanup", label: "Basic Windows cleanup" },
      { key: "diagnostics", label: "Performance diagnostics" },
      { key: "desktop", label: "Desktop makeover" },
      { key: "files", label: "File organization" },
      { key: "review", label: "Final system review" },
    ];
    var head =
      '<tr><th scope="col"><span class="visually-hidden">Included work</span></th>' +
      cfg.services.map(function (s) {
        return '<th scope="col">' + esc(s.name) + '<span class="th-price">' + money(s.price) + "</span></th>";
      }).join("") +
      "</tr>";
    var body = rows
      .map(function (r) {
        return (
          '<tr><th scope="row">' + esc(r.label) + "</th>" +
          cfg.services.map(function (s) {
            return s.covers && s.covers[r.key]
              ? '<td><span class="yes">' + SR.icon("check") + "Included</span></td>"
              : '<td><span class="no">' + SR.icon("x") + '<span class="visually-hidden">Not included</span></span></td>';
          }).join("") +
          "</tr>"
        );
      })
      .join("");
    compareTable.innerHTML = "<thead>" + head + "</thead><tbody>" + body + "</tbody>";
  }

  // Plain-language difference between the two packages people compare most.
  var compareNote = document.getElementById("compare-note");
  if (compareNote) {
    var adv = SR.service("advanced");
    var desk = SR.service("desktop-makeover");
    var complete = SR.service("complete-refresh");
    if (adv && desk && complete) {
      compareNote.textContent =
        "Advanced covers cleanup and diagnostics for " + money(adv.price) + ". Complete Refresh adds the Desktop Makeover " +
        "and a final system review for " + money(complete.price) + ". Booked separately, Advanced and Desktop Makeover " +
        "would cost " + money(adv.price + desk.price) + " together. Choose Advanced if you only want diagnostics, " +
        "and Complete Refresh if you also want the desktop work and a final review.";
    }
  }

  /* ---------- FAQ ---------- */

  var faqList = document.getElementById("faq-list");
  if (faqList) {
    faqList.innerHTML = cfg.faq
      .map(function (item) {
        var answer = item.a || (item.policy && cfg.policies && cfg.policies[item.policy]) || "";
        if (!answer) return "";
        return '<details class="reveal"><summary>' + esc(item.q) + "</summary><p>" + esc(answer) + "</p></details>";
      })
      .join("");
  }

  /* ---------- Reviews (hidden until approved reviews exist) ---------- */

  var approved = (cfg.testimonials || []).filter(function (t) {
    return t && t.consentRecorded === true && t.quote && t.name;
  });
  var reviewSection = document.getElementById("reviews");
  if (reviewSection && approved.length) {
    reviewSection.hidden = false;
    document.getElementById("review-list").innerHTML = approved
      .map(function (t) {
        return (
          '<figure class="review-card"><blockquote>' + esc(t.quote) + "</blockquote>" +
          "<figcaption>" + esc(t.name) + (t.date ? ' · <time datetime="' + esc(t.date) + '">' + esc(t.date) + "</time>" : "") + "</figcaption>" +
          (t.disclosure ? '<p class="review-disclosure">' + esc(t.disclosure) + "</p>" : "") +
          "</figure>"
        );
      })
      .join("");
  }

  /* ---------- Headline experiment (homepage) ---------- */

  var headline = document.getElementById("hero-title");
  if (headline && headline.getAttribute("data-variant")) {
    SR.track("headline_view", { variant: headline.getAttribute("data-variant") });
  }

  /* ---------- Products (shop page) ---------- */

  var productGrid = document.getElementById("product-grid");
  if (productGrid) {
    var products = Array.isArray(cfg.products) ? cfg.products : [];
    var shipNote = document.getElementById("shipping-note");

    if (!products.length) {
      productGrid.innerHTML =
        '<div class="card empty-state"><h3>New products are on the way.</h3>' +
        '<p class="muted">Check back soon, or <a href="contact.html">message us</a> if you\'re looking for something specific.</p></div>';
    } else {
      productGrid.innerHTML = products
        .map(function (p) {
          var media = p.image
            ? '<img src="' + esc(p.image) + '" alt="" loading="lazy" />'
            : '<span class="product-icon">' + SR.icon(p.icon || "package") + "</span>";
          // Three states only: sold out (status), ready to buy (real link), or no checkout yet (a real link to contact).
          var buy;
          if (p.soldOut) {
            buy = '<p class="sold-out">Sold out</p>';
          } else if (p.stripeLink) {
            buy = '<a class="btn btn-primary" href="' + esc(p.stripeLink) + '">Buy now</a>';
          } else {
            buy = '<a class="btn btn-ghost" href="contact.html">Ask about this item</a>';
          }
          return (
            '<article class="card product-card reveal">' +
            '<div class="product-media">' + media + (p.badge ? '<span class="badge">' + esc(p.badge) + "</span>" : "") + "</div>" +
            '<div class="product-body">' +
            '<span class="product-type">' + esc(p.type || "Product") + "</span>" +
            "<h3>" + esc(p.name) + "</h3>" +
            '<p class="muted">' + esc(p.description || "") + "</p>" +
            (p.shipping && cfg.shippingNote ? '<p class="ship-line">' + esc(cfg.shippingNote) + "</p>" : "") +
            '<div class="product-buy"><p class="price">' + money(p.price) + "</p>" + buy + "</div>" +
            "</div></article>"
          );
        })
        .join("");
    }

    if (shipNote && cfg.shippingNote && products.some(function (p) { return p.shipping; })) {
      shipNote.textContent = cfg.shippingNote;
      shipNote.hidden = false;
    }

    if (new URLSearchParams(window.location.search).get("order") === "1") {
      var banner = document.getElementById("status-banner");
      if (banner) {
        banner.textContent = cfg.orderThanksMessage || "Thanks for your order!";
        banner.hidden = false;
        banner.focus();
      }
    }
  }

  /* ---------- Static icons and reveal on scroll ---------- */

  // Any element with data-icon gets that icon. Icons are decorative, so the words beside them carry the meaning.
  document.querySelectorAll("[data-icon]").forEach(function (el) {
    el.innerHTML = SR.icon(el.getAttribute("data-icon"));
  });

  // Elements marked .reveal fade and rise into place as they reach the screen. Siblings get a
  // small delay so a list builds up in order. Without JavaScript nothing is hidden.
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  revealEls.forEach(function (el) {
    var siblings = el.parentElement
      ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); })
      : [el];
    el.style.setProperty("--i", String(Math.max(0, siblings.indexOf(el))));
  });
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Copy buttons and tracking (event delegation) ---------- */

  var copyStatus = document.getElementById("copy-status");

  document.addEventListener("click", function (e) {
    var copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
      var channel = SR.channel(copyBtn.getAttribute("data-channel"));
      var name = channel ? channel.label : "the platform you chose";
      SR.copy(cfg.introMessage).then(function (ok) {
        if (copyStatus) {
          copyStatus.textContent = ok
            ? "Copied. Paste it into " + name + " and finish your message."
            : "We couldn't copy automatically. Select the message and copy it yourself: " + cfg.introMessage;
        }
      });
      SR.track("copy_intro", { channel: channel ? channel.id : "unknown" });
      return;
    }

    var tracked = e.target.closest("[data-track]");
    if (tracked) {
      SR.track(tracked.getAttribute("data-track"), { channel: tracked.getAttribute("data-channel") || "" });
    }
  });

  /* ---------- Mobile navigation ---------- */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        nav.classList.remove("is-open");
      }
    });
  }
})();
