(function () {
  var lang = document.documentElement.lang === "en" ? "en" : "fr";
  var t = window.SEC_STRINGS[lang];
  var grid = document.getElementById("members-grid");
  if (!grid) return;

  function initials(name) {
    return name
      .split(/\s+/)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .slice(0, 2)
      .join("");
  }

  grid.innerHTML = '<p class="skeleton">' + t.loading + "</p>";
  fetch("/content/members.json")
    .then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    })
    .then(function (data) {
      var members = data.members || [];
      // No hierarchy: same layout for everyone, alphabetical by first name.
      members = members.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
      grid.innerHTML = members
        .map(function (m) {
          var avatar = m.photo
            ? '<img class="member-avatar" src="' + m.photo + '" alt="">'
            : '<div class="member-avatar">' + initials(m.name) + "</div>";
          return (
            '<div class="member-card">' +
            avatar +
            '<div class="member-name">' + m.name + "</div>" +
            "</div>"
          );
        })
        .join("");
    })
    .catch(function () {
      grid.innerHTML = "<p>" + t.load_error + "</p>";
    });
})();
