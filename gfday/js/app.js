/* ============================================================
   REWIND — app.js
   ============================================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  var FILMSTRIP = [
    { src: 'assets/photos/photo-new-1.jpg', caption: 'our newest memory ❤️', code: 'F01' },
    { src: 'assets/photos/photo-1.jpg', caption: 'the teddy bear delivery 🧸', code: 'F02' },
    { src: 'assets/photos/photo-new-2.jpg', caption: 'still smiling 🩷', code: 'F03' },
    { src: 'assets/photos/photo-2.jpg', caption: 'campus bench regulars', code: 'F04' },
    { src: 'assets/photos/photo-new-3.jpg', caption: 'month two vibes 💕', code: 'F05' },
    { src: 'assets/photos/photo-3.jpg', caption: 'rooftop, golden hour', code: 'F06' },
    { src: 'assets/photos/photo-4.jpg', caption: 'sunshine in a frame', code: 'F07' },
    { src: 'assets/photos/photo-5.jpg', caption: 'candid magic', code: 'F08' },
    { src: 'assets/photos/photo-6.jpg', caption: 'the way you look at me', code: 'F09' },
    { src: 'assets/photos/photo-new-4.jpg', caption: 'forever my favorite view 🥹', code: 'F10' },
    { src: 'assets/photos/photo-9.jpg', caption: 'late night polaroids', code: 'F11' },
    { src: 'assets/photos/photo-10.jpg', caption: 'forehead kisses, on repeat', code: 'F12' },
    { src: 'assets/photos/photo-11.jpg', caption: 'still laughing', code: 'F13' },
    { src: 'assets/photos/photo-12.jpg', caption: 'favorite view', code: 'F14' },
    { src: 'assets/photos/photo-13.jpg', caption: 'our tight hugs', code: 'F15' },
    { src: 'assets/photos/photo-14.jpg', caption: 'old tape, same us ❤️', code: 'F16' }
  ];

  var MEMORY_PHOTOS = [
    'assets/photos/photo-new-1.jpg',
    'assets/photos/photo-1.jpg',
    'assets/photos/photo-new-2.jpg',
    'assets/photos/photo-5.jpg',
    'assets/photos/photo-new-3.jpg',
    'assets/photos/photo-9.jpg'
  ];

  var CORKBOARD = [
    { src: 'assets/photos/photo-new-1.jpg', top: '6%', left: '6%', rot: -6 },
    { src: 'assets/photos/photo-2.jpg', top: '10%', left: '58%', rot: 5 },
    { src: 'assets/photos/photo-new-2.jpg', top: '48%', left: '4%', rot: 4 },
    { src: 'assets/photos/photo-11.jpg', top: '42%', left: '62%', rot: -4, secret: true },
    { src: 'assets/photos/photo-new-3.jpg', top: '58%', left: '32%', rot: 2 },
    { src: 'assets/photos/photo-13.jpg', top: '65%', left: '70%', rot: 12, secret: true }
  ];

  var QUIZ = [
    {
      q: 'What did Nush name the teddy bear Yajat gave her on her birthday?',
      options: ['Sir Fluffington', 'Yajat', 'Mr. Cuddles', 'Bearry'],
      correct: 1
    },
    {
      q: 'Where is our sacred, pavitra place that makes us cry happy tears?',
      options: ['Library', 'Open Audi (Amphitheatre)', 'Canteen', 'Dr. Morphin\'s'],
      correct: 1
    },
    {
      q: 'What happens every night at 8:00 PM at Open Audi?',
      options: ['We go straight to sleep', 'Guards kick us out and our escape walk begins 💀😂', 'We study math', 'Nothing'],
      correct: 1
    },
    {
      q: 'Which hostel block is our reluctant goodbye spot every night?',
      options: ['Boys Hostel', 'Girls Block 2 (GB-2)', 'Block 5', 'Main Gate'],
      correct: 1
    },
    {
      q: 'One very honest selfie caption says Nush should start taking pills for...',
      options: ['Sleep', 'Memory', 'Patience', 'Vitamin D'],
      correct: 1
    },
    {
      q: 'What is our go-to comfort food at 2 AM?',
      options: ['Pizza', 'Sushi', 'Maggi (extra cheese)', 'Ice Cream'],
      correct: 2
    },
    {
      q: 'Who takes longer to get ready?',
      options: ['Definitely Yajat', 'Definitely Nush (by 3 business days 😂)', 'It\'s a tie', 'The teddy bear'],
      correct: 1
    },
    {
      q: 'What is Yajat\'s favorite thing about Nush?',
      options: ['Her smile', 'Her laugh', 'Her heart', 'Everything (especially her smile 🥹❤️)'],
      correct: 3
    }
  ];

  var WEIGHTS = { splash: 10, filmstrip: 15, memory: 20, quiz: 25, corkboard: 20, jukebox: 10 };

  /* ---------------- state ---------------- */

  var STORE_KEY = 'gfday-tape-001';
  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { love: 0, unlocked: [] };
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function addLove(key) {
    if (state.unlocked.indexOf(key) !== -1) return;
    state.unlocked.push(key);
    state.love = Math.min(100, state.love + (WEIGHTS[key] || 0));
    saveState();
    updateLoveUI();
  }

  function updateLoveUI() {
    var fill = document.getElementById('love-fill');
    var pct = document.getElementById('love-pct');
    var sub = document.getElementById('finale-sub');
    var wrap = document.getElementById('finale-wrap');
    var btn = document.getElementById('btn-certificate');
    if (fill) fill.style.width = state.love + '%';
    if (pct) pct.textContent = state.love + '%';
    if (sub) {
      if (state.love >= 100) {
        sub.textContent = 'ALL REELS WATCHED — CREDITS UNLOCKED';
      } else {
        sub.textContent = state.love + '% — KEEP SCROLLING TO UNLOCK THE CREDITS';
      }
    }
    if (wrap) {
      if (state.love >= 100) wrap.classList.remove('finale-locked');
      else wrap.classList.add('finale-locked');
    }
  }

  /* ---------------- HUD clock ---------------- */

  function initClock() {
    var hudTime = document.getElementById('hud-time');
    var startDate = new Date('2026-06-22T00:00:00');
    
    // HUD clock
    setInterval(function () {
      var d = new Date();
      if (hudTime) {
        hudTime.textContent = d.getHours().toString().padStart(2, '0') + ':' +
                              d.getMinutes().toString().padStart(2, '0') + ':' +
                              d.getSeconds().toString().padStart(2, '0');
      }
    }, 1000);

    // Days Together Counter
    var tcDays = document.getElementById('tc-days');
    var tcHours = document.getElementById('tc-hours');
    var tcMins = document.getElementById('tc-mins');
    var tcSecs = document.getElementById('tc-secs');
    
    if (tcDays && tcHours && tcMins && tcSecs) {
      setInterval(function () {
        var now = new Date();
        var diff = Math.max(0, now - startDate);
        
        var d = Math.floor(diff / (1000 * 60 * 60 * 24));
        var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        var m = Math.floor((diff / 1000 / 60) % 60);
        var s = Math.floor((diff / 1000) % 60);
        
        tcDays.textContent = d;
        tcHours.textContent = h.toString().padStart(2, '0');
        tcMins.textContent = m.toString().padStart(2, '0');
        tcSecs.textContent = s.toString().padStart(2, '0');
      }, 1000);
    }
  }

  /* ---------------- generic scroll reveal ---------------- */

  function initReveals() {
    var els = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('in');
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- 0. splash ---------------- */

  function initSplash() {
    var section = document.getElementById('splash');
    var titleEl = document.getElementById('splash-title');
    var full = 'Happy 2 Months, Nushi 😭❤️';
    var cursor = titleEl.querySelector('.cursor');
    titleEl.textContent = '';
    titleEl.appendChild(cursor ? cursor : document.createTextNode(''));

    requestAnimationFrame(function () { section.classList.add('powering'); });

    var i = 0;
    function type() {
      if (i <= full.length) {
        titleEl.textContent = full.slice(0, i);
        var c = document.createElement('span');
        c.className = 'cursor';
        c.innerHTML = '&nbsp;';
        titleEl.appendChild(c);
        i++;
        setTimeout(type, 42);
      }
    }
    setTimeout(type, 900);

    document.getElementById('btn-play').addEventListener('click', function () {
      addLove('splash');
      confettiBurst('soft');
      document.getElementById('filmstrip').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ---------------- 1. filmstrip ---------------- */

  function buildFilmstrip() {
    var track = document.getElementById('reel-track');
    FILMSTRIP.forEach(function (f) {
      var div = document.createElement('div');
      div.className = 'frame';
      div.innerHTML =
        '<img src="' + f.src + '" alt="" />' +
        '<div class="frame-hud">' +
          '<div class="row"><span>' + f.code + '</span><span>SP &#9655;</span></div>' +
          '<div class="row"><span>' + f.caption + '</span></div>' +
        '</div>';
      track.appendChild(div);
    });
  }

  function initFilmstripScroll() {
    var track = document.getElementById('reel-track');
    var frames = track.querySelectorAll('.frame');
    var heart = document.getElementById('heart-path');
    var heartLen = 130;
    var firstRun = true;

    function layout() {
      var trackWidth = track.scrollWidth;
      var viewportWidth = window.innerWidth;
      var maxShift = Math.max(trackWidth - viewportWidth + 80, 0);

      ScrollTrigger.getAll().forEach(function (t) { if (t.vars.id === 'filmstrip') t.kill(); });

      gsap.set(track, { x: 0 });

      ScrollTrigger.create({
        id: 'filmstrip',
        trigger: '.filmstrip-pin',
        start: 'top top',
        end: '+=' + (window.innerHeight * 3.2),
        pin: true,
        scrub: 0.6,
        onUpdate: function (self) {
          gsap.set(track, { x: -maxShift * self.progress });
          if (heart) heart.setAttribute('stroke-dashoffset', heartLen - heartLen * self.progress);
          var idx = Math.round(self.progress * (frames.length - 1));
          frames.forEach(function (fr, i) { fr.classList.toggle('in-view', i === idx); });
          if (self.progress > 0.96 && firstRun) { firstRun = false; addLove('filmstrip'); }
        }
      });
    }

    layout();
    window.addEventListener('resize', debounce(layout, 300));
  }

  /* ---------------- 2. memory match ---------------- */

  function buildMemoryGame() {
    var grid = document.getElementById('memory-grid');
    var status = document.getElementById('memory-status');
    var deck = [];
    MEMORY_PHOTOS.forEach(function (src, i) {
      deck.push({ id: i, src: src });
      deck.push({ id: i, src: src });
    });
    shuffle(deck);

    var flipped = [];
    var matched = 0;
    var lock = false;

    deck.forEach(function (card, idx) {
      var el = document.createElement('div');
      el.className = 'mm-card';
      el.dataset.id = card.id;
      el.dataset.idx = idx;
      el.innerHTML =
        '<div class="mm-card-inner">' +
          '<div class="mm-face mm-front">&#9825;</div>' +
          '<div class="mm-face mm-back"><img src="' + card.src + '" alt="" /></div>' +
        '</div>';
      el.addEventListener('click', function () {
        if (lock || el.classList.contains('flipped') || el.classList.contains('matched')) return;
        if (typeof AudioEngine !== 'undefined') AudioEngine.playClick();
        el.classList.add('flipped');
        flipped.push(el);
        if (flipped.length === 2) {
          lock = true;
          var a = flipped[0], b = flipped[1];
          if (a.dataset.id === b.dataset.id) {
            a.classList.add('matched');
            b.classList.add('matched');
            matched++;
            status.textContent = matched + ' / 6 pairs synced';
            confettiBurst('tiny');
            flipped = [];
            lock = false;
            if (matched === 6) {
              status.textContent = 'all synced — reel complete';
              addLove('memory');
              confettiBurst('soft');
            }
          } else {
            setTimeout(function () {
              a.classList.remove('flipped');
              b.classList.remove('flipped');
              flipped = [];
              lock = false;
            }, 700);
          }
        }
      });
      grid.appendChild(el);
    });
  }

  /* ---------------- 3. quiz ---------------- */

  function buildQuiz() {
    var counter = document.getElementById('quiz-counter');
    var qEl = document.getElementById('quiz-question');
    var optsEl = document.getElementById('quiz-options');
    var resultEl = document.getElementById('quiz-result');
    var box = document.getElementById('quiz-box');
    var index = 0;
    var score = 0;
    var answered = false;

    function render() {
      var item = QUIZ[index];
      counter.textContent = 'QUESTION ' + (index + 1) + ' / ' + QUIZ.length;
      qEl.textContent = item.q;
      optsEl.innerHTML = '';
      answered = false;
      item.options.forEach(function (opt, i) {
        var btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.textContent = opt;
        btn.addEventListener('click', function () { choose(i, btn); });
        optsEl.appendChild(btn);
      });
    }

    function choose(i, btn) {
      if (answered) return;
      if (typeof AudioEngine !== 'undefined') AudioEngine.playClick();
      var item = QUIZ[index];
      
      if (i === item.correct) {
        answered = true;
        btn.classList.add('correct');
        score++;
        setTimeout(function () {
          index++;
          if (index < QUIZ.length) {
            render();
          } else {
            finish();
          }
        }, 850);
      } else {
        // Retry logic for wrong answer
        btn.classList.add('wrong');
        btn.style.animation = 'shake 0.4s ease';
        setTimeout(function() {
          btn.style.animation = '';
        }, 400);
      }
    }

    function finish() {
      box.querySelector('.quiz-counter').style.display = 'none';
      qEl.style.display = 'none';
      optsEl.style.display = 'none';
      resultEl.classList.add('show');
      var title = document.getElementById('quiz-result-title');
      var sub = document.getElementById('quiz-result-sub');
      title.textContent = score >= 7 ? "it's like you wrote the letter yourself" : "close enough — still my favorite person";
      sub.textContent = score + ' / ' + QUIZ.length + ' correct';
      addLove('quiz');
      confettiBurst('soft');
    }

    render();
  }

  /* ---------------- 4. corkboard ---------------- */

  function buildCorkboard() {
    var board = document.getElementById('board');
    
    var secrets = CORKBOARD.filter(function (c) { return c.secret; });
    secrets.forEach(function (sec, idx) {
      var note = document.createElement('div');
      note.className = 'corkboard-note';
      note.textContent = idx === 0 ? "P.S. — I'd pick you in every timeline, every tape, every take. – Y" : "P.P.S. — forever isn't long enough. 🩷";
      note.style.top = sec.top;
      note.style.left = sec.left;
      board.appendChild(note);
      sec.noteEl = note;
    });

    CORKBOARD.forEach(function (item) {
      var el = document.createElement('div');
      el.className = 'polaroid';
      el.style.top = item.top;
      el.style.left = item.left;
      el.style.transform = 'rotate(' + item.rot + 'deg)';
      el.innerHTML = '<span class="pin"></span><img src="' + item.src + '" alt="" />';
      board.appendChild(el);
      makeDraggable(el, board, item.secret ? function() {
        if (!item.revealed) {
          item.revealed = true;
          item.noteEl.classList.add('revealed');
          addLove('corkboard');
          confettiBurst('tiny');
        }
      } : null);
    });

    // Envelope Logic
    var env = document.getElementById('love-letter-envelope');
    var paperText = document.getElementById('ll-text');
    var letterContent = "Happy 2 months to us, Nushi 😭❤️\n\nHonestly, it's crazy to think that it's only been two months, baby, because somehow we've already created memories that feel like they'll stay with me forever.\n\nWhen I think about our memories, my mind always goes back to Open Audi 🥹❤️. That place feels so emotional and pavitra for both of us.\n\nAnd our daily 8:00 PM escape route 😭😂: Getting kicked out of Open Audi, walking through AB-1, getting kicked out again 💀, slow walking past Dr. Morphin's and Girls Block 1, until we finally say goodbye at Girls Block 2.\n\nAnd your birthday, Nush 🥹❤️, giving you that teddy, and you deciding to name it Yajat 😭😭.\n\nI love our random tight hugs, our shared passion for music, and you being my Nush, Nushi, baby, bbg, and wifeyyy all at once.\n\nI love you so so much, Nushi ❤️🥹\n\nYours forever,\nYajat Kataria 🐻🩷";
    
    if (env && paperText) {
      makeDraggable(env, board);
      var isOpened = false;
      env.addEventListener('click', function(e) {
        if (isOpened) return;
        isOpened = true;
        if (typeof AudioEngine !== 'undefined') AudioEngine.playShutter();
        env.classList.add('open');
        
        setTimeout(function() {
          var i = 0;
          function typeLetter() {
            if (i < letterContent.length) {
              if (i % 3 === 0 && typeof AudioEngine !== 'undefined') AudioEngine.playClick();
              paperText.textContent += letterContent.charAt(i);
              i++;
              setTimeout(typeLetter, 20);
            }
          }
          typeLetter();
          confettiBurst('soft');
        }, 800);
      });
    }
  }

  function makeDraggable(el, boundEl, onMoved) {
    var startX, startY, origLeft, origTop, dragging = false;

    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      var rect = el.getBoundingClientRect();
      var boundRect = boundEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = rect.left - boundRect.left;
      origTop = rect.top - boundRect.top;
      el.style.zIndex = 20;
    });

    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var boundRect = boundEl.getBoundingClientRect();
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var newLeft = clamp(origLeft + dx, 0, boundRect.width - el.offsetWidth);
      var newTop = clamp(origTop + dy, 0, boundRect.height - el.offsetHeight);
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      if (typeof AudioEngine !== 'undefined') AudioEngine.playShutter();
      if (onMoved) onMoved();
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  /* ---------------- 5. jukebox ---------------- */

  function initJukebox() {
    var video = document.getElementById('deck-video');
    var tape1 = document.getElementById('tape-1');
    var tape2 = document.getElementById('tape-2');
    var tape3 = document.getElementById('tape-3');
    var tapes = [tape1, tape2, tape3].filter(Boolean);
    var used = false;

    tapes.forEach(function (t) {
      t.addEventListener('click', function () {
        if (typeof AudioEngine !== 'undefined') AudioEngine.playClick();
        tapes.forEach(function (o) { o.classList.remove('active'); });
        t.classList.add('active');
        var src = t.dataset.src;
        if (video.getAttribute('src') !== src) {
          video.setAttribute('src', src);
        }
        video.play().catch(function () {});
        if (!used) { used = true; addLove('jukebox'); }
      });
    });

    video.addEventListener('play', function () {
      tapes.forEach(function (t) { t.classList.toggle('playing', t.classList.contains('active')); });
      if (!used) { used = true; addLove('jukebox'); }
    });
    video.addEventListener('pause', function () {
      tapes.forEach(function (t) { t.classList.remove('playing'); });
    });
  }

  /* ---------------- 6. finale ---------------- */

  function initFinale() {
    var btn = document.getElementById('btn-certificate');
    var built = false;
    btn.addEventListener('click', function () {
      if (state.love < 100) return;
      if (!built) {
        built = true;
        drawCertificate();
        document.getElementById('certificate').style.display = 'block';
        confettiBurst('fireworks');
        btn.textContent = '⬇ Download the tape';
      } else {
        downloadCertificate();
      }
    });
  }

  function drawCertificate() {
    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    ready.then(paintCertificate);
  }

  function paintCertificate() {
    var canvas = document.getElementById('cert-canvas');
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;

    ctx.fillStyle = '#f4efe3';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#16140f';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, w - 48, h - 48);
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    ctx.fillStyle = '#c15c81';
    ctx.font = '20px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TAPE 002 · 2ND MONTH ANNIVERSARY', w / 2, 110);

    ctx.fillStyle = '#16140f';
    ctx.font = '64px "Caveat", cursive';
    ctx.fillText('Officially the', w / 2, 220);
    ctx.font = '84px "Caveat", cursive';
    ctx.fillStyle = '#c15c81';
    ctx.fillText('Best Girlfriend in the Universe', w / 2, 310);

    var img = new Image();
    img.onload = function () {
      var iw = 320, ih = 320;
      ctx.drawImage(img, w / 2 - iw / 2, 360, iw, ih);
      ctx.strokeStyle = '#16140f';
      ctx.lineWidth = 4;
      ctx.strokeRect(w / 2 - iw / 2, 360, iw, ih);
      finishCertificate(ctx, w, h);
    };
    img.onerror = function () { finishCertificate(ctx, w, h); };
    img.src = 'assets/photos/photo-new-1.jpg';
  }

  function finishCertificate(ctx, w, h) {
    ctx.fillStyle = '#16140f';
    ctx.font = '22px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    var today = new Date();
    var dateStr = 'August 22, 2026';
    ctx.fillText(dateStr, w / 2, 730);

    ctx.font = '18px "Space Mono", monospace';
    ctx.fillStyle = '#5f5e5a';
    ctx.fillText('signed, sealed, delivered — Yajat Kataria 🐻🩷', w / 2, 770);

    var holder = document.getElementById('qr-holder');
    holder.innerHTML = '';
    new QRCode(holder, {
      text: 'Happy 2 Months, Nush! - Yajat',
      width: 96,
      height: 96,
      colorDark: '#16140f',
      colorLight: '#f4efe3'
    });
    setTimeout(function () {
      var qrCanvas = holder.querySelector('canvas');
      if (qrCanvas) {
        ctx.drawImage(qrCanvas, w / 2 - 48, 800, 96, 96);
      }
    }, 150);
  }

  function downloadCertificate() {
    var canvas = document.getElementById('cert-canvas');
    var link = document.createElement('a');
    link.download = 'best-girlfriend-certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /* ---------------- name lockup & interactive name effect ---------------- */

  function initNameLockup() {
    var wrap = document.getElementById('heart-wrap');
    var emoji = document.getElementById('heart-emoji');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Immersive click animations with ripples and centered confetti bursts
    function spawnRipple(x, y, color) {
      var ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.borderColor = color;
      document.body.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 1000);
    }

    function spawnNameConfetti(x, y, colors) {
      if (typeof confetti !== 'function') return;
      try {
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { x: x, y: y },
          colors: colors,
          startVelocity: 45,
          zIndex: 999999
        });
        setTimeout(function() {
          confetti({
            particleCount: 100,
            spread: 360,
            origin: { x: x, y: y },
            colors: colors,
            startVelocity: 25,
            zIndex: 999999
          });
        }, 150);
      } catch (err) {}
    }

    // 2. Click events for Yajat & Nush
    document.querySelectorAll('.name-a, #name-yajat, #finale-yajat, #sec-yajat').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var rect = el.getBoundingClientRect();
        var clientX = rect.left + rect.width / 2;
        var clientY = rect.top + rect.height / 2;
        
        var cx = clientX / window.innerWidth;
        var cy = clientY / window.innerHeight;
        
        if (typeof AudioEngine !== 'undefined') { AudioEngine.playClick(); AudioEngine.playShutter(); }
        
        el.style.transform = 'scale(1.4) rotate(-5deg)';
        setTimeout(function() { el.style.transform = ''; }, 200);

        document.body.style.animation = 'shake 0.3s ease';
        setTimeout(function() { document.body.style.animation = ''; }, 300);

        spawnRipple(clientX, clientY, 'rgba(255, 215, 0, 0.9)');
        spawnNameConfetti(cx, cy, ['#ffd700', '#ff758c', '#ffffff']);
        
        spawnToastAt('Yajat 🐻✨', clientX, clientY - 40);
        addLove('splash');
      });
    });

    document.querySelectorAll('.name-b, #name-nush, #sec-nush').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var rect = el.getBoundingClientRect();
        var clientX = rect.left + rect.width / 2;
        var clientY = rect.top + rect.height / 2;
        
        var cx = clientX / window.innerWidth;
        var cy = clientY / window.innerHeight;
        
        if (typeof AudioEngine !== 'undefined') { AudioEngine.playClick(); AudioEngine.playShutter(); }
        
        el.style.transform = 'scale(1.4) rotate(5deg)';
        setTimeout(function() { el.style.transform = ''; }, 200);

        document.body.style.animation = 'shake 0.3s ease';
        setTimeout(function() { document.body.style.animation = ''; }, 300);

        spawnRipple(clientX, clientY, 'rgba(255, 117, 140, 0.9)');
        spawnNameConfetti(cx, cy, ['#ff758c', '#ff9ec9', '#b9aef5']);
        
        spawnToastAt('Nush 🌸💖', clientX, clientY - 40);
        addLove('splash');
      });
    });

    function spawnToastAt(text, x, y) {
      var toast = document.createElement('div');
      toast.style.cssText = 'position:fixed; z-index:99999; pointer-events:none; font-family:var(--font-mono); font-weight:bold; font-size:16px; color:#fff; background:rgba(255,117,140,0.9); padding:6px 14px; border-radius:20px; box-shadow:0 0 15px rgba(255,117,140,0.8); transform:translate(-50%,-50%); animation:toastFloat 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards;';
      toast.textContent = text;
      toast.style.left = x + 'px';
      toast.style.top = y + 'px';
      document.body.appendChild(toast);
      setTimeout(function () { toast.remove(); }, 1200);
    }

    if (!document.getElementById('toast-keyframes')) {
      var style = document.createElement('style');
      style.id = 'toast-keyframes';
      style.textContent = '@keyframes toastFloat { 0% { opacity:0; transform:translate(-50%, 0) scale(0.6); } 20% { opacity:1; transform:translate(-50%, -20px) scale(1.1); } 100% { opacity:0; transform:translate(-50%, -70px) scale(0.9); } }';
      document.head.appendChild(style);
    }

    if (!wrap || !emoji) return;

    function spawnMiniHeart(opts) {
      var el = document.createElement('span');
      el.className = 'mini-heart';
      el.textContent = Math.random() > 0.5 ? '❤' : (Math.random() > 0.5 ? '💖' : '🌸');
      var size = opts.size || (10 + Math.random() * 8);
      el.style.fontSize = size + 'px';
      el.style.setProperty('--dx', opts.dx + 'px');
      el.style.setProperty('--dy', opts.dy + 'px');
      el.style.setProperty('--rot', opts.rot + 'deg');
      el.style.animationDuration = opts.dur + 's';
      wrap.appendChild(el);
      setTimeout(function () { el.remove(); }, opts.dur * 1000 + 50);
    }

    function ambientHeart() {
      spawnMiniHeart({
        dx: (Math.random() - 0.5) * 44,
        dy: -55 - Math.random() * 35,
        rot: (Math.random() - 0.5) * 40,
        dur: 1.6 + Math.random() * 0.5,
        size: 10 + Math.random() * 8
      });
    }

    function burst() {
      var count = 12;
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        var radius = 48 + Math.random() * 32;
        spawnMiniHeart({
          dx: Math.cos(angle) * radius,
          dy: Math.sin(angle) * radius - 10,
          rot: (Math.random() - 0.5) * 90,
          dur: 0.75 + Math.random() * 0.35,
          size: 12 + Math.random() * 10
        });
      }
    }

    if (!reduceMotion) {
      setInterval(ambientHeart, 1150);
    }

    wrap.addEventListener('click', function () {
      emoji.classList.remove('pop');
      void emoji.offsetWidth;
      emoji.classList.add('pop');
      if (!reduceMotion) burst();
      confettiBurst('tiny');
    });
    emoji.addEventListener('animationend', function (e) {
      if (e.animationName === 'heartPop') emoji.classList.remove('pop');
    });

    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      var maxPull = 9, radius = 130;
      window.addEventListener('pointermove', function (e) {
        var r = wrap.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = e.clientX - cx, dy = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
          var pull = (1 - dist / radius) * maxPull;
          var ux = dx / (dist || 1), uy = dy / (dist || 1);
          wrap.style.transform = 'translate(' + (ux * pull) + 'px,' + (uy * pull) + 'px)';
        } else {
          wrap.style.transform = 'translate(0,0)';
        }
      });
    }

    initSecretKeypressListener();
  }

  function initSecretKeypressListener() {
    var keyBuffer = '';
    var overlay = document.getElementById('ny-secret-overlay');
    var closeBtn = document.getElementById('ny-close');
    var backdrop = document.getElementById('ny-backdrop');
    var loveBtn = document.getElementById('ny-btn-love');
    var bgHeartsContainer = document.getElementById('ny-floating-hearts');

    if (!overlay) return;

    function openSecretOverlay() {
      overlay.classList.remove('hidden');
      addLove('quiz');
      addLove('splash');
      
      var modal = document.querySelector('.ny-modal');
      if(modal) modal.style.opacity = '0';

      if (bgHeartsContainer) {
        bgHeartsContainer.innerHTML = '';
        for (var i = 0; i < 16; i++) {
          var heart = document.createElement('span');
          heart.className = 'ny-bg-heart';
          heart.textContent = i % 3 === 0 ? '💖' : (i % 2 === 0 ? '🌸' : '✨');
          heart.style.left = Math.random() * 100 + '%';
          heart.style.animationDelay = Math.random() * 4 + 's';
          heart.style.animationDuration = 4 + Math.random() * 5 + 's';
          bgHeartsContainer.appendChild(heart);
        }
      }

      // Cinematic Intro Sequence
      var intro = document.createElement('div');
      intro.style.cssText = 'position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:100000; pointer-events:none; flex-direction:column;';
      
      var bigHeart = document.createElement('div');
      bigHeart.textContent = '💖';
      bigHeart.style.cssText = 'font-size:80px; filter:drop-shadow(0 0 40px rgba(255,117,140,1)); animation:heartPop 0.8s ease infinite alternate;';
      
      var bigText = document.createElement('div');
      bigText.textContent = 'NUSH';
      bigText.style.cssText = 'font-family:var(--font-script); font-size:120px; color:#fff; text-shadow:0 0 30px #ff758c, 0 0 60px #ffd700; margin-top:20px; transform:scale(0); opacity:0; transition:all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);';
      
      intro.appendChild(bigHeart);
      intro.appendChild(bigText);
      overlay.appendChild(intro);

      if (typeof AudioEngine !== 'undefined') AudioEngine.playClick();

      // Sequence
      setTimeout(function() {
        bigText.style.transform = 'scale(1)';
        bigText.style.opacity = '1';
        if (typeof AudioEngine !== 'undefined') AudioEngine.playShutter();
      }, 600);

      setTimeout(function() {
        // Shatter & Explode
        bigHeart.style.display = 'none';
        bigText.style.transform = 'scale(2) translateY(-50px)';
        bigText.style.opacity = '0';
        bigText.style.filter = 'blur(10px)';
        if (typeof AudioEngine !== 'undefined') AudioEngine.playShutter();
        
        if (typeof confetti === 'function') {
          var duration = 3000;
          var end = Date.now() + duration;
          (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff758c', '#ffd700', '#ffffff', '#b9aef5'], zIndex: 9999999 });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff758c', '#ffd700', '#ffffff', '#b9aef5'], zIndex: 9999999 });
            if (Date.now() < end) requestAnimationFrame(frame);
          })();
          confetti({ particleCount: 200, spread: 360, origin: { y: 0.5 }, startVelocity: 55, colors: ['#ff758c', '#ffd700', '#ffffff', '#b9aef5'], zIndex: 9999999 });
        }
        
        setTimeout(function() {
          intro.remove();
          if(modal) {
            modal.style.transition = 'opacity 1s ease';
            modal.style.opacity = '1';
          }
        }, 800);
      }, 2200);
    }

    function closeSecretOverlay() {
      overlay.classList.add('hidden');
    }

    window.addEventListener('keydown', function (e) {
      if (e.key && e.key.length === 1) {
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 25) keyBuffer = keyBuffer.slice(-25);

        if (keyBuffer.indexOf('nush') !== -1) {
          keyBuffer = '';
          openSecretOverlay();
        } else if (keyBuffer.indexOf('yajat') !== -1) {
          keyBuffer = '';
          openYajatMinigame();
        }
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSecretOverlay);
    if (backdrop) backdrop.addEventListener('click', closeSecretOverlay);
    if (loveBtn) {
      loveBtn.addEventListener('click', function () {
        confettiBurst('fireworks');
        loveBtn.textContent = '💖 INFINITE LOVE SENT! 💖';
        setTimeout(function () {
          loveBtn.textContent = '🩷 Send Infinite Love 🩷';
        }, 3000);
      });
    }
  }

  /* ---------------- yajat's minigame logic ---------------- */
  function openYajatMinigame() {
    var gameOverlay = document.getElementById('yajat-minigame');
    if (!gameOverlay) return;
    gameOverlay.classList.remove('hidden');
    
    var catcher = document.getElementById('ym-catcher');
    var playArea = document.getElementById('ym-play-area');
    var scoreEl = document.getElementById('ym-score');
    var winScreen = document.getElementById('ym-win');
    
    var score = 0;
    var hearts = [];
    var gameLoopId;
    var spawnLoopId;
    var catcherX = window.innerWidth / 2;
    var isWin = false;

    scoreEl.textContent = '0 / 10';
    winScreen.classList.add('hidden');
    catcher.style.left = catcherX + 'px';

    function moveCatcher(e) {
      if (isWin) return;
      var clientX = e.clientX;
      if (e.touches && e.touches.length > 0) clientX = e.touches[0].clientX;
      if (clientX !== undefined) {
        catcherX = clientX;
        catcher.style.left = catcherX + 'px';
      }
    }
    gameOverlay.addEventListener('mousemove', moveCatcher);
    gameOverlay.addEventListener('touchmove', moveCatcher, {passive: true});

    function spawnHeart() {
      if (isWin) return;
      var h = document.createElement('div');
      h.className = 'ym-falling-heart';
      h.textContent = Math.random() > 0.5 ? '💖' : (Math.random() > 0.5 ? '💋' : '🐻');
      h.style.left = Math.random() * (window.innerWidth - 40) + 20 + 'px';
      h.style.top = '-40px';
      var speed = 2 + Math.random() * 3;
      playArea.appendChild(h);
      hearts.push({ el: h, y: -40, speed: speed });
    }

    spawnLoopId = setInterval(spawnHeart, 600);

    function gameLoop() {
      if (isWin) return;
      var catcherRect = catcher.getBoundingClientRect();
      
      for (var i = hearts.length - 1; i >= 0; i--) {
        var heart = hearts[i];
        heart.y += heart.speed;
        heart.el.style.top = heart.y + 'px';

        var hRect = heart.el.getBoundingClientRect();
        if (
          hRect.bottom > catcherRect.top + 10 &&
          hRect.top < catcherRect.bottom - 10 &&
          hRect.right > catcherRect.left + 10 &&
          hRect.left < catcherRect.right - 10
        ) {
          heart.el.remove();
          hearts.splice(i, 1);
          score++;
          scoreEl.textContent = score + ' / 10';
          
          if (typeof AudioEngine !== 'undefined') AudioEngine.playClick();
          
          // pop effect on catcher
          catcher.style.transform = 'translateX(-50%) scale(1.4)';
          setTimeout(function() { catcher.style.transform = 'translateX(-50%) scale(1)'; }, 100);

          // floating +1
          var plusOne = document.createElement('div');
          plusOne.textContent = '+1';
          plusOne.style.cssText = 'position:absolute; color:#7cf29c; font-weight:bold; font-size:24px; pointer-events:none; left:' + hRect.left + 'px; top:' + hRect.top + 'px; z-index:20; animation:floatUp 0.6s forwards;';
          playArea.appendChild(plusOne);
          setTimeout(function() { plusOne.remove(); }, 600);
          
          if (score >= 10) winGame();
        } else if (heart.y > window.innerHeight) {
          heart.el.remove();
          hearts.splice(i, 1);
        }
      }
      gameLoopId = requestAnimationFrame(gameLoop);
    }

    gameLoopId = requestAnimationFrame(gameLoop);

    function winGame() {
      isWin = true;
      clearInterval(spawnLoopId);
      cancelAnimationFrame(gameLoopId);
      winScreen.classList.remove('hidden');
      addLove('quiz'); 
      addLove('memory'); 
      
      if (typeof confetti === 'function') {
        var duration = 3000;
        var end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff758c', '#ffd700'] });
          confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff758c', '#ffd700'] });
          if (Date.now() < end) { requestAnimationFrame(frame); }
        }());
      }

      setTimeout(function() {
        gameOverlay.classList.add('hidden');
        hearts.forEach(function(h) { h.el.remove(); });
        gameOverlay.removeEventListener('mousemove', moveCatcher);
        gameOverlay.removeEventListener('touchmove', moveCatcher);
      }, 4000);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeSecretOverlay);
    if (backdrop) backdrop.addEventListener('click', closeSecretOverlay);
    if (loveBtn) {
      loveBtn.addEventListener('click', function () {
        confettiBurst('fireworks');
        loveBtn.textContent = '💖 INFINITE LOVE SENT! 💖';
        setTimeout(function () {
          loveBtn.textContent = '🩷 Send Infinite Love 🩷';
        }, 3000);
      });
    }
  }

  /* ---------------- confetti themes ---------------- */

  function confettiBurst(theme) {
    if (typeof confetti !== 'function') return;
    if (theme === 'tiny') {
      confetti({ particleCount: 24, spread: 45, origin: { y: 0.6 }, colors: ['#e98cae', '#7cf29c'] });
    } else if (theme === 'soft') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#e98cae', '#c15c81', '#7cf29c'] });
    } else if (theme === 'fireworks') {
      var duration = 2200;
      var end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#c9a227', '#e98cae', '#7cf29c'] });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#c9a227', '#e98cae', '#7cf29c'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }

  /* ---------------- utils ---------------- */

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); var args = arguments; t = setTimeout(function () { fn.apply(null, args); }, ms); };
  }

  /* ---------------- boot sequence & audio ---------------- */
  function initBootSequence() {
    var bootSeq = document.getElementById('boot-sequence');
    var audioBtn = document.getElementById('audio-toggle');
    var started = false;
    
    function startExperience() {
      if (started) return;
      started = true;
      if (bootSeq) {
        bootSeq.style.opacity = '0';
        setTimeout(function() { bootSeq.remove(); }, 500);
      }
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.init();
        var isMuted = AudioEngine.toggleMute(); // initialize as OFF
        audioBtn.textContent = isMuted ? 'AUDIO: OFF' : 'AUDIO: ON';
        audioBtn.style.color = isMuted ? '#fff' : '#7cf29c';
      }
      document.removeEventListener('click', startExperience);
      document.removeEventListener('keydown', startExperience);
    }
    
    document.addEventListener('click', startExperience);
    document.addEventListener('keydown', startExperience);
    setTimeout(startExperience, 2500); // auto-hide if no interaction

    if (audioBtn && typeof AudioEngine !== 'undefined') {
      audioBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if(!started) startExperience();
        var isMuted = AudioEngine.toggleMute();
        audioBtn.textContent = isMuted ? 'AUDIO: OFF' : 'AUDIO: ON';
        audioBtn.style.color = isMuted ? '#fff' : '#7cf29c';
      });
    }
  }

  /* ---------------- boot ---------------- */

  document.addEventListener('DOMContentLoaded', function () {
    initBootSequence();
    initClock();
    initReveals();
    initSplash();
    initNameLockup();

    buildFilmstrip();
    initFilmstripScroll();

    buildMemoryGame();
    buildQuiz();
    buildCorkboard();
    initJukebox();
    initFinale();
    initCouponQuiz();
    initMilestones();
    initMixtape();

    updateLoveUI();
    window.scrollTo(0, 0);
    setTimeout(function () { window.scrollTo(0, 0); }, 100);
  });

  /* ---------------- mixtape logic ---------------- */
  function initMixtape() {
    var tracks = document.querySelectorAll('.mt-interactive');
    tracks.forEach(function(el) {
      el.addEventListener('click', function() {
        var playerId = this.getAttribute('data-spotify-id');
        var playerContainer = this.querySelector('.mt-player');
        
        if (playerContainer.style.display === 'block') {
          if (typeof AudioEngine !== 'undefined') AudioEngine.playShutter();
          playerContainer.style.display = 'none';
          playerContainer.innerHTML = '';
          this.style.background = '';
        } else {
          if (typeof AudioEngine !== 'undefined') AudioEngine.playClick();
          document.querySelectorAll('.mt-player').forEach(function(p) { p.style.display = 'none'; p.innerHTML = ''; });
          document.querySelectorAll('.mt-interactive').forEach(function(i) { i.style.background = ''; });
          
          playerContainer.style.display = 'block';
          playerContainer.innerHTML = '<iframe src="https://open.spotify.com/embed/track/' + playerId + '?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:12px;"></iframe>';
          this.style.background = 'rgba(255,255,255,0.05)';
        }
      });
    });
  }

  /* ---------------- milestones logic ---------------- */
  function initMilestones() {
    var milestones = document.querySelectorAll('.milestone-interactive');
    milestones.forEach(function(m) {
      m.addEventListener('click', function() {
        var expand = m.querySelector('.tm-expand');
        if (expand) {
          if (!expand.classList.contains('open')) {
            expand.classList.add('open');
            if (typeof AudioEngine !== 'undefined') AudioEngine.playClick();
          } else {
            expand.classList.remove('open');
            if (typeof AudioEngine !== 'undefined') AudioEngine.playShutter();
          }
        }
      });
    });
  }

  /* ---------------- coupon quiz logic ---------------- */
  function initCouponQuiz() {
    var opts = document.querySelectorAll('.coupon-opt');
    var quizContainer = document.getElementById('coupon-quiz-container');
    var revealContainer = document.getElementById('coupon-reveal-container');
    var jkText = document.getElementById('jk-text');

    opts.forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        if (opt.classList.contains('correct-opt')) {
          opt.classList.add('correct');
        } else {
          opt.classList.add('wrong');
        }
        
        if (typeof AudioEngine !== 'undefined') AudioEngine.playClick();
        
        setTimeout(function() {
          quizContainer.style.display = 'none';
          revealContainer.style.display = 'block';
          
          if (typeof confetti === 'function') confettiBurst('soft');
          
          setTimeout(function() {
            jkText.style.opacity = '1';
            jkText.style.transform = 'scale(1)';
          }, 100);
          
        }, 600);
      });
    });
  }
})();
