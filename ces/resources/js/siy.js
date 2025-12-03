// siy.js
$(function () {
    // 필요 시 초기화 코드 추가
});
// End of siy.js


/* ---------------------------------------------------------
   공통 유틸
--------------------------------------------------------- */

// hash fragment 가져오기
function getFragment() {
    return window.location.hash.substring(1) || '1';
}

// hash → 제품명 변환
function getHashOfName(fragment) {
    fragment = fragment ? fragment : getFragment();
    const map = {
        '1': 'NexDrive',
        '2': 'Qstack',
        '3': 'ApexBio',
        '4': 'Dataverse'
    };
    return map[fragment] || '';
}

// hash → 제품명 변환
function getHashOfCategory(fragment) {
    fragment = fragment ? fragment : getFragment();
    const map = {
        '1': '자동차',
        '2': '전기·전자',
        '3': '바이오·헬스케어',
        '4': '정보통신·소프트웨어'
    };
    return map[fragment] || '';
}

// panel & overlay DOM 조회
function getPanelElements(id) {
    return {
        panel: document.getElementById(id),
        overlay: document.querySelector(".esg_dim")
    };
}


/* ---------------------------------------------------------
   패널 열기/닫기
--------------------------------------------------------- */

// panel open
function openPanel(id) {
    const { panel, overlay } = getPanelElements(id);

    [panel, overlay].forEach(el => el.style.display = "");
    panel.style.animationName = "panelIn";
    overlay.style.animationName = "overlayIn";
}

// panel close
function closePanel(id) {
    const { panel, overlay } = getPanelElements(id);

    panel.style.animationName = "panelOut";
    overlay.style.animationName = "overlayOut";

    const hideAfterAnimation = (el, name) => {
        el.addEventListener(
            "animationend",
            () => {
                if (el.style.animationName === name) el.style.display = "none";
            },
            { once: true }
        );
    };

    hideAfterAnimation(panel, "panelOut");
    hideAfterAnimation(overlay, "overlayOut");
}


/* ---------------------------------------------------------
   Gate 초기화
--------------------------------------------------------- */

// gate0301Init
function gate0301Init() {
    const fragment = getFragment();

    $('#selPrdName').text(getHashOfName());
    const $visibleItems = $("[data-visible]");
    $visibleItems.hide();
    $visibleItems.filter(`[data-visible="${fragment}"]`).show();
    $(".esg_cont").css("visibility", "");
}

// gate0302Init
function gate0302Init() {
    const fragment = getFragment();

    $('#selPrdName').text(getHashOfName());
    const $visibleItems = $("[data-visible]");
    $visibleItems.hide();
    $visibleItems.filter(`[data-visible="${fragment}"]`).show();

    $(".esg_cont").css("visibility", "");
}

// gate0303Init
function gate0303Init() {
    const fragment = getFragment();

    $('#selPrdName').text(getHashOfName());
    const $visibleItems = $("[data-visible]");
    $visibleItems.hide();
    $visibleItems.filter(`[data-visible="${fragment}"]`).show();

    $(".esg_cont").css("visibility", "");
}

// gate0304Init
function gate0304Init() {
    const fragment = getFragment();

    $('#selPrdName').text(getHashOfName());
    $('#selPrdCategory').text(getHashOfCategory());
    const $visibleItems = $("[data-visible]");
    $visibleItems.hide();
    $visibleItems.filter(`[data-visible="${fragment}"]`).show();

    $(".esg_cont").css("visibility", "");
}