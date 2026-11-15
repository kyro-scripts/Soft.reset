/* Request a session.
   The visitor picks a service and an optional preferred time, then describes the problem.
   Nothing is booked or charged here. We confirm the time and price by message first.

   - With cfg.bookingEndpoint set: the request is sent there, and the page says it was received.
   - Without it: the request is NOT saved. The page gives a ready-to-send message and the
     channel buttons, and says plainly that nothing has been sent yet. */
(function () {
  "use strict";

  var SR = window.SR;
  var form = document.getElementById("request-form");
  if (!SR || !form) return;

  var cfg = SR.cfg;
  var esc = SR.esc;
  var money = SR.money;
  var TZ = cfg.timezone;

  var serviceWrap = document.getElementById("service-options");
  var dayWrap = document.getElementById("date-options");
  var timeWrap = document.getElementById("time-options");
  var summary = document.getElementById("summary");
  var errorEl = document.getElementById("form-error");
  var submitBtn = document.getElementById("submit-btn");
  var outcome = document.getElementById("request-outcome");
  var replySelect = document.getElementById("f-reply");

  /* ---------- Time zone helpers (business hours are always in cfg.timezone) ---------- */

  function zoneParts(date, tz) {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).formatToParts(date);
    var v = {};
    parts.forEach(function (p) { v[p.type] = Number(p.value); });
    return { y: v.year, mo: v.month - 1, d: v.day, h: v.hour % 24, mi: v.minute, s: v.second };
  }

  function zonedToDate(y, mo, d, h, mi, tz) {
    var target = Date.UTC(y, mo, d, h, mi, 0);
    var guess = target;
    for (var i = 0; i < 2; i++) {
      var p = zoneParts(new Date(guess), tz);
      guess += target - Date.UTC(p.y, p.mo, p.d, p.h, p.mi, p.s);
    }
    return new Date(guess);
  }

  function fmt(opts) {
    return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: TZ }, opts));
  }
  var fmtTime = function (d) { return fmt({ hour: "numeric", minute: "2-digit" }).format(d); };
  var fmtDow = function (d) { return fmt({ weekday: "short" }).format(d); };
  var fmtMonDay = function (d) { return fmt({ month: "short", day: "numeric" }).format(d); };
  var fmtLong = function (d) { return fmt({ weekday: "long", month: "long", day: "numeric" }).format(d); };
  function tzAbbr(d) {
    var part = fmt({ timeZoneName: "short" }).formatToParts(d).filter(function (p) { return p.type === "timeZoneName"; })[0];
    return part ? part.value : "";
  }

  /* ---------- Available days and times ---------- */

  function buildDays() {
    var minTime = Date.now() + cfg.minLeadHours * 3600 * 1000;
    var today = zoneParts(new Date(), TZ);
    var startMin = cfg.workHours.start * 60;
    var endMin = cfg.workHours.end * 60;
    var days = [];

    for (var i = 0; i < cfg.daysToShow; i++) {
      var cal = new Date(Date.UTC(today.y, today.mo, today.d + i));
      if (cfg.workDays.indexOf(cal.getUTCDay()) === -1) continue;

      var y = cal.getUTCFullYear();
      var mo = cal.getUTCMonth();
      var d = cal.getUTCDate();
      var slots = [];
      for (var m = startMin; m + cfg.slotMinutes <= endMin; m += cfg.slotMinutes) {
        var when = zonedToDate(y, mo, d, Math.floor(m / 60), m % 60, TZ);
        if (when.getTime() >= minTime) slots.push(when);
      }
      if (slots.length) days.push({ anchor: zonedToDate(y, mo, d, 12, 0, TZ), slots: slots });
    }
    return days;
  }

  var state = {
    service: null,
    day: null,
    slot: null,
    submitting: false,
    days: buildDays(),
  };

  /* ---------- Rendering ---------- */

  function renderServices() {
    serviceWrap.innerHTML = cfg.services
      .map(function (s) {
        return (
          '<button type="button" class="opt" data-id="' + esc(s.id) + '" aria-pressed="false">' +
          '<span class="icon-badge icon-badge--sm">' + SR.icon(s.icon) + "</span>" +
          '<span class="opt-main"><span class="opt-top"><strong>' + esc(s.name) + '</strong><span class="opt-price">' + money(s.price) + "</span></span>" +
          '<span class="opt-meta">' + esc(s.summary) + "</span></span>" +
          "</button>"
        );
      })
      .join("");
  }

  function paintServices() {
    serviceWrap.querySelectorAll(".opt").forEach(function (b) {
      b.setAttribute("aria-pressed", String(!!state.service && b.getAttribute("data-id") === state.service.id));
    });
  }

  function renderDays() {
    if (!state.days.length) {
      dayWrap.innerHTML =
        '<p class="muted">No preferred times are open in the next ' + cfg.daysToShow +
        ' days. You can still send your request without a time.</p>';
      return;
    }
    dayWrap.innerHTML = state.days
      .map(function (day, i) {
        return (
          '<button type="button" class="chip" data-i="' + i + '" aria-pressed="false">' +
          '<span class="chip-dow">' + fmtDow(day.anchor) + "</span>" +
          '<span class="chip-date">' + fmtMonDay(day.anchor) + "</span></button>"
        );
      })
      .join("");
    paintDays();
  }

  function paintDays() {
    dayWrap.querySelectorAll(".chip").forEach(function (b) {
      var day = state.days[Number(b.getAttribute("data-i"))];
      b.setAttribute("aria-pressed", String(!!state.day && day === state.day));
    });
  }

  function renderTimes() {
    if (!state.day) {
      timeWrap.innerHTML = '<p class="muted">Pick a day to see times.</p>';
      return;
    }
    timeWrap.innerHTML = state.day.slots
      .map(function (s, i) {
        var on = !!state.slot && state.slot.getTime() === s.getTime();
        return '<button type="button" class="chip chip-time" data-i="' + i + '" aria-pressed="' + on + '">' + fmtTime(s) + "</button>";
      })
      .join("");
  }

  function updateSummary() {
    document.getElementById("sum-service").textContent = state.service ? state.service.name : "Not selected";
    document.getElementById("sum-price").textContent = state.service ? money(state.service.price) : "Choose a service";
    document.getElementById("sum-time").textContent = state.slot
      ? fmtLong(state.day.anchor) + " at " + fmtTime(state.slot) + " " + tzAbbr(state.slot)
      : "Flexible, or not sure yet";
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  function setSubmitting(on) {
    state.submitting = on;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Sending…" : "Send my request";
    form.setAttribute("aria-busy", on ? "true" : "false");
  }

  /* ---------- Interactions ---------- */

  serviceWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".opt");
    if (!btn) return;
    selectService(btn.getAttribute("data-id"));
  });

  dayWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    state.day = state.days[Number(btn.getAttribute("data-i"))];
    state.slot = null;
    paintDays();
    renderTimes();
    updateSummary();
  });

  timeWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn || !state.day) return;
    state.slot = state.day.slots[Number(btn.getAttribute("data-i"))];
    renderTimes();
    updateSummary();
  });

  function selectService(id) {
    state.service = SR.service(id);
    paintServices();
    updateSummary();
    clearError();
  }

  /* ---------- Message and outcome panels ---------- */

  function buildMessage(payload) {
    return cfg.requestMessage
      .replace("{service}", payload.service.name)
      .replace("{price}", money(payload.service.price))
      .replace("{time}", payload.preferredTime ? payload.preferredTime.label : "flexible")
      .replace("{name}", payload.customer.name)
      .replace("{issue}", payload.issue);
  }

  function channelFor(id) {
    return SR.channel(id);
  }

  function renderOutcome(kind, payload, message) {
    var channel = channelFor(payload.customer.replyOn);
    var channelLabel = channel ? channel.label : "the platform you chose";

    var heading;
    var body;
    if (kind === "received") {
      heading = "Request received";
      body =
        "Thanks, " + esc(payload.customer.name.split(" ")[0]) + ". We'll confirm the time and price with you by message on " +
        esc(channelLabel) + ". Nothing is booked or changed until you approve it.";
    } else if (kind === "ready") {
      heading = "Your message is ready";
      body =
        "This page doesn't save requests yet, so nothing has been sent. Copy the message below and send it to us on " +
        esc(channelLabel) + ". We'll confirm the time and price with you before anything is booked.";
    } else {
      heading = "We couldn't send your request";
      body =
        "Something went wrong on our end. Your message is still ready. Copy it below and send it to us on " +
        esc(channelLabel) + " so we get it.";
    }

    outcome.className = "outcome is-" + kind;
    outcome.innerHTML =
      "<h2>" + heading + "</h2>" +
      '<p class="outcome-body">' + body + "</p>" +
      '<label class="field" for="request-message"><span class="field-label">Your message</span>' +
      '<textarea id="request-message" class="message-box" rows="6" readonly>' + esc(message) + "</textarea></label>" +
      '<div class="outcome-actions">' +
      '<button type="button" class="btn btn-primary" data-copy-message>Copy my message</button>' +
      (channel && channel.url
        ? '<a class="btn btn-ghost" href="' + esc(channel.url) + '" target="_blank" rel="noopener" data-track="contact_click" data-channel="' + esc(channel.id) + '">Open ' + esc(channelLabel) + "</a>"
        : "") +
      "</div>" +
      '<p class="copy-status" data-copy-status aria-live="polite"></p>';

    outcome.hidden = false;
    outcome.focus();
    // An explicit "smooth" overrides the CSS reset, so check the preference here as well.
    var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    outcome.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  outcome.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy-message]");
    if (!btn) return;
    var box = document.getElementById("request-message");
    var status = outcome.querySelector("[data-copy-status]");
    SR.copy(box.value).then(function (ok) {
      status.textContent = ok
        ? "Copied. Paste it into the message to us."
        : "We couldn't copy automatically. Select the text in the box and copy it yourself.";
    });
    SR.track("copy_request_message", {});
  });

  /* ---------- Submit ---------- */

  function validate() {
    if (!state.service) return "Choose a service first.";
    if (!form.checkValidity()) {
      form.reportValidity();
      return "Please fill in the highlighted fields.";
    }
    return "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (state.submitting) return;

    var problem = validate();
    if (problem) {
      showError(problem);
      return;
    }
    clearError();

    var fd = new FormData(form);
    var payload = {
      source: "website",
      service: { id: state.service.id, name: state.service.name, price: state.service.price, currency: cfg.currency },
      preferredTime: state.slot
        ? { startsAt: state.slot.toISOString(), label: fmtLong(state.day.anchor) + " at " + fmtTime(state.slot), timezone: TZ }
        : null,
      customer: {
        name: String(fd.get("name") || "").trim(),
        replyOn: String(fd.get("reply") || ""),
        handle: String(fd.get("handle") || "").trim(),
      },
      issue: String(fd.get("issue") || "").trim(),
      submittedAt: new Date().toISOString(),
    };
    var message = buildMessage(payload);

    if (!cfg.bookingEndpoint) {
      // Nothing is saved. Give the visitor a message they can send themselves.
      form.hidden = true;
      summary.hidden = true;
      renderOutcome("ready", payload, message);
      SR.track("request_ready", { service: payload.service.id });
      return;
    }

    setSubmitting(true);
    fetch(cfg.bookingEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request endpoint returned " + res.status);
        form.hidden = true;
        summary.hidden = true;
        renderOutcome("received", payload, message);
        SR.track("request_submit", { service: payload.service.id });
      })
      .catch(function (err) {
        console.error(err);
        form.hidden = true;
        summary.hidden = true;
        renderOutcome("failed", payload, message);
        SR.track("request_failed", { service: payload.service.id });
      })
      .then(function () { setSubmitting(false); });
  });

  /* ---------- Init ---------- */

  renderServices();
  var wanted = new URLSearchParams(window.location.search).get("service");
  if (wanted) selectService(wanted);
  renderDays();
  renderTimes();
  updateSummary();

  document.getElementById("tz-note").textContent =
    "Times shown in " + cfg.timezoneLabel + " (" + tzAbbr(new Date()) + "). Optional: we confirm the time with you.";

  if (replySelect) {
    replySelect.innerHTML =
      '<option value="">Choose one</option>' +
      cfg.contactChannels
        .map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.label) + "</option>"; })
        .join("");
  }

  if (!cfg.bookingEndpoint) {
    console.warn("softreset: bookingEndpoint is empty. Requests are not saved; visitors get a message to send themselves.");
  }
})();
