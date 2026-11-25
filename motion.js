/* Điều khiển chuyển động nhẹ: tôn trọng prefers-reduced-motion, nhớ lựa chọn
   tắt chuyển động, và tạm dừng animation khi khối .anim-loop ra khỏi màn hình. */
(function () {
  var body = document.body;
  var root = document.documentElement;
  var KEY = "motion";
  var mql = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}

  function systemReduce() {
    return !!(mql && mql.matches);
  }

  function isOff() {
    return saved === "off" || (saved === null && systemReduce());
  }

  function paintButton(btn) {
    if (!btn) return;
    var off = body.classList.contains("less-motion");
    btn.setAttribute("aria-pressed", String(!off));
    btn.setAttribute("aria-label", off ? "Bật chuyển động nhẹ" : "Tắt chuyển động nhẹ");
    btn.setAttribute("title", off ? "Chuyển động đang tắt" : "Chuyển động đang bật");
    btn.innerHTML = '<span class="motion-icon" aria-hidden="true">' + (off ? "❚❚" : "✦") + "</span>" +
      '<span class="motion-text">' + (off ? "Bật động" : "Tắt động") + "</span>";
  }

  function apply() {
    body.classList.toggle("less-motion", isOff());
    paintButton(document.querySelector("[data-motion-toggle]"));
  }

  function init() {
    apply();

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "motion-toggle";
    toggle.setAttribute("data-motion-toggle", "");
    var theme = document.querySelector("[data-theme-toggle]");
    if (theme && theme.parentNode) theme.parentNode.insertBefore(toggle, theme.nextSibling);
    else body.insertBefore(toggle, body.firstChild);
    paintButton(toggle);

    toggle.addEventListener("click", function () {
      var off = !body.classList.contains("less-motion");
      body.classList.toggle("less-motion", off);
      saved = off ? "off" : "on";
      try { localStorage.setItem(KEY, saved); } catch (e) {}
      paintButton(toggle);
    });

    if (mql) {
      var onChange = function () {
        if (saved === null) apply();
      };
      if (mql.addEventListener) mql.addEventListener("change", onChange);
      else if (mql.addListener) mql.addListener(onChange);
    }

    var loops = Array.prototype.slice.call(document.querySelectorAll(".anim-loop"));
    if (loops.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      }, { threshold: 0.15 });
      loops.forEach(function (el) { io.observe(el); });
    } else {
      loops.forEach(function (el) { el.classList.add("is-visible"); });
    }

    document.addEventListener("visibilitychange", function () {
      body.classList.toggle("is-hidden-tab", document.hidden);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
