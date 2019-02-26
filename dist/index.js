(function() {
  // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
  // MIT license
  var Textmode, init;

  (function() {
    var lastTime, vendors, x;
    lastTime = 0;
    vendors = ['ms', 'moz', 'webkit', 'o'];
    x = 0;
    while (x < vendors.length && !window.requestAnimationFrame) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
      ++x;
    }
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime, id, timeToCall;
        currTime = (new Date).getTime();
        timeToCall = Math.max(0, 16 - (currTime - lastTime));
        id = window.setTimeout((function() {
          callback(currTime + timeToCall);
        }), timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  })();

  init = function() {
    var audioData, audioVolume, audioVolumeEL, canvasEl, changeCpuFrequ, changeVolume, cpufreqNumberEL, cpufreqRangeEL, ctx, cycle, data, imageData, keyyy, nxtBtnEl, prevTextValue, refreshAutomatic, setBuffer, startBtnEl, stopBtnEl, textEl, textOriginalEl, wwCanvas;
    canvasEl = document.getElementById('canvas');
    nxtBtnEl = document.getElementById('nextFrame');
    startBtnEl = document.getElementById('start');
    stopBtnEl = document.getElementById('stop');
    textEl = document.getElementById('textarea');
    textOriginalEl = document.getElementById('textOriginal');
    cpufreqRangeEL = document.getElementById('cpufreq_range');
    cpufreqNumberEL = document.getElementById('cpufreq_number');
    audioVolumeEL = document.getElementById('volume');
    canvasEl.width = 256;
    canvasEl.height = 256;
    ctx = canvasEl.getContext('2d');
    imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    data = imageData.data;
    audioData = new Uint8Array(canvasEl.width * canvasEl.height);
    refreshAutomatic = true;
    audioVolume = 0;
    wwCanvas = new Worker("worker.js");
    setBuffer = function() {
      var bs, bufferCnt, sr;
      sr = Pico.sampleRate;
      bs = Pico.bufferSize;
      bufferCnt = 0;
      return function(e) {
        var i, out, pos;
        out = e.buffers;
        i = 0;
        while (i < e.bufferSize) {
          pos = bs * bufferCnt;
          out[0][i] = audioData[pos + i] / 255 / 255 * audioVolume;
          out[1][i] = out[0][i];
          i++;
        }
        if ((bufferCnt + 1) * bs > audioData.length) {
          return bufferCnt = 0;
        } else {
          return bufferCnt++;
        }
      };
    };
    cycle = function() {
      wwCanvas.postMessage("G"); // get image data array
      if (refreshAutomatic) {
        return requestAnimationFrame(cycle);
      }
    };
    wwCanvas.onmessage = function(n) {
      var len, pos, wwData;
      len = n.data.length;
      while (len--) {
        audioData[len] = n.data[len];
        pos = len * 4;
        wwData = n.data[len];
        data[pos] = wwData;
        data[pos + 1] = wwData;
        data[pos + 2] = wwData;
        data[pos + 3] = 255;
      }
      return ctx.putImageData(imageData, 0, 0);
    };
    prevTextValue = "";
    keyyy = function(e) {
      var char, charOrig, instrRaw, j, len1, ref;
      char = "";
      ref = textOriginalEl.value;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        charOrig = ref[j];
        if (charOrig === "a") {
          char += "&#8592;";
        } else if (charOrig === "d") {
          char += "&#8594;";
        } else if (charOrig === "w") {
          char += "&#8593;";
        } else if (charOrig === "s") {
          char += "&#8595;";
        } else if (charOrig === "r") {
          char += "&#10595;";
        } else if (charOrig === "f") {
          char += "&#10597;";
        } else if (charOrig === "y") {
          char += "Y";
        } else if (charOrig === "x") {
          char += "X";
        } else if (charOrig === "c") {
          char += "&#8630;";
        } else if (charOrig === "v") {
          char += "&#8631;";
        } else if (charOrig === "\n") {
          char += "<br/>";
        }
      }
      textEl.innerHTML = char;
      instrRaw = textOriginalEl.value;
      instrRaw = instrRaw.replace(/[^23456789wasdrfyxc\+\-\|\&\^]/g, "");
      if (instrRaw.length === 0 || prevTextValue === e.target.value) {
        return;
      }
      prevTextValue = e.target.value;
      wwCanvas.postMessage("S");
      return wwCanvas.postMessage(instrRaw);
    };
    changeVolume = function(e) {
      audioVolume = e.target.value;
      if (Pico.isPlaying === false) {
        console.log('Start playing');
        return Pico.play(setBuffer());
      }
    };
    changeCpuFrequ = function(e) {
      cpufreqRangeEL.value = e.target.value;
      cpufreqNumberEL.value = e.target.value;
      wwCanvas.postMessage("C");
      wwCanvas.postMessage(e.target.value);
      return console.log(e.target.value);
    };
    textOriginalEl.addEventListener("keyup", keyyy);
    cpufreqRangeEL.addEventListener("change", changeCpuFrequ);
    cpufreqNumberEL.addEventListener("change", changeCpuFrequ);
    audioVolumeEL.addEventListener("change", changeVolume);
    nxtBtnEl.addEventListener("click", function() {
      refreshAutomatic = false;
      return cycle();
    });
    startBtnEl.addEventListener("click", function() {
      if (refreshAutomatic) {
        return false;
      }
      refreshAutomatic = true;
      return cycle();
    });
    stopBtnEl.addEventListener("click", function() {
      return refreshAutomatic = false;
    });
    keyyy({
      target: textEl
    });
    return cycle();
  };

  window.onload = init;

  Textmode = (function() {
    class Textmode {
      constructor(textEl) {
        this.keydown = this.keydown.bind(this);
        this.keypress = this.keypress.bind(this);
        this.newLine = this.newLine.bind(this);
        this.cycle = this.cycle.bind(this);
        this.el = textEl;
        this.initScreen();
        this.welcomeMsg();
        window.addEventListener('keydown', this.keydown);
        window.addEventListener('keypress', this.keypress);
        requestAnimationFrame(this.cycle);
      }

      keydown(e) {
        if (e.keyCode === 8) { // BACKSPACE
          e.preventDefault();
          this.delChar();
          return false;
        }
        if (e.ctrlKey && e.shiftKey) {
          return this.switchCaps();
        } else if (e.keyCode === 37) {
          return this.checkCursor(this.cursor.x - 1, null); // LEFT ARROW
        } else if (e.keyCode === 39) {
          return this.checkCursor(this.cursor.x + 1, null); // RIGHT ARROW
        } else if (e.keyCode === 40) {
          return this.checkCursor(null, this.cursor.y + 1); // TOP ARROW
        } else if (e.keyCode === 38) {
          return this.checkCursor(null, this.cursor.y - 1); // BOTTOM ARROW
        }
      }

      keypress(e) {
        var charCode;
        if (e.keyCode === 13) {
          return this.getLine(); // ENTER
        } else if ((e.keyCode || e.charCode) === 32) {
          return this.putChar('&nbsp;'); // SPACE
        } else {
          charCode = e.keyCode === 0 ? e.charCode : e.keyCode;
          return this.putChar(String.fromCharCode(charCode));
        }
      }

      switchCaps() {
        return this.el.className = this.el.className !== 'capsMode' ? 'capsMode' : '';
      }

      welcomeMsg() {
        this.checkCursor(0, 0);
        return this.writeDelayed('\n     **** saylermorph.com v0.1 ****\n\n 64k ram system 38911 basic bytes free\n\nready.\n');
      }

      initScreen() {
        var cellEl, j, k, ref, ref1, results, rowEl, x, y;
        results = [];
        for (y = j = 0, ref = this.SCREENSIZE.h; (0 <= ref ? j < ref : j > ref); y = 0 <= ref ? ++j : --j) {
          rowEl = document.createElement('ul');
          for (x = k = 0, ref1 = this.SCREENSIZE.w; (0 <= ref1 ? k < ref1 : k > ref1); x = 0 <= ref1 ? ++k : --k) {
            cellEl = document.createElement('li');
            cellEl.innerHTML = '&nbsp;';
            rowEl.appendChild(cellEl);
          }
          results.push(this.el.appendChild(rowEl));
        }
        return results;
      }

      checkCursor(x, y) {
        this.getCell().className = '';
        if (x != null) {
          this.cursor.x = x;
        }
        if (y != null) {
          this.cursor.y = y;
        }
        if (this.cursor.x === this.SCREENSIZE.w) {
          this.cursor.x = 0;
          this.cursor.y++;
        } else if (this.cursor.x === -1) {
          this.cursor.x = this.SCREENSIZE.w - 1;
          this.cursor.y--;
        }
        if (this.cursor.y === this.SCREENSIZE.h) {
          this.cursor.y -= 1;
          this.shiftScreenUp();
        } else if (this.cursor.y === -1) {
          this.cursor.y = this.SCREENSIZE.h - 1;
        }
        return this.getCell().className = 'inverted';
      }

      cmdInterpreter(cmd) {
        var interval;
        interval = null;
        if (cmd.trim().length === 0) {
          return true;
        }
        if (cmd.split('clear').length > 1) {
          this.clearScreen();
        } else if (cmd.split('list').length > 1) {
          this.writeDelayed('0\n1\n2\n3\n4\n5\nready.\n');
        } else if (cmd.split('reset').length > 1) {
          this.clearScreen();
          this.welcomeMsg();
        } else if (cmd.split('help').length > 1) {
          this.writeDelayed('\n\ncall 0900-drs-will-do-it\nready.\n');
        } else if (cmd.split('load').length > 1) {
          this.writeDelayed('\n\npress play on tape\nloading\nready.\n');
        } else if (cmd.split('run').length > 1) {
          this.clearScreen();
          this.writeDelayed('1. A robot may not injure a human being\n   or, through inaction, allow a human \n   being to come to harm. \n\n2. A robot must obey the orders given \n   it by human beings except where such\n   orders would conflict with the First\n   Law. \n\n3. A robot must protect its own \n   existence as long as such protection\n   does not conflict with\n   the First or Second Laws \n\n\n\nready.\n');
        } else {
          this.writeDelayed('\n?syntax error\nready.\n');
        }
        return true;
      }

      getCell() {
        return this.el.childNodes[this.cursor.y].childNodes[this.cursor.x];
      }

      getLine() {
        var char, child, j, len1, lineText, ref;
        lineText = '';
        ref = this.el.childNodes[this.cursor.y].childNodes;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          child = ref[j];
          char = child.innerHTML;
          lineText += char === '&nbsp;' ? ' ' : char;
        }
        if (this.cmdInterpreter(lineText.toLowerCase())) {
          this.newLine();
        }
        return this.checkCursor();
      }

      blinkCursor() {
        if (this.cursor.blink) {
          this.getCell().className = 'inverted';
        } else {
          this.getCell().className = '';
        }
        return this.cursor.blink = !this.cursor.blink;
      }

      putChar(char) {
        this.checkCursor(null, null);
        this.getCell().innerHTML = char;
        return this.checkCursor(this.cursor.x + 1, null);
      }

      delChar() {
        var cell;
        this.checkCursor(this.cursor.x - 1, null);
        cell = this.getCell();
        return cell.innerHTML = '&nbsp;';
      }

      newLine() {
        this.checkCursor(0, this.cursor.y + 1);
        return this.getCell().className = 'inverted';
      }

      clearScreen() {
        var cell, j, k, len1, len2, line, ref, ref1;
        this.getCell().className = '';
        this.cursor = {
          x: 0,
          y: 0,
          blink: false
        };
        ref = this.el.childNodes;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          line = ref[j];
          ref1 = line.childNodes;
          for (k = 0, len2 = ref1.length; k < len2; k++) {
            cell = ref1[k];
            cell.innerHTML = '&nbsp;';
          }
        }
        return this.getCell().className = 'inverted';
      }

      setColor() {
        return null; // TODO ???
      }

      shiftScreenUp() {
        var child, i, j, k, len, len1, len2, li, original, ref, ref1, replacement;
        len = this.el.childNodes;
        ref = this.el.childNodes;
        for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
          child = ref[i];
          if (i === this.el.childNodes.length - 1) {
            ref1 = child.childNodes;
            for (k = 0, len2 = ref1.length; k < len2; k++) {
              li = ref1[k];
              li.innerHTML = "&nbsp";
            }
            return true;
          }
          replacement = this.el.childNodes[i + 1].innerHTML;
          original = this.el.childNodes[i];
          original.innerHTML = replacement;
        }
      }

      writeDelayed(text) {
        return this.textToWriteDelayed += text;
      }

      nextDelayedText() {
        this.write(this.textToWriteDelayed[0]);
        return this.textToWriteDelayed = this.textToWriteDelayed.substring(1, this.textToWriteDelayed.length);
      }

      write(text) { // TODO implement \0 - \f \! codes \fore /background foreground and inverted
        var char, j, len1, results;
        results = [];
        for (j = 0, len1 = text.length; j < len1; j++) {
          char = text[j];
          if (char === '\n') {
            results.push(this.newLine());
          } else {
            results.push(this.putChar(char === ' ' ? char = '&nbsp;' : char));
          }
        }
        return results;
      }

      cycle() {
        if ((this.time++) % 35 === 0) {
          this.blinkCursor();
        }
        if (this.time % 1 === 0 && this.textToWriteDelayed.length > 0) {
          this.nextDelayedText();
        }
        return requestAnimationFrame(this.cycle);
      }

    };

    Textmode.prototype.SCREENSIZE = {
      w: 40,
      h: 25
    };

    Textmode.prototype.time = 0; // count every animation frame

    Textmode.prototype.cursor = {
      x: 0,
      y: 0,
      blink: true
    };

    //replacement.parentNode.replaceChild replacement, original
    Textmode.prototype.textToWriteDelayed = "";

    return Textmode;

  }).call(this);

}).call(this);

//# sourceMappingURL=index.js.map
