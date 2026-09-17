// Petition data (title/description) lives in content/petitions.json, editable from
// /admin. Signatures themselves are NOT stored in this repo: each petition is wired
// to its own Google Form (free, no-code) whose responses land in a Google Sheet.
// See README.md "Configuring a petition" for the one-time setup per petition.
(function () {
  var lang = document.documentElement.lang === "en" ? "en" : "fr";
  var t = window.SEC_STRINGS[lang];

  function loadPetitions() {
    return fetch("/content/petitions.json")
      .then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      })
      .then(function (data) {
        return data.petitions || [];
      });
  }

  // --- Petition listing page ---
  var listEl = document.getElementById("petitions-list");
  if (listEl) {
    listEl.innerHTML = '<p class="skeleton">' + t.loading + "</p>";
    loadPetitions()
      .then(function (petitions) {
        if (!petitions.length) {
          listEl.innerHTML = "<p>" + t.load_error + "</p>";
          return;
        }
        listEl.innerHTML = petitions
          .map(function (p) {
            var closed = p.status === "closed";
            return (
              '<a class="card" href="/' + lang + '/petitions/petition.html?slug=' + encodeURIComponent(p.slug) + '">' +
              (closed ? '<span class="badge-closed">' + t.petition_closed + "</span>" : "") +
              "<h3>" + (p["title_" + lang] || "") + "</h3>" +
              "<p>" + (p["description_" + lang] || "") + "</p>" +
              "</a>"
            );
          })
          .join("");
      })
      .catch(function () {
        listEl.innerHTML = "<p>" + t.load_error + "</p>";
      });
  }

  // --- Petition detail page ---
  var detailEl = document.getElementById("petition-detail");
  if (!detailEl) return;

  detailEl.innerHTML = '<p class="skeleton">' + t.loading + "</p>";
  var slug = new URLSearchParams(window.location.search).get("slug");

  loadPetitions().then(function (petitions) {
    var petition = petitions.filter(function (p) {
      return p.slug === slug;
    })[0];

    if (!petition) {
      detailEl.innerHTML = "<p>" + t.load_error + "</p>";
      return;
    }

    document.title = petition["title_" + lang] + " — SEC";
    var closed = petition.status === "closed";

    detailEl.innerHTML =
      (closed ? '<span class="badge-closed">' + t.petition_closed + "</span>" : "") +
      "<h1>" + petition["title_" + lang] + "</h1>" +
      '<div class="petition-counter">' +
      '<span class="count" id="petition-count">—</span>' +
      '<span class="label">' + t.signature_plural + "</span>" +
      "</div>" +
      "<p>" + (petition["description_" + lang] || "") + "</p>" +
      (closed ? "" : buildFormHtml());

    renderCounter(petition);

    if (!closed) {
      wireForm(petition);
    }
  });

  function buildFormHtml() {
    return (
      '<form class="sec-form" id="petition-form">' +
      '<div class="field"><label for="p-name">' +
      (lang === "fr" ? "Prénom et nom" : "First and last name") +
      '</label><input id="p-name" name="name" type="text" required></div>' +
      '<div class="field"><label for="p-email">Email</label>' +
      '<input id="p-email" name="email" type="email" required></div>' +
      '<div class="field field-checkbox"><input id="p-anon" name="anonymous" type="checkbox">' +
      "<label for=\"p-anon\">" +
      (lang === "fr"
        ? "Je souhaite rester anonyme (mon nom ne sera pas rendu public)"
        : "I want to stay anonymous (my name won't be made public)") +
      "</label></div>" +
      '<button class="btn btn-primary" type="submit">' + t.sign_this_petition + "</button>" +
      '<div class="form-status" id="petition-form-status"></div>' +
      "</form>"
    );
  }

  function renderCounter(petition) {
    var countEl = document.getElementById("petition-count");
    if (!countEl) return;
    if (!petition.sheet_csv_url) {
      countEl.textContent = "";
      countEl.parentElement.querySelector(".label").textContent = t.counter_pending;
      return;
    }
    fetch(petition.sheet_csv_url)
      .then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.text();
      })
      .then(function (csv) {
        var rows = csv.trim().split("\n");
        // first row is the Google Form header row
        var count = Math.max(0, rows.length - 1);
        countEl.textContent = String(count);
      })
      .catch(function () {
        countEl.textContent = "";
        countEl.parentElement.querySelector(".label").textContent = t.counter_pending;
      });
  }

  function wireForm(petition) {
    var form = document.getElementById("petition-form");
    var status = document.getElementById("petition-form-status");
    if (!form) return;

    form.addEventListener("submit", function (evt) {
      evt.preventDefault();

      if (!petition.google_form_action) {
        status.className = "form-status visible error";
        status.textContent =
          lang === "fr"
            ? "Cette pétition n'est pas encore configurée (formulaire manquant). Contactez le Bureau."
            : "This petition isn't configured yet (missing form). Contact the Board.";
        return;
      }

      // NB: read #p-name by id, not form.name — HTMLFormElement already has its
      // own native `name` property, which shadows a child <input name="name">.
      var body = new URLSearchParams();
      body.append(petition.entry_name, document.getElementById("p-name").value);
      body.append(petition.entry_email, form.email.value);
      if (petition.entry_anonymous) {
        body.append(petition.entry_anonymous, form.anonymous.checked ? "yes" : "no");
      }

      // Google Forms doesn't allow CORS reads, so this is a fire-and-forget
      // "no-cors" POST: we can't confirm delivery, only that the request was sent.
      fetch(petition.google_form_action, {
        method: "POST",
        mode: "no-cors",
        body: body,
      })
        .then(function () {
          status.className = "form-status visible success";
          status.textContent =
            lang === "fr" ? "Merci, votre signature a été envoyée !" : "Thanks, your signature was sent!";
          form.reset();
        })
        .catch(function () {
          status.className = "form-status visible error";
          status.textContent =
            lang === "fr"
              ? "Impossible d'envoyer votre signature pour le moment."
              : "Couldn't send your signature right now.";
        });
    });
  }
})();
