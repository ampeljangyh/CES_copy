document.addEventListener('DOMContentLoaded', function () {
  var langBtn = document.querySelector('.btn_lang');
  if (!langBtn) return;

  var body = document.body;

  function applyGateLangByBodyId() {
    var id = body.id || 'lang_kr';
    var lang = (id === 'lang_en') ? 'en' : 'kr';

    // setGateLang가 준비된 경우 즉시 적용
    if (typeof window.setGateLang === 'function') {
      window.setGateLang(lang);
      return;
    }

    // setGateLang가 아직 없으면(스크립트 로딩 순서) 짧게 재시도
    var tryCount = 0;
    var timer = setInterval(function () {
      tryCount++;
      if (typeof window.setGateLang === 'function') {
        clearInterval(timer);
        window.setGateLang(lang);
      } else if (tryCount >= 30) { // 약 1.5초(50ms*30)까지만
        clearInterval(timer);
      }
    }, 50);
  }

  // 1) localStorage에 저장된 언어 상태 불러오기
  var savedLang = localStorage.getItem('siteLang'); // 'lang_kr' or 'lang_en'

  if (savedLang === 'lang_kr' || savedLang === 'lang_en') {
    body.id = savedLang;
  } else {
    if (!body.id) body.id = 'lang_kr';
  }

  // ✅ 초기 로드시 gate 비디오/텍스트도 현재 언어로 동기 적용
  applyGateLangByBodyId();

  // 2) 버튼 클릭 시 토글 + localStorage 저장 + ✅ setGateLang 반영
  langBtn.addEventListener('click', function () {
    var currentId = body.id || 'lang_kr';
    var nextId = currentId === 'lang_kr' ? 'lang_en' : 'lang_kr';

    body.id = nextId;
    localStorage.setItem('siteLang', nextId);

    applyGateLangByBodyId();
  });
});



  
$(function () {
    /* main의 start 버튼 클릭 시 활성화 */
    $('.btn_main').on('click', function () {
        $('#container').addClass('started');
    });

    /* Gate 클릭 시 활성화 */
    $('.gate_wrap [class^="gate_item_"]').on('click', function () {
        const $card = $(this);
        const $all  = $('.gate_wrap [class^="gate_item_"]');

        if ($card.hasClass('on')) {
            $card.removeClass('on');
            return;
        }

        $all.removeClass('on');
        $card.addClass('on');
    });

    /* Gate 롤링 활성화 */
    $(function () {
        const $cards = $('.gate_wrap [class^="gate_item_"]');
        const cardCount = $cards.length;

        // gate_item_의 부모 li들
        const $cardLis = $cards.closest('li');

        let currentIndex = 0;           // gate_item_01부터 시작
        let autoTimer = null;           // setInterval 저장
        let resumeTimeout = null;       // 클릭 후 재시작 setTimeout
        let isAutoInitialized = false;  // START 버튼 여러 번 눌러도 1번만 시작

        // 카드 활성화 함수 (gate_item_ + 부모 li 둘 다)
        function showCard(index) {
            // gate_item_ on 처리
            $cards.removeClass('on');
            $cards.eq(index).addClass('on');

            // 부모 li active 처리
            $cardLis.removeClass('active');
            $cardLis.eq(index).addClass('active');
        }

        // 특정 인덱스부터 자동 롤링 시작
        function startAutoFrom(index) {
            currentIndex = index;
            showCard(currentIndex);

            if (autoTimer) clearInterval(autoTimer);

            autoTimer = setInterval(function () {
                currentIndex = (currentIndex + 1) % cardCount;
                showCard(currentIndex);
            }, 2500);
        }

        /* START 버튼 클릭 */
        $('.btn_main').on('click', function () {
            $('#container').addClass('started');

            // 자동 롤링은 한 번만 세팅
            if (isAutoInitialized) return;
            isAutoInitialized = true;

            // 1.5초 뒤 자동 롤링 시작
            setTimeout(function () {
                startAutoFrom(currentIndex);
            }, 1500);
        });

        /* 카드 클릭 시: 클릭된 카드 활성 + 2초 후 그 카드부터 재시작 */
        $cards.on('click', function () {
            const $card = $(this);
            const clickedIndex = $cards.index($card);

            // 자동 롤링, 재시작 타이머 모두 정지
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
            if (resumeTimeout) {
                clearTimeout(resumeTimeout);
                resumeTimeout = null;
            }

            // 클릭된 카드 바로 활성화 (gate_item_ + li)
            showCard(clickedIndex);

            // 2초 후, 클릭된 카드부터 자동 롤링 재개
            resumeTimeout = setTimeout(function () {
                startAutoFrom(clickedIndex);
                resumeTimeout = null;
            }, 2000);
        });
    });

    /* Gate menu 클릭 시 동작 */
    $('.menu_item').on('click', function () {
        $('.menu_item').removeClass('active'); // 전체에서 제거
        $(this).addClass('active');            // 클릭된 애만 active
    });









(() => {
  // =========================================================
  // ✅ [공통] btn_list_cop 또는 at_btn 클릭 시 gate_01.html "완료부팅"으로 이동
  // =========================================================
  const BOOT_KEY = 'GATE01_BOOT_COMPLETE';

  function bindBackToGate01() {
    if (document._boundBackToGate01) return;
    document._boundBackToGate01 = true;

    const btns = document.querySelectorAll('.btn_list_cop, .at_btn');
    if (!btns || !btns.length) return;

    btns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        try { sessionStorage.setItem(BOOT_KEY, '1'); } catch (err) {}
        window.location.href = '../gate01/gate_01.html';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindBackToGate01);
  } else {
    bindBackToGate01();
  }

  // =========================================================
  // ✅ gate_01 페이지 DOM 없으면(상세페이지 등) 여기서 종료
  // =========================================================
  const gateSec = document.querySelector('.new_gate_sec_01');
  const step1El = document.querySelector('.new_gate_01.step_01');
  const step2El = document.querySelector('.new_gate_01.step_02');
  if (!gateSec || !step1El || !step2El) return;

  // =========================================================
  // ✅ 공통 유틸: back/forward 네비게이션 감지
  // =========================================================
  function isBackForwardNav(e) {
    const nav = performance.getEntriesByType('navigation')[0];
    return !!(e && e.persisted) || (nav && nav.type === 'back_forward');
  }

  // =========================================================
  // ✅ toast 상태 체크 (dataset.active === "1" 이면 노출 중)
  // =========================================================
  function getToastBox() {
    return document.querySelector('.toast_pop_box');
  }
  function isToastActive() {
    const box = getToastBox();
    return !!(box && box.dataset && box.dataset.active === '1');
  }

  // =========================================================
  // ✅✅✅ search_complete 도넛 슬라이더 (클릭 씹힘 해결 버전)
  // - pointerCapture: "드래그로 판정된 순간"에만 잡음
  // - 드래그 후 발생하는 click은 캡처링으로 차단
  // =========================================================
  function initSearchCompleteDonutOnce() {
    if (document._scDonutInited) return true;

    const scene = document.querySelector('.search_complete_list');
    const list  = scene ? scene.querySelector(':scope > ul') : null;
    if (!scene || !list) return false;

    let itemEls = Array.from(list.children);
    if (!itemEls.length) return false;

    document._scDonutInited = true;

    let angle = 0;
    let velocity = 0;
    let isDragging = false;
    let lastX = 0;
    let lastT = 0;
    let rafId = null;

    // ✅ 클릭/드래그 분리
    const DRAG_THRESHOLD = 6; // px
    let startX = 0;
    let startY = 0;
    let moved = false;
    let captured = false;

    list.style.position = 'relative';
    list.style.width = '100%';
    list.style.height = '100%';
    list.style.transformStyle = 'preserve-3d';
    list.style.transformOrigin = '50% 50%';
    scene.style.touchAction = 'pan-y';

    function refreshItems() {
      itemEls = Array.from(list.children);
    }

    function layoutCards() {
      refreshItems();
      const total = itemEls.length;
      if (!total) return;

      const radius = 24;      // vw
      const minScale = 0.9;
      const maxScale = 1.2;
      const maxYOffset = 12;  // vw

      itemEls.forEach((li, index) => {
        const theta = (360 / total) * index + angle;
        const rad = theta * Math.PI / 180;

        const x = Math.sin(rad) * radius;
        const depth = (Math.cos(rad) + 1) / 2;

        const scale = minScale + (maxScale - minScale) * depth;
        const opacity = 0.4 + 0.6 * depth;
        const zIndex = 100 + Math.round(depth * 100);

        const yOffset = (1 - depth) * maxYOffset;

        li.style.position = 'absolute';
        li.style.left = '50%';
        li.style.top = '50%';
        li.style.transform = `
          translate3d(${x}vw, -50%, 0)
          translateY(-${yOffset}vw)
          scale(${scale})
        `;
        li.style.zIndex = zIndex;
        li.style.opacity = opacity;
      });
    }

    function stopInertia() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function startInertia() {
      stopInertia();
      const friction = 0.92;

      const tick = () => {
        velocity *= friction;
        if (Math.abs(velocity) < 0.001) {
          velocity = 0;
          rafId = null;
          return;
        }
        angle += velocity;
        layoutCards();
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    }

    function pxToDeg(dxPx) {
      const w = Math.max(320, window.innerWidth || 1920);
      return (dxPx / w) * 220;
    }

    function onDown(e) {
      isDragging = true;
      stopInertia();
      velocity = 0;

      startX = lastX = e.clientX;
      startY = e.clientY;
      lastT = performance.now();

      moved = false;
      captured = false;
      // ❌ 여기서 setPointerCapture 하지 않음(클릭 씹힘 원인)
    }

    function onMove(e) {
      if (!isDragging) return;

      const dxAll = e.clientX - startX;
      const dyAll = e.clientY - startY;

      // ✅ 임계치 넘으면 "드래그"로 판정하고 그때만 capture
      if (!captured && (Math.abs(dxAll) > DRAG_THRESHOLD || Math.abs(dyAll) > DRAG_THRESHOLD)) {
        moved = true;
        captured = true;
        scene._scDonutSuppressClick = true; // 드래그 이후 click 차단용
        try { scene.setPointerCapture && scene.setPointerCapture(e.pointerId); } catch (err) {}
      }

      // 드래그 확정 전에는 레이아웃 갱신 안 함(= 클릭 살림)
      if (!captured) return;

      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(16, now - lastT);

      const dAng = pxToDeg(dx);
      angle += dAng;
      velocity = dAng * (16 / dt);

      lastX = e.clientX;
      lastT = now;

      layoutCards();
    }

    function onUp() {
      if (!isDragging) return;
      isDragging = false;

      // ✅ 드래그가 아니면 suppressClick 해제(클릭 허용)
      if (!moved) {
        scene._scDonutSuppressClick = false;
        return;
      }

      // 드래그였으면 관성
      if (Math.abs(velocity) > 0.02) startInertia();
    }

    function onWheel(e) {
      const dy = e.deltaY || 0;
      angle += pxToDeg(dy) * 0.25;
      layoutCards();
    }

    if (!scene._scDonutBound) {
      scene._scDonutBound = true;

      // ✅ 드래그 이후 발생하는 click(특히 anchor click)을 캡처링 단계에서 차단
      scene.addEventListener('click', (e) => {
        if (!scene._scDonutSuppressClick) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        scene._scDonutSuppressClick = false; // 다음 클릭은 정상
      }, true);

      scene.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      scene.addEventListener('wheel', onWheel, { passive: true });

      window.addEventListener('resize', () => {
        layoutCards();
      });
    }

    if (!list._scDonutObs) {
      const obs = new MutationObserver(() => {
        layoutCards();
      });
      obs.observe(list, { childList: true });
      list._scDonutObs = obs;
    }

    layoutCards();
    document._scDonutRelayout = layoutCards;

    return true;
  }

  function ensureSearchCompleteDonut() {
    if (document._scDonutInited) {
      if (document._scDonutRelayout) document._scDonutRelayout();
      return;
    }

    if (document._scDonutEnsuring) return;
    document._scDonutEnsuring = true;

    let tries = 0;
    const MAX_TRIES = 80;   // 8초
    const INTERVAL = 100;

    const tick = () => {
      const ok = initSearchCompleteDonutOnce();
      if (ok) {
        document._scDonutEnsuring = false;
        if (document._scDonutRelayout) document._scDonutRelayout();
        return;
      }

      tries++;
      if (tries >= MAX_TRIES) {
        document._scDonutEnsuring = false;
        return;
      }

      setTimeout(tick, INTERVAL);
    };

    requestAnimationFrame(() => requestAnimationFrame(tick));
  }

  // =========================================================
  // ✅ 완료부팅(뒤로가기/리스트복귀) 모드
  // =========================================================
  const FORCE_COMPLETE = (sessionStorage.getItem(BOOT_KEY) === '1');

  function injectCompleteLockCssOnce() {
    if (document.getElementById('gate01-complete-lock')) return;

    const style = document.createElement('style');
    style.id = 'gate01-complete-lock';
    style.type = 'text/css';
    style.textContent = `
      html.gate01-complete-lock *{
        animation: none !important;
        transition: none !important;
      }

      html.gate01-complete-lock .new_gate_01.step_01,
      html.gate01-complete-lock .new_gate_01.step_02{
        display: none !important;
      }

      html.gate01-complete-lock .toast_pop_box,
      html.gate01-complete-lock .toast_pop{
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      html.gate01-complete-lock .search_complete,
      html.gate01-complete-lock .gate_01 .search_complete{
        display: flex !important;
        opacity: 1 !important;
        transform: translateY(0px) !important;
        top: 0px !important;
        pointer-events: auto !important;
        z-index: 999 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function keepNoBlendOff() {
    const sec = document.querySelector('.new_gate_sec_01');
    if (!sec) return;

    sec.classList.remove('no-blend-screen');

    if (sec._noBlendObserver) return;
    const mo = new MutationObserver(() => {
      if (sec.classList.contains('no-blend-screen')) {
        sec.classList.remove('no-blend-screen');
      }
    });
    mo.observe(sec, { attributes: true, attributeFilter: ['class'] });
    sec._noBlendObserver = mo;
  }

  // =========================================================
  // ✅ 시퀀스 파라미터
  // =========================================================
  const STEP_HOLD = 15000;
  const STEP_ANIM = 600;

  const CARD_HOLD = 4500;
  const CARD_ANIM = 500;

  const TEXT_TOTAL = 1000;
  const CHAR_DUR   = 300;
  const P_STAGGER  = 500;

  const STEP2_PRELOAD_BEFORE = 2200;
  const SECOND_LANG_DELAY    = 250;
  const CANPLAY_TIMEOUT      = 8000;

  const TOAST_AFTER_STEP2_VIDEO_END_DELAY = 0;
  const STEP2_TOAST_FALLBACK = 30000;
  const TOAST_FADE_DUR = 350;

  const VW_UP = '-0.5200vw';

  let currentLang = document.documentElement.classList.contains('lang-en') ? 'en_t' : 'kr_t';

  window.setGateLang = function (lang) {
    const nextLang = (lang === 'en' || lang === 'en_t') ? 'en_t' : 'kr_t';
    if (nextLang === currentLang) return;

    const prevLang = currentLang;
    currentLang = nextLang;

    document.documentElement.classList.toggle('lang-en', currentLang === 'en_t');
    document.documentElement.classList.toggle('lang-kr', currentLang === 'kr_t');

    const activeStep =
      document.querySelector('.new_gate_sec_01 .new_gate_01.on') ||
      document.querySelector('.new_gate_sec_01 .new_gate_01.step_01');

    if (activeStep) {
      syncStepLangVideosOnce(activeStep, prevLang, currentLang);

      const onCard = activeStep.querySelector('.gate_01_card_item.on');
      if (onCard) requestAnimationFrame(() => playCardText(onCard));
    }
  };

  // =========================================================
  // ✅✅✅ ty_02(kr/en 2개): "toast 노출 시점부터" opacity:0 유지
  // =========================================================
  let _ty02Locked = false;

  function getStep2TitleTy02Els() {
    return Array.from(
      document.querySelectorAll(
        '.new_gate_01.step_02 .inner .tit.ty_02.kr_t, ' +
        '.new_gate_01.step_02 .inner .tit.ty_02.en_t'
      )
    );
  }

  function setStep2TitleTy02Lock(lock) {
    _ty02Locked = !!lock;

    const els = getStep2TitleTy02Els();
    if (!els.length) return;

    els.forEach(el => {
      if (_ty02Locked) el.style.opacity = '0';
      else el.style.opacity = '';
    });
  }

  function enforceStep2TitleTy02Lock() {
    if (!_ty02Locked) return;

    const els = getStep2TitleTy02Els();
    if (!els.length) return;

    els.forEach(el => {
      if (el.style.opacity !== '0') el.style.opacity = '0';
    });
  }

  function installTy02ObserverOnce() {
    if (document._ty02ObsInstalled) return;
    document._ty02ObsInstalled = true;

    const tryBind = () => {
      const els = getStep2TitleTy02Els();
      if (!els.length) return false;

      if (!_ty02Locked) els.forEach(el => { el.style.opacity = ''; });

      els.forEach(el => {
        if (el._ty02Mo) return;

        const mo = new MutationObserver(() => {
          enforceStep2TitleTy02Lock();
        });

        mo.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        el._ty02Mo = mo;
      });

      return true;
    };

    if (!tryBind()) {
      let tries = 0;
      const t = setInterval(() => {
        tries++;
        if (tryBind() || tries >= 40) clearInterval(t);
      }, 100);
    }
  }

  // =========================================================
  // ✅ no-blend-screen 토글 (toast 활성 시 on)
  // =========================================================
  function setNoBlendScreen(on) {
    const sec = gateSec || document.querySelector('.new_gate_sec_01');
    if (!sec) return;
    if (on) sec.classList.add('no-blend-screen');
    else sec.classList.remove('no-blend-screen');
  }

  // =========================================================
  // ✅ toast_pop_box 제어
  // =========================================================
  function showToastPop(dur) {
    const box = getToastBox();
    if (!box) return;

    setNoBlendScreen(true);

    setStep2TitleTy02Lock(true);
    enforceStep2TitleTy02Lock();

    box.dataset.active = '1';
    box.style.willChange = 'opacity';
    box.style.transition = `opacity ${dur}ms ease`;

    box.style.visibility = 'visible';
    box.style.pointerEvents = 'none';
    box.style.opacity = '0';

    void box.offsetHeight;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        box.style.opacity = '1';
        box.style.pointerEvents = 'auto';

        requestAnimationFrame(enforceStep2TitleTy02Lock);
        requestAnimationFrame(enforceStep2TitleTy02Lock);
      });
    });
  }

  function hideToastPop(dur, done) {
    const box = getToastBox();
    if (!box) {
      setNoBlendScreen(false);
      if (done) done();
      return;
    }

    if (!dur || dur <= 0) {
      box.dataset.active = '0';
      box.style.transition = '';
      box.style.opacity = '0';
      box.style.visibility = 'hidden';
      box.style.pointerEvents = 'none';

      setNoBlendScreen(false);

      enforceStep2TitleTy02Lock();
      if (done) done();
      return;
    }

    box.style.willChange = 'opacity';
    box.style.transition = `opacity ${dur}ms ease`;
    box.style.pointerEvents = 'none';

    requestAnimationFrame(() => {
      box.style.opacity = '0';
      enforceStep2TitleTy02Lock();
    });

    setTimeout(() => {
      box.dataset.active = '0';
      box.style.visibility = 'hidden';
      box.style.pointerEvents = 'none';

      setNoBlendScreen(false);

      enforceStep2TitleTy02Lock();
      if (done) done();
      requestAnimationFrame(enforceStep2TitleTy02Lock);
    }, dur + 30);
  }

  // =========================================================
  // ✅ search_complete 초기화/노출
  // =========================================================
  function getSearchComplete() {
    return document.querySelector('.gate_01 .search_complete') || document.querySelector('.search_complete');
  }

  function setSearchCompleteInitial() {
    const sc = getSearchComplete();
    if (!sc) return;

    sc.dataset.active = '0';
    sc.style.willChange = 'top, opacity, transform';
    sc.style.pointerEvents = 'none';

    sc.style.top = '120vw';
    sc.style.opacity = '0';
    sc.style.transform = 'translateY(0.5200vw)';
  }

  function showSearchComplete() {
    const sc = getSearchComplete();
    if (!sc) return;

    enforceStep2TitleTy02Lock();

    sc.dataset.active = '1';
    sc.style.display = 'flex';
    sc.style.willChange = 'top, opacity, transform';
    sc.style.zIndex = '999';
    sc.style.pointerEvents = 'none';

    sc.style.top = '120vw';
    sc.style.opacity = '0';
    sc.style.transform = 'translateY(0.5200vw)';

    void sc.offsetHeight;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sc.style.top = '0';
        sc.style.opacity = '1';
        sc.style.transform = 'translateY(0)';
        sc.style.pointerEvents = 'auto';

        requestAnimationFrame(enforceStep2TitleTy02Lock);

        // ✅ search_complete 노출 직후 도넛 적용(카드가 늦게 렌더돼도 재시도)
        ensureSearchCompleteDonut();
      });
    });
  }

  // =========================================================
  // ✅ #cardListShow 클릭 → toast 닫기 + step_02 제거 + search_complete 노출
  // =========================================================
  function bindToastButtonToSearchComplete(step2) {
    if (document._bindCardListShow) return;
    document._bindCardListShow = true;

    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest && e.target.closest('#cardListShow');
      if (!btn) return;

      e.preventDefault();

      setStep2TitleTy02Lock(true);
      enforceStep2TitleTy02Lock();

      if (step2 && step2._toSearchRunning) return;
      if (step2) step2._toSearchRunning = true;

      hideToastPop(TOAST_FADE_DUR, () => {
        enforceStep2TitleTy02Lock();

        hideStep02ToSearch(step2, 600, () => {
          enforceStep2TitleTy02Lock();
          requestAnimationFrame(enforceStep2TitleTy02Lock);

          showSearchComplete();
        });
      });
    });
  }

  function hideStep02ToSearch(step2, dur, done) {
    if (!step2) { if (done) done(); return; }

    enforceStep2TitleTy02Lock();

    step2.style.willChange = 'opacity, transform';
    step2.style.transition = `opacity ${dur}ms ease, transform ${dur}ms ease`;

    requestAnimationFrame(() => {
      step2.style.opacity = '0';
      step2.style.transform = `translateY(${VW_UP})`;
      enforceStep2TitleTy02Lock();
    });

    setTimeout(() => {
      step2.classList.remove('on', 'is-leave');

      try { pauseStepVideos(step2); } catch (e) {}
      clearStep02Toast(step2);

      enforceStep2TitleTy02Lock();

      step2.style.display = 'none';
      if (typeof done === 'function') done();
    }, dur + 30);
  }

  function clearStep02Toast(step2) {
    if (!step2) return;

    if (step2._toastTimer) {
      clearTimeout(step2._toastTimer);
      step2._toastTimer = null;
    }
    if (step2._toastFallbackTimer) {
      clearTimeout(step2._toastFallbackTimer);
      step2._toastFallbackTimer = null;
    }

    step2._toastScheduled = false;
  }

  // =========================================================
  // ✅ 완료부팅 진입 처리
  // =========================================================
  function bootGate01Complete(consumesFlag) {
    if (consumesFlag) {
      try { sessionStorage.removeItem(BOOT_KEY); } catch (e) {}
    }

    document.documentElement.classList.add('gate01-complete-lock');
    injectCompleteLockCssOnce();

    keepNoBlendOff();

    // toast 숨김 + no-blend off
    hideToastPop(0);

    // search_complete 고정 노출
    const sc =
      document.querySelector('.gate_01 .search_complete') ||
      document.querySelector('.search_complete');

    if (sc) {
      sc.dataset.active = '1';
      sc.style.setProperty('display', 'flex', 'important');
      sc.style.setProperty('will-change', 'top, opacity, transform', 'important');
      sc.style.setProperty('opacity', '1', 'important');
      sc.style.setProperty('transform', 'translateY(0px)', 'important');
      sc.style.setProperty('top', '0px', 'important');
      sc.style.setProperty('pointer-events', 'auto', 'important');
      sc.style.setProperty('z-index', '999', 'important');
    }

    // ✅ 완료부팅에서도 도넛 적용
    ensureSearchCompleteDonut();

    // 비디오 정지
    document.querySelectorAll('.new_gate_sec_01 .main_video video').forEach(v => {
      try { v.pause(); } catch (e) {}
    });
  }

  // ✅ bfcache(back/forward) 복귀에서도 락 적용 + 도넛 재적용
  window.addEventListener('pageshow', (e) => {
    const flag = (sessionStorage.getItem(BOOT_KEY) === '1');
    const scActive = !!document.querySelector('.search_complete[data-active="1"]');

    if (isBackForwardNav(e) && (flag || scActive || document.documentElement.classList.contains('gate01-complete-lock'))) {
      bootGate01Complete(flag);
    }

    if (scActive) ensureSearchCompleteDonut();

    if (document.documentElement.classList.contains('gate01-complete-lock')) {
      keepNoBlendOff();
    }
  });

  // ✅ 최초 로드 시 완료부팅이면: 애니 자체 실행 금지(return)
  if (FORCE_COMPLETE) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => bootGate01Complete(true), { once: true });
    } else {
      bootGate01Complete(true);
    }
    return;
  }

  // =========================================================
  // ✅ gate_01 시퀀스
  // =========================================================
  function initGate01Sequence() {
    const step1 = document.querySelector('.new_gate_01.step_01');
    const step2 = document.querySelector('.new_gate_01.step_02');
    if (!step1 || !step2) return;

    if (!document.documentElement.classList.contains('lang-kr') && !document.documentElement.classList.contains('lang-en')) {
      document.documentElement.classList.add(currentLang === 'en_t' ? 'lang-en' : 'lang-kr');
    }

    installTy02ObserverOnce();

    // ✅ 시작은 락 해제(토스트 뜨기 전엔 보이게)
    setStep2TitleTy02Lock(false);

    setupAllGateVideos();
    pauseStepVideos(step2);

    hideToastPop(0);
    setSearchCompleteInitial();

    bindToastButtonToSearchComplete(step2);

    // step_01 비디오 재생
    playStepVideosSmooth(step1);

    // step_02 프라임
    setTimeout(() => {
      primeStepVideos(step2);
    }, Math.max(0, STEP_HOLD - STEP2_PRELOAD_BEFORE));

    requestAnimationFrame(() => prepareAllDescText(step1));

    step1.classList.add('on');
    step2.classList.remove('on', 'is-leave');

    const cards = Array.from(step1.querySelectorAll('.gate_01_card_item'));
    if (cards.length) {
      let idx = cards.findIndex(el => el.classList.contains('on'));
      if (idx < 0) idx = 0;

      cards.forEach((el, i) => el.classList.toggle('on', i === idx));
      requestAnimationFrame(() => playCardText(cards[idx]));
      runCardSequence(cards, idx);
    }

    // step_01 끝 → step_02
    setTimeout(() => {
      enterStep(step2);
      leaveStep(step1);
    }, STEP_HOLD);
  }

  // -----------------------------
  // VIDEO
  // -----------------------------
  function setupAllGateVideos() {
    document.querySelectorAll('.new_gate_sec_01 .main_video video').forEach(v => {
      v.muted = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('disablepictureinpicture', '');

      v.autoplay = false;
      v.removeAttribute('autoplay');

      v.preload = 'metadata';
      try { v.pause(); } catch (e) {}
    });
  }

  function primeStepVideos(step) {
    if (!step) return;
    step.querySelectorAll('.main_video video').forEach(v => {
      v.preload = 'auto';
      try { v.load(); } catch (e) {}
    });
  }

  function playStepVideosSmooth(step) {
    if (!step) return;

    const kr = step.querySelector('.main_video video.kr_t');
    const en = step.querySelector('.main_video video.en_t');
    if (!kr || !en) return;

    const primary = (currentLang === 'en_t') ? en : kr;
    const second  = (currentLang === 'en_t') ? kr : en;

    // ✅ step_01만 0.7
    const rate = step.classList.contains('step_01') ? 0.7 : 1;
    try { primary.playbackRate = rate; } catch (e) {}
    try { second.playbackRate  = rate; } catch (e) {}

    waitCanPlay(primary, CANPLAY_TIMEOUT).then(() => {
      safePlay(primary);

      setTimeout(() => {
        waitCanPlay(second, CANPLAY_TIMEOUT).then(() => {
          syncOneToAnother(second, primary);
          safePlay(second);
        });
      }, SECOND_LANG_DELAY);
    });
  }

  function pauseStepVideos(step) {
    if (!step) return;
    step.querySelectorAll('.main_video video').forEach(v => {
      try { v.pause(); } catch (e) {}
    });
  }

  // ✅✅✅ toast 노출 중(step_02 on) 언어 변경 시, 영상 재생 금지
  function syncStepLangVideosOnce(step, fromLang, toLang) {
    const from = step.querySelector(`.main_video video.${fromLang}`);
    const to   = step.querySelector(`.main_video video.${toLang}`);
    if (!from || !to) return;

    const blockPlay = step.classList.contains('step_02') && isToastActive();

    waitCanPlay(to, CANPLAY_TIMEOUT).then(() => {
      syncOneToAnother(to, from);

      if (blockPlay) {
        try { to.pause(); } catch (e) {}
        return;
      }

      safePlay(to);
    });
  }

  function syncOneToAnother(target, base) {
    if (!target || !base) return;

    const t = clampTime(base.currentTime, target.duration);
    try {
      if (typeof target.fastSeek === 'function') target.fastSeek(t);
      else if (Math.abs((target.currentTime || 0) - t) > 0.12) target.currentTime = t;
    } catch (e) {}
  }

  function clampTime(t, duration) {
    if (!isFinite(t)) return 0;
    if (!isFinite(duration) || duration <= 0) return t;
    return Math.min(t, Math.max(0, duration - 0.12));
  }

  // ✅ 안전장치: 다른 경로에서 play()가 불려도 토스트+step_02면 차단
  function safePlay(v) {
    if (!v) return;

    // toast 노출 + step_02 on + 해당 비디오가 그 안이면 재생 금지
    const inStep2On = !!(v.closest && v.closest('.new_gate_01.step_02.on'));
    if (inStep2On && isToastActive()) {
      try { v.pause(); } catch (e) {}
      return;
    }

    const p = v.play && v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  function waitCanPlay(video, timeoutMs) {
    return new Promise(resolve => {
      if (!video) return resolve();
      if (video.readyState >= 2) return resolve();

      let done = false;
      const t = setTimeout(finish, timeoutMs);

      function finish() {
        if (done) return;
        done = true;
        clearTimeout(t);
        cleanup();
        resolve();
      }
      function onReady() {
        if (video.readyState >= 2) finish();
      }
      function cleanup() {
        video.removeEventListener('loadeddata', onReady);
        video.removeEventListener('canplay', onReady);
        video.removeEventListener('canplaythrough', onReady);
        video.removeEventListener('error', finish);
        video.removeEventListener('stalled', finish);
        video.removeEventListener('abort', finish);
      }

      video.addEventListener('loadeddata', onReady);
      video.addEventListener('canplay', onReady);
      video.addEventListener('canplaythrough', onReady);
      video.addEventListener('error', finish, { once: true });
      video.addEventListener('stalled', finish, { once: true });
      video.addEventListener('abort', finish, { once: true });

      try { video.load(); } catch (e) {}
    });
  }

  // -----------------------------
  // STEP / CARD
  // -----------------------------
  function enterStep(el) {
    el.classList.add('on');
    playStepVideosSmooth(el);

    if (el.classList.contains('step_02')) {
      // ✅ step_02 진입 시에는 토스트 전이므로 락 해제
      setStep2TitleTy02Lock(false);
      hideToastPop(0);

      bindStep2PlayOnceThenToast(el);
    }
  }

  function bindStep2PlayOnceThenToast(step2) {
    if (!step2) return;

    clearStep02Toast(step2);
    step2._step2EndedHandled = false;

    const vids = Array.from(step2.querySelectorAll('.main_video > video'));
    if (!vids.length) {
      scheduleToastAfterStep2End(step2);
      return;
    }

    vids.forEach(v => {
      try { v.loop = false; } catch (e) {}
      v.removeAttribute('loop');
    });

    const onEnded = () => {
      if (!step2.classList.contains('on')) return;
      if (step2._step2EndedHandled) return;
      step2._step2EndedHandled = true;

      vids.forEach(v => { try { v.pause(); } catch (e) {} });
      scheduleToastAfterStep2End(step2);
    };

    vids.forEach(v => v.addEventListener('ended', onEnded));

    step2._toastFallbackTimer = setTimeout(() => {
      if (!step2.classList.contains('on')) return;
      if (step2._step2EndedHandled) return;
      step2._step2EndedHandled = true;

      vids.forEach(v => { try { v.pause(); } catch (e) {} });
      scheduleToastAfterStep2End(step2);
    }, STEP2_TOAST_FALLBACK);
  }

  function scheduleToastAfterStep2End(step2) {
    if (!step2 || !step2.classList.contains('on')) return;
    if (step2._toastScheduled) return;

    step2._toastScheduled = true;
    clearStep02Toast(step2);

    if (!TOAST_AFTER_STEP2_VIDEO_END_DELAY || TOAST_AFTER_STEP2_VIDEO_END_DELAY <= 0) {
      showToastPop(TOAST_FADE_DUR);
      return;
    }

    step2._toastTimer = setTimeout(() => {
      if (!step2.classList.contains('on')) return;
      showToastPop(TOAST_FADE_DUR);
    }, TOAST_AFTER_STEP2_VIDEO_END_DELAY);
  }

  function leaveStep(el, done) {
    el.classList.add('is-leave');
    setTimeout(() => {
      el.classList.remove('on', 'is-leave');
      pauseStepVideos(el);
      if (typeof done === 'function') done();
    }, STEP_ANIM);
  }

  function runCardSequence(cards, startIdx) {
    const lastIdx = cards.length - 1;

    for (let i = startIdx; i < lastIdx; i++) {
      const t = (i - startIdx) * (CARD_HOLD + CARD_ANIM) + CARD_HOLD;
      setTimeout(() => swapCardSequential(cards[i], cards[i + 1]), t);
    }

    const lastOnTime = (lastIdx - startIdx) * (CARD_HOLD + CARD_ANIM);
    setTimeout(() => clearCardOn(cards[lastIdx]), lastOnTime + CARD_HOLD);
  }

  function swapCardSequential(current, next) {
    if (!current || !next) return;

    current.classList.add('is-leave');
    setTimeout(() => {
      current.classList.remove('on', 'is-leave');
      resetCardText(current);

      next.classList.add('on');
      requestAnimationFrame(() => playCardText(next));
    }, CARD_ANIM);
  }

  function clearCardOn(card) {
    if (!card) return;
    card.classList.add('is-leave');
    setTimeout(() => {
      card.classList.remove('on', 'is-leave');
      resetCardText(card);
    }, CARD_ANIM);
  }

  // -----------------------------
  // TEXT
  // -----------------------------
  function prepareAllDescText(root) {
    root.querySelectorAll('.bott_desc p').forEach(p => splitToChars(p));
  }

  function splitToChars(p) {
    if (!p || p.dataset.split === '1') return;

    let idx = 0;
    const frag = document.createDocumentFragment();
    Array.from(p.childNodes).forEach(node => frag.appendChild(processNode(node)));

    p.textContent = '';
    p.appendChild(frag);
    p.dataset.split = '1';

    function processNode(node) {
      if (node.nodeType === 3) {
        const text = node.nodeValue || '';
        const f = document.createDocumentFragment();
        for (const ch of text) {
          const span = document.createElement('span');
          span.className = 'char';
          span.style.setProperty('--i', idx++);
          span.textContent = (ch === ' ') ? '\u00A0' : ch;
          f.appendChild(span);
        }
        return f;
      }

      if (node.nodeType === 1) {
        const tag = node.tagName.toUpperCase();
        if (tag === 'BR') return node.cloneNode(true);

        const el = node.cloneNode(false);
        Array.from(node.childNodes).forEach(child => el.appendChild(processNode(child)));
        return el;
      }

      return document.createTextNode('');
    }
  }

  function playCardText(card) {
    if (!card) return;

    const ps = Array.from(card.querySelectorAll(`.bott_desc.${currentLang} p[data-split="1"]`));
    ps.forEach((p, pi) => {
      p.classList.remove('text_play');

      const chars = p.querySelectorAll('.char');
      const n = chars.length;

      const pDelay = pi * P_STAGGER;
      p.style.setProperty('--p-delay', pDelay + 'ms');
      p.style.setProperty('--char-dur', CHAR_DUR + 'ms');

      const availableTotal = Math.max(CHAR_DUR, TEXT_TOTAL - pDelay);
      const charDelay = (n > 1) ? Math.max(0, (availableTotal - CHAR_DUR) / (n - 1)) : 0;
      p.style.setProperty('--char-delay', charDelay + 'ms');

      void p.offsetWidth;
      p.classList.add('text_play');
    });
  }

  function resetCardText(card) {
    if (!card) return;
    card.querySelectorAll('.bott_desc p').forEach(p => p.classList.remove('text_play'));
  }

  // -----------------------------
  // start
  // -----------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGate01Sequence);
  } else {
    initGate01Sequence();
  }
})();























/* Gate01 결과 클릭 시 카드 회전 및 해당 결과 동작 */
document.addEventListener('click', function (e) {
  // .search_complete_item 또는 그 안쪽을 클릭했는지 확인
  const item = e.target.closest('.search_complete_item');
  if (!item) return; // 다른 곳 클릭이면 아무 것도 안 함

  // li 안에 <a href=""></a> 때문에 페이지 튈 수 있으니 방지
  e.preventDefault();

  const target = item.dataset.target;
  if (!target) return;

  // 클릭된 요소의 부모 li 찾기
  const li = item.closest('li');
  if (!li) return;

  // 이미 애니메이션 중이면 중복 실행 방지
  if (li.classList.contains('is-animating')) return;

  // 0) 검색 결과 영역 위로 사라지는 애니 (wrap 이 있으면 그 쪽에, 없으면 item에)
  const searchWrap = item.closest('.search_complete'); // 전체 블록 래퍼가 있다면
  if (searchWrap) {
    searchWrap.classList.add('is-hide'); // opacity 0 + translateY(-200%)
  } else {
    item.classList.add('is-hide');       // 최소한 클릭한 아이템이라도 위로 사라지게
  }

  // 1) li 회전 + 확대 시작
  li.classList.add('is-animating');

  // 2) 회전 애니메이션이 0.6s 이니까, 끝난 뒤에 카드 열기
  setTimeout(function () {
    li.classList.remove('is-animating');

    // (1) 모든 .card_detail 숨기기
    const allCards = document.querySelectorAll('.card_detail');
    allCards.forEach(function (card) {
      card.classList.remove('is-show');   // → opacity 0, translateY(200%), display:none
    });

    // (2) data-target 과 매칭되는 id 만들기
    const num = parseInt(target, 10);
    const id = (num < 10) ? 'cardDetail0' + num : 'cardDetail' + num;
    const card = document.getElementById(id);

    // (3) 해당 카드만 보여주기 (아래에서 위로 슬라이드 인)
    if (card) {
      card.classList.add('is-show');      // → display:block, opacity:1, translateY(0)
    }
  }, 600); // liRotateZoom 0.6s와 맞춰서
});







const PROG_SRC_BASE = '../../resources/images/chk_ico_prog.svg';
let progIconCounter = 0; // SVG 애니 재시작용 쿼리스트링 카운터

function startEvalSequence(card) {
  // 카드마다 한 번만 실행
  if (card.dataset.evalAnimated === '1') return;
  card.dataset.evalAnimated = '1';

  const items = card.querySelectorAll('.eval_list ul > li .item');
  const txts  = card.querySelectorAll('.eval_list .chk_ico .txt');

  if (!items.length) return;

  // 기존 .on 초기화
  txts.forEach(function (t) {
    t.classList.remove('on');
  });

  // 🔹 이미지 교체 스케줄
  // is-show 이후 2초 뒤 첫 번째, 이후 4초 간격으로 3개까지
  items.forEach(function (item, index) {
    if (index > 2) return; // 3개까지만

    const delay = 2000 + index * 4000; // ms → 2초, 6초, 10초

    setTimeout(function () {
      const img = item.querySelector('.chk_ico .ico img');
      if (img) {
        const uniqueSrc = PROG_SRC_BASE + '?v=' + (progIconCounter++);
        img.src = uniqueSrc;
      }
    }, delay);
  });

  // 🔹 텍스트 .on + score_result.on + result_progress step on
  txts.forEach(function (txt, index) {
    if (index > 2) return;

    // txt.on 이 붙는 시점
    const delay = 5000 + index * 3900; // 원하는 타이밍 (예: 5초, 8.9초, 12.8초)

    setTimeout(function () {
      // 1) 텍스트에 .on 추가
      txt.classList.add('on');

      // 2) 같은 줄의 .item > .score_result 찾기
      const item = txt.closest('.item');
      if (!item) return;

      const scoreResult = item.querySelector('.score_result');
      if (!scoreResult) return;

      // 3) txt.on 이 붙은 후 0.5초 뒤에 score_result.on + result_progress 처리
      setTimeout(function () {
        // 3-1) 점수 영역 on
        scoreResult.classList.add('on');

        // 3-2) 종합평가 result_progress 처리
        const resultProgress = card.querySelector('.result_sum .result_progress');
        if (resultProgress) {
          // result_progress 자체에도 on을 한 번 추가 (지워지지 않음)
          resultProgress.classList.add('on');

          const stepClasses = ['step_01', 'step_02', 'step_03'];
          const targetStepClass = stepClasses[index];

          stepClasses.forEach(function (cls) {
            const stepEl = resultProgress.querySelector('.' + cls);
            if (!stepEl) return;

            if (cls === targetStepClass) { 
              // 들어올 애: leaving 제거 + on 추가
              stepEl.classList.remove('leaving');
              stepEl.classList.add('on');
            } else {
              // 나가는 애: on을 빼고 leaving을 잠깐 넣어서 위로 사라지는 모션
              if (stepEl.classList.contains('on')) {
                stepEl.classList.remove('on');
                stepEl.classList.add('leaving');

                // 애니 끝난 뒤 leaving 제거 (0.6s transition 기준)
                setTimeout(function () {
                  stepEl.classList.remove('leaving');
                }, 600);
              }
            }
          });
        }
      }, 500); // 0.5초 딜레이
    }, delay);
  });
}

// 🔹 .card_detail 요소에 is-show 클래스가 붙는 걸 감지
const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (m) {
    if (m.type === 'attributes' && m.attributeName === 'class') {
      const el = m.target;
      if (
        el.classList &&
        el.classList.contains('card_detail') &&
        el.classList.contains('is-show')
      ) {
        startEvalSequence(el);
      }
    }
  });
});

// 페이지에 있는 모든 .card_detail을 감시
document.querySelectorAll('.card_detail').forEach(function (card) {
  observer.observe(card, { attributes: true });

  // 이미 is-show인 상태로 로드된 경우도 처리
  if (card.classList.contains('is-show')) {
    startEvalSequence(card);
  }
});

});

// kcon_swiper 안의 kcon_item 클릭
$(document).on('click', '.kcon_swiper .kcon_item', function () {
    const $item = $(this);
    const $wrap = $item.closest('.kcon_swiper'); // 현재 스와이퍼 범위

    // 1) 같은 스와이퍼 안의 모든 kcon_item에서 on 제거
    $wrap.find('.kcon_item').removeClass('on');

    // 2) 클릭한 아이에만 on 추가
    $item.addClass('on');

    // 3) data-bg 값 읽기 (예: "01", "02" ...)
    const bgKey = $item.data('bg'); // -> "01", "02" 같은 문자열

    // 4) 모든 배경에서 on 제거
    $('.kcon_bg_wrap').removeClass('on');

    // 5) 매칭되는 id에 on 추가 (예: #bg01, #bg02 ...)
    if (bgKey) {
        const $bgWrap = $('#bg' + bgKey);
        $bgWrap.addClass('on');

        // 6) 해당 bg의 영상 재시작 (포스터 2초 → 영상 재생)
        const bgEl = $bgWrap.find('.kcon_bg')[0];
        if (bgEl && bgEl._restartKconVideo) {
            // 다른 bg 영상 멈추고 싶으면 여기서 모두 stop
            $('.kcon_bg video').each(function () {
                this.pause();
            });

            bgEl._restartKconVideo();
        }
    }
});

  /* =========================
     팝업 열기 / 닫기
     ========================= */

$(document).on('click', '.inve_btn_sub', function () {
  // 1) 나를 감싸고 있는 가장 가까운 kcon_item 찾기
  const $item = $(this).closest('.kcon_item');
  if (!$item.length) return;

  // 2) 그 kcon_item의 data-bg 값 가져오기 (예: "01", "02")
  const bgKey = $item.data('bg');  // data-bg="01"
  if (!bgKey) return;

  // 3) 열려 있던 팝업 닫고 싶으면 (선택)
  // $('.kcon_pop').removeClass('is-show');

  // 4) 해당 id를 가진 팝업 열기 (#pop01, #pop02 ...)
  $('#pop' + bgKey).addClass('is-show');
});

  // 닫기 버튼
  $(document).on('click', '.kcon_pop .close_pop', function () {
    $(this).closest('.kcon_pop').removeClass('is-show');
  });

  // 딤 영역 클릭 시 닫기 (컨텐츠 영역 제외)
  $(document).on('click', '.kcon_pop', function (e) {
    if ($(e.target).is('.kcon_pop')) {
      $(this).removeClass('is-show');
    }
  });

  /* =========================
     슬라이더 생성 & 값 연동
     ========================= */

  // 1번째 박스: 예상 관람객 수 (100 / 500 / 1000 만)
  // 2번째 박스: 투자금액 (1 / 5 / 10 억)
  var sliderConfigs = [
    { // 첫 번째 scroll_box
      steps: [100, 500, 1000],
      unit: '만'
    },
    { // 두 번째 scroll_box
      steps: [1, 5, 10],
      unit: '억'
    }
  ];

  $('.kcon_pop .scroll_wrap .scroll_box').each(function (idx) {
    var config = sliderConfigs[idx];
    if (!config) return;

    var $box = $(this);
    var $scroll = $box.find('.scroll');
    var $numSpan = $box.find('.tit .in_num span').first(); // 숫자만 들어가는 span

    // 슬라이더 DOM 생성
    var maxIndex = config.steps.length - 1;
    var rangeId = 'kconRange' + (idx + 1);

    var html =
      '<div class="scroll_range" data-unit="' + config.unit + '">' +
        '<input type="range" ' +
          'id="' + rangeId + '" ' +
          'class="kcon_range_input" ' +
          'min="0" max="' + maxIndex + '" step="1" value="0">' +
        '<div class="scroll_labels">' +
          config.steps.map(function (v) {
            return '<span>' + v + config.unit + '</span>';
          }).join('') +
        '</div>' +
      '</div>';

    $scroll.html(html);

    var $range = $scroll.find('.kcon_range_input');

    function updateValue() {
      var idx = parseInt($range.val(), 10);
      var val = config.steps[idx];
      $numSpan.text(val);
    }

    // 초기값 세팅
    updateValue();

    // 슬라이드 시 숫자 갱신
    $range.on('input change', updateValue);
  });









/* Gate02 sub */
document.addEventListener('DOMContentLoaded', function () {
  // 공통 SVG 경로
  var SVG_PATH = '../../resources/images/chk_ico_prog.svg';

  // 대상 item들
  var items = Array.prototype.slice.call(
    document.querySelectorAll('.gate_02.sub [class*="gate_02"] .inve_confirm_list .item')
  );
  if (!items.length) return;

  // 1초 뒤에 시작
  var baseDelay = 1000;

  // item들을 랜덤 순서로 섞기
  var shuffledItems = items.slice().sort(function () {
    return Math.random() - 0.5;
  });

  shuffledItems.forEach(function (item, index) {
    var confirmBox = item.querySelector('.confirm');
    if (!confirmBox) return;

    // 각 아이템 사이 간격 1~1.5초 랜덤
    var interval = 1000 + Math.random() * 500; // 1000~1500ms
    var startTime = baseDelay + index * interval;

    setTimeout(function () {

      // 1) 체크 아이콘 "새 인스턴스"로 생성 + 삽입
      var ico = document.createElement('img');
      ico.className = 'ico';
      ico.src = SVG_PATH + '?t=' + Date.now() + '_' + Math.random(); 
      confirmBox.appendChild(ico);

      // 먼저 display 보이게 하고
      ico.style.display = 'inline-block';

      // 다음 프레임에 opacity transition 적용
      requestAnimationFrame(function () {
        ico.classList.add('active'); // opacity 1
      });

      // 3초 후 아이콘 서서히 사라짐
      setTimeout(function () {
        ico.classList.remove('active');  // opacity 0으로

        // 아이콘이 사라지는 transition 시간(0.6초) 이후에 버튼 등장
        setTimeout(function () {
          ico.style.display = 'none';

          // 2) 버튼 생성/표시
          var btn = confirmBox.querySelector('button.btn.case_01');
          if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn case_01';

            // 한글 span
            var spanKr = document.createElement('span');
            spanKr.className = 'kr_t';
            spanKr.textContent = '적합';

            // 영문 span
            var spanEn = document.createElement('span');
            spanEn.className = 'en_t';
            spanEn.textContent = 'Eligible';

            btn.appendChild(spanKr);
            btn.appendChild(spanEn);

            confirmBox.appendChild(btn);
          } else {
            // 이미 있는 버튼이면 내부 span 구조 보정
            var spanKr = btn.querySelector('span.kr_t');
            var spanEn = btn.querySelector('span.en_t');

            if (!spanKr) {
              spanKr = document.createElement('span');
              spanKr.className = 'kr_t';
              btn.appendChild(spanKr);
            }
            if (!spanEn) {
              spanEn = document.createElement('span');
              spanEn.className = 'en_t';
              btn.appendChild(spanEn);
            }

            spanKr.textContent = '적합';
            spanEn.textContent = 'Eligible';
          }

          btn.style.display = 'inline-flex';
          requestAnimationFrame(function () {
            btn.classList.add('active'); // opacity 1
          });

        }, 200); // CSS transition 0.6s와 맞춤

      }, 1500); // 아이콘이 1.5초 동안 화면에 있다가 사라짐

    }, startTime); // 1초 후 + (1~1.5초 * index) 마다 순차 실행
  });
});



document.addEventListener('DOMContentLoaded', function () {
    var bgList = document.querySelectorAll('.kcon_bg');

    bgList.forEach(function (bg) {
        var video  = bg.querySelector('.video-el');
        var poster = bg.querySelector('.video-poster');
        if (!video) return;

        var posterTimer = null;

        // 포스터 → 영상 전환 + 재생
        function showVideo() {
            if (bg.classList.contains('is-ready')) return;

            bg.classList.add('is-ready'); // CSS에서 포스터/영상 전환

            var p = video.play();
            if (p && typeof p.catch === 'function') {
                p.catch(function () {
                    // 자동재생 막혔을 때 처리하고 싶으면 여기서
                });
            }
        }

        // 이 bg를 "처음부터 다시" 시작하는 함수
        function restartWithPosterDelay() {
            // 다른 타이머 있으면 정리
            if (posterTimer) {
                clearTimeout(posterTimer);
                posterTimer = null;
            }

            // 상태 리셋
            bg.classList.remove('is-ready');
            video.pause();
            video.currentTime = 0;

            // 이벤트 핸들러
            function onCanPlay() {
                video.removeEventListener('canplaythrough', onCanPlay);
                video.removeEventListener('canplay', onCanPlay);

                // 준비된 시점 기준으로 1초 후 포스터 → 영상 전환
                posterTimer = setTimeout(showVideo, 1000);
            }

            // 혹시 중복 등록되지 않도록 한 번 정리 후 다시 등록
            video.removeEventListener('canplaythrough', onCanPlay);
            video.removeEventListener('canplay', onCanPlay);
            video.addEventListener('canplaythrough', onCanPlay);
            video.addEventListener('canplay', onCanPlay);

            // 이미 어느 정도 로드된 상태면 바로 2초 타이머
            if (video.readyState >= 3) { // HAVE_FUTURE_DATA 이상
                posterTimer = setTimeout(showVideo, 2000);
            } else {
                video.load();
            }
        }

        // 이 bg에 재시작 함수를 저장 (jQuery 쪽에서 호출용)
        bg._restartKconVideo = restartWithPosterDelay;

        // 처음부터 on인 bg가 있다면 자동 시작하고 싶으면 이 부분 사용
        var wrap = bg.closest('.kcon_bg_wrap');
        if (wrap && wrap.classList.contains('on')) {
            restartWithPosterDelay();
        }
    });
});



$(document).on('click', '.pop_btn', function () {
  window.location.href = './html/gate02/gate_02_01.html';
});


document.addEventListener('DOMContentLoaded', function () {
    // --------------------------------------------------------------------
    // 공통 엘리먼트
    // --------------------------------------------------------------------
    var confirmBoxWrap  = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_confirm_box');
    var examineBoxWrap  = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_examine_box');
    var confirmWrap     = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_confirm_wrap');
    var movieClosed     = document.querySelector('.gate_02.sub [class*="gate_02"] .movie_closed');
    var inveResult      = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_result');

    // 추가: inve_adj_box
    var adjBoxWrap      = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_adj_box');

    // 커서: confirm / examine / adj 각각 별도
    var confirmCursor   = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_confirm_box .final_cursor');
    var examineCursor   = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_examine_box .final_cursor');
    var adjCursor       = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_adj_box .final_cursor');

    // 커서 텍스트 (공통)
    var cursorText      = document.querySelector('.final_gp .cursor_text');

    // 팝업
    var pop01           = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_pop.pop_01');
    var pop02           = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_pop.pop_02');

    if (!confirmCursor && !examineCursor && !adjCursor) return;

    // --------------------------------------------------------------------
    // 숫자 유틸 & 카운트 함수
    // --------------------------------------------------------------------
    function parseNumber(str){
        const num = parseInt(str.replace(/[^\d\-]/g,''),10);
        return isNaN(num)?0:num;
    }
    function formatNumber(num){
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
    }
    function countUp($el,from,to,duration,formatter,onComplete){
        const startTime = Date.now();
        const diff = to-from;
        function tick(){
            const now = Date.now();
            const elapsed = now-startTime;
            const progress = Math.min(elapsed/duration,1);
            const value = Math.round(from+diff*progress);
            $el.text(formatter?formatter(value):value);
            if(progress<1){
                requestAnimationFrame(tick);
            }else if(typeof onComplete==="function"){
                onComplete();
            }
        }
        requestAnimationFrame(tick);
    }

    // --------------------------------------------------------------------
    // 결과 숫자/스텝 애니 시작 함수
    // --------------------------------------------------------------------
    function startInveInfoAnimation(){
        const $wrap = $('.gate_02.sub [class*="gate_02"] .inve_info_list');
        if(!$wrap.length) return;

        const $step01=$wrap.find('.step_01');
        const $step02=$wrap.find('.step_02');
        const $step03=$wrap.find('.step_03');
        const $step04=$wrap.find('.step_04');
        const $step05=$wrap.find('.step_05');
        const $step06=$wrap.find('.step_06');

        const $s1_d1=$step01.find('.data_01');
        const $s1_d2=$step01.find('.data_02');
        const $s3_d3=$step03.find('.data_03');
        const $s4_d5=$step04.find('.data_05');
        const $s4_d4=$step04.find('.data_04');

        const s1_d1_target=parseNumber($s1_d1.text());
        const s1_d2_target=parseNumber($s1_d2.text());
        const s3_d3_target=parseNumber($s3_d3.text());
        const s4_d5_target=parseNumber($s4_d5.text());

        const d4_raw=$s4_d4.text().trim();
        const d4_prefix=(d4_raw.match(/^[^\d\-]*/)||[''])[0];
        const d4_suffix=(d4_raw.match(/[^\d]*$/)||[''])[0];
        const d4_num=parseNumber(d4_raw);

        $s1_d1.text('0');
        $s1_d2.text('0');
        $s3_d3.text('0');
        $s4_d5.text('0');
        $s4_d4.text(d4_prefix+'0'+d4_suffix);

        const $steps=$wrap.children('div');
        $steps.addClass('step-hidden').removeClass('step-visible step-hide-up');
        $step01.removeClass('step-hidden').addClass('step-visible');

        const DURATION_S1_NUM=2000;
        const DURATION_S3_NUM=2000;
        const DURATION_S4_D5=2000;
        const DURATION_S4_D4=2000;
        const DELAY_BETWEEN=500;
        const DELAY_AFTER_S3=500;
        const DELAY_AFTER_S1=1000;

        setTimeout(startStep1,500);

        function startStep1(){
            let doneCount=0;
            function done(){
                doneCount++;
                if(doneCount===2){
                    setTimeout(nextFromStep1,DELAY_AFTER_S1);
                }
            }
            countUp($s1_d1,0,s1_d1_target,DURATION_S1_NUM,formatNumber,done);
            countUp($s1_d2,0,s1_d2_target,DURATION_S1_NUM,formatNumber,done);
        }

        function nextFromStep1(){
            $step01.removeClass('step-visible step-hidden').addClass('step-hide-up');
            $step02.removeClass('step-hidden step-hide-up').addClass('step-visible');
            setTimeout(startStep3,DELAY_BETWEEN);
        }

        function startStep3(){
            $step03.removeClass('step-hidden step-hide-up').addClass('step-visible');
            countUp($s3_d3,0,s3_d3_target,DURATION_S3_NUM,formatNumber,function(){
                setTimeout(startStep4,DELAY_AFTER_S3);
            });
        }

        function startStep4(){
            $step04.removeClass('step-hidden step-hide-up').addClass('step-visible');
            $step05.removeClass('step-hidden step-hide-up').addClass('step-visible');

            setTimeout(function(){
                countUp($s4_d5,0,s4_d5_target,DURATION_S4_D5,formatNumber,function(){
                    setTimeout(function(){
                        countUp($s4_d4,0,d4_num,DURATION_S4_D4,function(val){
                            return d4_prefix+val+d4_suffix;
                        },function(){
                            setTimeout(showStep6,DELAY_BETWEEN);
                        });
                    },DELAY_BETWEEN);
                });
            },DELAY_BETWEEN);
        }

        function showStep6(){
            $step06.removeClass('step-hidden step-hide-up').addClass('step-visible');
        }
    }

    // --------------------------------------------------------------------
    // 커서 이동 헬퍼 (confirm / examine / adj)
    // --------------------------------------------------------------------
    function clampPercent(p){
        return Math.max(0, Math.min(100, p));
    }

    function moveConfirmCursor(percent){
        if (!confirmCursor) return;
        confirmCursor.style.left = clampPercent(percent) + '%';
    }

    function moveExamineCursor(percent){
        if (!examineCursor) return;
        examineCursor.style.left = clampPercent(percent) + '%';
    }

    function moveAdjCursor(percent){
        if (!adjCursor) return;
        adjCursor.style.left = clampPercent(percent) + '%';
    }

    // 외부에서 같이 움직일 수 있게
    window.moveFinalCursor = function(percent){
        moveConfirmCursor(percent);
        moveExamineCursor(percent);
        moveAdjCursor(percent);
    };

    // 초기 상태
    if (examineBoxWrap) { examineBoxWrap.style.display = 'none'; }
    if (adjBoxWrap)     { adjBoxWrap.style.display     = 'none'; }
    if (confirmCursor)  { confirmCursor.style.left = '0.4vw'; }
    if (examineCursor)  { examineCursor.style.left = '0.4vw'; }
    if (adjCursor)      { adjCursor.style.left     = '0.4vw'; }

    // --------------------------------------------------------------------
    // Chart.js 레이더 차트: 그리드만 먼저, 마지막 단계에서 폴리곤
    // --------------------------------------------------------------------
    var movieRadar = null;

    function initMovieRadarBase(){
        if (movieRadar) return;

        var canvas = document.getElementById('movieRadar');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');

        movieRadar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['시나리오', '감독', '배우', '제작사 역량', '배급', '투자'],
                datasets: [{
                    label: '평가',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: 'rgba(0,0,0,0)',
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderWidth: 0,
                    pointBackgroundColor: 'rgba(0,0,0,0)',
                    pointBorderColor: 'rgba(0,0,0,0)',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                layout: { padding: 10 },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: {
                            display: false,
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(241, 241, 241, 1)'
                        },
                        angleLines: {
                            color: 'rgba(241, 241, 241, 1)'
                        },
                        pointLabels: {
                            color: '#ffffff',
                            font: {
                                size: 25,
                                family: 'Pretendard, Noto Sans KR, sans-serif'
                            }
                        }
                    }
                }
            }
        });
    }

    function animateMovieRadar(){
        if (!movieRadar) return;

        var ds = movieRadar.data.datasets[0];

        ds.data = [81, 50, 60, 60, 55, 60];

        ds.borderColor = '#1d7bff';
        ds.backgroundColor = 'rgba(29, 123, 255, 0.35)';
        ds.borderWidth = 4;
        ds.pointBackgroundColor = '#1d7bff';
        ds.pointBorderColor = '#1d7bff';
        ds.pointRadius = 8;
        ds.pointHoverRadius = 8;

        movieRadar.options.animation = {
            duration: 800,
            easing: 'easeOutQuad'
        };

        movieRadar.update();
    }

    // DOM 로드 시점에 그리드만 보이는 차트 준비
    initMovieRadarBase();

    // --------------------------------------------------------------------
    // adj_box 끝난 후 confirm_wrap → movie_closed → inve_result
    // --------------------------------------------------------------------
    function runConfirmWrapSequence() {
        if (!confirmWrap) {
            if (inveResult) {
                inveResult.classList.add('fade-in-up');
                var resultHandler2 = function (rv2) {
                    if (rv2.propertyName !== 'opacity') return;
                    inveResult.removeEventListener('transitionend', resultHandler2);
                    startInveInfoAnimation();
                };
                inveResult.addEventListener('transitionend', resultHandler2);
            } else {
                startInveInfoAnimation();
            }
            return;
        }

        // adj 애니 끝난 시점에서 2초 유지
        setTimeout(function () {
            confirmWrap.classList.add('fade-out-up');

            var handler = function (e) {
                if (e.propertyName !== 'opacity') return;
                confirmWrap.removeEventListener('transitionend', handler);

                setTimeout(function () {
                    confirmWrap.style.display = 'none';

                    // movie_closed → inve_result
                    if (movieClosed) {
                        movieClosed.style.display = 'flex';
                        movieClosed.classList.remove('fade-out-up');
                        movieClosed.classList.add('fade-in-up');

                        setTimeout(function () {
                            movieClosed.classList.remove('fade-in-up');
                            movieClosed.classList.add('fade-out-up');

                            var closedHandler = function (ev) {
                                if (ev.propertyName !== 'opacity') return;
                                movieClosed.removeEventListener('transitionend', closedHandler);

                                movieClosed.style.display = 'none';

                                if (inveResult) {
                                    inveResult.classList.add('fade-in-up');

                                    var resultHandler = function (rv) {
                                        if (rv.propertyName !== 'opacity') return;
                                        inveResult.removeEventListener('transitionend', resultHandler);
                                        startInveInfoAnimation();
                                    };
                                    inveResult.addEventListener('transitionend', resultHandler);
                                } else {
                                    startInveInfoAnimation();
                                }
                            };

                            movieClosed.addEventListener('transitionend', closedHandler);
                        }, 2100);
                    } else {
                        if (inveResult) {
                            inveResult.classList.add('fade-in-up');
                            var resultHandler2 = function (rv2) {
                                if (rv2.propertyName !== 'opacity') return;
                                inveResult.removeEventListener('transitionend', resultHandler2);
                                startInveInfoAnimation();
                            };
                            inveResult.addEventListener('transitionend', resultHandler2);
                        } else {
                            startInveInfoAnimation();
                        }
                    }
                }, 500);
            };

            confirmWrap.addEventListener('transitionend', handler);

        }, 500);
    }

    // --------------------------------------------------------------------
    // examine_box → fade-out-up 넣으면서 동시에 adj_box fade-in-up
    //  + adj_box display:block 은 fade-in-up 넣고 0.3초 뒤에 적용
    // --------------------------------------------------------------------
    function endExamineAndStartAdj(){
        if (!examineBoxWrap) {
            // examine 박스가 없으면 바로 adj 시퀀스
            runAdjBoxSequence();
            return;
        }

        // 1) examine_box 위로 사라지는 애니
        examineBoxWrap.classList.remove('fade-in-up');
        examineBoxWrap.classList.add('fade-out-up');

        // 2) adj_box에 fade-in-up을 동시에 넣고
        if (adjBoxWrap) {
            adjBoxWrap.classList.remove('fade-out-up');
            adjBoxWrap.classList.add('fade-in-up');
        }

        // 3) adj_box 내부 시퀀스 시작
        runAdjBoxSequence();

        // 4) examine_box는 애니 조금 여유 두고 display:none
        setTimeout(function(){
            examineBoxWrap.style.display = 'none';
        }, 700); // 전환 여유
    }

    // --------------------------------------------------------------------
    // inve_adj_box 시퀀스
    //  - fade-in-up 먼저 넣고 0.3초 뒤 display:block
    //  - 버튼 span.on 진행 + 자동 스크롤
    //  - final_cursor 7초 타임라인 + p01~p04 전환
    // --------------------------------------------------------------------
    function runAdjBoxSequence(){
        if (!adjBoxWrap) {
            // adj_box 없으면 바로 confirm_wrap 시퀀스
            runConfirmWrapSequence();
            return;
        }

        var ADJ_DISPLAY_DELAY = 500; // fade-in-up 넣은 뒤 0.3초 후 display:block

        // fade-in-up 클래스 세팅
        adjBoxWrap.classList.remove('fade-out-up');
        adjBoxWrap.classList.add('fade-in-up');

        setTimeout(function () {
            adjBoxWrap.style.display = 'block';

            // 내부 애니는 살짝 뒤에 시작
            setTimeout(function(){
                var btnSets = adjBoxWrap.querySelectorAll('.inve_adj_list .btn_set');
                var maxIdx  = btnSets.length;

                if (!maxIdx) {
                    runConfirmWrapSequence();
                    return;
                }

                // 스크롤 컨테이너
                var adjList = document.querySelector('.gate_02.sub [class*="gate_02"] .inve_adj_list');

                // adj_box 안 p01~p04 수집
                var adjTexts = [];
                for (var i = 1; i <= 4; i++) {
                    var t = adjBoxWrap.querySelector('.p0' + i);
                    if (t) adjTexts.push(t);
                }

                // p01~p04 초기 세팅 (p01만 보이게)
                if (adjTexts.length) {
                    adjTexts.forEach(function(el, idx){
                        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        if (idx === 0) {
                            el.style.display   = 'block';
                            el.style.opacity   = 1;
                            el.style.transform = 'translateY(0)';
                        } else {
                            el.style.display   = 'none';
                            el.style.opacity   = 0;
                            el.style.transform = 'translateY(10px)';
                        }
                    });
                }

                // p01~p04 전환 함수
                function showAdjText(targetIdx) {
                    if (!adjTexts.length || !adjTexts[targetIdx]) return;

                    adjTexts.forEach(function(el, idx){
                        if (idx === targetIdx) return;
                        if (el.style.display !== 'none') {
                            el.style.opacity   = 0;
                            el.style.transform = 'translateY(-10px)';
                            (function(node){
                                setTimeout(function(){
                                    node.style.display = 'none';
                                }, 400); // 트랜지션 0.4s 끝난 뒤 display:none
                            })(el);
                        }
                    });

                    var showTarget = adjTexts[targetIdx];

                    // ★ 여기 딜레이를 1000 → 420 정도로 변경
                    setTimeout(function(){
                        showTarget.style.display   = 'block';
                        showTarget.getBoundingClientRect();
                        showTarget.style.opacity   = 1;
                        showTarget.style.transform = 'translateY(0)';
                    }, 420); // 0.4s 트랜지션랑 거의 맞춰줌
                }

                var targetMap = [1, 1, 1, 0, 1, 1, 1];

                // 버튼 span.on 애니 (1초 간격) + 자동 스크롤
                for (let i = 0; i < maxIdx && i < targetMap.length; i++) {
                    (function(index){
                        setTimeout(function(){
                            var btn   = btnSets[index];
                            var spans = btn.querySelectorAll('span');
                            if (!spans.length) return;

                            spans.forEach(function(s){ s.classList.remove('on'); });

                            var tIdx = targetMap[index];
                            if (spans[tIdx]) {
                                spans[tIdx].classList.add('on');

                                // 자동 스크롤
                                if (adjList) {
                                    var li = btn.closest('li');
                                    if (li) {
                                        var listRect = adjList.getBoundingClientRect();
                                        var liRect   = li.getBoundingClientRect();

                                        if (liRect.bottom > listRect.bottom) {
                                            var delta = liRect.bottom - listRect.bottom;
                                            var newScrollTop = adjList.scrollTop + delta + 25;

                                            adjList.scrollTo({
                                                top: newScrollTop,
                                                behavior: 'smooth'
                                            });
                                        }
                                    }
                                }
                            }
                        }, index * 1000);
                    })(i);
                }

                // 커서 + 텍스트 + p01~p04 전환 (총 7초 시나리오)
                var labels          = ['비적합','기준충족','적합','매우적합'];
                var cursorPositions = [0, 30, 60, 85]; // moveAdjCursor는 % 기준

                var CURSOR_TOTAL = 7000; // 7초

                // 0~4초: left 0.4vw, 비적합 + p01
                if (adjCursor)    adjCursor.style.left = '0.4vw';
                if (cursorText)   cursorText.textContent = labels[0];
                if (adjTexts.length) showAdjText(0);

                // 5초: 기준충족 + p02, 첫 번째 이동
                setTimeout(function(){
                    moveAdjCursor(cursorPositions[1]);   // 30% 쪽으로 이동
                    if (cursorText) cursorText.textContent = labels[1];
                    if (adjTexts.length) showAdjText(1);
                }, 4000);

                // 6초: 적합 + p03, 두 번째 이동
                setTimeout(function(){
                    moveAdjCursor(cursorPositions[2]);   // 60%
                    if (cursorText) cursorText.textContent = labels[2];
                    if (adjTexts.length) showAdjText(2);
                }, 5000);

                // 7초: 매우적합 + p04, 세 번째 이동
                setTimeout(function(){
                    moveAdjCursor(cursorPositions[3]);   // 85%
                    if (cursorText) cursorText.textContent = labels[3];
                    if (adjTexts.length) showAdjText(3);
                }, 6000);

                // 버튼 애니 전체 시간
                var totalBtnDuration = (Math.min(maxIdx, targetMap.length) - 1) * 1000;
                if (totalBtnDuration < 0) totalBtnDuration = 0;

                // 커서/텍스트 7초 연출이 끝난 뒤 + 버튼 애니 둘 다 끝난 다음 → pop_02
                var endDelay = Math.max(totalBtnDuration, CURSOR_TOTAL) + 500;
                setTimeout(function(){
                    showPop02();
                }, endDelay);

            }, 400); // fade-in-up 끝난 느낌으로 내부 애니 시작

        }, ADJ_DISPLAY_DELAY);
    }

    // --------------------------------------------------------------------
    // inve_examine_box 시퀀스 (팝업 01에서 시작)
    // --------------------------------------------------------------------
    function startExamineSequence() {
        // confirmBoxWrap 사라지기
        if (confirmBoxWrap) {
            confirmBoxWrap.classList.add('fade-out-up');
            setTimeout(function () {
                confirmBoxWrap.style.display = 'none';
            }, 600);
        }

        // examine 박스가 없으면 바로 adj로
        if (!examineBoxWrap) {
            endExamineAndStartAdj();
            return;
        }

        // 2) inve_examine_box 등장
        examineBoxWrap.style.display = 'block';
        examineBoxWrap.getBoundingClientRect();
        examineBoxWrap.classList.add('fade-in-up');

        // p01~p04 텍스트 초기 세팅 (p01만 노출)
        var examineTexts = [];
        for (var i = 1; i <= 4; i++) {
            var t = examineBoxWrap.querySelector('.p0' + i);
            if (t) examineTexts.push(t);
        }

        examineTexts.forEach(function (el, idx) {
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            if (idx === 0) {
                el.style.display = 'block';
                el.style.opacity = 1;
                el.style.transform = 'translateY(0)';
            } else {
                el.style.display = 'none';
                el.style.opacity = 0;
                el.style.transform = 'translateY(10px)';
            }
        });

        // p01~p04 전환 (총 6단계)
        function showProgressText(stepIndex) {
            if (!examineTexts.length) return;

            var targetIdx;
            if (stepIndex <= 2)          targetIdx = 0;
            else if (stepIndex === 3)    targetIdx = 1;
            else if (stepIndex === 4)    targetIdx = 2;
            else                         targetIdx = 3;

            examineTexts.forEach(function (el, idx) {
                if (idx === targetIdx) return;
                if (el.style.display !== 'none') {
                    el.style.opacity = 0;
                    el.style.transform = 'translateY(-10px)';
                    (function (node) {
                        setTimeout(function () {
                            node.style.display = 'none';
                        }, 400);
                    })(el);
                }
            });

            var showTarget = examineTexts[targetIdx];
            if (!showTarget) return;

            setTimeout(function () {
                showTarget.style.display = 'block';
                showTarget.getBoundingClientRect();
                showTarget.style.opacity = 1;
                showTarget.style.transform = 'translateY(0)';
            }, 420);
        }

        // examineBox 올라온 뒤 1초 후 단계 시퀀스 시작
        setTimeout(function () {

            var STEP_DURATION = 1500;

            var steps = document.querySelectorAll('.step_examine_list [class^="step_examine_"]');
            var examineGroups = document.querySelectorAll('[class^="inve_examine_step_"]');

            if (!steps.length || !examineGroups.length) {
                // 예외: 단계 구조가 없으면 바로 examine 닫고 adj로
                endExamineAndStartAdj();
                return;
            }

            var totalSteps  = steps.length; // 기대: 6
            var examineMax  = 85;          // 0 → 85%

            // 모든 단계 컨텐츠 초기화
            examineGroups.forEach(function (grp) {
                grp.style.display = 'none';
                grp.classList.remove('fade-in-up', 'fade-out-up');

                var gauges = grp.querySelectorAll('.inve_examine_gp_item .bar .gauge');
                gauges.forEach(function (g) {
                    g.style.transition = 'none';
                    g.style.width = '0%';
                });
            });

            // 게이지 애니
            function animateGauges(group) {
                var bars = group.querySelectorAll('.inve_examine_gp_item .bar');
                var barCount = bars.length;
                if (!barCount) return;

                var perTime = STEP_DURATION / barCount;

                bars.forEach(function (bar, idx) {
                    var gauge = bar.querySelector('.gauge');
                    if (!gauge) return;

                    var target = parseFloat(gauge.getAttribute('data-percent')) || 100;

                    gauge.style.transition = 'none';
                    gauge.style.width = '0%';
                    gauge.getBoundingClientRect();

                    setTimeout(function () {
                        gauge.style.transition = 'width ' + (perTime / 1000) + 's ease';
                        gauge.style.width = target + '%';
                    }, idx * perTime);
                });
            }

            // 단계별 실행 (총 6단계, 0~5 index)
            function showStep(stepIndex) {
                var lastIndex = totalSteps - 1;

                if (stepIndex > lastIndex || stepIndex >= examineGroups.length) {
                    // 모든 단계 끝 → examine 박스 닫고 adj 시작
                    endExamineAndStartAdj();
                    return;
                }

                // 동그라미 상태 처리
                steps.forEach(function (el, i) {
                    el.classList.remove('done');

                    if (stepIndex === lastIndex) {
                        if (i < lastIndex) {
                            el.classList.remove('on');
                            el.classList.add('done');
                        } else if (i === lastIndex) {
                            el.classList.add('on');
                        }
                    } else {
                        if (i <= stepIndex) {
                            el.classList.add('on');
                        } else {
                            el.classList.remove('on');
                        }
                    }
                });

                // examine 커서: 0 → 85% (0~5)
                var cursorTarget = (stepIndex / lastIndex) * examineMax;
                moveExamineCursor(cursorTarget);

                // p01~p04 텍스트 전환
                showProgressText(stepIndex);

                var currentGroup = examineGroups[stepIndex];

                currentGroup.style.display = 'flex';
                currentGroup.classList.remove('fade-out-up');
                currentGroup.classList.add('fade-in-up');

                // 게이지 애니
                animateGauges(currentGroup);

                if (stepIndex === lastIndex) {
                    // 마지막 단계: 레이더 차트 그리고
                    animateMovieRadar();

                    // 마지막 그룹 애니 끝난 뒤 examine_box 자체 fade-out-up → adj
                    setTimeout(function () {
                        endExamineAndStartAdj();
                    }, STEP_DURATION);
                } else {
                    setTimeout(function () {
                        currentGroup.classList.remove('fade-in-up');
                        currentGroup.classList.add('fade-out-up');

                        var hideHandler = function (ev) {
                            if (ev.propertyName !== 'opacity') return;
                            currentGroup.removeEventListener('transitionend', hideHandler);

                            currentGroup.style.display = 'none';
                            showStep(stepIndex + 1);
                        };

                        currentGroup.addEventListener('transitionend', hideHandler);
                    }, STEP_DURATION);
                }
            }

            // 첫 단계 시작
            showStep(0);

        }, 1000); // examineBoxWrap 올라온 후 대기
    }

    // --------------------------------------------------------------------
    // pop_01 / pop_02 제어
    // --------------------------------------------------------------------
    function showPop01() {
        if (!pop01) {
            // 팝업이 없으면 기존처럼 바로 진행
            startExamineSequence();
            return;
        }
        pop01.classList.add('is-active');
    }

    function showPop02() {
        if (!pop02) {
            // 팝업이 없으면 바로 기존 시퀀스
            runConfirmWrapSequence();
            return;
        }
        pop02.classList.add('is-active');
    }

    // 팝업 버튼 이벤트: pop_01 → examine, pop_02 → movie_closed + inve_result
    if (pop01) {
        var pop01Btn = pop01.querySelector('.btn_next');
        if (pop01Btn) {
            pop01Btn.addEventListener('click', function () {
                pop01.classList.remove('is-active');
                startExamineSequence();
            });
        }
    }

    if (pop02) {
        var pop02Btn = pop02.querySelector('.btn_next');
        if (pop02Btn) {
            pop02Btn.addEventListener('click', function () {
                pop02.classList.remove('is-active');
                runConfirmWrapSequence();
            });
        }
    }

    // --------------------------------------------------------------------
    // 커서 & confirm/examine 시퀀스 시작
    //   - inve_confirm_box 커서 애니 끝 → pop_01 노출
    // --------------------------------------------------------------------
    setTimeout(function () {
        if (cursorText) {
            setTimeout(function () { cursorText.style.opacity = 1; }, 1300);
        }

        // 1) inve_confirm_box 구간 커서 (0 → 85%)
        var step        = 0;
        var maxStep     = 4;
        var maxPercent  = 85;

        var intervalId = setInterval(function () {
            step++;

            if (step <= maxStep) {
                var percent = (step / maxStep) * maxPercent;
                moveConfirmCursor(percent);
            }

            if (step === maxStep) {
                clearInterval(intervalId);

                // 커서 애니 끝난 후 1초 뒤 → pop_01 띄우기
                setTimeout(function () {
                    showPop01();
                }, 1000);
            }
        }, 1100);

    }, 2000); // 최초 지연
});












document.addEventListener('DOMContentLoaded', function () {
    // .inve_btn_main 클릭 → 대응하는 .kcon_pop 열기
    var btns = document.querySelectorAll('.inve_btn_main');

    btns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            // 1) 부모 .kcon_bg_wrap 찾기
            var wrap = btn.closest('.kcon_bg_wrap');
            if (!wrap || !wrap.id) return;

            // 2) bg01 → 01 이런 식으로 번호만 추출
            var bgId = wrap.id;              // 예: 'bg01'
            var num  = bgId.replace('bg', ''); // '01'

            // 3) 같은 번호의 popxx 찾기
            var targetPopId = 'pop' + num;   // 'pop01'
            var targetPop   = document.getElementById(targetPopId);
            if (!targetPop) return;

            // 4) 모든 팝업에서 is-show 제거
            var allPop = document.querySelectorAll('.kcon_pop');
            allPop.forEach(function (pop) {
                pop.classList.remove('is-show');
            });

            // 5) 해당 팝업에 is-show 추가
            targetPop.classList.add('is-show');
        });
    });

    // 선택: 팝업 닫기 버튼(.close_pop) 처리
    var closeBtns = document.querySelectorAll('.kcon_pop .close_pop');
    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var pop = btn.closest('.kcon_pop');
            if (pop) {
                pop.classList.remove('is-show');
            }
        });
    });
});









document.addEventListener('DOMContentLoaded', function () {
    // ----------------------------------------------------
    // 1) 슬라이더 실제 값 매핑 (KR 전용)
    //    - 첫 번째: 예상 관람객 (명 단위)
    //    - 두 번째: 투자금액 (억 단위 숫자 그대로)
    // ----------------------------------------------------
    var VISITOR_VALUES = [1000000, 5000000, 10000000]; // 100만, 500만, 1000만
    var VISITOR_DISPLAY = [100, 500, 1000];            // 화면에 "100 / 500 / 1000" 노출
    var AMOUNT_VALUES  = [1, 5, 10];                   // 1, 5, 10억

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // 라벨 텍스트에서 숫자만 뽑기 (EN용: "100M" → 100, "68K" → 68)
    function extractNumberFromLabel(text) {
        var num = parseFloat(String(text).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
    }

    // ----------------------------------------------------
    // 2) 각 팝업(kcon_pop) 기준으로 처리
    // ----------------------------------------------------
    document.querySelectorAll('.kcon_pop').forEach(function (pop) {
        /* =========================
         * KR 영역(.scroll_wrap.kr_t)
         * ========================= */
        (function setupKR(pop) {
            var scrollWraps = pop.querySelectorAll('.con_r .scroll_wrap.kr_t');
            if (scrollWraps.length < 2) return; // 예상 2개 없으면 스킵

            // 첫 번째 스크롤 박스 (예상 관람객 수)
            var visitorWrap   = scrollWraps[0];
            var visitorRange  = visitorWrap.querySelector('.k-range');
            var visitorNumEl  = visitorWrap.querySelector('.tit .in_num span:first-child'); // "100" 부분
            var visitorLabels = visitorWrap.querySelectorAll('.k-slider-labels span');

            // 두 번째 스크롤 박스 (투자금액)
            var amountWrap   = scrollWraps[1];
            var amountRange  = amountWrap.querySelector('.k-range');
            var amountNumEl  = amountWrap.querySelector('.tit .in_num span:first-child'); // "5" 부분
            var amountLabels = amountWrap.querySelectorAll('.k-slider-labels span');

            // "투자하기" 버튼
            var popBtn = pop.querySelector('.btn .pop_btn');

            if (!visitorRange || !amountRange || !visitorNumEl || !amountNumEl || !popBtn) {
                return;
            }

            // range 기본 옵션 세팅 (0,1,2)
            visitorRange.min = 0;
            visitorRange.max = VISITOR_VALUES.length - 1;
            visitorRange.step = 1;
            if (visitorRange.value === "" || visitorRange.value == null) {
                visitorRange.value = 0;
            }

            amountRange.min = 0;
            amountRange.max = AMOUNT_VALUES.length - 1;
            amountRange.step = 1;
            if (amountRange.value === "" || amountRange.value == null) {
                amountRange.value = 0;
            }

            // 표시 값 / 라벨 상태 업데이트 함수 + 콘솔 로그
            function updateVisitorDisplay(isInit) {
                var idx = parseInt(visitorRange.value, 10) || 0;
                if (idx < 0) idx = 0;
                if (idx >= VISITOR_VALUES.length) idx = VISITOR_VALUES.length - 1;

                visitorNumEl.textContent = VISITOR_DISPLAY[idx];

                var realVal = VISITOR_VALUES[idx];
                visitorRange.dataset.realValue = realVal;

                visitorLabels.forEach(function (lbl) {
                    var liIdx = parseInt(lbl.getAttribute('data-index'), 10);
                    if (liIdx === idx) {
                        lbl.classList.add('is-active');
                    } else {
                        lbl.classList.remove('is-active');
                    }
                });

                if (isInit) {
                    console.log('[초기][KR] 예상 관람객 선택 값:', realVal, '(index:', idx + ')');
                } else {
                    console.log('[변경][KR] 예상 관람객 선택 값:', realVal, '(index:', idx + ')');
                }
            }

            function updateAmountDisplay(isInit) {
                var idx = parseInt(amountRange.value, 10) || 0;
                if (idx < 0) idx = 0;
                if (idx >= AMOUNT_VALUES.length) idx = AMOUNT_VALUES.length - 1;

                var realVal = AMOUNT_VALUES[idx];
                amountNumEl.textContent = realVal;

                amountRange.dataset.realValue = realVal;

                amountLabels.forEach(function (lbl) {
                    var liIdx = parseInt(lbl.getAttribute('data-index'), 10);
                    if (liIdx === idx) {
                        lbl.classList.add('is-active');
                    } else {
                        lbl.classList.remove('is-active');
                    }
                });

                if (isInit) {
                    console.log('[초기][KR] 투자금액 선택 값:', realVal, '억 (index:', idx + ')');
                } else {
                    console.log('[변경][KR] 투자금액 선택 값:', realVal, '억 (index:', idx + ')');
                }
            }

            // 최초 1회 초기 디스플레이
            updateVisitorDisplay(true);
            updateAmountDisplay(true);

            // 슬라이더 움직일 때마다 표시/로그 업데이트
            visitorRange.addEventListener('input', function () {
                updateVisitorDisplay(false);
            });
            amountRange.addEventListener('input', function () {
                updateAmountDisplay(false);
            });

            // "투자하기" 클릭 시 선택 값만 넘기기 (URL은 그대로)
            popBtn.addEventListener('click', function () {
                var vIdx = parseInt(visitorRange.value, 10) || 0;
                var aIdx = parseInt(amountRange.value, 10) || 0;

                if (vIdx < 0) vIdx = 0;
                if (vIdx >= VISITOR_VALUES.length) vIdx = VISITOR_VALUES.length - 1;
                if (aIdx < 0) aIdx = 0;
                if (aIdx >= AMOUNT_VALUES.length) aIdx = AMOUNT_VALUES.length - 1;

                var visitorVal = VISITOR_VALUES[vIdx];
                var amountVal  = AMOUNT_VALUES[aIdx];

                console.log('▶ [KR] 투자하기 클릭 - 최종 선택 값');
                console.log('   예상 관람객:', visitorVal);
                console.log('   투자금액:', amountVal, '억');

                try {
                    // KR 기본값
                    sessionStorage.setItem('kcon_visitor', String(visitorVal));
                    sessionStorage.setItem('kcon_amount', String(amountVal));
                    // KR 전용 키
                    sessionStorage.setItem('kcon_visitor_kr', String(visitorVal));
                    sessionStorage.setItem('kcon_amount_kr', String(amountVal));
                } catch (err) {
                    console.warn('sessionStorage 저장 실패(KR):', err);
                }
            });
        })(pop);

        /* =========================
         * EN 영역(.scroll_wrap.en_t)
         * ========================= */
        (function setupEN(pop) {
            var scrollWrapsEn = pop.querySelectorAll('.con_r .scroll_wrap.en_t');
            if (scrollWrapsEn.length < 2) return;

            // 첫 번째 (예상 관람객 EN)
            var visitorWrapEn   = scrollWrapsEn[0];
            var visitorRangeEn  = visitorWrapEn.querySelector('.k-range');
            var visitorNumElEn  = visitorWrapEn.querySelector('.tit .in_num span:first-child');
            var visitorLabelsEn = visitorWrapEn.querySelectorAll('.k-slider-labels span');

            // 두 번째 (투자금액 EN, 달러)
            var amountWrapEn   = scrollWrapsEn[1];
            var amountRangeEn  = amountWrapEn.querySelector('.k-range');
            var amountNumElEn  = amountWrapEn.querySelector('.tit .in_num span:first-child');
            var amountLabelsEn = amountWrapEn.querySelectorAll('.k-slider-labels span');

            // KR과 동일 버튼 사용
            var popBtn = pop.querySelector('.btn .pop_btn');

            if (!visitorRangeEn || !amountRangeEn || !visitorNumElEn || !amountNumElEn || !popBtn) {
                return;
            }

            // range 기본 세팅
            visitorRangeEn.min  = 0;
            visitorRangeEn.max  = visitorLabelsEn.length - 1;
            visitorRangeEn.step = 1;
            if (visitorRangeEn.value === "" || visitorRangeEn.value == null) {
                visitorRangeEn.value = 0;
            }

            amountRangeEn.min  = 0;
            amountRangeEn.max  = amountLabelsEn.length - 1;
            amountRangeEn.step = 1;
            if (amountRangeEn.value === "" || amountRangeEn.value == null) {
                amountRangeEn.value = 0;
            }

            // 라벨 텍스트 기반 숫자 배열 생성
            //   예: "1M"  → 1
            //       "68K" → 68
            var VISITOR_VALUES_EN = [];
            visitorLabelsEn.forEach(function (lbl) {
                VISITOR_VALUES_EN.push(extractNumberFromLabel(lbl.textContent || ''));
            });

            var AMOUNT_VALUES_EN = [];
            amountLabelsEn.forEach(function (lbl) {
                AMOUNT_VALUES_EN.push(extractNumberFromLabel(lbl.textContent || ''));
            });

            function updateVisitorDisplayEn(isInit) {
                var idx = parseInt(visitorRangeEn.value, 10) || 0;
                if (idx < 0) idx = 0;
                if (idx >= VISITOR_VALUES_EN.length) idx = VISITOR_VALUES_EN.length - 1;

                var realVal = VISITOR_VALUES_EN[idx];
                visitorNumElEn.textContent = realVal;

                visitorRangeEn.dataset.realValue = realVal;

                visitorLabelsEn.forEach(function (lbl) {
                    var liIdx = parseInt(lbl.getAttribute('data-index'), 10);
                    if (liIdx === idx) {
                        lbl.classList.add('is-active');
                    } else {
                        lbl.classList.remove('is-active');
                    }
                });

                if (isInit) {
                    console.log('[초기][EN] 예상 관람객:', realVal, '(index:', idx + ')');
                } else {
                    console.log('[변경][EN] 예상 관람객:', realVal, '(index:', idx + ')');
                }
            }

            function updateAmountDisplayEn(isInit) {
                var idx = parseInt(amountRangeEn.value, 10) || 0;
                if (idx < 0) idx = 0;
                if (idx >= AMOUNT_VALUES_EN.length) idx = AMOUNT_VALUES_EN.length - 1;

                var realVal = AMOUNT_VALUES_EN[idx];
                amountNumElEn.textContent = realVal;

                amountRangeEn.dataset.realValue = realVal;

                amountLabelsEn.forEach(function (lbl) {
                    var liIdx = parseInt(lbl.getAttribute('data-index'), 10);
                    if (liIdx === idx) {
                        lbl.classList.add('is-active');
                    } else {
                        lbl.classList.remove('is-active');
                    }
                });

                if (isInit) {
                    console.log('[초기][EN] 투자금액(표시값):', realVal, '(index:', idx + ')');
                } else {
                    console.log('[변경][EN] 투자금액(표시값):', realVal, '(index:', idx + ')');
                }
            }

            // 초기 표시
            updateVisitorDisplayEn(true);
            updateAmountDisplayEn(true);

            // 슬라이더 이벤트
            visitorRangeEn.addEventListener('input', function () {
                updateVisitorDisplayEn(false);
            });
            amountRangeEn.addEventListener('input', function () {
                updateAmountDisplayEn(false);
            });

            // "투자하기" 클릭 시 EN 값도 따로 sessionStorage에 저장
            popBtn.addEventListener('click', function () {
                var vIdx = parseInt(visitorRangeEn.value, 10) || 0;
                var aIdx = parseInt(amountRangeEn.value, 10) || 0;

                if (vIdx < 0) vIdx = 0;
                if (vIdx >= VISITOR_VALUES_EN.length) vIdx = VISITOR_VALUES_EN.length - 1;
                if (aIdx < 0) aIdx = 0;
                if (aIdx >= AMOUNT_VALUES_EN.length) aIdx = AMOUNT_VALUES_EN.length - 1;

                var visitorValEnBase = VISITOR_VALUES_EN[vIdx]; // 예: 1, 50, 100
                var amountValEnBase  = AMOUNT_VALUES_EN[aIdx];  // 예: 68, 340, 680

                // ★ 달러 실제 값: "340M" 같은 표기에서 340 → 340,000 달러로 넘기기
                //   → 베이스 값에 1000 곱해서 세션에 저장
                var amountValEnReal = amountValEnBase * 1000;

                console.log('▶ [EN] 투자하기 클릭 - 최종 선택 값(표시 기준)');
                console.log('   예상 관람객(EN base):', visitorValEnBase);
                console.log('   투자금액(EN base):', amountValEnBase);
                console.log('   투자금액(EN 실제 달러):', amountValEnReal);

                try {
                    // 필요하면 관람객도 그대로 저장
                    sessionStorage.setItem('kcon_visitor_en', String(visitorValEnBase));
                    // 달러는 1000배 한 실제값으로 저장
                    sessionStorage.setItem('kcon_amount_en', String(amountValEnReal));
                } catch (err) {
                    console.warn('sessionStorage 저장 실패(EN):', err);
                }
            });
        })(pop);
    });
});







document.addEventListener('DOMContentLoaded', function () {
  var videos = document.querySelectorAll('.new_gate_01.step_01 .main_video > video');
  if (!videos || !videos.length) return;

  function applyRate(v) {
    if (!v) return;

    // 재생 속도 1 -> 0.7
    v.playbackRate = 0.7;

    // (자동재생/재로드 등으로 초기화되는 경우 대비)
    v.addEventListener('loadedmetadata', function () {
      v.playbackRate = 0.7;
    });
  }

  videos.forEach(applyRate);
});





// gate_tab_box 탭 기능 (tab_item 클릭 → on 토글 + 컨텐츠 on 매칭)
document.addEventListener('DOMContentLoaded', function () {
  var tabBox = document.querySelector('.gate_tab_box');
  if (!tabBox) return;

  var tabs = Array.prototype.slice.call(tabBox.querySelectorAll('.tab_item'));
  var cons = Array.prototype.slice.call(document.querySelectorAll('.tab_con'));

  if (!tabs.length) return;

  // tab index → 활성화할 tab_con 클래스 매핑
  // 1번째 tab_item -> tab_con_01
  // 2번째 tab_item -> tab_con_03
  var conMap = {
    0: '.tab_con.tab_con_01',
    1: '.tab_con.tab_con_02',
    2: '.tab_con.tab_con_03'
  };

  function clearOn() {
    tabs.forEach(function (t) { t.classList.remove('on'); });
    cons.forEach(function (c) { c.classList.remove('on'); });
  }

  function activateByIndex(idx) {
    clearOn();

    if (tabs[idx]) tabs[idx].classList.add('on');

    var selector = conMap[idx];
    if (!selector) return;

    var targetCon = document.querySelector(selector);
    if (targetCon) targetCon.classList.add('on');
  }

  tabs.forEach(function (tab, idx) {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      activateByIndex(idx);
    });
  });

  // 초기 상태: 이미 on이 있으면 그 탭 기준으로, 없으면 1번째 탭
  var initIdx = tabs.findIndex ? tabs.findIndex(function(t){ return t.classList.contains('on'); }) : -1;
  if (initIdx < 0) initIdx = 0;
  activateByIndex(initIdx);
});





document.addEventListener('DOMContentLoaded', function () {
  // 팝업 컨테이너(오버레이)
  var gateTabCon = document.querySelector('.gate_tab_con');
  if (!gateTabCon) return;

  var inner    = gateTabCon.querySelector('.inner');
  var closeBtn = gateTabCon.querySelector('.pop_close');

  // 팝업 내부 탭/컨텐츠
  var tabBox   = gateTabCon.querySelector('.gate_tab_box');
  var tabItems = tabBox ? tabBox.querySelectorAll('.tab_item') : [];
  var tabCons  = gateTabCon.querySelectorAll('.content .tab_con');

  // gate_wrap 내 ul > li (아이콘이 들어있는 li 기준)
  var gateWrap = document.querySelector('.gate_wrap');
  var gateLis  = gateWrap ? gateWrap.querySelectorAll('ul > li') : [];

  function openPopup() {
    gateTabCon.style.display = 'flex';
    gateTabCon.style.opacity = '1';
    gateTabCon.style.visibility = 'visible';
    gateTabCon.classList.add('is-active');
    gateTabCon.classList.remove('is-close', 'hide');
  }

  function closePopup() {
    gateTabCon.style.opacity = '0';
    gateTabCon.style.visibility = 'hidden';
    gateTabCon.style.display = 'none';
    gateTabCon.classList.remove('is-active', 'on', 'open');
  }

  // index(0,1,2)에 맞춰 탭/컨텐츠 on 세팅
  function setPopupTabByIndex(idx) {
    // tab_item on 정리
    if (tabItems && tabItems.length) {
      tabItems.forEach(function (el) { el.classList.remove('on'); });
      if (tabItems[idx]) tabItems[idx].classList.add('on');
    }

    // tab_con on 정리
    if (tabCons && tabCons.length) {
      tabCons.forEach(function (el) { el.classList.remove('on'); });
      if (tabCons[idx]) tabCons[idx].classList.add('on');
    }
  }

  // 1) pop_close 클릭 시 닫기
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closePopup();
    });
  }

  // 2) gate_tab_con 영역 클릭 시, inner 바깥(오버레이) 클릭이면 닫기
  gateTabCon.addEventListener('click', function (e) {
    if (!inner) {
      closePopup();
      return;
    }
    if (inner.contains(e.target)) return;
    closePopup();
  });

  // 3) gate_wrap 내 gate_tab_ico가 3개 → 어떤 걸 클릭해도 팝업 오픈 + li 순서에 맞게 탭/컨텐츠 세팅
  //    (li 기준: 1번째 li -> 탭/컨텐츠 1번, 2번째 -> 2번, 3번째 -> 3번)
  if (gateWrap) {
    gateWrap.addEventListener('click', function (e) {
      var icoBtn = e.target.closest('.gate_tab_ico');
      if (!icoBtn) return;

      e.preventDefault();

      // 클릭된 icoBtn이 속한 li가 ul > li 중 몇 번째인지 계산
      var li = icoBtn.closest('li');
      var idx = 0; // 기본 1번째로
      if (li && gateLis && gateLis.length) {
        idx = Array.prototype.indexOf.call(gateLis, li);
        if (idx < 0) idx = 0;
      }

      // 0~2만 유효하게(3개 기준)
      if (idx > 2) idx = 2;

      // 팝업 열고 해당 탭/컨텐츠 활성화
      openPopup();
      setPopupTabByIndex(idx);
    });
  }

  // 4) 팝업 내부 tab_item 클릭 시에도 on 토글 + 해당 tab_con on
  if (tabBox && tabItems && tabItems.length) {
    tabItems.forEach(function (item, idx) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        setPopupTabByIndex(idx);
      });
    });
  }
});

