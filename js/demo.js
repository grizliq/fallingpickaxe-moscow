/* Falling Pickaxe — демо Pixmove в сворачиваемом окне + приманка на фриспины после первых раундов */
(function () {
  var w = document.getElementById('fpw');
  if (!w) return;
  var body = document.getElementById('fpwBody'), load = document.getElementById('fpwLoad'), bait = document.getElementById('fpwBait'),
      API = 'https://games.pixmove.co/api/games/game/demo/?partnerId=1&gameId=63&hash=' + w.getAttribute('data-hash'),
      iframe = null, started = false, baitTimer = null, loadTimer = null, baitShown = 0,
      exitCard = document.getElementById('fpwExit'), exitShown = false, exitTimer = null;

  function lock(on) { document.body.style.overflow = on ? 'hidden' : ''; }

  function showBait() {
    if (!started || w.hidden || w.classList.contains('is-min')) { baitTimer = setTimeout(showBait, 15000); return; }
    bait.hidden = false; baitShown++;
  }
  function hideBait() { bait.hidden = true; clearTimeout(baitTimer); baitTimer = setTimeout(showBait, baitShown < 2 ? 90000 : 180000); }

  function fail() {
    clearTimeout(loadTimer);
    load.classList.remove('is-off'); load.classList.add('is-fb');
    started = false;
  }

  function mount(url) {
    iframe = document.createElement('iframe');
    iframe.className = 'fpw__iframe'; iframe.title = 'Falling Pickaxe демо';
    iframe.allow = 'autoplay; fullscreen'; iframe.setAttribute('allowfullscreen', '');
    iframe.addEventListener('load', function () {
      clearTimeout(loadTimer); load.classList.add('is-off'); started = true;
      /* раунд длится 10–20 с: первая приманка после первых раундов */
      clearTimeout(baitTimer); baitTimer = setTimeout(showBait, 28000);
    });
    iframe.src = url; body.insertBefore(iframe, bait);
    loadTimer = setTimeout(function () { if (!started) fail(); }, 15000);
  }

  function start() {
    if (iframe) return;
    load.classList.remove('is-off', 'is-fb');
    fetch(API, { mode: 'cors' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || j.status !== 'success' || !j.data || !j.data.gameUrl) throw new Error('no url');
        var u = new URL(j.data.gameUrl); u.searchParams.set('lang', 'ru'); mount(u.href);
      })
      .catch(fail);
  }

  function showExit() {
    if (!exitCard || exitShown || !started) return;
    exitShown = true; exitCard.hidden = false;
    clearTimeout(exitTimer); exitTimer = setTimeout(function () { exitCard.hidden = true; }, 30000);
  }
  function hideExit() { if (exitCard) exitCard.hidden = true; clearTimeout(exitTimer); }

  function open() { hideExit(); w.hidden = false; w.classList.remove('is-min'); lock(true); start(); }
  function min() { w.classList.add('is-min'); w.classList.remove('is-full'); lock(false); showExit(); }
  function restore() { w.classList.remove('is-min'); lock(true); }
  function close() {
    showExit();
    w.hidden = true; w.classList.remove('is-min', 'is-full'); lock(false);
    if (iframe) { iframe.remove(); iframe = null; }
    started = false; clearTimeout(baitTimer); clearTimeout(loadTimer); bait.hidden = true;
    load.classList.remove('is-off', 'is-fb');
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-demo-start]'), function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
  document.getElementById('fpwMin').addEventListener('click', function (e) { e.stopPropagation(); min(); });
  document.getElementById('fpwFull').addEventListener('click', function (e) { e.stopPropagation(); w.classList.toggle('is-full'); });
  document.getElementById('fpwClose').addEventListener('click', function (e) { e.stopPropagation(); close(); });
  document.getElementById('fpwBar').addEventListener('click', function () { if (w.classList.contains('is-min')) restore(); });
  var bx = bait.querySelector('[data-bait-close]'); if (bx) bx.addEventListener('click', hideBait);
  if (exitCard) Array.prototype.forEach.call(exitCard.querySelectorAll('[data-exit-close]'), function (b) { b.addEventListener('click', hideExit); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !w.hidden && !w.classList.contains('is-min')) min(); });
  window.__fpwOpen = function () { return !w.hidden && !w.classList.contains('is-min'); };
})();
