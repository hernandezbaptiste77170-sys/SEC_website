// Injects the shared header/footer chrome. Uses root-absolute paths ("/fr/...")
// so it works the same at any folder depth. If this site is ever deployed under
// a sub-path (e.g. https://user.github.io/repo/ instead of a custom domain at the
// root), every root-absolute link below needs that sub-path prefixed — see README.
(function () {
  var lang = document.documentElement.lang === "en" ? "en" : "fr";
  var t = window.SEC_STRINGS[lang];
  var path = window.location.pathname;

  var nav = [
    { href: "/" + lang + "/index.html", label: t.nav_home },
    { href: "/" + lang + "/blog/index.html", label: t.nav_blog },
    { href: "/" + lang + "/petitions/index.html", label: t.nav_petitions },
    { href: "/" + lang + "/members.html", label: t.nav_members },
    { href: "/" + lang + "/contact.html", label: t.nav_contact },
  ];

  function isCurrent(href) {
    // treat /fr/index.html and /fr/ as the same page
    var normalized = path.replace(/index\.html$/, "");
    var target = href.replace(/index\.html$/, "");
    return normalized === target;
  }

  var navHtml = nav
    .map(function (item) {
      var current = isCurrent(item.href) ? ' aria-current="page"' : "";
      return '<a href="' + item.href + '"' + current + ">" + item.label + "</a>";
    })
    .join("");

  var otherLang = lang === "fr" ? "en" : "fr";
  // swap the /fr/ or /en/ path segment to build the other language's URL,
  // preserving the query string (e.g. ?slug=... on a blog/petition detail page)
  var fullPath = path + window.location.search;
  var altPath = fullPath.replace(/^\/(fr|en)\//, "/" + otherLang + "/");
  if (altPath === fullPath) {
    altPath = "/" + otherLang + "/index.html";
  }

  var headerEl = document.getElementById("site-header");
  if (headerEl) {
    headerEl.innerHTML =
      '<div class="container">' +
      '<a class="logo-pill" href="/' + lang + '/index.html">' +
      '<span class="pill">SEC</span>' +
      "</a>" +
      '<nav class="site-nav" aria-label="main">' + navHtml + "</nav>" +
      '<div class="lang-switch">' +
      '<a href="' + (lang === "fr" ? fullPath : altPath) + '" aria-current="' + (lang === "fr") + '">FR</a>' +
      '<a href="' + (lang === "en" ? fullPath : altPath) + '" aria-current="' + (lang === "en") + '">EN</a>' +
      "</div>" +
      "</div>";
  }

  var footerEl = document.getElementById("site-footer");
  if (footerEl) {
    footerEl.innerHTML =
      '<div class="container">' +
      '<div class="footer-links">' +
      '<a href="/' + lang + '/legal-notice.html">' + t.footer_legal + "</a>" +
      '<a href="/' + lang + '/privacy.html">' + t.footer_privacy + "</a>" +
      "</div>" +
      "<div>" + t.footer_rights + "</div>" +
      "</div>";
  }
})();
