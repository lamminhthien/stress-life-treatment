/* Chuyển giao diện sáng/tối và nhớ lựa chọn.
   Chế độ tự động (theo cài đặt hệ điều hành) do CSS đảm nhiệm; tệp này chỉ
   ghi đè khi người dùng bấm nút, và cập nhật nhãn cho trình đọc màn hình. */
(function () {
  var root = document.documentElement;
  var KEY = "theme";
  var mql = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function current() {
    var saved = root.getAttribute("data-theme");
    if (saved === "dark" || saved === "light") return saved;
    return mql && mql.matches ? "dark" : "light";
  }

  function paint() {
    var dark = current() === "dark";
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      b.setAttribute("aria-pressed", String(dark));
      b.setAttribute("aria-label", dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
      b.setAttribute("title", dark ? "Giao diện tối đang bật" : "Giao diện sáng đang bật");
      var icon = b.querySelector(".theme-icon");
      if (icon) icon.textContent = dark ? "☀" : "☾";
      var label = b.querySelector(".theme-text");
      if (label) label.textContent = dark ? "Sáng" : "Tối";
    }
  }

  function toggle() {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    paint();
  }

  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest("[data-theme-toggle]") : null;
    if (!btn) return;
    e.preventDefault();
    toggle();
  });

  if (mql) {
    if (mql.addEventListener) mql.addEventListener("change", paint);
    else if (mql.addListener) mql.addListener(paint);
  }

  paint();
})();
