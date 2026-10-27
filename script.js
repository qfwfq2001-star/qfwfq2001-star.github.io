/* ===========================================================
   Viewer behaviour. You should not need to touch this file.
   =========================================================== */

(function () {
  var img     = document.getElementById("work");
  var plate   = document.getElementById("plate");
  var stage   = document.getElementById("stage");
  var caption = document.getElementById("caption");
  var nEl     = document.getElementById("n");
  var totalEl = document.getElementById("total");
  var fill    = document.getElementById("track-fill");
  var panel   = document.getElementById("index-panel");
  var grid    = document.getElementById("index-grid");
  var toggle  = document.getElementById("index-toggle");

  if (typeof works === "undefined" || !works || !works.length) {
    caption.textContent = "No works listed in works.js yet.";
    return;
  }

  /* how wide the painting is drawn, so the browser picks the right file */
  var NAME = (typeof site !== "undefined" && site.name) ? site.name : "";

  var SIZES = "(max-width: 680px) 92vw, (max-width: 1200px) 76vw, 64vw";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* pool is the set currently being browsed: everything, or one category */
  var pool = works.slice();
  var i = 0;
  var busy = false;
  /* The address bar only gets a #n once the visitor has actually moved.
     Writing it on the first render would make every reload look like a
     link to a particular work, which would then skip the opening screen. */
  var moved = false;

  function meta(w) {
    return [w.year, w.medium, w.size].filter(Boolean).join(", ");
  }

  var empty = document.createElement("div");
  empty.className = "collection-empty";
  empty.setAttribute("role", "status");
  empty.hidden = true;
  stage.appendChild(empty);

  function render(n) {
    var hasWorks = pool.length > 0;
    plate.hidden = !hasWorks;
    document.getElementById("prev").hidden = !hasWorks;
    document.getElementById("next").hidden = !hasWorks;
    empty.hidden = hasWorks;
    if (!hasWorks) {
      empty.replaceChildren();
      var heading = document.createElement("h1");
      heading.textContent = current === "Photography" ? "Tibet, 2022" : "Ceramics";
      var description = document.createElement("p");
      description.textContent = current === "Photography" ? "Photographs made in Tibet in 2022. Selection coming soon." : "Selected ceramic works coming soon.";
      empty.append(heading, description);
      caption.textContent = current;
      nEl.textContent = "0";
      totalEl.textContent = "0";
      fill.style.width = "0%";
      document.title = current + " — " + NAME;
      history.replaceState(null, "", location.pathname);
      busy = false;
      return;
    }

    i = (n + pool.length) % pool.length;
    var w = pool[i];

    caption.classList.add("fading");
    img.classList.remove("ready");

    var next = new Image();
    if (w.srcset) { next.srcset = w.srcset; next.sizes = SIZES; }
    next.onload = function () {
      if (w.srcset) { img.srcset = w.srcset; img.sizes = SIZES; } else { img.removeAttribute("srcset"); }
      img.src = w.src;
      img.alt = w.alt || w.title + ", " + meta(w);
      requestAnimationFrame(function () { img.classList.add("ready"); });

      caption.innerHTML =
        (w.category === "Photography" ? "<em>Tibet, 2022</em>" : "<em>" + w.title + "</em>" + meta(w)) +
        (w.note ? '<span class="note">' + w.note + "</span>" : "");
      caption.classList.remove("fading");
      busy = false;
    };
    next.onerror = function () {
      caption.innerHTML = "<em>Missing file</em>" + w.src;
      caption.classList.remove("fading");
      busy = false;
    };
    next.src = w.src;
    if (next.complete) next.onload();

    nEl.textContent = i + 1;
    totalEl.textContent = pool.length;
    fill.style.width = ((i + 1) / pool.length * 100) + "%";
    document.title = (w.series || w.title) + (NAME ? " — " + NAME : "");
    if (moved) history.replaceState(null, "", "#" + (works.indexOf(w) + 1));

    [i + 1, i - 1].forEach(function (k) {
      var n = pool[(k + pool.length) % pool.length];
      var pre = new Image();
      if (n.srcset) { pre.srcset = n.srcset; pre.sizes = SIZES; }
      pre.src = n.src;
    });
  }

  function go(n) {
    if (busy || !pool.length) return;
    busy = true;
    moved = true;
    render(n);
  }

  function openIndex(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Index";
    document.body.style.overflow = open ? "hidden" : "";
  }

  function drawGrid() {
    grid.innerHTML = "";
    if (!pool.length) {
      var message = document.createElement("p");
      message.className = "index-empty";
      message.textContent = current === "Photography" ? "Tibet, 2022 — photographs coming soon." : "Selected ceramic works coming soon.";
      grid.appendChild(message);
    }
    pool.forEach(function (w, n) {
      var b = document.createElement("button");
      b.type = "button";
      b.innerHTML =
        '<img src="' + (w.thumb || w.src) + '" alt="" loading="lazy">' +
        (w.category === "Photography" ? "" : '<span class="meta"><em>' + w.title + "</em>" + w.year + "</span>");
      b.setAttribute("aria-label", w.alt || w.title);
      b.addEventListener("click", function () { moved = true; render(n); openIndex(false); });
      grid.appendChild(b);
    });
  }

  /* Categories come from the works themselves, in the order they first
     appear, so adding one to works.js adds it to the header. */
  function categories() {
    return ["Painting", "Ceramics", "Photography"];
  }

  var current = "";

  function filterTo(name) {
    var keeping = pool[i];
    current = name;
    pool = name ? works.filter(function (w) { return w.category === name; }) : works.slice();

    var at = pool.indexOf(keeping);
    moved = true;
    drawGrid();
    drawFilters();
    render(at > -1 ? at : 0);
  }

  function drawFilters() {
    var names = categories();
    if (names.length < 2) return;
    [document.getElementById("filters-bar"), document.getElementById("filters-index")]
      .forEach(function (host) {
        if (!host) return;
        host.innerHTML = "";
        [""].concat(names).forEach(function (name) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = name || "All";
          b.setAttribute("aria-pressed", String(current === name));
          b.addEventListener("click", function () { filterTo(name); });
          host.appendChild(b);
        });
      });
  }

  drawGrid();
  drawFilters();
  totalEl.textContent = pool.length;
  document.getElementById("prev").addEventListener("click", function () { go(i - 1); });
  document.getElementById("next").addEventListener("click", function () { go(i + 1); });
  toggle.addEventListener("click", function () { openIndex(panel.hidden); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(i + 1); }
    else if (e.key === "ArrowLeft") go(i - 1);
    else if (e.key === "Escape") openIndex(false);
    else if (e.key === "i" || e.key === "I") openIndex(panel.hidden);
  });

  var x0 = null;
  document.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 48) go(dx < 0 ? i + 1 : i - 1);
    x0 = null;
  }, { passive: true });

  /* Cursor parallax. A few pixels only — the painting should feel
     lit from a slightly different angle as you move, nothing more. */
  if (!calm && window.matchMedia("(hover: hover)").matches) {
    var raf = null, tx = 0, ty = 0;
    stage.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width  - .5) * -14;
      ty = ((e.clientY - r.top)  / r.height - .5) * -9;
      if (!raf) raf = requestAnimationFrame(function () {
        plate.style.transform = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0)";
        raf = null;
      });
    });
    stage.addEventListener("mouseleave", function () {
      plate.style.transform = "translate3d(0,0,0)";
    });
  }

  var start = parseInt(location.hash.slice(1), 10);
  var deepLink = start > 0 && start <= works.length;
  if (deepLink) moved = true;
  render(deepLink ? start - 1 : 0);

  /* Opening screen. Always skipped when the visitor arrived on a link to a
     specific work (#2), since they asked for that work, not an introduction. */
  (function () {
    var el = document.getElementById("cover");
    if (!el || typeof cover === "undefined" || !cover.enabled) return;
    if (deepLink) return;

    if (cover.oncePerSession) {
      var seen = false;
      try { seen = sessionStorage.getItem("seen-cover") === "1"; } catch (e) {}
      if (seen) return;
    }

    var pic = document.getElementById("cover-image");

    if (NAME) document.title = NAME;
    if (cover.srcset) pic.srcset = cover.srcset;
    pic.src = cover.src;

    el.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { el.classList.add("lit"); });

    var gone = false;
    function leave() {
      if (gone) return;
      gone = true;
      if (cover.oncePerSession) {
        try { sessionStorage.setItem("seen-cover", "1"); } catch (e) {}
      }
      el.classList.add("leaving");
      document.body.style.overflow = "";
      render(i);
      setTimeout(function () { el.hidden = true; }, 950);
      document.removeEventListener("keydown", onKey, true);
    }
    function onKey(e) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " " ||
          e.key === "ArrowRight" || e.key === "ArrowDown") { e.stopPropagation(); leave(); }
    }
    el.addEventListener("click", leave);
    document.addEventListener("keydown", onKey, true);
    el.addEventListener("wheel", leave, { passive: true });
    el.addEventListener("touchmove", leave, { passive: true });
  })();
})();
