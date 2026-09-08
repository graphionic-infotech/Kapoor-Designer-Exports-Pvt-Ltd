/* Kapoor Designer Exports — interactions (no dependencies) */
(function () {
  "use strict";

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Sticky nav shadow */
  var navbar = document.getElementById("navbar");
  var onScroll = function () {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = navbar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navbar.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  });

  /* Active section highlight */
  var navAs = Array.prototype.slice.call(links.querySelectorAll("a"));
  var map = {};
  navAs.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navAs.forEach(function (a) { a.classList.remove("active"); });
          map[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) secObs.observe(s);
    });
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Live open / closed status — store hours in Asia/Kolkata
     Mon–Sat 10:30–21:00, Sun 11:00–17:00 (as listed for the store) */
  function storeNow() {
    try {
      var fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata", weekday: "short",
        hour: "2-digit", minute: "2-digit", hour12: false
      });
      var parts = fmt.formatToParts(new Date());
      var get = function (t) {
        for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parts[i].value;
        return "";
      };
      var wd = get("weekday");
      var day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd];
      var mins = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
      return { day: day, mins: mins };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function openState() {
    var n = storeNow();
    var o = n.day === 0 ? 11 * 60 : 10 * 60 + 30;
    var c = n.day === 0 ? 17 * 60 : 21 * 60;
    if (n.mins >= o && n.mins < c) {
      var plus = n.day === 0 ? "5:00 PM" : "9:00 PM";
      return { open: true, label: "Open now · Closes " + plus, tb: "Open now · Closes " + plus };
    }
    var opensAt = n.mins < o
      ? (n.day === 0 ? "11:00 AM" : "10:30 AM") + " today"
      : (n.day === 6 ? "11:00 AM Sunday" : "10:30 AM tomorrow");
    return { open: false, label: "Closed · Opens " + opensAt, tb: "Closed · Opens " + opensAt };
  }
  function paintStatus() {
    var st = openState();
    var badge = document.getElementById("openBadge");
    var txt = document.getElementById("openText");
    if (badge && txt) {
      badge.classList.toggle("open", st.open);
      badge.classList.toggle("closed", !st.open);
      txt.textContent = st.label;
    }
    var tb = document.getElementById("tbStatus");
    if (tb) tb.textContent = st.tb;
    var dot = document.getElementById("tbDot");
    if (dot) {
      dot.style.background = st.open ? "#7bc47f" : "#e08a8a";
      dot.style.boxShadow = st.open ? "0 0 0 3px rgba(123,196,127,.18)" : "0 0 0 3px rgba(224,138,138,.18)";
    }
    /* Highlight today's row */
    var n = storeNow();
    document.querySelectorAll("#hoursTable tbody tr").forEach(function (tr) {
      var days = (tr.getAttribute("data-days") || "").split(",");
      tr.classList.toggle("today", days.indexOf(String(n.day)) > -1);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* Enquiry form → WhatsApp */
  var form = document.getElementById("enquiryForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("fName");
    var phone = document.getElementById("fPhone");
    var interest = document.getElementById("fInterest");
    var msg = document.getElementById("fMsg");
    var ok = true;
    [name, phone].forEach(function (f) {
      var bad = !f.value.trim() || (f === phone && f.value.replace(/\D/g, "").length < 8);
      f.style.borderColor = bad ? "#b3262e" : "";
      if (bad) ok = false;
    });
    if (!ok) {
      (!name.value.trim() ? name : phone).focus();
      return;
    }
    var text = "Hello Kapoor Designer Exports,%0A" +
      "Name: " + encodeURIComponent(name.value.trim()) + "%0A" +
      "Phone: " + encodeURIComponent(phone.value.trim()) + "%0A" +
      "Interested in: " + encodeURIComponent(interest.value) + "%0A" +
      (msg.value.trim() ? "Message: " + encodeURIComponent(msg.value.trim()) : "Please share designs with prices.");
    window.open("https://wa.me/919313999285?text=" + text, "_blank", "noopener");
  });
})();
