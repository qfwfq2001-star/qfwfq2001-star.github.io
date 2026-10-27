/* ===========================================================
   Your details. Change them here and they change everywhere:
   the header on both pages, the browser tab, the opening screen,
   the contact links.

   Nothing else needs editing when your name or email changes.
   =========================================================== */

const site = {
  name:      "SHUQU LIU",
  tagline:   "Painting, ceramics & photography",
  email:     "qfwfq2001@gmail.com",
  instagram: "",
  gallery:   ""
};


/* --- below here is plumbing; you can ignore it --- */

(function () {
  function fill() {
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var key = el.getAttribute("data-site");
      if (!(key in site)) return;
      if (!site[key]) { el.hidden = true; return; }
      el.textContent = site[key];
    });
    document.querySelectorAll("[data-site-href]").forEach(function (el) {
      var key = el.getAttribute("data-site-href");
      if (!(key in site)) return;
      if (!site[key]) { el.hidden = true; return; }
      el.href = key === "email" ? "mailto:" + site[key] : site[key];
    });
    if (site.name && !document.body.classList.contains("viewer")) {
      document.title = (document.title.split("—")[0] || "").trim() + " — " + site.name;
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fill);
  } else {
    fill();
  }
})();
