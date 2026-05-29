
var PHOTOS = {
  missYou:   'friendsphoto.jpeg',
  bffRing:   'friendsagain.webp',
  alwaysYes: 'friendshipsaripoledha.png'
};

/* ── API CONFIG ──────────────────────────────────────────── */
var API_URL = (typeof CONFIG !== 'undefined' && CONFIG.apiUrl) ? CONFIG.apiUrl : '';;

/* ── INJECT PHOTOS ON LOAD ───────────────────────────────── */
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('our-photo').src  = PHOTOS.missYou;
  document.getElementById('bff-photo').src  = PHOTOS.bffRing;
  document.getElementById('miss-photo').src = PHOTOS.alwaysYes;
});

/* ── CUSTOM CURSOR ───────────────────────────────────────── */
var curEl = document.getElementById('cur');
document.addEventListener('mousemove', function(e) {
  curEl.style.left = e.clientX + 'px';
  curEl.style.top  = e.clientY + 'px';
});
document.querySelectorAll('button, .ring, #music-btn').forEach(function(el) {
  el.addEventListener('mouseenter', function() { curEl.classList.add('big'); });
  el.addEventListener('mouseleave', function() { curEl.classList.remove('big'); });
});

/* ── BACKGROUND CANVAS (floating petals) ─────────────────── */
var bgc = document.getElementById('bgc');
var bx  = bgc.getContext('2d');

function resizeBg() { bgc.width = window.innerWidth; bgc.height = window.innerHeight; }
resizeBg();
window.addEventListener('resize', resizeBg);

var petals = [];
for (var i = 0; i < 28; i++) {
  petals.push({
    x:   Math.random() * window.innerWidth,
    y:   Math.random() * window.innerHeight,
    r:   3 + Math.random() * 5,
    vx:  (Math.random() - 0.5) * 0.35,
    vy:  0.25 + Math.random() * 0.45,
    a:   0.04 + Math.random() * 0.09,
    h:   340 + Math.random() * 30,
    rot: Math.random() * Math.PI * 2,
    vr:  (Math.random() - 0.5) * 0.018
  });
}

function drawBg() {
  bx.clearRect(0, 0, bgc.width, bgc.height);
  var g = bx.createRadialGradient(
    bgc.width * .5, bgc.height * .3, 0,
    bgc.width * .5, bgc.height * .5, bgc.width * .72
  );
  g.addColorStop(0, 'hsla(350,100%,97%,1)');
  g.addColorStop(.5,'hsla(20,80%,96%,1)');
  g.addColorStop(1, 'hsla(35,70%,94%,1)');
  bx.fillStyle = g;
  bx.fillRect(0, 0, bgc.width, bgc.height);

  petals.forEach(function(p) {
    p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    if (p.y > bgc.height + 20) { p.y = -20; p.x = Math.random() * bgc.width; }
    bx.save();
    bx.translate(p.x, p.y);
    bx.rotate(p.rot);
    bx.globalAlpha = p.a;
    bx.fillStyle   = 'hsl(' + p.h + ',80%,75%)';
    bx.beginPath();
    bx.ellipse(0, 0, p.r * 2.5, p.r, 0, 0, Math.PI * 2);
    bx.fill();
    bx.restore();
  });
  requestAnimationFrame(drawBg);
}
drawBg();

/* ── MUSIC ───────────────────────────────────────────────── */
var audio        = new Audio('OhMyFriend.mp3');
audio.loop       = true;
audio.volume     = 0.35;

/* Loop back to 46sec instead of 0 */
audio.addEventListener('timeupdate', function() {
  if (audio.currentTime >= audio.duration - 0.5) {
    audio.currentTime = 46;
  }
});

var musicBtn     = document.getElementById('music-btn');
var musicNote    = document.getElementById('music-note');
var musicLabel   = document.getElementById('music-label');
var musicPlaying = false;

document.addEventListener('click', function startMusic() {
  if (!musicPlaying) {
    audio.currentTime = 46;
    audio.play().then(function() {
      musicPlaying = true;
      musicBtn.classList.remove('paused');
      musicLabel.textContent = 'Pause';
    }).catch(function() {});
  }
  document.removeEventListener('click', startMusic);
}, { once: true });

musicBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  if (musicPlaying) {
    audio.pause(); musicPlaying = false;
    musicBtn.classList.add('paused');
    musicNote.textContent  = '🎵';
    musicLabel.textContent = 'Play';
  } else {
    audio.play(); musicPlaying = true;
    musicBtn.classList.remove('paused');
    musicNote.textContent  = '🎶';
    musicLabel.textContent = 'Pause';
  }
});

/* ── PAGE NAVIGATION ─────────────────────────────────────── */
var curScene = 's1';

function goTo(id) {
  if (curScene === 's6') {
    FlowerShow.stop();
    var fc = document.getElementById('flower-canvas');
    fc.getContext('2d').clearRect(0, 0, fc.width, fc.height);
    var succ = document.getElementById('succ');
    if (succ) succ.style.display = 'none';

    var yesBtn = document.querySelector('#s6 .btn-bff');
    var noBtn  = document.getElementById('nbf');
    if (yesBtn) {
      yesBtn.disabled      = false;
      yesBtn.style.opacity = '1';
      yesBtn.style.cursor  = 'none';
    }
    if (noBtn) {
      noBtn.disabled      = false;
      noBtn.style.opacity = '1';
      noBtn.style.cursor  = 'none';
      noBtn.style.transform = '';
    }

    while (noBtn.firstChild) noBtn.removeChild(noBtn.firstChild);
    noBtn.appendChild(document.createTextNode('No 😒'));
    var span = document.createElement('span');
    span.className = 'no-hint';
    span.id = 'nohint';
    noBtn.appendChild(span);
    noCount = 0;
  }

  document.getElementById(curScene).classList.remove('on');
  var nextId = id;
  setTimeout(function() {
    var next = document.getElementById(nextId);
    next.classList.add('on');
    curScene = nextId;
  }, 80);
}

/* ── NO BUTTON LOGIC ─────────────────────────────────────── */
var noCount = 0;
var MAX_NO  = 10;

var noMsgs = [
  'Are you sure? 🤔',
  'WRONG ANSWER 😤',
  'The panda is crying 😭',
  'Last chance!! 🙏',
  'WHY ARE YOU LIKE THIS',
  'okay i give up 😔'
];

var noFinal = [
  'Really? 💔',
  'WRONG. Try again. 😤',
  'No is not an option 🙅',
  'pls i beg you 🥺',
  'seriously?? 😤',
  'fine ill cry then 😭',
  'the panda is sobbing 😭',
  'last chance... 🙏',
  'i am begging you 🥺',
  'just click Always 💖'
];

function hitNo(btnId, sceneId, ev) {
  noCount++;
  burst(ev, ['😤', '💔', '😭']);

  if (sceneId === 's6') {
    FlowerShow.wither();
    var succ = document.getElementById('succ');
    if (succ) succ.style.display = 'none';

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer:   'No 😒',
        attempts: noCount
      })
    });
  }

  var card = document.querySelector('#' + sceneId + ' .card');
  card.classList.remove('shake');
  void card.offsetWidth;
  card.classList.add('shake');
  setTimeout(function() { card.classList.remove('shake'); }, 600);

  if (sceneId === 's1' && noCount >= 2) { goTo('s2'); return; }

  var btn = document.getElementById(btnId);
  var idx = Math.min(noCount - 1, noFinal.length - 1);

  if (sceneId === 's6') {
    var hint     = document.getElementById('nohint');
    var textNode = btn.firstChild;
    if (textNode && textNode.nodeType === 3) {
      textNode.textContent = noFinal[idx] + ' ';
    } else {
      btn.insertBefore(document.createTextNode(noFinal[idx] + ' '), btn.firstChild);
    }
    if (hint) hint.textContent = noCount + '/10 attempts 👀';

    if (noCount >= MAX_NO) {
      btn.disabled        = true;
      btn.style.opacity   = '0.3';
      btn.style.cursor    = 'not-allowed';
      btn.style.transform = 'scale(0.9)';
      if (hint) hint.textContent = '❌ No button disabled! Only one option left 💖';
    }
  } else {
    btn.textContent = noMsgs[idx] || noMsgs[noMsgs.length - 1];
  }
}

/* ── BFF YES ─────────────────────────────────────────────── */
function yesBFF(ev) {
  var yesBtn = document.querySelector('#s6 .btn-bff');
  var noBtn  = document.getElementById('nbf');
  if (yesBtn) {
    yesBtn.disabled      = true;
    yesBtn.style.opacity = '0.6';
    yesBtn.style.cursor  = 'not-allowed';
  }
  if (noBtn) {
    noBtn.disabled      = true;
    noBtn.style.opacity = '0.3';
    noBtn.style.cursor  = 'not-allowed';
  }

  bigConfetti();
  FlowerShow.bloom();
  burst(ev, ['🎉', '💖', '🌸', '✨', '🥳']);
  setTimeout(function() {
    burst({ clientX: window.innerWidth * .25, clientY: window.innerHeight * .4 }, ['💗', '🎊', '🫶']);
  }, 300);
  setTimeout(function() {
    burst({ clientX: window.innerWidth * .75, clientY: window.innerHeight * .5 }, ['🌸', '✨', '💝']);
  }, 600);

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answer:   'Always 💖',
      attempts: noCount
    })
  });

  document.getElementById('succ').style.display = 'block';
}

/* ── PARTICLE BURST ──────────────────────────────────────── */
function burst(e, chars) {
  var cx = (e && e.clientX) ? e.clientX : window.innerWidth  / 2;
  var cy = (e && e.clientY) ? e.clientY : window.innerHeight / 2;
  chars.forEach(function(ch, i) {
    setTimeout(function() {
      var el = document.createElement('span');
      el.className   = 'pt';
      el.textContent = ch;
      var angle = Math.random() * Math.PI * 2;
      var dist  = 60 + Math.random() * 110;
      el.style.left = cx + 'px';
      el.style.top  = cy + 'px';
      el.style.setProperty('--px', (Math.cos(angle) * dist) + 'px');
      el.style.setProperty('--py', (Math.sin(angle) * dist - 40) + 'px');
      el.style.setProperty('--pr', (Math.random() * 360) + 'deg');
      el.style.fontSize = (1 + Math.random()) + 'rem';
      document.body.appendChild(el);
      setTimeout(function() { el.remove(); }, 1300);
    }, i * 60);
  });
}

/* ── CONFETTI ────────────────────────────────────────────── */
function bigConfetti() {
  var c   = document.getElementById('cvc');
  var ctx = c.getContext('2d');
  c.width  = window.innerWidth;
  c.height = window.innerHeight;
  var colors = ['#E8607A','#FFB7C5','#FFCBA4','#A8C5A0','#FFD700','#C4956A','#D94F6A','#7C4DFF'];
  var pieces = [];
  for (var i = 0; i < 180; i++) {
    pieces.push({
      x:      Math.random() * c.width,
      y:      -20 - Math.random() * c.height,
      size:   5 + Math.random() * 8,
      color:  colors[Math.floor(Math.random() * colors.length)],
      vy:     2 + Math.random() * 4,
      vx:     (Math.random() - 0.5) * 3,
      angle:  Math.random() * 360,
      va:     (Math.random() - 0.5) * 8,
      isRect: Math.random() > 0.5
    });
  }
  var frame = 0;
  function tick() {
    if (frame++ > 240) { ctx.clearRect(0, 0, c.width, c.height); return; }
    ctx.clearRect(0, 0, c.width, c.height);
    pieces.forEach(function(p) {
      p.y += p.vy; p.x += p.vx; p.angle += p.va;
      if (p.y > c.height) p.y = -20;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle * Math.PI / 180);
      ctx.fillStyle   = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / 210);
      if (p.isRect) {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    requestAnimationFrame(tick);
  }
  tick();
}