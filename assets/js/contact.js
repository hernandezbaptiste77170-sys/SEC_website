// Submits the contact/ticket form to Formspree (https://formspree.io) via fetch,
// so the page never reloads. The form's `action` attribute in contact.html must be
// replaced with your real Formspree endpoint — see README.md "Configuring the
// contact form".
(function () {
  var lang = document.documentElement.lang === "en" ? "en" : "fr";
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("contact-form-status");

  form.addEventListener("submit", function (evt) {
    evt.preventDefault();

    if (form.action.indexOf("REPLACE_ME") !== -1) {
      status.className = "form-status visible error";
      status.textContent =
        lang === "fr"
          ? "Le formulaire n'est pas encore configuré (voir README.md)."
          : "The form isn't configured yet (see README.md).";
      return;
    }

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(function (r) {
        if (r.ok) {
          status.className = "form-status visible success";
          status.textContent =
            lang === "fr"
              ? "Merci, votre message a bien été envoyé. Nous ne le rendrons pas public."
              : "Thanks, your message was sent. We won't make it public.";
          form.reset();
        } else {
          throw new Error("http " + r.status);
        }
      })
      .catch(function () {
        status.className = "form-status visible error";
        status.textContent =
          lang === "fr"
            ? "Une erreur est survenue, réessayez plus tard."
            : "Something went wrong, please try again later.";
      });
  });
})();
