// Injects the shared header/footer chrome, using paths relative to the site
// root (window.SEC_ROOT, computed here and reused by blog.js/petitions.js/
// members.js) rather than root-absolute "/..." paths. This makes the site work
// whether it's deployed at a domain root or under a GitHub Pages project
// sub-path like https://user.github.io/repo/.
(function () {
  var lang = document.documentElement.lang === "en" ? "en" : "fr";
  var t = window.SEC_STRINGS[lang];
  var path = window.location.pathname;

  // Find where "/fr/" or "/en/" starts in the real path (which may itself sit
  // under an arbitrary sub-path) and count how many segments follow it, to
  // know how many "../" it takes to get back to the site root from here.
  var langMatch = path.match(/\/(fr|en)\/(.*)$/);
  var afterLang = langMatch ? langMatch[2] : "index.html";
  var depth = 1 + (afterLang.split("/").length - 1); // "index.html" -> 1, "blog/post.html" -> 2
  var root = new Array(depth + 1).join("../");
  window.SEC_ROOT = root;

  function normalize(p) {
    return p.replace(/index\.html$/, "");
  }

  var currentKey = normalize(afterLang);

  var navItems = [
    { key: "index.html", label: t.nav_home },
    { key: "blog/index.html", label: t.nav_blog },
    { key: "petitions/index.html", label: t.nav_petitions },
    { key: "members.html", label: t.nav_members },
    { key: "contact.html", label: t.nav_contact },
  ];

  var navHtml = navItems
    .map(function (item) {
      var current = normalize(item.key) === currentKey ? ' aria-current="page"' : "";
      return '<a href="' + root + lang + "/" + item.key + '"' + current + ">" + item.label + "</a>";
    })
    .join("");

  var otherLang = lang === "fr" ? "en" : "fr";
  var search = window.location.search; // preserve ?slug=... across a language switch
  var currentHref = root + lang + "/" + afterLang + search;
  var otherHref = root + otherLang + "/" + afterLang + search;

  var headerEl = document.getElementById("site-header");
  if (headerEl) {
    headerEl.innerHTML =
      '<div class="container">' +
      '<a class="logo-pill" href="' + root + lang + '/index.html">' +
      '<span class="pill">SEC</span>' +
      "</a>" +
      '<nav class="site-nav" aria-label="main">' + navHtml + "</nav>" +
      '<div class="lang-switch">' +
      '<a href="' + (lang === "fr" ? currentHref : otherHref) + '" aria-current="' + (lang === "fr") + '">FR</a>' +
      '<a href="' + (lang === "en" ? currentHref : otherHref) + '" aria-current="' + (lang === "en") + '">EN</a>' +
      "</div>" +
      "</div>";
  }

  var footerEl = document.getElementById("site-footer");
  if (footerEl) {
    footerEl.innerHTML =
      '<div class="container">' +
      '<div class="footer-links">' +
      '<a href="' + root + lang + '/legal-notice.html">' + t.footer_legal + "</a>" +
      '<a href="' + root + lang + '/privacy.html">' + t.footer_privacy + "</a>" +
      "</div>" +
      "<div>" + t.footer_rights + "</div>" +
      "</div>";
  }
})();
