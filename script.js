// 스크롤 리빌과 좌측 스파인의 현재 섹션 추적을 담당한다
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 스크롤 리빌 ────────────────────────────────────────────── */
  var revealTargets = document.querySelectorAll(
    '.sec__head, .spec__row, .shelf, .proj__head, .block, .cases__title, .case, .edu__item, .end__eyebrow, .end__line, .end__links'
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

  /* ── 프로젝트 상세 읽기 모드 ────────────────────────────────── */
  // 책등을 누르면 해당 프로젝트만 남기고 전체화면으로 전환한다.
  // 주소의 해시를 유일한 상태로 두어 뒤로가기와 직접 링크가 그대로 동작한다.
  var ORDER = ['waait', 'sblim', 'trip', 'themoa'];

  // 브라우저의 자동 스크롤 복원은 popstate 처리 뒤에 실행되어 복귀 위치를 덮어쓴다.
  // 상세를 여닫는 동안의 스크롤은 이 스크립트가 직접 관리한다.
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

  var reader = document.querySelector('.reader');
  var readerTitle = document.querySelector('[data-reader-title]');
  var openedFrom = null;   // 닫을 때 포커스를 되돌릴 책등
  var shelfScroll = 0;     // 목록에서의 스크롤 위치
  var openId = null;

  function currentHashId() {
    var id = window.location.hash.replace('#', '');
    return ORDER.indexOf(id) !== -1 ? id : null;
  }

  function openReading(id) {
    if (openId === id) return;

    var article = document.getElementById(id);
    if (!article) return;

    // 목록에서 진입한 경우에만 복귀 지점을 기억한다
    if (!openId) shelfScroll = window.scrollY;

    ORDER.forEach(function (key) {
      var el = document.getElementById(key);
      if (el) el.classList.toggle('is-open', key === id);
    });

    // 숨겨진 동안에는 관찰자가 발화하지 않는다. 열 때 직접 노출한다.
    article.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-in');
    });

    document.body.classList.add('is-reading');
    reader.hidden = false;

    var idx = ORDER.indexOf(id);
    readerTitle.textContent = article.dataset.section || '';
    reader.querySelector('[data-step="-1"]').disabled = idx === 0;
    reader.querySelector('[data-step="1"]').disabled = idx === ORDER.length - 1;

    openId = id;
    // 'auto'는 CSS의 scroll-behavior(smooth)를 그대로 따른다. 전환 중 스크롤이
    // 애니메이션되지 않도록 'instant'로 즉시 이동한다.
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 화면이 통째로 바뀌므로 읽기 시작점으로 포커스를 옮긴다
    var heading = article.querySelector('.proj__name');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  function closeReading() {
    if (!openId) return;

    document.body.classList.remove('is-reading');
    reader.hidden = true;

    var article = document.getElementById(openId);
    if (article) article.classList.remove('is-open');
    openId = null;

    // 상세 링크로 바로 들어온 경우엔 돌아갈 스크롤 위치가 없다. 책장을 찾아 보낸다.
    var back = shelfScroll;
    if (!back) {
      var works = document.getElementById('works');
      if (works) back = works.offsetTop;
    }
    window.scrollTo({ top: back, behavior: 'instant' });

    // 펼침이 화려한 만큼 복귀가 뚝 끊기지 않도록 짧게 받아 준다
    var main = document.getElementById('main');
    if (!reduced && main && typeof main.animate === 'function') {
      main.animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    }
    if (openedFrom) {
      openedFrom.focus({ preventScroll: true });
      openedFrom = null;
    }
  }

  function syncFromLocation() {
    var id = currentHashId();
    if (id) openReading(id); else closeReading();
  }

  /* 표지가 펼쳐지는 전환.
     onCovered는 표지가 화면을 완전히 덮은 시점에 호출되며, 그때 상세로 교체한다. */
  function flipOpen(link, onCovered) {
    var canAnimate = typeof link.animate === 'function';
    if (reduced || !canAnimate) { onCovered(); return; }

    var rect = link.getBoundingClientRect();
    var cs = window.getComputedStyle(link);
    var name = link.querySelector('.book__name');

    var stage = document.createElement('div');
    stage.className = 'flip';

    var cover = document.createElement('div');
    cover.className = 'flip__cover';
    cover.style.background = cs.backgroundColor;
    cover.style.color = cs.color;
    cover.style.left = rect.left + 'px';
    cover.style.top = rect.top + 'px';
    cover.style.width = rect.width + 'px';
    cover.style.height = rect.height + 'px';

    var label = document.createElement('span');
    label.className = 'flip__label';
    label.textContent = name ? name.textContent : '';
    cover.appendChild(label);
    stage.appendChild(cover);

    document.body.classList.add('is-flipping');
    document.body.appendChild(stage);

    // 두 단계 모두 어떤 이유로든 멈출 수 있다. 화면 교체와 뒷정리는 각각 한 번만 보장한다.
    var covered = false, cleaned = false;

    function swap() {
      if (covered) return;
      covered = true;
      onCovered();
    }
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      swap();
      stage.remove();
      document.body.classList.remove('is-flipping');
    }

    // 판형이 크게 달라지므로 제목은 펼쳐지기 전에 지운다
    label.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: 190, easing: 'linear', fill: 'forwards' });

    var grow = cover.animate([
      { left: rect.left + 'px', top: rect.top + 'px',
        width: rect.width + 'px', height: rect.height + 'px' },
      { left: '0px', top: '0px',
        width: window.innerWidth + 'px', height: window.innerHeight + 'px' }
    ], { duration: 330, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' });

    grow.onfinish = function () {
      swap(); // 표지 뒤에서 교체 — 이음매가 보이지 않는다
      var swing = cover.animate([
        { transform: 'rotateY(0deg)',    opacity: 1  },
        { transform: 'rotateY(-112deg)', opacity: .9 }
      ], { duration: 470, easing: 'cubic-bezier(.45, .02, .4, 1)', fill: 'forwards' });
      swing.onfinish = cleanup;
    };

    // onfinish가 오지 않아도 표지가 화면에 남지 않도록 한다
    window.setTimeout(cleanup, 1500);
  }

  if (reader && readerTitle) {
    document.addEventListener('click', function (e) {
      var book = e.target.closest('[data-open]');
      if (book) {
        e.preventDefault();
        openedFrom = book;
        window.history.pushState({ proj: book.dataset.open }, '', '#' + book.dataset.open);
        flipOpen(book, syncFromLocation);
        return;
      }

      if (e.target.closest('[data-close-project]')) {
        // 책등을 눌러 들어왔다면 뒤로가기로 닫아 히스토리를 늘리지 않는다
        if (window.history.state && window.history.state.proj) window.history.back();
        else { window.history.replaceState(null, '', '#works'); syncFromLocation(); }
        return;
      }

      var step = e.target.closest('[data-step]');
      if (step && openId) {
        var next = ORDER[ORDER.indexOf(openId) + Number(step.dataset.step)];
        if (!next) return;
        openedFrom = document.querySelector('[data-open="' + next + '"]');
        window.history.pushState({ proj: next }, '', '#' + next);
        syncFromLocation();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !openId) return;
      // 라이트박스가 열려 있으면 그쪽이 먼저 닫혀야 한다
      if (lb && lb.open) return;
      if (window.history.state && window.history.state.proj) window.history.back();
      else { window.history.replaceState(null, '', '#works'); syncFromLocation(); }
    });

    window.addEventListener('popstate', syncFromLocation);
    // 주소창에서 해시를 직접 고치면 popstate 대신 hashchange가 온다
    window.addEventListener('hashchange', syncFromLocation);

    // 상세 링크로 바로 들어온 경우
    syncFromLocation();
  }

  /* ── 스파인 섹션 추적 ───────────────────────────────────────── */
  // 프로젝트 상세는 스크롤 흐름에 없다(책장에서만 연다). 감춰진 요소는 offsetTop이 0이라
  // 기준선 비교에서 항상 걸려 스파인이 문서 첫 화면에서 THEMOA를 가리키게 된다.
  var sections = Array.prototype.slice
    .call(document.querySelectorAll('[data-section]'))
    .filter(function (el) { return !el.classList.contains('proj'); });
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
    // 읽기 모드에서는 스파인이 감춰지고 나머지 섹션의 offsetTop이 0이 된다
    if (document.body.classList.contains('is-reading')) return;

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
