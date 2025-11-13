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





    
/* floatin icon 생성 */
  const floatArea = document.querySelector('.float-img-area');
  const ICON_COUNT = 138; // 총 아이콘 개수
  const maxVisible = 20;  // 한 번에 노출할 개수 (랜덤)

  /* ===========================
   * 1. HTML 동적 생성
   * ===========================
   */
  for (let i = 1; i <= ICON_COUNT; i++) {
    const wrap = document.createElement('div');
    wrap.classList.add('float-img-wrap');

    const img = document.createElement('img');

    // 파일명 규칙: 01~09, 10~99, 100~138
    const numStr = String(i).padStart(2, '0');
    img.src = `../../resources/images/floatin_img_${numStr}.jpg`;
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

  const shuffled = Array.from(floatWraps).sort(() => Math.random() - 0.5);
  const visibleWraps = shuffled.slice(0, Math.min(maxVisible, total));

  // 전부 숨김
  floatWraps.forEach(wrap => {
    wrap.style.display = 'none';
  });

  // 선택된 20개에만 랜덤 속성 부여 + 노출
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

    wrap.style.display = "block";
    wrap.style.left = `${x}%`;
    wrap.style.top  = `${y}%`;
    wrap.style.position = 'absolute';
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
      setTimeout(() => {
        ico.classList.add('show');
      }, delay * 1000);
    }









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
    // 메인 -> 검색 프로세스 상태 전환
    $('.contents_01').addClass('processing');

    const $step1 = $('.search_txt_step .step01');
    const $step2 = $('.search_txt_step .step02');
    const $step3 = $('.search_txt_step .step03');
    const $count = $('.search_txt_step .counting');
    const $countWrap = $('.search_txt_step > ul > li > span');

    // 초기 상태 리셋
    $step1.addClass('active').removeClass('enter');
    $step2.removeClass('active enter');
    $step3.removeClass('active enter');
    $count.text('00');

    // 깜빡임 시작
    $countWrap.addClass('blink');

    /* -------------------------
       1) 카운팅: 00 → 20
          랜덤 속도 + 총 6초
       ------------------------- */
    let current    = 0;
    const target   = 20;
    let tick       = 0;
    const maxTicks = 20;    // 20번 틱
    const interval = 500;   // 0.3초 간격 → 6초

    const counterTimer = setInterval(function () {
        tick++;

        if (tick >= maxTicks) {
            current = target;  // 마지막 틱에서 정확히 20
        } else {
            const remaining = target - current;
            let step = Math.floor(Math.random() * 3) + 1; // 1~3 랜덤 증가
            if (step > remaining) step = remaining;
            current += step;
        }

        const display = current.toString().padStart(2, '0');
        $count.text(display);

        if (current >= target) {
            clearInterval(counterTimer);
        }
    }, interval);

    /* -------------------------
       2) step 텍스트 전환
          0초 : step01 (기본 active)
          3초 : step02
          6초 : step03
       ------------------------- */

    // 3초 후: step02 등장, step01은 서서히 사라짐(제자리)
    setTimeout(function () {
        $step1.removeClass('active');     // opacity 0으로
        $step2.addClass('active');        // 표시
    }, 3000);

    // 6초 후: step03 등장, step02는 제자리에서 서서히 사라짐
    setTimeout(function () {
        $step2.removeClass('active');     // opacity 0으로
        $step3.addClass('active');        // 표시
        // 원하시면 이 시점에 깜빡임 종료도 가능
        $countWrap.removeClass('blink');
    }, 6000);

    /* -------------------------
       3) 플로팅 아이콘 7개 랜덤 제거
          6초 동안 서서히 사라지기
       ------------------------- */

    const removeCount   = 90;      // 총 90개 제거
    const totalDuration = 6000;   // 6초 안에
    const stepDelay     = totalDuration / removeCount;  // 한 개당 간격

    for (let i = 0; i < removeCount; i++) {
        setTimeout(function () {
            // 아직 제거되지 않은 아이콘들만 대상으로
            const $remaining = $('.float-img-area .float-img-wrap').not('.removed');
            if (!$remaining.length) return;

            const randomIndex = Math.floor(Math.random() * $remaining.length);
            const $target = $($remaining[randomIndex]);

            // 중복 제거 방지용 플래그 클래스
            $target.addClass('removed');

            // 서서히 사라지는 애니메이션 (css 없이 jQuery로)
            $target.animate({ opacity: 0 }, 700, function () {
                $(this).css('display', 'none');
            });

        }, stepDelay * (i + 1)); // 6초 / 7개 간격으로 순차 실행
    }

    /* -------------------------
       4) 모든 동작이 끝난 뒤
          processing → processing_end로 교체
          (.hero / .search_process 위로 사라지고,
           .search_complete 위로 슬라이드 인)
       ------------------------- */

    // step03, 아이콘 제거까지 고려해서 여유를 조금 줌 (약 7초 후)
    const endDelay = 7000;

    setTimeout(function () {
        $('.contents_01')
            .removeClass('processing')
            .addClass('processing_end');
    }, endDelay);
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
  const minScale = 0.8; // 가장 뒤쪽 카드 크기
  const maxScale = 1.1;  // 정면 카드 크기
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
        document.querySelectorAll('.gate_02.sub .gate_02_01 .inve_confirm_list .item')
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

            }, 3000); // 아이콘이 3초 동안 화면에 있다가 사라짐

        }, startTime); // 2초 후 + (1~1.5초 * index) 마다 순차 실행
    });
});
document.addEventListener('DOMContentLoaded', function () {
    var cursor = document.querySelector('.final_gp .final_cursor');
    var cursorText = document.querySelector('.final_gp .cursor_text');
    if (!cursor) return;

    // 박스 영역
    var confirmBoxWrap  = document.querySelector('.gate_02.sub .gate_02_01 .inve_confirm_box');
    var examineBoxWrap  = document.querySelector('.gate_02.sub .gate_02_01 .inve_examine_box');

    // 퍼센트(0~100) 기준으로 커서 위치 이동
    function moveFinalCursor(percent) {
        percent = Math.max(0, Math.min(100, percent)); // 0~100으로 제한
        cursor.style.left = percent + '%';
    }

    // 외부 다른 스크립트에서도 사용 가능하게 전역으로 노출
    window.moveFinalCursor = moveFinalCursor;

    // 시작 위치 0%
    cursor.style.left = '0%';

    // examine 박스 초기 상태(안 보이게)
    if (examineBoxWrap) {
        examineBoxWrap.style.display = 'none';
    }

    // 3초 뒤에 애니메이션 시작
    setTimeout(function () {
        // ▶ 이 타이밍에 텍스트 노출 (1.5초 지연)
        if (cursorText) {
            setTimeout(function () {
                cursorText.style.opacity = 1;
            }, 1500); // 1.5초 후
        }

        var step = 0;
        var maxStep = 4; // 총 4번 이동 (1~3 랜덤, 4번째는 85%)

        var intervalId = setInterval(function () {
            step++;

            if (step < maxStep) {
                // 1~3번째: 랜덤 위치 (60~100% → -20 해서 40~80%대)
                var randomPercent = 60 + Math.random() * 50; // 60~110 이지만 아래에서 -20
                moveFinalCursor(randomPercent - 20);
            } else {
                // 4번째: 85%로 이동 후 종료
                moveFinalCursor(85);
                clearInterval(intervalId);

                // ★ 커서 애니 끝나고 1초 뒤에 박스 전환
                setTimeout(function () {
                    // inve_confirm_box 위로 스르륵 사라짐
                    if (confirmBoxWrap) {
                        confirmBoxWrap.classList.add('fade-out-up');

                        // 트랜지션 끝난 후 display:none 처리
                        setTimeout(function () {
                            confirmBoxWrap.style.display = 'none';
                        }, 600); // CSS transition 시간과 맞추기
                    }

                    // inve_examine_box 위로 스르륵 올라오면서 노출
                    if (examineBoxWrap) {
                        examineBoxWrap.style.display = 'block';

                        // 강제 리플로우로 transition 적용 보장
                        examineBoxWrap.getBoundingClientRect();

                        examineBoxWrap.classList.add('fade-in-up');

                        // ★ fade-in-up 적용 후 1초 뒤에 step_examine 순차 on
setTimeout(function () {
    var steps = document.querySelectorAll(
        '.step_examine_list [class^="step_examine_"]'
    );

    steps.forEach(function (el, idx) {
        setTimeout(function () {
            // 순차적으로 on 적용
            el.classList.add('on');

            // 마지막 on이 적용되는 순간 처리
            if (idx === steps.length - 1) {
                steps.forEach(function (item, j) {
                    var li = item.closest('li');
                    if (li) {
                        li.classList.add('done');
                    }

                    if (j !== idx) {
                        item.classList.remove('on');
                        item.classList.add('done');
                    }
                });

                // ★ 모든 step 처리 완료 후, confirm_wrap 사라지고 movie_closed 등장
                var confirmWrap = document.querySelector(
                    '.gate_02.sub .gate_02_01 .inve_confirm_wrap'
                );
                var movieClosed = document.querySelector(
                    '.gate_02.sub .gate_02_01 .movie_closed'
                );

                if (confirmWrap) {
                    // confirm_wrap 위로 + 투명
                    confirmWrap.classList.add('fade-out-up');

                    // 트랜지션 끝난 뒤 처리
                    var handler = function (e) {
                        // opacity 트랜지션 끝났을 때만
                        if (e.propertyName !== 'opacity') return;

                        // 더 이상 중복 호출 안 되게 리스너 제거
                        confirmWrap.removeEventListener('transitionend', handler);

                        // ★ confirm_wrap 애니 끝나고 1초 뒤에 처리
                        setTimeout(function () {
                            // 1) confirm_wrap 영역 제거
                            confirmWrap.style.display = 'none';

                            // 2) movie_closed 등장
                            if (movieClosed) {
                                movieClosed.classList.add('fade-in-up');
                            }
                        }, 1000); // 1초 딜레이
                    };

                    confirmWrap.addEventListener('transitionend', handler);
                }
            }
        }, idx * 1000); // 2초 간격으로 순차 적용
    });
}, 1000);
                    }
                }, 1000); // 커서 애니 끝난 뒤 1초
            }
        }, 1200); // 1.2초마다 실행
    }, 3000); // 3초 뒤에 시작
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