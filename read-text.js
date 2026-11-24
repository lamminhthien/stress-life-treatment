(function (global) {
  "use strict";

  function collapseWhitespace(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function pageText(rootSelector) {
    var main = document.querySelector(rootSelector || "main") || document.body;
    return collapseWhitespace((main.cloneNode(true).textContent) || "");
  }

  function chunkText(text) {
    return text.match(/[^.!?。]+[.!?。]?/g) || [text];
  }

  function createReader(button, options) {
    options = options || {};
    if (!button) return null;

    var synth = window.speechSynthesis;
    if (!synth) {
      button.disabled = true;
      button.textContent = options.unsupportedText || "Trình duyệt không hỗ trợ đọc";
      return null;
    }

    var reading = false;
    var token = 0;

    function stop() {
      token += 1;
      synth.cancel();
      reading = false;
      button.textContent = options.label || "Đọc văn bản";
      button.setAttribute("aria-pressed", "false");
    }

    button.addEventListener("click", function () {
      if (reading) {
        stop();
        return;
      }

      var text = pageText(options.rootSelector);
      if (!text) return;

      reading = true;
      button.textContent = options.stopLabel || "Dừng đọc";
      button.setAttribute("aria-pressed", "true");

      var myToken = ++token;
      var chunks = chunkText(text);

      function speakNext(i) {
        if (myToken !== token || !reading) return;
        if (i >= chunks.length) {
          stop();
          return;
        }

        var chunk = collapseWhitespace(chunks[i]);
        if (!chunk) {
          speakNext(i + 1);
          return;
        }

        var utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = options.lang || "vi-VN";
        utterance.rate = (typeof options.rate === "number") ? options.rate : 0.9;
        utterance.pitch = (typeof options.pitch === "number") ? options.pitch : 0.95;

        utterance.onend = function () {
          if (myToken === token && reading) speakNext(i + 1);
        };
        utterance.onerror = function () {
          if (myToken === token) stop();
        };

        synth.speak(utterance);
      }

      synth.cancel();
      setTimeout(function () {
        if (myToken === token && reading) speakNext(0);
      }, 50);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && reading) stop();
    });
    window.addEventListener("beforeunload", function () {
      synth.cancel();
    });

    return { stop: stop };
  }

  function initAll(selector) {
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll(selector || "[data-read-text]")
    );
    return buttons.map(function (btn) {
      return createReader(btn);
    });
  }

  var api = {
    collapseWhitespace: collapseWhitespace,
    pageText: pageText,
    chunkText: chunkText,
    createReader: createReader,
    initAll: initAll
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.ReadTextUtil = api;

  function boot() {
    initAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
