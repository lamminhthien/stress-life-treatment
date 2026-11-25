(function () {
  "use strict";

  var items = Array.prototype.slice.call(document.querySelectorAll(".quotes > li"));
  if (!items.length) return;

  var canvasOk = (function () {
    var test = document.createElement("canvas");
    return !!(test.getContext && test.getContext("2d") && test.toBlob);
  })();
  if (!canvasOk) return;

  var FORMATS = {
    square: { w: 1080, h: 1080, name: "vuông" },
    story: { w: 1080, h: 1920, name: "dọc" }
  };

  var currentText = "";
  var format = "square";
  var lastFocus = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function clean(text) {
    return (text || "").replace(/^[\s“”"]+|[\s“”"]+$/g, "").replace(/\s+/g, " ").trim();
  }

  function quoteText(li) {
    var span = li.querySelector(".q-text");
    if (span) return span.textContent;

    var clone = li.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll("button"), function (btn) {
      btn.parentNode.removeChild(btn);
    });
    return clone.textContent;
  }

  /* ----- Khung hộp thoại, tạo một lần rồi dùng cho mọi câu ----- */

  var dialog = el("dialog", "share-dialog");
  dialog.setAttribute("aria-labelledby", "share-dialog-title");

  var inner = el("div", "share-inner");

  var head = el("div", "share-head");
  var title = el("h2", "", "Tạo ảnh từ câu nói");
  title.id = "share-dialog-title";
  var closeX = el("button", "share-close", "×");
  closeX.type = "button";
  closeX.setAttribute("aria-label", "Đóng");
  head.appendChild(title);
  head.appendChild(closeX);

  var preview = el("p", "share-quote-preview");

  var formats = el("div", "share-format");
  formats.setAttribute("role", "group");
  formats.setAttribute("aria-label", "Chọn kiểu ảnh");

  var formatButtons = {};
  [["square", "Vuông · 1080×1080"], ["story", "Dọc · 1080×1920"]].forEach(function (pair) {
    var btn = el("button", "share-format-btn", pair[1]);
    btn.type = "button";
    btn.setAttribute("data-share-format", pair[0]);
    btn.setAttribute("aria-pressed", pair[0] === "square" ? "true" : "false");
    if (pair[0] === "square") btn.classList.add("is-active");
    formatButtons[pair[0]] = btn;
    btn.addEventListener("click", function () { setFormat(pair[0], true); });
    formats.appendChild(btn);
  });

  var previewBox = el("div", "share-preview");
  var canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Ảnh xem trước của câu nói");
  previewBox.appendChild(canvas);

  var actions = el("div", "share-actions");
  var downloadBtn = el("button", "btn", "Tải ảnh PNG");
  downloadBtn.type = "button";
  var closeBtn = el("button", "btn btn-soft", "Đóng");
  closeBtn.type = "button";
  actions.appendChild(downloadBtn);
  actions.appendChild(closeBtn);

  var statusEl = el("p", "share-status");
  statusEl.setAttribute("role", "status");
  statusEl.setAttribute("aria-live", "polite");

  inner.appendChild(head);
  inner.appendChild(preview);
  inner.appendChild(formats);
  inner.appendChild(previewBox);
  inner.appendChild(actions);
  inner.appendChild(statusEl);
  dialog.appendChild(inner);
  document.body.appendChild(dialog);

  function finishClose() {
    currentText = "";
    if (lastFocus && document.contains(lastFocus) && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  dialog.addEventListener("close", finishClose);

  function closeDialog() {
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      dialog.classList.remove("is-open");
      finishClose();
    }
  }

  closeX.addEventListener("click", closeDialog);
  closeBtn.addEventListener("click", closeDialog);

  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) closeDialog();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && dialog.open && typeof dialog.showModal !== "function") {
      closeDialog();
    }
  });

  /* ----- Màu lấy từ theme đang bật ----- */

  function cssVar(styles, name, fallback) {
    var value = (styles.getPropertyValue(name) || "").trim();
    return value || fallback;
  }

  function colors() {
    var styles = getComputedStyle(document.documentElement);
    return {
      bg: cssVar(styles, "--bg", "#f6f3ec"),
      bgAlt: cssVar(styles, "--bg-alt", "#eef1e8"),
      ink: cssVar(styles, "--ink", "#2e3a31"),
      soft: cssVar(styles, "--ink-soft", "#55624f"),
      accent: cssVar(styles, "--accent", "#6f8b6a"),
      warm: cssVar(styles, "--accent-warm", "#b9744f"),
      line: cssVar(styles, "--line", "#d6d8c9")
    };
  }

  function rgb(hex) {
    var match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!match) return { r: 46, g: 58, b: 49 };
    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16)
    };
  }

  function rgba(hex, alpha) {
    var c = rgb(hex);
    return "rgba(" + c.r + ", " + c.g + ", " + c.b + ", " + alpha + ")";
  }

  /* ----- Vẽ ảnh ----- */

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapLines(ctx, text, maxWidth) {
    var words = text.split(/\s+/);
    var lines = [];
    var line = "";

    words.forEach(function (word) {
      var next = line ? line + " " + word : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });

    if (line) lines.push(line);
    return lines;
  }

  function fitText(ctx, text, maxWidth, maxHeight, maxSize, minSize) {
    var size = maxSize;
    while (size >= minSize) {
      ctx.font = 'italic 400 ' + size + 'px "Lora", Georgia, serif';
      var lines = wrapLines(ctx, text, maxWidth);
      var lineHeight = Math.round(size * 1.38);
      if (lines.length * lineHeight <= maxHeight) {
        return { size: size, lines: lines, lineHeight: lineHeight };
      }
      size -= 2;
    }

    ctx.font = 'italic 400 ' + minSize + 'px "Lora", Georgia, serif';
    return {
      size: minSize,
      lines: wrapLines(ctx, text, maxWidth),
      lineHeight: Math.round(minSize * 1.38)
    };
  }

  function render() {
    if (!currentText) return;

    var f = FORMATS[format];
    var ctx = canvas.getContext("2d");
    var c = colors();
    var W = f.w;
    var H = f.h;
    var M = format === "story" ? 130 : 110;

    canvas.width = W;
    canvas.height = H;

    var bg = ctx.createLinearGradient(0, 0, W * 0.35, H);
    bg.addColorStop(0, c.bg);
    bg.addColorStop(1, c.bgAlt);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var glow = ctx.createRadialGradient(W * 0.85, H * 0.08, 0, W * 0.85, H * 0.08, W * 0.7);
    glow.addColorStop(0, rgba(c.accent, 0.2));
    glow.addColorStop(1, rgba(c.accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    var glow2 = ctx.createRadialGradient(W * 0.1, H * 0.92, 0, W * 0.1, H * 0.92, W * 0.65);
    glow2.addColorStop(0, rgba(c.warm, 0.16));
    glow2.addColorStop(1, rgba(c.warm, 0));
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    var inset = Math.round(M * 0.5);
    ctx.strokeStyle = rgba(c.line, 0.9);
    ctx.lineWidth = 2;
    roundedRect(ctx, inset, inset, W - inset * 2, H - inset * 2, 26);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = c.accent;
    ctx.font = '600 30px "Be Vietnam Pro", system-ui, sans-serif';
    if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
    ctx.fillText("HẠ NHIỆT", M, M + 40);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

    ctx.fillStyle = c.soft;
    ctx.font = 'italic 400 26px "Lora", Georgia, serif';
    ctx.fillText("một khoảng lặng nhỏ", M, M + 82);

    var area = format === "story"
      ? { top: 430, bottom: H - 430, maxWidth: W - M * 2 }
      : { top: 280, bottom: H - 280, maxWidth: W - M * 2 };
    var maxHeight = area.bottom - area.top;

    var fitted = fitText(
      ctx,
      currentText,
      area.maxWidth,
      maxHeight,
      format === "story" ? 96 : 80,
      format === "story" ? 48 : 40
    );

    var blockHeight = fitted.lines.length * fitted.lineHeight;
    var blockTop = area.top + (maxHeight - blockHeight) / 2;

    ctx.fillStyle = rgba(c.warm, 0.85);
    ctx.fillRect(W / 2 - 32, blockTop - 48, 64, 4);

    ctx.fillStyle = c.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'italic 400 ' + fitted.size + 'px "Lora", Georgia, serif';

    var y = blockTop + fitted.lineHeight / 2;
    fitted.lines.forEach(function (line) {
      ctx.fillText(line, W / 2, y);
      y += fitted.lineHeight;
    });

    var footerY = H - M - 55;
    ctx.strokeStyle = rgba(c.line, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(M, footerY - 62);
    ctx.lineTo(W - M, footerY - 62);
    ctx.stroke();

    ctx.fillStyle = c.soft;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = '400 26px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.fillText("lamminhthien.github.io/stress-life-treatment", W / 2, footerY);

    canvas.setAttribute(
      "aria-label",
      "Ảnh " + f.name + " " + W + "×" + H + " chứa câu: " + currentText
    );
  }

  function setFormat(next, announce) {
    if (!FORMATS[next]) return;
    format = next;

    Object.keys(formatButtons).forEach(function (key) {
      var on = key === next;
      formatButtons[key].setAttribute("aria-pressed", String(on));
      formatButtons[key].classList.toggle("is-active", on);
    });

    render();

    if (announce) {
      var f = FORMATS[next];
      statusEl.textContent = "Đã chuyển sang ảnh " + f.name + " " + f.w + "×" + f.h +
        ". Bấm “Tải ảnh PNG” để lưu.";
    }
  }

  function openFor(li) {
    var text = clean(quoteText(li));
    if (!text) return;

    lastFocus = document.activeElement;
    currentText = text;
    preview.textContent = "“" + text + "”";
    setFormat("square", false);

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
      dialog.classList.add("is-open");
    }

    closeX.focus();
    statusEl.textContent = "Ảnh vuông 1080×1080 đã sẵn sàng. Bấm “Tải ảnh PNG” để lưu, hoặc chọn kiểu dọc.";
  }

  downloadBtn.addEventListener("click", function () {
    if (!currentText) return;

    var f = FORMATS[format];
    statusEl.textContent = "Đang tạo ảnh PNG…";

    try {
      canvas.toBlob(function (blob) {
        if (!blob) {
          statusEl.textContent = "Không tạo được ảnh. Thử tải lại trang rồi làm lại.";
          return;
        }

        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = "ha-nhiet-cau-noi-" + f.w + "x" + f.h + ".png";
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);

        statusEl.textContent = "Đã tải ảnh " + f.w + "×" + f.h +
          " xuống máy. Ảnh được tạo tại trình duyệt, không gửi đi đâu.";
      }, "image/png");
    } catch (e) {
      statusEl.textContent = "Trình duyệt không xuất được ảnh PNG. Thử bằng trình duyệt khác.";
    }
  });

  function addButtons() {
    items.forEach(function (li) {
      var text = clean(quoteText(li));
      if (!text) return;

      var btn = el("button", "q-share", "Tạo ảnh chia sẻ");
      btn.type = "button";
      btn.setAttribute(
        "aria-label",
        "Tạo ảnh chia sẻ từ câu: " + (text.length > 70 ? text.slice(0, 70) + "…" : text)
      );
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openFor(li);
      });
      li.appendChild(btn);
    });
  }

  addButtons();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (currentText && dialog.open) render();
    });
  }
})();
