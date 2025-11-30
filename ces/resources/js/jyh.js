document.addEventListener('DOMContentLoaded', function () {
  var langBtn = document.querySelector('.btn_lang');
  if (!langBtn) return;

  var body = document.body;

  // 1) localStorage에 저장된 언어 상태 불러오기
  var savedLang = localStorage.getItem('siteLang'); // 'lang_kr' or 'lang_en'

  if (savedLang === 'lang_kr' || savedLang === 'lang_en') {
    // 저장된 언어가 있으면 그걸로 body id 세팅
    body.id = savedLang;
  } else {
    // 저장된 값이 없으면: 기존 id 유지, 없으면 기본 lang_kr
    if (!body.id) {
      body.id = 'lang_kr';
    }
  }

  // 2) 버튼 클릭 시 토글 + localStorage 저장
  langBtn.addEventListener('click', function () { 
    var currentId = body.id || 'lang_kr';
    var nextId    = currentId === 'lang_kr' ? 'lang_en' : 'lang_kr';

    body.id = nextId;                  // 실제 DOM 적용
    localStorage.setItem('siteLang', nextId); // 다음 페이지에서도 유지
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





$(window).on('load', function () {
  setTimeout(function () {
    $('.hero-text').addClass('is-show');
  }, 200);
});

/* floatin icon 생성 */
const floatArea = document.querySelector('.float-img-area');
const ICON_COUNT = 70; // 총 아이콘 개수
const maxVisible = 70;  // 한 번에 노출할 개수 (랜덤)
const requiredNums = [2, 4, 5, 7, 9, 10]; // 꼭 포함할 아이콘 번호

/* ===========================
 * 1. HTML 동적 생성
 * ===========================
 */
for (let i = 1; i <= ICON_COUNT; i++) {
  const wrap = document.createElement('div');
  wrap.classList.add('float-img-wrap');
  wrap.dataset.index = String(i);

  const img = document.createElement('img');

  // 파일명 규칙: 01~09, 10~99, 100~138
  const numStr = String(i).padStart(2, '0');
  const ext = requiredNums.includes(i) ? 'png' : 'jpg';
  img.src = `../../resources/images/floatin_img_${numStr}.${ext}`;
  img.alt = `floating icon ${i}`;

  const ico = document.createElement('span');
  ico.classList.add('ico_fillter');

  wrap.appendChild(img);
  wrap.appendChild(ico);
  floatArea.appendChild(wrap);
}

/* ===========================
 * 2. 랜덤 노출 + 플로팅 효과
 * ===========================
 */
const floatWraps = floatArea.querySelectorAll('.float-img-wrap');
const total = floatWraps.length;

if (total < 10) {
  console.warn(`⚠️ 이미지 개수가 ${total}개입니다. 최소 10개 이상 권장!`);
}

const allWraps = Array.from(floatWraps);
const requiredWraps = allWraps.filter(wrap => requiredNums.includes(parseInt(wrap.dataset.index, 10)));
const remainingWraps = allWraps.filter(wrap => !requiredWraps.includes(wrap));
const shuffled = remainingWraps.sort(() => Math.random() - 0.5);
const limit = Math.min(maxVisible, total);
let visibleWraps = requiredWraps.slice(0);
if (visibleWraps.length < limit) {
  visibleWraps = visibleWraps.concat(shuffled.slice(0, limit - visibleWraps.length));
}

// 전부 숨김
floatWraps.forEach(wrap => {
  wrap.style.display = 'none';
});

// 선택된 개수에만 랜덤 속성 부여 + 노출
visibleWraps.forEach(wrap => {
  let x, y;

  // 중앙 25~75% 영역 피해서 랜덤 배치
  do {
    x = Math.random() * 100;
    y = Math.random() * 100;
  } while (x > 25 && x < 75 && y > 25 && y < 75);

  const orbitSize = 5 + Math.random() * 10;   // 회전 궤도 (vmin)
  const duration  = 15 + Math.random() * 10;  // 회전 속도 (s)
  const delay     = Math.random() * 3;        // 딜레이 (s)

  const maxSize = 5.2865;
  const minSize = 2;
  const imgSize = minSize + Math.random() * (maxSize - minSize);

  wrap.style.display = 'block';
  wrap.style.left = `${x}%`;
  wrap.style.top  = `${y}%`;
  wrap.style.position = 'absolute';
  wrap.style.opacity = '0.6';                 // ★ float-img-wrap 전체 투명도
  wrap.style.setProperty('--orbit-size', `${orbitSize}vmin`);
  wrap.style.setProperty('--duration', `${duration}s`);
  wrap.style.setProperty('--delay', `${delay}s`);

  const img = wrap.querySelector('img');
  img.style.width  = `${imgSize}vw`;
  img.style.height = `${imgSize}vw`;

  if (imgSize <= 3.5) {
    img.style.filter = 'blur(0.2vmin) brightness(0.8)';
  } else {
    img.style.filter = 'none';
  }

  const ico = wrap.querySelector('.ico_fillter');
  if (ico) {
    // 이미지와 동시에 필터 아이콘 노출
    ico.classList.add('show');
  }


// ★ 아이콘 세팅이 끝난 뒤 1초 후 전체 영역을 보이게
setTimeout(() => {
  if (floatArea) {
    floatArea.style.opacity = '1';
  }
}, 300); // 1초 뒤에 등장







    var $range  = $('#visitorRange');
  var $labels = $('.k-slider-labels span');

  function updateLabels() {
    var idx = parseInt($range.val(), 10);   // 0, 1, 2
    $labels.removeClass('active');
    $labels.eq(idx).addClass('active');
  }

  // 초기 상태 세팅
  updateLabels();

  // 슬라이드 할 때마다 업데이트
  $range.on('input change', updateLabels);
  });






// .btn_search 버튼 클릭 시 .contents_01에 processing 클래스 추가 
$('.hero-text .btn_search button').on('click', function () {

    // 이미 처리 중이면 중복 실행 방지
    if ($('.contents_01').hasClass('processing')) return;

    $('.contents_01').addClass('processing');

    /* ============================================
     *  공통 헬퍼들: 항상 "현재 DOM" 기준으로 찾기
     * ============================================ */

    // search_txt_step 전체 래퍼
    function getSearchStep() {
        return $('.search_txt_step');
    }

    // KR/EN 컨테이너 (ul.kr_t, ul.en_t / dl.kr_t, dl.en_t 등)
    function getLangContainers() {
        const $searchStep = getSearchStep();
        let $containers = $searchStep.find('.kr_t, .en_t');

        // kr_t/en_t 로 안 나뉜 경우 전체를 하나의 컨테이너로 취급 (하위 호환)
        if (!$containers.length) {
            return $searchStep;
        }
        return $containers;
    }

    // 각 언어 컨테이너 안의 li/dd 의 span (카운트 박스들)
    function getCountWraps() {
        return getLangContainers().find('> li > span, > dd > span, li > span, dd > span');
    }

    // 숫자 카운트 텍스트(.counting) (KR/EN 모두)
    function getCountingEls() {
        return getSearchStep().find('.counting');
    }

    // progress 영역
    function getProgressDots() {
        return $('.progress_dot .item_dot');
    }
    function getProgressNum() {
        return $('.progress_dot .progress_num_counting');
    }
    function getProgressNumBox() {
        return $('.progress_dot .progress_num');
    }

    /* ============================================
     *  blink (카운트/프로그레스 숫자 깜빡임)
     * ============================================ */
    const BLINK_PAUSE = 1500; // 단계 끝날 때 깜빡임 유지 시간(ms)
    const FADE_TIME   = 300;  // blink on/off 페이드 시간(ms)

    function setBlink(active) {
        const $countWraps     = getCountWraps();
        const $progressNumBox = getProgressNumBox();

        if (active) {
            // 1) opacity 1 → 0.3 으로 부드럽게 줄이고 blink 클래스 부여
            $countWraps.stop(true, true).animate({ opacity: 0.3 }, FADE_TIME, function () {
                $countWraps.addClass('blink');
            });

            if ($progressNumBox.length) {
                $progressNumBox.stop(true, true).animate({ opacity: 0.3 }, FADE_TIME, function () {
                    $progressNumBox.addClass('blink');
                });
            }
        } else {
            // 2) blink 클래스 제거 후 opacity 0.3 → 1 복귀
            $countWraps.removeClass('blink').stop(true, true).animate({ opacity: 1 }, FADE_TIME);

            if ($progressNumBox.length) {
                $progressNumBox.removeClass('blink').stop(true, true).animate({ opacity: 1 }, FADE_TIME);
            }
        }
    }

    /* ============================================
     *  progress 점/숫자 갱신
     * ============================================ */
    function updateProgressStep(step) {
        const $dots = getProgressDots();
        const $num  = getProgressNum();

        if (!$dots.length) return;

        // 1) 지금까지의 단계는 모두 on 추가 (누적)
        for (let i = 1; i <= step; i++) {
            $('.progress_dot_step_0' + i).addClass('on');
        }

        // 2) 모든 점의 "현재 단계" 깜빡임 클래스 제거
        $dots.removeClass('is-current');

        // 3) 이번 단계 점에만 깜빡임 클래스 추가
        $('.progress_dot_step_0' + step).addClass('is-current');

        // 4) 숫자 1~7 변경
        if ($num.length) {
            $num.text(step);
        }
    }

    /* ============================================
     *  step별 span 위치 조정 (KR/EN 모두)
     * ============================================ */

    // 해당 step 번호에 맞춰 각 언어 컨테이너의 span margin-top 맞추기
    function setSpanPositionByStepAll(stepNum) {
        const stepClass   = '.step' + ('0' + stepNum).slice(-2); // ".step01" ~ ".step07"
        const $containers = getLangContainers();

        $containers.each(function () {
            const $box = $(this);
            const $li  = $box.find('> li, > dd');
            const $step = $li.find(stepClass).first();
            if (!$step.length) return;

            const $parent    = $step.closest('li, dd');
            const $countWrap = $parent.children('span').first();
            if (!$countWrap.length) return;

            const wasHidden = $step.css('display') === 'none';
            let originalDisplay;

            // step 이 display:none 이면, 잠깐 보여서 높이 측정
            if (wasHidden) {
                originalDisplay = $step[0].style.display;
                $step.css({ display: 'block', visibility: 'hidden' });
            }

            const h = $step.outerHeight(true);

            if (wasHidden) {
                $step.css({ display: originalDisplay || '', visibility: '' });
            }

            $countWrap.css('margin-top', (h + 20) + 'px');
        });
    }

    // step01~step07 활성화 (KR/EN 둘 다에 적용)
    function showStep(num) {
        const stepClass   = '.step' + ('0' + num).slice(-2);
        const $containers = getLangContainers();

        $containers.each(function () {
            const $box = $(this);
            const $li  = $box.find('> li, > dd');

            // 이 컨테이너 안의 모든 step p 비활성화
            const $allSteps = $li.find('> p');
            $allSteps.removeClass('active');

            // 이번 step만 active
            const $step = $li.find(stepClass);
            if ($step.length) {
                $step.addClass('active');
            }
        });

        // 활성 step 기준으로 각 언어별 span 위치 조정
        setSpanPositionByStepAll(num);
    }

    /* ============================================
     *  숫자 카운트 (KR/EN 전체 .counting 동시 갱신)
     * ============================================ */
    function animateCount(from, to, duration, onComplete) {
        const startTime = Date.now();
        const diff      = to - from;

        function tick() {
            const now      = Date.now();
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value    = Math.round(from + diff * progress);
            const text     = value.toLocaleString ? value.toLocaleString() : value;

            getCountingEls().text(text); // KR/EN 모두 동일 숫자 노출

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else if (typeof onComplete === 'function') {
                onComplete();
            }
        }
        requestAnimationFrame(tick);
    }

    /* ============================================
     *  결과 팝업
     * ============================================ */
    function showResultPopup() {
        $('.search_process_pop').addClass('is-active');
        $('.contents_01.processing').addClass('pop_on');
        $('.contents_01 .hero').css('z-index', 0);
    }

    /* ============================================
     *  플로팅 이미지 점점 줄이기
     * ============================================ */
    function startFloatFadeSequence() {
        // visibleWraps 는 랜덤 노출 시 만든 전역 배열이라고 가정
        if (typeof visibleWraps === 'undefined' || !visibleWraps.length) return;

        const wraps    = Array.from(visibleWraps);
        const mustKeep = [2, 4, 5, 7, 9, 10]; // 최종에 남길 아이콘 번호
        const fadeSec  = totalCountTime / 1000;
        const removeFadeMs = 500;

        // 전체를 0.6 → 0.3 으로 길게 페이드
        wraps.forEach(wrap => {
            const baseTransition = wrap.style.transition || '';
            wrap.style.transition = baseTransition
                ? baseTransition + `, opacity ${fadeSec}s ease`
                : `opacity ${fadeSec}s ease`;

            requestAnimationFrame(function () {
                wrap.style.opacity = '0.3';
            });
        });

        // 제거 대상만 골라서 순차 제거
        const removeWraps = wraps.filter(wrap => {
            const idx = parseInt(wrap.dataset.index, 10);
            return !mustKeep.includes(idx);
        });

        if (!removeWraps.length) return;

        const removeCount = removeWraps.length;
        const interval    = totalCountTime / removeCount;

        removeWraps.forEach((wrap, idx) => {
            const t = Math.round(idx * interval);

            setTimeout(function () {
                wrap.style.transition = `opacity ${removeFadeMs / 1000}s ease`;
                wrap.style.opacity = '0';

                setTimeout(function () {
                    wrap.style.display = 'none';
                }, removeFadeMs + 50);
            }, t);
        });
    }

    /* ============================================
     *  단계별 목표 값 / 시간 세팅
     * ============================================ */
    const phase1Start = 0;
    const phase1End   = 1111243; // step01
    const phase2End   = 952705;  // step02
    const phase3End   = 323531;  // step03
    const phase4End   = 320988;  // step04
    const phase5End   = 230266;  // step05
    const phase6End   = 105379;  // step06
    const phase7End   = 500;     // step07

    const phase1Duration = 1000;
    const phase2Duration = 1000;
    const phase3Duration = 1000;
    const phase4Duration = 1000;
    const phase5Duration = 1000;
    const phase6Duration = 1000;
    const phase7Duration = 1000;
    const phaseDelay     = BLINK_PAUSE; // 각 단계 끝난 후 머무는 시간 = blink 시간

    // 전체 검색 카운트 시간 (step01 ~ step07 + 중간 딜레이 합산)
    const totalCountTime =
        phase1Duration + phase2Duration + phase3Duration +
        phase4Duration + phase5Duration + phase6Duration +
        phase7Duration + phaseDelay * 6;

    // 한 단계 끝난 후 blink 타임 → 다음 단계 시작
    function afterPhaseComplete(nextPhaseFn) {
        setBlink(true);  // 부드럽게 blink 시작

        setTimeout(function () {
            setBlink(false); // 다시 부드럽게 원상복귀

            if (typeof nextPhaseFn === 'function') {
                nextPhaseFn();
            }
        }, BLINK_PAUSE);
    }

    /* ============================================
     *  단계별 실제 동작
     * ============================================ */

    // 1단계: 0 → 1,111,243 (step01)
    function startPhase1() {
        showStep(1);             // KR/EN 모두 step01 active + span 위치
        updateProgressStep(1);
        setBlink(false);

        animateCount(phase1Start, phase1End, phase1Duration, function () {
            afterPhaseComplete(startPhase2);
        });
    }

    // 2단계: 1,111,243 → 952,705 (step02)
    function startPhase2() {
        showStep(2);
        updateProgressStep(2);
        setBlink(false);

        animateCount(phase1End, phase2End, phase2Duration, function () {
            afterPhaseComplete(startPhase3);
        });
    }

    // 3단계: 952,705 → 323,531 (step03)
    function startPhase3() {
        showStep(3);
        updateProgressStep(3);
        setBlink(false);

        animateCount(phase2End, phase3End, phase3Duration, function () {
            afterPhaseComplete(startPhase4);
        });
    }

    // 4단계: 323,531 → 320,988 (step04)
    function startPhase4() {
        showStep(4);
        updateProgressStep(4);
        setBlink(false);

        animateCount(phase3End, phase4End, phase4Duration, function () {
            afterPhaseComplete(startPhase5);
        });
    }

    // 5단계: 320,988 → 230,266 (step05)
    function startPhase5() {
        showStep(5);
        updateProgressStep(5);
        setBlink(false);

        animateCount(phase4End, phase5End, phase5Duration, function () {
            afterPhaseComplete(startPhase6);
        });
    }

    // 6단계: 230,266 → 105,379 (step06)
    function startPhase6() {
        showStep(6);
        updateProgressStep(6);
        setBlink(false);

        animateCount(phase5End, phase6End, phase6Duration, function () {
            afterPhaseComplete(startPhase7);
        });
    }

    // 7단계: 105,379 → 500 (step07)
    function startPhase7() {
        showStep(7);
        updateProgressStep(7);
        setBlink(false);

        animateCount(phase6End, phase7End, phase7Duration, function () {
            // 마지막 단계: 한 번 더 blink → 결과 팝업
            setBlink(true);
            setTimeout(function () {
                setBlink(false);
                showResultPopup();
            }, BLINK_PAUSE);
        });
    }

    /* ============================================
     *  클릭 시 초기화 & 시퀀스 시작
     * ============================================ */

    // 1) 각 언어 컨테이너의 step 초기화
    getLangContainers().each(function () {
        const $box      = $(this);
        const $li       = $box.find('> li, > dd');
        const $allSteps = $li.find('> p');
        $allSteps.removeClass('active');
    });

    // 2) .counting 숫자 0으로 초기화
    getCountingEls().text('0');

    // 3) blink OFF / step1 활성화 + span 위치
    setBlink(false);
    showStep(1);

    // 4) 플로팅 이미지 줄이기 시퀀스도 같이 시작
    startFloatFadeSequence();

    // 5) 카운트 & 텍스트 시퀀스 시작
    startPhase1();
});





/* ------------------------------------
   팝업 내 "기업 보기" 버튼 클릭 시
   팝업 닫고 processing_end 적용
   ------------------------------------ */
$('.search_process_pop .btn_card_list').on('click', function () {
    $('.search_process_pop').removeClass('is-active');

    $('.contents_01')
        .removeClass('processing pop_on') // pop_on도 같이 제거
        .addClass('processing_end');
});










// ===============================
// 검색 결과 도넛 슬라이더 (카드 크기 고정)
// ===============================
const scene = document.querySelector('.search_complete_list');
// 🔹 .search_complete_list 바로 아래의 ul만 선택
const list  = scene ? scene.querySelector(':scope > ul') : null;
// 🔹 그 ul의 "직계 자식 li"만 카드로 사용 → bottom 안 li는 제외
const itemEls = list ? Array.from(list.children) : [];

if (scene && list && itemEls.length) {

  let angle = 0;        // 전체 회전 각도
  let velocity = 0;     // 관성 속도
  let isDragging = false;
  let startX = 0;

  // 🔹 45도 위에서 내려다보는 느낌
  list.style.position = 'relative';
  list.style.width    = '100%';
  list.style.height   = '100%';
  list.style.transformStyle = 'preserve-3d';
  list.style.transformOrigin = '50% 50%';

  // 카드 배치 함수
function layoutCards() {
  const total = itemEls.length;
  if (!total) return;

  const radius   = 24;   // 도넛 반지름 (vw)
  const minScale = 0.9; // 가장 뒤쪽 카드 크기
  const maxScale = 1.2;  // 정면 카드 크기
  const maxYOffset = 12;  // 옆으로 갈수록 위로 올라가는 최대 값 (vw)

  itemEls.forEach((li, index) => {
    const theta = (360 / total) * index + angle; // 각 카드의 현재 각도
    const rad   = theta * Math.PI / 180;

    // 원형 x 위치
    const x = Math.sin(rad) * radius;            // -radius ~ radius

    // cos 값으로 앞/뒤 깊이 계산 (0~1)
    const depth = (Math.cos(rad) + 1) / 2;       // 0(뒤) ~ 1(앞)

    // 깊이에 따른 scale / opacity / z-index
    const scale   = minScale + (maxScale - minScale) * depth;
    const opacity = 0.4 + 0.6 * depth;          // 0.4 ~ 1.0
    const zIndex  = 100 + Math.round(depth * 100);

    // 🔹 옆/뒤로 갈수록 위로 살짝 더 올리기
    // depth가 작을수록(옆/뒤) yOffset이 커짐
    const yOffset = (1 - depth) * maxYOffset;   // 0 ~ maxYOffset (vw)

    li.style.position = 'absolute';
    li.style.left     = '50%';
    li.style.top      = '50%';
    li.style.transform = `
      translate3d(${x}vw, -50%, 0)
      translateY(-${yOffset}vw)
      scale(${scale})
    `;
    li.style.zIndex   = zIndex;
    li.style.opacity  = opacity;
  });
}






  // 초기 배치
  layoutCards();

  // 관성 회전 애니메이션
  function animate() {
    if (!isDragging) {
      angle += velocity;
      velocity *= 0.85;                 // 마찰 계수

      if (Math.abs(velocity) < 0.001) {
        velocity = 0;
      }
      layoutCards();
    }
    requestAnimationFrame(animate);
  }
  animate();

  // -----------------------
  // 입력 이벤트 (휠, 드래그, 터치)
  // -----------------------

  // 마우스 휠로 회전
  scene.addEventListener('wheel', e => {
    e.preventDefault();
    velocity += e.deltaY * 0.03;        // 스크롤 방향에 따라 속도 부여
  }, { passive: false });

  // 드래그 시작
  scene.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
  });

  // 드래그 중
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    angle += delta * 0.2;               // 이동량 → 각도
    velocity = delta * 0.15;            // 관성값 갱신
    startX = e.clientX;
    layoutCards();
  });

  // 드래그 종료
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // 터치 시작
  scene.addEventListener('touchstart', e => {
    if (!e.touches.length) return;
    isDragging = true;
    startX = e.touches[0].clientX;
  });

  // 터치 이동
  scene.addEventListener('touchmove', e => {
    if (!isDragging || !e.touches.length) return;
    const delta = e.touches[0].clientX - startX;
    angle += delta * 0.2;
    velocity = delta * 0.15;
    startX = e.touches[0].clientX;
    layoutCards();
  });

  // 터치 종료
  scene.addEventListener('touchend', () => {
    isDragging = false;
  });
}







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
            //    → 쿼리스트링을 붙여서 매번 다른 URL처럼 보이게 해서
            //      SVG 애니메이션이 각각 개별로 재생되도록 함
            var ico = document.createElement('img');
            ico.className = 'ico';
            ico.src = SVG_PATH + '?t=' + Date.now() + '_' + Math.random(); 
            // 위 ?t=... 부분이 포인트

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
                        btn.textContent = '적합';
                        confirmBox.appendChild(btn);
                    }

                    btn.style.display = 'inline-flex';
                    requestAnimationFrame(function () {
                        btn.classList.add('active'); // opacity 1
                    });

                }, 200); // CSS transition 0.6s와 맞춤

            }, 1500); // 아이콘이 1.5초 동안 화면에 있다가 사라짐

        }, startTime); // 2초 후 + (1~1.5초 * index) 마다 순차 실행
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


