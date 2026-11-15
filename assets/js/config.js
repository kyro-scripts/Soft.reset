/* =========================================================
   softreset — site configuration
   Edit this file to change services, prices, contact channels,
   FAQ policies, reviews, and the optional booking endpoint.
   ========================================================= */
window.SOFTRESET_CONFIG = {
  brand: "softreset",
  tagline: "Remote Windows help. You stay in control.",
  siteUrl: "https://softreset.cc",   // used for canonical links and sitemap.xml. Confirm before launch.
  contactEmail: "",                  // leave "" to hide email everywhere

  /* Contact channels. Shown on the contact page, home page, and footer.
     Delete an entry to hide that channel. */
  contactChannels: [
    { id: "tiktok", label: "TikTok", handle: "@softreset.cc", url: "https://www.tiktok.com/@softreset.cc" },
    { id: "instagram", label: "Instagram", handle: "@softreset.cc", url: "https://www.instagram.com/softreset.cc/" },
    { id: "discord", label: "Discord", handle: "Join our server", url: "https://discord.gg/snYQn8Pwk8" },
  ],

  /* Pre-written messages, copied to the clipboard so visitors can paste them into the platform they pick.
     {service}, {price}, {time}, {name}, {issue} are filled in from the request form. */
  introMessage: "Hi softreset, I'd like to learn how it works. My PC problem is: ",
  requestMessage: "Hi softreset, I'd like to request {service} ({price}). Preferred time: {time}. Name: {name}. What's going on with my PC: {issue}",

  /* ---- Booking (request form) ---- */
  currency: "USD",
  timezone: "America/Chicago",       // times are offered in this zone
  timezoneLabel: "Central Time",
  workDays: [1, 2, 3, 4, 5],         // 0 = Sun ... 6 = Sat
  workHours: { start: 9, end: 17 },  // 24-hour clock
  slotMinutes: 60,
  daysToShow: 14,
  minLeadHours: 12,
  /* Optional. A URL that accepts a JSON POST (dashboard API, Zapier/Make webhook, form service).
     Leave "" and nothing is saved. The form then gives the visitor a ready-to-send message instead. */
  bookingEndpoint: "",

  /* ---- Services. Each one is a plain-English problem plus the work we do. ---- */
  services: [
    {
      id: "essential",
      name: "Essential",
      price: 25,
      summary: "Basic Windows cleanup.",
      problem: "Your PC feels cluttered, or it's slow to start and you're not sure what's running.",
      bestFor: "A basic tidy-up for a PC that's getting crowded.",
      work: [
        "Storage usage review",
        "Unnecessary application cleanup",
        "Startup application review",
        "Basic Windows housekeeping",
      ],
      covers: { cleanup: true, diagnostics: false, desktop: false, files: false, review: false },
    },
    {
      id: "advanced",
      name: "Advanced",
      price: 35,
      summary: "Cleanup and performance diagnostics.",
      problem: "Your PC is slow overall, or something specific like gaming feels worse than it should, and you want to know why.",
      bestFor: "Anyone who wants to understand what's slowing the PC, not just tidy it up.",
      work: [
        "Everything in Essential",
        "Windows performance diagnostics",
        "Gaming performance investigation",
        "System health and background-process review",
      ],
      note: "We explain what we find. We don't promise a specific speed or frame-rate result.",
      covers: { cleanup: true, diagnostics: true, desktop: false, files: false, review: false },
    },
    {
      id: "desktop-makeover",
      name: "Desktop Makeover",
      price: 20,
      summary: "Personalized Windows appearance.",
      problem: "Your desktop is messy, or it doesn't feel like yours.",
      bestFor: "Anyone who wants a tidier, more personal Windows look.",
      work: [
        "Wallpaper and theme customization",
        "Desktop and taskbar organization",
        "Icons and layout personalization",
        "A clean, cohesive desktop setup",
      ],
      covers: { cleanup: false, diagnostics: false, desktop: true, files: false, review: false },
    },
    {
      id: "file-organization",
      name: "File Organization",
      price: 20,
      summary: "Organize scattered files and folders.",
      problem: "Your documents, downloads, and photos are scattered, and you can't find what you need.",
      bestFor: "When finding files is the real problem.",
      work: [
        "Documents, Downloads, and photo organization",
        "Logical folder structures",
        "Duplicate file identification",
        "Desktop file organization",
      ],
      note: "We never delete, rename, or move important files without your explicit approval. We plan backups before significant changes.",
      separate: "This is a separate service. It is not included in Complete Refresh.",
      covers: { cleanup: false, diagnostics: false, desktop: false, files: true, review: false },
    },
    {
      id: "complete-refresh",
      name: "Complete Refresh",
      price: 45,
      summary: "Full Windows refresh.",
      problem: "You want one session that covers cleanup, diagnostics, and a tidy desktop.",
      bestFor: "A full refresh of your Windows setup.",
      work: [
        "Everything in Advanced",
        "Everything in Desktop Makeover",
        "Final system review",
      ],
      separate: "File Organization is a separate service and is not included.",
      covers: { cleanup: true, diagnostics: true, desktop: true, files: false, review: true },
    },
  ],

  /* ---- Policies. Leave a value as null until you've decided it.
     The site shows a DRAFT flag for every null policy, so nothing undecided goes live by accident. ---- */
  policies: {
    remoteTool: null,          // which remote support tool you use (must be properly licensed)
    installSoftware: null,     // whether the customer installs anything
    sessionLength: null,       // how long each service typically takes
    paymentTiming: null,       // how and when payment is requested
    refunds: null,             // refund policy
    unresolvedIssues: null,    // what happens if an issue can't be fixed
    retention: null,           // how long request details are kept
  },

  /* ---- FAQ. Each item has either a fixed answer (a) or a policy key from above (policy). ---- */
  faq: [
    {
      q: "How does remote PC support work?",
      a: "You share your screen with us through a remote support connection that you approve. We explain each step, and we only make changes you have approved.",
    },
    {
      q: "Will you be able to see my personal files?",
      a: "During a session we can see what's on your screen. We only look at files the service you chose needs, and only with your permission.",
    },
    {
      q: "Can I disconnect at any time?",
      a: "Yes. You can end the connection at any time, and you can tell us to stop.",
    },
    {
      q: "Will my PC definitely become faster?",
      a: "No, and we won't promise a specific speed or gaming result. We look at what's slowing your PC, make the changes you approve, and tell you what we found and what changed.",
    },
    {
      q: "What happens if my issue cannot be resolved?",
      policy: "unresolvedIssues",
    },
    {
      q: "Do you delete files?",
      a: "Not without your explicit approval. We don't delete, rename, or move important files. For significant file changes we plan a backup first. Unused apps and temporary files are removed only after you approve them.",
    },
    {
      q: "Do I need to install software?",
      policy: "installSoftware",
    },
    {
      q: "How long does a session take?",
      policy: "sessionLength",
    },
    {
      q: "How do I pay?",
      policy: "paymentTiming",
    },
    {
      q: "Do you offer refunds?",
      policy: "refunds",
    },
    {
      q: "What happens after the session?",
      a: "You receive a summary of the work we completed, what we changed, and anything we recommend you check later. You're welcome to give feedback afterwards.",
    },
  ],

  /* ---- Reviews. Shown only when consentRecorded is true and the text is genuine.
     Add an entry only after the customer has agreed in writing to publication.
     Example:
     { quote: "…their words…", name: "First name, town", date: "2026-12-01", consentRecorded: true, disclosure: "" }
     If the customer got a free or discounted session, set disclosure to say so. */
  testimonials: [],

  /* ---- Experiments. Each visitor sees one variant per browser tab (sessionStorage). No personal data. ---- */
  experiments: {
    homeHeadline: {
      variants: {
        A: "Give Your PC a Fresh Start.",
        B: "Is Your Windows PC Slow or Cluttered?",
      },
    },
  },

  /* ---- Analytics. "none" loads nothing. Options: "plausible" or "gtag". Needs your setup and, where required, consent. */
  analytics: { provider: "none" },

  /* ---- Products (shop page, physical items) ----
     Each product has its own Stripe Payment Link (one item per checkout).
     image: optional path or URL. Leave "" to show a tile with the product's initial.
     soldOut: true disables the buy button. Stock is NOT tracked automatically. */
  shippingNote: "Shipping is added at checkout.",
  orderThanksMessage: "Thanks for your order! We'll email you with shipping updates.",
  products: [
    {
      id: "cable-management-kit",
      name: "Cable Management Kit",
      price: 22,
      type: "Desk accessory",
      description: "Velcro ties, clips, and a sleeve to keep cables tidy behind your desk.",
      image: "",
      stripeLink: "",
      soldOut: false,
      shipping: true,
      badge: "New",
    },
    {
      id: "screen-keyboard-kit",
      name: "Screen & Keyboard Cleaning Kit",
      price: 14,
      type: "Cleaning kit",
      description: "A microfiber cloth, a small brush, and a cleaner made for screens and keyboards.",
      image: "",
      stripeLink: "",
      soldOut: false,
      shipping: true,
      badge: "",
    },
    {
      id: "xl-desk-mat",
      name: "XL Desk Mat",
      price: 29,
      type: "Desk accessory",
      description: "A large, stitched-edge mat with a non-slip base for your keyboard and mouse.",
      image: "",
      stripeLink: "",
      soldOut: false,
      shipping: true,
      badge: "",
    },
  ],
};
