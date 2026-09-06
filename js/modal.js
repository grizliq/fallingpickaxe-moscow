(function () {
  var modal = document.getElementById('md-notify');
  if (!modal) return;

  /* ---- настройки ---- */
  var MIN_TIME  = 15000;   // 15 секунд — раньше не показывать никогда
  var MAX_TIME  = 45000;   // 45 секунд — принудительный показ
  var SCROLL_AT = 0.70;    // доля прокрутки (0.70 = 70%)
  var KEY       = 'fp_notify_v5';

  var ready = false, opened = false, maxTimer;

  function open() {
    if (opened) return;
    opened = true;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    clearTimeout(maxTimer);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('mouseout', onLeave);
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function onScroll() {
    if (!ready) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0 && window.scrollY / h >= SCROLL_AT) open();
  }

  function onLeave(e) {
    if (!ready) return;
    if (e.clientY <= 0 && !e.relatedTarget) open();
  }

  /* закрытие вешаем всегда */
  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-md-notify-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  /* управление из консоли:
     fpNotify.show()  — показать сразу
     fpNotify.reset() — сбросить флаг сессии и перезагрузить */
  window.fpNotify = {
    show: function () {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    },
    reset: function () {
      try { sessionStorage.removeItem(KEY); } catch (e) {}
      location.reload();
    }
  };

  var suppressed = false;
  try { suppressed = !!sessionStorage.getItem(KEY); } catch (e) {}

  console.info(
    '[fp-modal] v5 · порог ' + (MIN_TIME / 1000) + ' c · ' +
    (suppressed ? 'ПОДАВЛЕНА — сбрось: fpNotify.reset()' : 'активна')
  );

  if (suppressed) return;

  setTimeout(function () { ready = true; }, MIN_TIME);
  maxTimer = setTimeout(open, MAX_TIME);

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('mouseout', onLeave);
})();
