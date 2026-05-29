/* ============================================================
   FLOWERS.js — Canvas-based glowing flower animation
   Bloom on YES · Wither on NO
   Inspired by: glowing pink flowers, dark bg, sparkle particles
   ============================================================ */

(function() {

  /* ── CANVAS SETUP ─────────────────────────────────────── */
  var canvas  = document.getElementById('flower-canvas');
  var ctx     = canvas.getContext('2d');
  var W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', function() { resize(); if (flowers.length) redraw(); });

  /* ── STATE ────────────────────────────────────────────── */
  var flowers   = [];
  var sparks    = [];
  var animFrame = null;
  var mode      = 'idle'; /* idle | bloom | wither */

  /* ── FLOWER DEFINITION ────────────────────────────────── */
  /*
    Each flower has:
      rootX, rootY  — base of stem (bottom of screen)
      stemH         — full grown stem height
      stemProgress  — 0→1 growing progress
      petalProgress — 0→1 petal open progress
      glowAlpha     — 0→1 inner glow
      leaves        — array of leaf objects
      withering     — bool
      witherProg    — 0→1 wither progress
      sway          — oscillating sway angle
      swaySpeed
      swayOffset
  */

  var CONFIGS = [
    /* x% of W,  stemH,  size,  petalCount, hue, lean */
    { xp: 0.50, h: 0.52, sz: 58, pc: 5, hue: 330, lean:  0   },   /* centre tall */
    { xp: 0.32, h: 0.38, sz: 46, pc: 5, hue: 320, lean: -8   },   /* left mid */
    { xp: 0.68, h: 0.40, sz: 48, pc: 5, hue: 340, lean:  8   },   /* right mid */
    { xp: 0.18, h: 0.26, sz: 38, pc: 5, hue: 315, lean:-14   },   /* far left */
    { xp: 0.82, h: 0.28, sz: 40, pc: 5, hue: 345, lean: 14   },   /* far right */
    { xp: 0.41, h: 0.30, sz: 36, pc: 5, hue: 325, lean: -4   },   /* inner left */
    { xp: 0.59, h: 0.32, sz: 38, pc: 5, hue: 335, lean:  4   },   /* inner right */
  ];

  function buildFlowers() {
    flowers = CONFIGS.map(function(c, i) {
      var leaves = [];
      var nLeaves = 2 + Math.floor(Math.random() * 2);
      for (var l = 0; l < nLeaves; l++) {
        leaves.push({
          t:      0.35 + l * 0.22 + Math.random() * 0.1,  /* position along stem */
          side:   l % 2 === 0 ? -1 : 1,
          angle:  55 + Math.random() * 20,
          len:    22 + Math.random() * 18,
          width:  9  + Math.random() * 6,
          prog:   0
        });
      }
      return {
        xp:           c.xp,
        stemH:        c.h,
        sz:           c.sz,
        pc:           c.pc,
        hue:          c.hue,
        lean:         c.lean,
        stemProgress: 0,
        petalProgress:0,
        glowAlpha:    0,
        leaves:       leaves,
        withering:    false,
        witherProg:   0,
        sway:         0,
        swaySpeed:    0.012 + Math.random() * 0.008,
        swayOffset:   Math.random() * Math.PI * 2,
        delay:        i * 0.18,          /* stagger seconds */
        startTime:    null,
        done:         false
      };
    });
  }

  /* ── SPARKLE PARTICLES ────────────────────────────────── */
  function spawnSparks(x, y, count, color) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.4 + Math.random() * 1.8;
      sparks.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        size:  1.5 + Math.random() * 2.5,
        color: color || ('hsl(' + (310 + Math.random()*50) + ',100%,80%)')
      });
    }
  }

  function updateSparks(dt) {
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x  += s.vx * dt * 60;
      s.y  += s.vy * dt * 60;
      s.vy += 0.02 * dt * 60;   /* gravity */
      s.life -= s.decay * dt * 60;
      if (s.life <= 0) sparks.splice(i, 1);
    }
  }

  function drawSparks() {
    sparks.forEach(function(s) {
      ctx.save();
      ctx.globalAlpha = s.life;
      ctx.fillStyle   = s.color;
      /* draw a 4-point star */
      ctx.beginPath();
      var arms = 4, r1 = s.size, r2 = s.size * 0.38;
      for (var i = 0; i < arms * 2; i++) {
        var a = (i * Math.PI) / arms;
        var r = i % 2 === 0 ? r1 : r2;
        var method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](s.x + Math.cos(a) * r, s.y + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  /* ── GRASS BLADES ─────────────────────────────────────── */
  var grassBlades = [];
  function buildGrass() {
    grassBlades = [];
    var count = Math.floor(W / 18);
    for (var i = 0; i < count; i++) {
      grassBlades.push({
        x:     (i / count) * W + (Math.random() - 0.5) * 30,
        h:     40 + Math.random() * 70,
        curve: (Math.random() - 0.5) * 28,
        width: 2 + Math.random() * 2,
        sway:  Math.random() * Math.PI * 2
      });
    }
  }
  buildGrass();

  function drawGrass(t) {
    grassBlades.forEach(function(b) {
      var sw = Math.sin(t * 0.9 + b.sway) * 5;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(b.x, H);
      ctx.quadraticCurveTo(
        b.x + b.curve + sw, H - b.h * 0.6,
        b.x + b.curve * 1.4 + sw * 1.3, H - b.h
      );
      var g = ctx.createLinearGradient(b.x, H, b.x, H - b.h);
      g.addColorStop(0,   '#1a4a1a');
      g.addColorStop(0.5, '#2d7a2d');
      g.addColorStop(1,   '#3a9a3a');
      ctx.strokeStyle = g;
      ctx.lineWidth   = b.width;
      ctx.lineCap     = 'round';
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      ctx.restore();
    });
  }

  /* ── DRAW ONE FLOWER ──────────────────────────────────── */
  function drawFlower(f, t) {
    var rootX   = f.xp * W;
    var rootY   = H - 10;
    var fullH   = f.stemH * H;
    var sp      = f.stemProgress;
    var pp      = f.petalProgress;
    var wither  = f.withering ? f.witherProg : 0;

    /* sway */
    var swayAng = Math.sin(t * f.swaySpeed * 60 + f.swayOffset) * (3 + f.lean * 0.3);
    var leanRad = (f.lean + swayAng) * Math.PI / 180;

    /* stem tip position */
    var tipX = rootX + Math.sin(leanRad) * fullH * sp;
    var tipY = rootY - Math.cos(leanRad) * fullH * sp;

    if (sp <= 0) return;

    /* ── stem ── */
    var stemAlpha = wither > 0 ? Math.max(0, 1 - wither * 1.2) : 1;
    ctx.save();
    ctx.globalAlpha = stemAlpha;
    var sg = ctx.createLinearGradient(rootX, rootY, tipX, tipY);
    if (wither > 0.5) {
      sg.addColorStop(0, '#4a3010'); sg.addColorStop(1, '#6a4818');
    } else {
      sg.addColorStop(0, '#3d2b10'); sg.addColorStop(1, '#6a9a30');
    }
    ctx.beginPath();
    ctx.moveTo(rootX, rootY);
    /* slight bezier curve for natural stem */
    var cx1 = rootX + Math.sin(leanRad) * fullH * sp * 0.3;
    var cy1 = rootY - Math.cos(leanRad) * fullH * sp * 0.6;
    ctx.quadraticCurveTo(cx1, cy1, tipX, tipY);
    ctx.strokeStyle = sg;
    ctx.lineWidth   = 3.5 - wither * 1.5;
    ctx.lineCap     = 'round';
    ctx.stroke();
    ctx.restore();

    /* ── leaves ── */
    f.leaves.forEach(function(lf) {
      if (lf.prog <= 0) return;
      var lt = lf.t;
      if (lt > sp) return;
      /* position along stem */
      var frac  = lt / sp;
      var lx    = rootX + (tipX - rootX) * lt;
      var ly    = rootY + (tipY - rootY) * lt;
      var lAngle= leanRad + lf.side * lf.angle * Math.PI / 180;
      var lAlpha= wither > 0 ? Math.max(0, 1 - wither * 1.4) : lf.prog;

      ctx.save();
      ctx.globalAlpha = lAlpha;
      ctx.translate(lx, ly);
      ctx.rotate(lAngle);

      /* leaf shape */
      var ll = lf.len * lf.prog;
      var lw = lf.width * lf.prog;
      var lg = ctx.createLinearGradient(0, 0, ll, 0);
      if (wither > 0.4) {
        lg.addColorStop(0, '#4a3810'); lg.addColorStop(1, '#6a5020');
      } else {
        lg.addColorStop(0, '#2d6a10'); lg.addColorStop(1, '#4a9a20');
      }
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(ll * 0.5, -lw, ll, 0);
      ctx.quadraticCurveTo(ll * 0.5,  lw, 0, 0);
      ctx.fillStyle = lg;
      ctx.fill();
      /* leaf vein */
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(ll * 0.85, 0);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();
      ctx.restore();
    });

    /* ── flower head ── */
    if (pp <= 0 || sp < 0.95) return;

    var fAlpha  = Math.max(0, pp - wither * 1.5);
    if (fAlpha <= 0) return;

    var sz      = f.sz * (1 - wither * 0.6);
    var nPetals = f.pc;

    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.globalAlpha = fAlpha;

    /* outer glow halo */
    if (f.glowAlpha > 0 && wither < 0.3) {
      var glow = ctx.createRadialGradient(0, 0, sz * 0.2, 0, 0, sz * 1.1);
      glow.addColorStop(0,   'hsla(' + f.hue + ',100%,80%,' + (f.glowAlpha * 0.5) + ')');
      glow.addColorStop(0.5, 'hsla(' + f.hue + ',100%,70%,' + (f.glowAlpha * 0.18) + ')');
      glow.addColorStop(1,   'hsla(' + f.hue + ',100%,60%,0)');
      ctx.beginPath();
      ctx.arc(0, 0, sz * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }

    /* petals */
    for (var p = 0; p < nPetals; p++) {
      var pa   = (p / nPetals) * Math.PI * 2 - Math.PI / 2;
      var open = pp * (sz * 0.55);
      var px   = Math.cos(pa) * open;
      var py   = Math.sin(pa) * open;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(pa + Math.PI / 2);

      /* petal shape — pointed oval */
      var pw  = sz * 0.28 * pp;
      var ph  = sz * 0.46 * pp;
      var pg1 = ctx.createRadialGradient(0, ph * 0.2, 0, 0, 0, ph);
      pg1.addColorStop(0,   'hsl(' + (f.hue - 10) + ',100%,88%)');
      pg1.addColorStop(0.4, 'hsl(' + f.hue + ',95%,72%)');
      pg1.addColorStop(1,   'hsl(' + (f.hue + 15) + ',85%,55%)');

      ctx.beginPath();
      ctx.ellipse(0, 0, pw, ph, 0, 0, Math.PI * 2);
      ctx.fillStyle = pg1;
      ctx.fill();

      /* petal edge shimmer */
      ctx.beginPath();
      ctx.ellipse(0, 0, pw, ph, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsla(' + (f.hue - 20) + ',100%,90%,0.4)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    /* inner glow disc */
    var ig = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 0.3);
    ig.addColorStop(0,   'rgba(255,255,220,0.95)');
    ig.addColorStop(0.4, 'rgba(255,220,120,0.8)');
    ig.addColorStop(1,   'rgba(255,160, 60,0)');
    ctx.beginPath();
    ctx.arc(0, 0, sz * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = ig;
    ctx.fill();

    /* stamens dots */
    for (var d = 0; d < 6; d++) {
      var da  = (d / 6) * Math.PI * 2;
      var dr  = sz * 0.14;
      ctx.beginPath();
      ctx.arc(Math.cos(da) * dr, Math.sin(da) * dr, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(' + (f.hue + 30) + ',100%,75%)';
      ctx.fill();
    }

    /* occasional sparkle near flower tip */
    if (f.glowAlpha > 0.6 && Math.random() < 0.04 && wither === 0) {
      spawnSparks(
        tipX + (Math.random() - 0.5) * sz,
        tipY + (Math.random() - 0.5) * sz,
        1,
        'hsl(' + (f.hue - 20 + Math.random() * 40) + ',100%,85%)'
      );
    }
    ctx.restore();
  }

  /* ── MAIN LOOP ─────────────────────────────────────────── */
  var lastT = null;

  function loop(timestamp) {
    animFrame = requestAnimationFrame(loop);
    var dt = lastT ? Math.min((timestamp - lastT) / 1000, 0.05) : 0.016;
    lastT = timestamp;
    var t  = timestamp / 1000;

    /* dark background — only visible during bloom/wither */
    ctx.clearRect(0, 0, W, H);

    if (mode === 'idle') { lastT = null; return; }

    /* soft dark gradient rising from bottom - flowers live in this dark zone */
    var bgGrad = ctx.createLinearGradient(0, H, 0, 0);
    bgGrad.addColorStop(0,    'rgba(5,5,10,0.92)');
    bgGrad.addColorStop(0.55, 'rgba(5,5,10,0.75)');
    bgGrad.addColorStop(0.80, 'rgba(5,5,10,0.25)');
    bgGrad.addColorStop(1,    'rgba(5,5,10,0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    /* draw grass */
    drawGrass(t);

    /* update + draw each flower */
    var allDone = true;
    flowers.forEach(function(f) {
      if (!f.startTime) f.startTime = timestamp + f.delay * 1000;
      var elapsed = Math.max(0, (timestamp - f.startTime) / 1000);

      if (mode === 'bloom' && !f.withering) {
        allDone = false;
        /* stem grows over 1.2s */
        f.stemProgress  = Math.min(1, elapsed / 1.2);
        /* leaves open progressively as stem grows */
        f.leaves.forEach(function(lf) {
          if (f.stemProgress > lf.t) {
            lf.prog = Math.min(1, (f.stemProgress - lf.t) / 0.25);
          }
        });
        /* petals open after stem reaches 95% — 0.8s */
        if (f.stemProgress >= 0.95) {
          var petalElapsed = elapsed - 1.2 * 0.95;
          f.petalProgress = Math.min(1, petalElapsed / 0.8);
          f.glowAlpha     = Math.min(1, petalElapsed / 0.6);
          /* burst of sparks when petals first open */
          if (f.petalProgress > 0.05 && f.petalProgress < 0.15) {
            var tx = f.xp * W + Math.sin(f.lean * Math.PI/180) * f.stemH * H;
            var ty = H - Math.cos(f.lean * Math.PI/180) * f.stemH * H;
            spawnSparks(tx, ty, 3, 'hsl(' + f.hue + ',100%,85%)');
          }
        }

      } else if (f.withering) {
        allDone = false;
        f.witherProg = Math.min(1, f.witherProg + dt * 0.7);
        /* droop stem — tilt lean more */
        f.lean += dt * 40;
        if (f.witherProg >= 1) f.done = true;
      }

      drawFlower(f, t);
    });

    drawSparks();
    updateSparks(dt);

    /* extra ambient sparkles while blooming */
    if (mode === 'bloom' && Math.random() < 0.15) {
      var rx = Math.random() * W;
      var ry = H * 0.1 + Math.random() * H * 0.5;
      spawnSparks(rx, ry, 1, 'hsl(' + (300 + Math.random()*80) + ',100%,85%)');
    }

    if (allDone && mode === 'wither') {
      stopAnimation();
    }
  }

  function stopAnimation() {
    cancelAnimationFrame(animFrame);
    animFrame = null;
    ctx.clearRect(0, 0, W, H);
    flowers   = [];
    sparks    = [];
    mode      = 'idle';
    lastT     = null;
  }

  /* ── PUBLIC API ────────────────────────────────────────── */
  window.FlowerShow = {

    bloom: function() {
      if (animFrame) { cancelAnimationFrame(animFrame); }
      sparks = [];
      buildFlowers();
      buildGrass();
      mode   = 'bloom';
      lastT  = null;
      animFrame = requestAnimationFrame(loop);
    },

    wither: function() {
      if (mode !== 'bloom' && flowers.length === 0) {
        /* nothing blooming — just do a quick wither-in */
        buildFlowers();
        buildGrass();
        /* fast-forward stems so they're visible first */
        flowers.forEach(function(f) {
          f.stemProgress   = 0.7;
          f.petalProgress  = 0.5;
          f.glowAlpha      = 0.4;
          f.leaves.forEach(function(lf) { lf.prog = 0.8; });
        });
      }
      mode = 'wither';
      flowers.forEach(function(f) {
        f.withering  = true;
        f.witherProg = 0;
      });
      if (!animFrame) {
        lastT = null;
        animFrame = requestAnimationFrame(loop);
      }
    },

    stop: stopAnimation
  };

})();
