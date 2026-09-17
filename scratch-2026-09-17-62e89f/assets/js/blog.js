(function () {
  var lang = document.documentElement.lang === "en" ? "en" : "fr";
  var t = window.SEC_STRINGS[lang];

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function loadPosts() {
    return fetch("/content/blog.json")
      .then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      })
      .then(function (data) {
        return (data.posts || []).slice().sort(function (a, b) {
          return a.date < b.date ? 1 : -1;
        });
      });
  }

  // --- Blog listing page ---
  var listEl = document.getElementById("blog-list");
  if (listEl) {
    // Homepage sets data-limit="3" to only show recent highlights; the full
    // blog index page omits it and shows everything.
    var limit = parseInt(listEl.getAttribute("data-limit"), 10);
    listEl.innerHTML = '<p class="skeleton">' + t.loading + "</p>";
    loadPosts()
      .then(function (posts) {
        if (!posts.length) {
          listEl.innerHTML = "<p>" + t.load_error + "</p>";
          return;
        }
        if (limit) {
          posts = posts.slice(0, limit);
        }
        listEl.innerHTML = posts
          .map(function (p) {
            return (
              '<a class="card" href="/' + lang + '/blog/post.html?slug=' + encodeURIComponent(p.slug) + '">' +
              "<h3>" + (p["title_" + lang] || "") + "</h3>" +
              '<div class="meta">' + fmtDate(p.date) + "</div>" +
              "<p>" + (p["excerpt_" + lang] || "") + "</p>" +
              "</a>"
            );
          })
          .join("");
      })
      .catch(function () {
        listEl.innerHTML = "<p>" + t.load_error + "</p>";
      });
  }

  // --- Blog post detail page ---
  var postEl = document.getElementById("blog-post");
  if (postEl) {
    postEl.innerHTML = '<p class="skeleton">' + t.loading + "</p>";
    var slug = new URLSearchParams(window.location.search).get("slug");
    loadPosts()
      .then(function (posts) {
        var post = posts.filter(function (p) {
          return p.slug === slug;
        })[0];
        if (!post) {
          postEl.innerHTML = "<p>" + t.load_error + "</p>";
          return;
        }
        var bodyHtml = window.marked
          ? window.marked.parse(post["body_" + lang] || "")
          : "<p>" + (post["body_" + lang] || "") + "</p>";
        document.title = post["title_" + lang] + " — SEC";
        postEl.innerHTML =
          "<h1>" + post["title_" + lang] + "</h1>" +
          '<div class="meta">' + fmtDate(post.date) + "</div>" +
          '<div class="post-body">' + bodyHtml + "</div>";
      })
      .catch(function () {
        postEl.innerHTML = "<p>" + t.load_error + "</p>";
      });
  }
})();
