// 스크롤 리빌과 좌측 스파인의 현재 섹션 추적을 담당한다
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 스크롤 리빌 ────────────────────────────────────────────── */
  var revealTargets = document.querySelectorAll(
    '.sec__head, .spec__row, .index__item, .proj__head, .block, .cases__title, .case, .edu__item, .end__eyebrow, .end__line, .end__links'
  );

  if (reduced || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });

    var revealedAny = false;

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealedAny = true;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });

    // 실패 안전장치: 관찰자가 한 번도 발화하지 않으면 콘텐츠가 통째로 숨겨진다.
    // 백그라운드 탭이나 관찰자 미동작 상황에서 전부 노출한다.
    window.setTimeout(function () {
      if (revealedAny) return;
      revealObserver.disconnect();
      revealTargets.forEach(function (el) { el.classList.add('is-in'); });
    }, 1500);
  }

  /* ── 스크린샷 확대 보기 ─────────────────────────────────────── */
  // 스크린샷은 2단 그리드에서 글씨를 읽을 수 없다. 원본 크기로 열어 준다.
  var lb = document.getElementById('lightbox');

  if (lb && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('.lb__img');
    var lbCap = lb.querySelector('.lb__cap');

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.shot__btn');
      if (btn) {
        var img = btn.querySelector('img');
        lbImg.src = btn.dataset.full;
        lbImg.alt = img ? img.alt : '';
        lbCap.textContent = btn.dataset.cap || '';
        lb.showModal();
        return;
      }
      // 배경 또는 닫기 버튼 클릭 시 닫는다
      if (e.target.closest('[data-lb-close]') || e.target === lb) lb.close();
    });
  } else {
    // dialog 미지원 브라우저에서는 원본을 새 탭으로 연다
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.shot__btn');
      if (btn) window.open(btn.dataset.full, '_blank', 'noopener');
    });
  }

  /* ── 스파인 섹션 추적 ───────────────────────────────────────── */
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
  var labelEl = document.querySelector('[data-spine-label]');
  var numEl = document.querySelector('[data-spine-num]');

  if (!sections.length || !labelEl || !numEl) return;

  var current = null;

  function setActive(section) {
    if (section === current) return;
    current = section;
    labelEl.style.opacity = '0';

    window.setTimeout(function () {
      labelEl.textContent = section.dataset.section;
      numEl.textContent = section.dataset.num;
      labelEl.style.opacity = '1';
    }, reduced ? 0 : 180);
  }

  function pickActive() {
    // 뷰포트 상단 1/3 지점을 기준선으로 두고, 그 위에 있는 마지막 섹션을 현재로 본다
    var line = window.scrollY + window.innerHeight / 3;
    var found = sections[0];

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= line) found = sections[i];
    }
    setActive(found);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      pickActive();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  pickActive();
})();
