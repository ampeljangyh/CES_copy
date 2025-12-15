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
function openPanel(id, callback, beforeFn) {
    const { panel, overlay } = getPanelElements(id);

    // beforeFn 먼저 실행
    if (typeof beforeFn === "function") {
        beforeFn(id);
    }

    // 표시
    [panel, overlay].forEach(el => el.style.display = "");

    // 애니메이션 시작
    panel.style.animationName = "panelIn";
    overlay.style.animationName = "overlayIn";

    if (typeof callback !== "function") return;

    let completed = 0;
    const total = 2;

    const onAnimationEnd = () => {
        completed++;
        if (completed === total) {
            callback(id); // 콜백 호출
            panel.removeEventListener("animationend", onAnimationEnd);
            overlay.removeEventListener("animationend", onAnimationEnd);
        }
    };

    panel.addEventListener("animationend", onAnimationEnd);
    overlay.addEventListener("animationend", onAnimationEnd);
}


// panel close
function closePanel(id, callback, beforeFn) {
    const { panel, overlay } = getPanelElements(id);

    // beforeFn 먼저 실행
    if (typeof beforeFn === "function") {
        beforeFn(id);
    }

    // 애니메이션 시작
    panel.style.animationName = "panelOut";
    overlay.style.animationName = "overlayOut";

    let completed = 0;
    const total = 2;

    const onAnimationEnd = (e) => {
        const el = e.target;

        if (
            (el === panel && panel.style.animationName === "panelOut") ||
            (el === overlay && overlay.style.animationName === "overlayOut")
        ) {
            el.style.display = "none";
            completed++;

            if (completed === total && typeof callback === "function") {
                callback(id); // 콜백 호출
            }
        }

        el.removeEventListener("animationend", onAnimationEnd);
    };

    panel.addEventListener("animationend", onAnimationEnd);
    overlay.addEventListener("animationend", onAnimationEnd);
}

function openModal(id, callback, beforeFn) {
    const { panel, overlay } = getPanelElements(id);

    // beforeFn 먼저 실행
    if (typeof beforeFn === "function") {
        beforeFn(id);
    }

    // 표시
    [panel].forEach(el => el.style.display = "");

    // 애니메이션 시작
    panel.style.animationName = "overlayIn";

    if (typeof callback !== "function") return;

    let completed = 0;
    const total = 1;

    const onAnimationEnd = () => {
        completed++;
        if (completed === total) {
            callback(id); // 콜백 호출
            panel.removeEventListener("animationend", onAnimationEnd);
        }
    };

    panel.addEventListener("animationend", onAnimationEnd);
}

/* ---------------------------------------------------------
   Gate 초기화
--------------------------------------------------------- */
async function runChain(steps) {
    for (const step of steps) {
        await step();   // 동기든 async든 모두 기다리면서 순서대로 실행
    }
}

async function pageInit(stepMap) {
    try {
        const pageSteps = Object.values(stepMap);
        await runChain(pageSteps);
    } catch (e) {
        console.error('script error:', e);
    }
}


//공통 처리
function commonBefore() {
    const fragment = getFragment();

    $('.selPrdName').text(getHashOfName());
    $('.selPrdCategory').text(getHashOfCategory());

    const $visibleItems = $("[data-visible]");
    $visibleItems.hide();
    $visibleItems.filter(`[data-visible="${fragment}"]`).show();
}

function commonInit() {
    $(".esg_cont").css("visibility", "");
}

// gate03ConfigData
function gate03ConfigData() {
    const fragment = getFragment();
    const config = {
        gradeTxt:['D', 'C', 'B', 'B+', 'A', 'A+', 'S'],
        regGradeTxt:['취약', '미흡', '보통', '양호', '우수'],
        '1': {
            // [종합 평가]
            grade: 5, // A+
            gradeMsg: '귀사는 ESG 관리 수준이 높은 기업으로, 주요 항목을 잘 운영하고 있습니다.<br>일부 영역을 보완하면 더욱 균형잡힌 ESG 경영을 실천할 수 있습니다.<br>지속적인 개선을 통해 한 단계 더 도약할 수 있습니다.',

            // [연도별 점수 이력]
            pointHistory: {
                2024: { gradePoint: 84.9, gradePointE: 82.5, gradePointS: 87,   gradePointG: 85 },
                2023: { gradePoint: 59,   gradePointE: 57.3, gradePointS: 66.2, gradePointG: 62.5 },
                2022: { gradePoint: 53,   gradePointE: 53.6, gradePointS: 61.9, gradePointG: 55.5 }
            },

            // [ESG 상세 점수]
            pointDetail: {
                e: {
                    grade: 5, // A+
                    point: 82.5,
                    avgIndustry: 49.7,
                    avgSme: 45.2,
                    details: [
                        { score: 81.3, text: '환경경영 일반' },
                        { score: 89.3, text: '온실가스 및 에너지' },
                        { score: 91.7, text: '폐기물' },
                        { score: 100,  text: '수자원' },
                        { score: 62.5, text: '유해화학물질' },
                        { score: 50,   text: '대기, 수질 오염물질' }
                    ]
                },
                s: {
                    grade: 5, // A+
                    point: 87,
                    avgIndustry: 64.9,
                    avgSme: 62.4,
                    details: [
                        { score: 100,  text: '인권' },
                        { score: 93.7, text: '근로조건' },
                        { score: 75,   text: '강제노동 및 아동노동' },
                        { score: 75,   text: '노사관계' },
                        { score: 95.8, text: '안전보건' },
                        { score: 50,   text: '지역사회' },
                        { score: 58.3, text: '협력사 및 공급망' },
                        { score: 100,  text: '제품 및 고객' },
                        { score: 91.7, text: '정보보호' }
                    ]
                },
                g: {
                    grade: 5, // A+
                    point: 85,
                    avgIndustry: 49.1,
                    avgSme: 41.1,
                    details: [
                        { score: 100, text: '윤리경영 및 반부패' },
                        { score: 50,  text: '이해관계자 소통' },
                        { score: 75,  text: '지배구조 건전성' },
                        { score: 80,  text: '주주 및 이사회', industry: 60 }
                    ]
                }
            },

            // [규제 대응 평가]
            regGrade: 1, // 미흡
            regGradeMsg: '귀사는 일부 ESG 규제 요구사항을 반영하고 있으나, 대응 체계가 충분히 갖춰지지 않은 상태입니다.<br>주요 항목을 점검하고 단계적으로 개선해 나가는 것이 필요합니다.',
            regPercent: 37.5,
            regAvgIndustry: 17.3,
            regAvgSme: 23.9,
            // 규제 상세 항목: title 속성 수정 (HTML <br> 포함)
            regDetails: [
                { score: 3,    text: '10/16, 62.5%', title: 'CSDDD부속서1' },
                { score: null, text: '미대상', title: 'CSDDD부속서2' },
                { score: null, text: '미대상', title: '산림벌채규정<br>(EUDR)' },
                { score: 0,    text: '0/1, 0%', title: 'EU 배터리규정' },
                { score: 4,    text: '1/1, 100%', title: '위구르 강제노동 금지법<br>(UFLPA)' },
                { score: 0,    text: '0/1, 0%', title: '탄소국경조정제도<br>(CBAM)' },
                { score: 0,    text: '0/1, 0%', title: '청정경쟁법<br>(CCA)' },
                { score: 0,    text: '0/1, 0%', title: '분쟁광물규정' },
                { score: 4,    text: '1/1, 100%', title: 'EU 강제노동제품 금지규정' }
            ]
        },
        '2': {
            // [종합 평가]
            grade: 4, // A
            gradeMsg: '귀사는 ESG 경영을 성실히 실천하고 있으며, 주요 항목에 대한 관리가 이루어지고 있습니다.<br>일부 보완할 부분을 개선해 나가면 더욱 안정적이고 신뢰받는 ESG 체계를 구축할 수 있습니다.',

            // [연도별 점수 이력]
            pointHistory: {
                2024: { gradePoint: 66.1, gradePointE: 61.4, gradePointS: 69.4, gradePointG: 70 },
                2023: { gradePoint: 59.1, gradePointE: 57.3, gradePointS: 66.2, gradePointG: 62.5 },
                2022: { gradePoint: 53,   gradePointE: 53.6, gradePointS: 62,   gradePointG: 55.6 }
            },

            // [ESG 상세 점수]
            pointDetail: {
                e: {
                    grade: 3, // B+
                    point: 61.4,
                    avgIndustry: 49.7,
                    avgSme: 45.2,
                    details: [
                        { score: 75,   text: '환경경영 일반' },
                        { score: 75,   text: '온실가스 및 에너지' },
                        { score: 56.3, text: '폐기물' },
                        { score: 0,    text: '수자원' },
                        { score: 62.5, text: '유해화학물질' },
                        { score: 58.3, text: '대기, 수질 오염물질' }
                    ]
                },
                s: {
                    grade: 4, // A
                    point: 69.4,
                    avgIndustry: 64.9,
                    avgSme: 62.4,
                    details: [
                        { score: 65,   text: '인권' },
                        { score: 100,  text: '근로조건' },
                        { score: 68.7, text: '강제노동 및 아동노동' },
                        { score: 100,  text: '노사관계' },
                        { score: 87.5, text: '안전보건' },
                        { score: 25,   text: '지역사회' },
                        { score: 16.7, text: '협력사 및 공급망' },
                        { score: 100,  text: '제품 및 고객' },
                        { score: 25,   text: '정보보호' }
                    ]
                },
                g: {
                    grade: 4, // A
                    point: 70,
                    avgIndustry: 49.1,
                    avgSme: 41.1,
                    details: [
                        { score: 75, text: '윤리경영 및 반부패' },
                        { score: 50, text: '이해관계자 소통' },
                        { score: 75, text: '지배구조 건전성' },
                        { score: 65, text: '주주 및 이사회', industry: 60 }
                    ]
                }
            },

            // [규제 대응 평가]
            regGrade: 1, // 미흡
            regGradeMsg: '귀사는 일부 ESG 규제 요구사항을 반영하고 있으나, 대응 체계가 충분히 갖춰지지 않은 상태입니다.<br>주요 항목을 점검하고 단계적으로 개선해 나가는 것이 필요합니다.',
            regPercent: 28.6,
            regAvgIndustry: 39.3,
            regAvgSme: 23.9,
            // 규제 상세 항목: title 속성 수정 (HTML <br> 포함)
            regDetails: [
                { score: 0,    text: '0/16, 0%', title: 'CSDDD부속서1' },
                { score: null, text: '미대상', title: 'CSDDD부속서2' },
                { score: null, text: '미대상', title: '산림벌채규정<br>(EUDR)' },
                { score: 0,    text: '0/1, 0%', title: 'EU 배터리규정' },
                { score: 4,    text: '1/1, 100%', title: '위구르 강제노동 금지법<br>(UFLPA)' },
                { score: 0,    text: '0/1, 0%', title: '탄소국경조정제도<br>(CBAM)' },
                { score: 0,    text: '0/1, 0%', title: '청정경쟁법<br>(CCA)' },
                { score: 0,    text: '0/1, 0%', title: '분쟁광물규정' },
                { score: 4,    text: '1/1, 100%', title: 'EU 강제노동제품 금지규정' }
            ]
        },
        '3': {
            // [종합 평가]
            grade: 3, // B+
            gradeMsg: '귀사는 ESG 관리 기반을 갖추고 있으며, 점진적인 개선을 통해 더 나은 성과를 기대할 수 있습니다.<br>관리 체계를 정교하게 다듬어 나간다면 ESG 경영의 신뢰도를 높일 수 있을 것입니다.',

            // [연도별 점수 이력]
            pointHistory: {
                2024: { gradePoint: 52.5, gradePointE: 43.4, gradePointS: 60.2, gradePointG: 60 },
                2023: { gradePoint: 46,   gradePointE: 39.4, gradePointS: 56.5, gradePointG: 56.9 },
                2022: { gradePoint: 42.1, gradePointE: 36.5, gradePointS: 51.5, gradePointG: 52.7 }
            },

            // [ESG 상세 점수]
            pointDetail: {
                e: {
                    grade: 2, // B
                    point: 43.4,
                    avgIndustry: 45.9,
                    avgSme: 45.2,
                    details: [
                        { score: 43.7, text: '환경경영 일반' },
                        { score: 46.4, text: '온실가스 및 에너지' },
                        { score: 50,   text: '폐기물' },
                        { score: 62.5, text: '수자원' },
                        { score: 25,   text: '유해화학물질' },
                        { score: 12.5, text: '대기, 수질 오염물질' }
                    ]
                },
                s: {
                    grade: 3, // B+
                    point: 60.2,
                    // avgIndustry 및 avgSme 항목은 @fix 주석에 따라 삭제됨
                    details: [
                        { score: 50,   text: '인권' },
                        { score: 100,  text: '근로조건' },
                        { score: 50,   text: '강제노동 및 아동노동' },
                        { score: 100,  text: '노사관계' },
                        { score: 89.3, text: '안전보건' },
                        { score: 0,    text: '지역사회' },
                        { score: 0,    text: '협력사 및 공급망' },
                        { score: 0,    text: '제품 및 고객' },
                        { score: 16.7, text: '정보보호' }
                    ]
                },
                g: {
                    grade: 3, // B+
                    point: 60,
                    avgIndustry: 31.7,
                    avgSme: 41.1,
                    details: [
                        { score: 66.7, text: '윤리경영 및 반부패' },
                        { score: 50,   text: '이해관계자 소통' },
                        { score: 50,   text: '지배구조 건전성' },
                        { score: 55,   text: '주주 및 이사회', industry: 60 }
                    ]
                }
            },

            // [규제 대응 평가]
            regGrade: 0, // 취약
            regGradeMsg: '귀사는 ESG 규제 대응이 아직 미비한 상태이며, 기본적인 요구사항 충족을 위한 조치가 필요합니다.<br>우선순위를 정해 핵심 항목부터 점검하고 보완하는 것이 중요합니다.',
            regPercent: 14.3,
            regAvgIndustry: 17.3,
            regAvgSme: 23.9,

            // 규제 상세 항목: title 속성 수정 (HTML <br> 포함)
            regDetails: [
                { score: 0,    text: '0/16, 0%', title: 'CSDDD부속서1' },
                { score: null, text: '미대상', title: 'CSDDD부속서2' },
                { score: null, text: '미대상', title: '산림벌채규정<br>(EUDR)' },
                { score: 0,    text: '0/1, 0%', title: 'EU 배터리규정' },
                { score: 0,    text: '0/1, 0%', title: '위구르 강제노동 금지법<br>(UFLPA)' },
                { score: 0,    text: '0/1, 0%', title: '탄소국경조정제도<br>(CBAM)' },
                { score: 0,    text: '0/1, 0%', title: '청정경쟁법<br>(CCA)' },
                { score: 0,    text: '0/1, 0%', title: '분쟁광물규정' },
                { score: 4,    text: '1/1, 100%', title: 'EU 강제노동제품 금지규정' }
            ]
        },
        '4': {
            // [종합 평가]
            grade: 2, // B
            gradeMsg: '귀사는 ESG 경영을 위한 노력을 지속하고 있으며, 기본적인 요소를 충족하고 있습니다.<br>주요 항목을 정비하고 보완해 나가면 ESG 경쟁력을 한층 더 높일 수 있습니다.',

            // [연도별 점수 이력]
            pointHistory: {
                2024: { gradePoint: 43.6, gradePointE: 38.3, gradePointS: 50, gradePointG: 35 },
                2023: { gradePoint: 35.9, gradePointE: 34.1, gradePointS: 45.1, gradePointG: 29.9 },
                2022: { gradePoint: 31.3, gradePointE: 29.3, gradePointS: 43.1, gradePointG: 23 }
            },

            // [ESG 상세 점수]
            pointDetail: {
                e: {
                    grade: 2, // B
                    point: 38.3,
                    avgIndustry: 49.7,
                    avgSme: 45.2,
                    details: [
                        { score: 16.7, text: '환경경영 일반' },
                        { score: 50,   text: '온실가스 및 에너지' },
                        { score: 16.7, text: '폐기물' },
                        { score: 62.5, text: '수자원' }
                        // 유해화학물질, 대기/수질 오염물질 항목은 삭제됨
                    ]
                },
                s: {
                    grade: 3, // B+
                    point: 50,
                    avgIndustry: 64.9,
                    avgSme: 62.4,
                    details: [
                        { score: 65,   text: '인권' },
                        { score: 81.3, text: '근로조건' },
                        { score: 62.5, text: '강제노동 및 아동노동' },
                        { score: 50,   text: '노사관계' },
                        { score: 31.3, text: '안전보건' },
                        { score: 25,   text: '지역사회' },
                        { score: 37.5, text: '협력사 및 공급망' },
                        { score: 25,   text: '제품 및 고객' },
                        { score: 41.7, text: '정보보호' }
                    ]
                },
                g: {
                    grade: 2, // B
                    point: 35,
                    avgIndustry: 49.1,
                    avgSme: 41.1,
                    details: [
                        { score: 41.7, text: '윤리경영 및 반부패' },
                        { score: 25,   text: '이해관계자 소통' },
                        { score: 25,   text: '지배구조 건전성' },
                        { score: 35,   text: '주주 및 이사회', industry: 60 }
                    ]
                }
            },

            // [규제 대응 평가]
            regGrade: 0, // 취약
            regGradeMsg: '귀사는 ESG 규제 대응이 아직 미비한 상태이며, 기본적인 요구사항 충족을 위한 조치가 필요합니다.<br>우선순위를 정해 핵심 항목부터 점검하고 보완하는 것이 중요합니다.',
            regPercent: 6.3,
            regAvgIndustry: 21.3,
            regAvgSme: 23.9,

            // 규제 상세 항목: title 속성 수정 (HTML <br> 포함)
            regDetails: [
                { score: 2,    text: '7/16, 43.8%', title: 'CSDDD부속서1' },
                { score: null, text: '미대상', title: 'CSDDD부속서2' },
                { score: null, text: '미대상', title: '산림벌채규정<br>(EUDR)' },
                { score: 0,    text: '0/1, 0%', title: 'EU 배터리규정' },
                { score: 0,    text: '0/1, 0%', title: '위구르 강제노동 금지법<br>(UFLPA)' },
                { score: 0,    text: '0/1, 0%', title: '탄소국경조정제도<br>(CBAM)' },
                { score: 0,    text: '0/1, 0%', title: '청정경쟁법<br>(CCA)' },
                { score: 0,    text: '0/1, 0%', title: '분쟁광물규정' },
                { score: 4,    text: '1/1, 100%', title: 'EU 강제노동제품 금지규정' }
            ]
        }
    };

    return config;
}

// 현재 해시(#1~#4)를 기준으로 gate03ConfigData에서 데이터 가져오기
function getCurrentGate03Data() {
    const config = gate03ConfigData();
    const fragment = getFragment();               // "1" ~ "4" 기대
    const key = (fragment && config[fragment]) ? fragment : '1';
    const data = config[key];

    return { config, key, data };
}

// 점수 텍스트 포맷터 (82.5 -> "82.5점", null/NaN -> "-")
function formatPointText(value) {
    if (value == null || isNaN(value)) return '-';
    return Number(value).toFixed(1) + '점';
}

// point_li 한 줄 업데이트 (막대 + 텍스트)
function updatePointLi($li, value) {
    const $bar = $li.find('.bar');
    const $pointText = $li.find('.point');

    if (value == null || isNaN(value)) {
        $bar.css('width', '0%').attr('data-point', '');
        $pointText.text('-');
    } else {
        const v = Number(value);
        $bar.css('width', v + '%').attr('data-point', v);
        $pointText.text(formatPointText(v));
    }
}

// 퍼센트 텍스트 포맷터 (37.5 -> "37.5%", null/NaN -> "-")
function formatPercentText(value) {
    if (value == null || isNaN(value)) return '-';
    return Number(value).toFixed(1) + '%';
}

// 규제 대응도 point_li 한 줄 업데이트 (막대 + 텍스트, 단위: %)
function updatePercentLi($li, value) {
    const $bar = $li.find('.bar');
    const $pointText = $li.find('.point');

    if (value == null || isNaN(value)) {
        $bar.css('width', '0%').attr('data-point', '');
        $pointText.text('-');
    } else {
        const v = Number(value);
        $bar.css('width', v + '%').attr('data-point', v);
        $pointText.text(formatPercentText(v));
    }
}

// "10/16, 62.5%" 같은 text에서 62.5 숫자만 뽑기
function parsePercentFromText(text) {
    if (!text) return null;
    const m = String(text).match(/([\d.]+)\s*%/);
    return m ? parseFloat(m[1]) : null;
}


/**
 * #totalResult 영역 데이터 바인딩
 *  - 종합 등급
 *  - 종합 점수 (당사/동종/중소)
 *  - 최근 3개년 ESG 점수 현황
 */
function bindTotalResult() {
    const { config, data } = getCurrentGate03Data();
    if (!data) return;

    const $totalResult = $('#totalResult');

    // -----------------------------
    // 1) [종합 등급] 영역
    // -----------------------------
    const $gradeLi = $totalResult.find('> li').eq(0);
    const companyGradeIndex = data.grade; // 0~6
    const companyGradeText = config.gradeTxt[companyGradeIndex] || '';

    // 등급 텍스트
    $gradeLi.find('.t2 strong').text(companyGradeText);
    $('#popupTotalGrade').text(companyGradeText);

    // 등급 설명 문구 (HTML 유지)
    $gradeLi.find('.cnt .t1').html(data.gradeMsg || '');

    // 등급 바 active 처리
    const $gradeItems1 = $gradeLi.find('.grade_li li');
    $gradeItems1.removeClass('active');
    if (typeof companyGradeIndex === 'number' &&
        companyGradeIndex >= 0 &&
        companyGradeIndex < $gradeItems1.length) {
        $gradeItems1.eq(companyGradeIndex).addClass('active');
    }

    // -----------------------------
    // 2) [종합 점수] 영역
    // -----------------------------
    const $scoreLi = $totalResult.find('> li').eq(1);

    const history = data.pointHistory || {};
    const years = Object.keys(history).sort((a, b) => Number(a) - Number(b));
    const latestYear = years[years.length - 1];
    const latest = latestYear ? history[latestYear] : null;
    const latestPoint = latest ? latest.gradePoint : null;

    // 상단 '종합 점수' 숫자
    if (latestPoint != null) {
        const pointStr = latestPoint.toFixed(1);
        $scoreLi.find('.t2 strong').text(pointStr);
        $('#popupTotalPoint').text(pointStr);
    } else {
        $scoreLi.find('.t2 strong').text('-');
        $('#popupTotalPoint').text('-');
    }

    const $pointLis = $scoreLi.find('.point_li li');

    // 0: 당사
    if ($pointLis.eq(0).length) {
        updatePointLi($pointLis.eq(0), latestPoint);
    }

    // 옵션: 전체 종합 점수의 산업/중소 평균을 데이터셋에 넣었다면 갱신
    // ex) data.pointAvgIndustry, data.pointAvgSme
    const pointAvgIndustry = data.pointAvgIndustry;
    const pointAvgSme = data.pointAvgSme;

    // 1: 동종산업 평균 (값이 있을 때만 퍼블 값 덮어쓰기)
    if ($pointLis.eq(1).length && pointAvgIndustry != null) {
        updatePointLi($pointLis.eq(1), pointAvgIndustry);
    }

    // 2: 중소기업 평균 (값이 있을 때만 퍼블 값 덮어쓰기)
    if ($pointLis.eq(2).length && pointAvgSme != null) {
        updatePointLi($pointLis.eq(2), pointAvgSme);
    }

    // -----------------------------
    // 3) [최근 3개년 ESG 점수 현황 + 등급 표시] 영역
    // -----------------------------
    const $thirdLi = $totalResult.find('> li').eq(2);

    // (3-1) 왼쪽 "전체 중소 기업 등급 분포" 아래 grade_li 에 현재 등급 active
    const $gradeItems2 = $thirdLi.find('.inner.chart_ty').eq(0).find('.grade_li li');
    $gradeItems2.removeClass('active');
    if (typeof companyGradeIndex === 'number' &&
        companyGradeIndex >= 0 &&
        companyGradeIndex < $gradeItems2.length) {
        $gradeItems2.eq(companyGradeIndex).addClass('active');
    }

    // (3-2) 오른쪽 "최근 3개년 ESG 점수 현황" 표 바인딩
    const $trendInner = $thirdLi.find('.inner.chart_ty').eq(1);
    const $theadSpans = $trendInner.find('.point_tbl .thead span'); // [년도, 2022, 2023, 2024...]
    const $tbodyRows = $trendInner.find('.point_tbl .tbody');       // 종합 / 환경 / 사회 / 지배구조

    // 연도 헤더 업데이트 (첫 span은 '년도' 고정)
    years.forEach((year, idx) => {
        $theadSpans.eq(idx + 1).text(year);
    });

    // 각 row별로 연도별 점수 채우기
    years.forEach((year, yearIdx) => {
        const rowData = history[year] || {};

        // 0: 종합 gradePoint
        if ($tbodyRows.eq(0).length) {
            const v = rowData.gradePoint;
            $tbodyRows.eq(0).find('span').eq(yearIdx + 1).text(
                v != null ? v.toFixed(1) : '-'
            );
        }

        // 1: 환경 gradePointE
        if ($tbodyRows.eq(1).length) {
            const v = rowData.gradePointE;
            $tbodyRows.eq(1).find('span').eq(yearIdx + 1).text(
                v != null ? v.toFixed(1) : '-'
            );
        }

        // 2: 사회 gradePointS
        if ($tbodyRows.eq(2).length) {
            const v = rowData.gradePointS;
            $tbodyRows.eq(2).find('span').eq(yearIdx + 1).text(
                v != null ? v.toFixed(1) : '-'
            );
        }

        // 3: 지배구조 gradePointG
        if ($tbodyRows.eq(3).length) {
            const v = rowData.gradePointG;
            $tbodyRows.eq(3).find('span').eq(yearIdx + 1).text(
                v != null ? v.toFixed(1) : '-'
            );
        }
    });
}


/**
 * #esgResult (분야별 탭) 데이터 바인딩
 *  - 상단 탭 버튼 요약(등급/점수)
 *  - 각 탭 내 grade_li / point_li / 이슈별 점수 표
 */
function bindEsgResult() {
    const { config, data } = getCurrentGate03Data();
    if (!data || !data.pointDetail) return;

    const gradeTxtArr = config.gradeTxt; // ['D','C','B','B+','A','A+','S']
    const detail = data.pointDetail;
    const $section = $('#esgResult');

    // 탭 번호와 데이터 키 매핑
    const tabMap = [
        { tab: 1, key: 'e' }, // 환경
        { tab: 2, key: 's' }, // 사회
        { tab: 3, key: 'g' }  // 지배구조
    ];

    tabMap.forEach(({ tab, key }) => {
        const d = detail[key];
        if (!d) return;

        const gradeIndex = d.grade;
        const gradeLabel = gradeTxtArr[gradeIndex] || '';
        const point = d.point;

        // ============================
        // 1) 상단 탭 버튼 요약 (등급 / 점수)
        // ============================
        const $btn = $section.find('.report_tab_btns .btn_report_tab[data-tab="' + tab + '"]');
        if ($btn.length) {
            $btn.find('.summary .grade').text(gradeLabel);
            $btn.find('.summary .point').text(formatPointText(point));
        }

        // ============================
        // 2) 탭 컨텐츠 영역
        // ============================
        const $tab = $section.find('.report_tab_cnts > div[data-tab="' + tab + '"]');
        if (!$tab.length) return;

        // 2-1) 등급 분포 grade_li 에 현재 등급 active 표시
        const $gradeLis = $tab.find('.grade_li li');
        $gradeLis.removeClass('active');
        if (typeof gradeIndex === 'number' &&
            gradeIndex >= 0 &&
            gradeIndex < $gradeLis.length) {
            $gradeLis.eq(gradeIndex).addClass('active');
        }

        // 2-2) "기업 ESG경쟁력 수준" 막대 3개(당사 / 동종산업 / 중소기업 평균)
        const $pointLis = $tab.find('.point_li li');

        // 0: 당사
        if ($pointLis.eq(0).length) {
            updatePointLi($pointLis.eq(0), point);
        }

        // 1: 동종산업 평균 (값 있을 때만 퍼블 값 덮어쓰기)
        if ($pointLis.eq(1).length && d.avgIndustry != null) {
            updatePointLi($pointLis.eq(1), d.avgIndustry);
        }

        // 2: 중소기업 평균 (값 있을 때만 퍼블 값 덮어쓰기)
        if ($pointLis.eq(2).length && d.avgSme != null) {
            updatePointLi($pointLis.eq(2), d.avgSme);
        }

        // 2-3) 이슈별 점수 표 (point_tbl)
        const $tbl = $tab.find('.point_tbl');
        if ($tbl.length) {
            // 기존 tbody 행 모두 제거
            $tbl.find('.tbody').remove();

            // 데이터 기준으로 tbody 다시 생성
            (d.details || []).forEach(item => {
                const $li = $('<li/>', { 'class': 'tbody' });
                $('<span/>').text(item.text || '').appendTo($li);

                const score = item.score;
                const scoreText = (score == null || isNaN(score))
                    ? '-'
                    : Number(score).toFixed(1) + '점';

                $('<span/>').text(scoreText).appendTo($li);
                $tbl.append($li);
            });
        }
    });
}

function bindRegResult() {
    const { config, data } = getCurrentGate03Data();
    if (!data) return;

    const $section = $('#regResult');

    // -----------------------------
    // 1) 상단 "ESG규제 대응 등급" 박스
    // -----------------------------
    const regGradeIndex = data.regGrade;                 // 0~4
    const regGradeLabel = config.regGradeTxt[regGradeIndex] || ''; // '취약'~'우수'

    // mt01 이 붙은 report_grid 안의 li 들: [0: 설명, 1: 등급, 2: 대응도]
    const $gridItems = $section.find('.report_grid.mt01 > li');
    const $gradeItem = $gridItems.eq(1);   // 등급 박스
    const $rateItem  = $gridItems.eq(2);   // 대응도 박스

    // 등급 텍스트
    $gradeItem.find('.txt .t2 strong').text(regGradeLabel);

    // 등급 바 active 처리
    const $regGradeLis = $gradeItem.find('.grade_li li');
    $regGradeLis.removeClass('active');
    if (typeof regGradeIndex === 'number' &&
        regGradeIndex >= 0 &&
        regGradeIndex < $regGradeLis.length) {
        $regGradeLis.eq(regGradeIndex).addClass('active');
    }

    // 등급 설명 (HTML 포함)
    $gradeItem.find('.cnt .t1').html(data.regGradeMsg || '');

    // -----------------------------
    // 2) 상단 "ESG규제 대응도" 박스
    // -----------------------------
    const regPercent      = data.regPercent;      // 당사 %
    const regAvgIndustry  = data.regAvgIndustry;  // 동종산업 평균 %
    const regAvgSme       = data.regAvgSme;       // 중소기업 평균 %

    // 제목 옆 숫자
    $rateItem.find('.txt .t2 strong').text(formatPercentText(regPercent));

    const $ratePointLis = $rateItem.find('.point_li li');

    // 0: 당사
    if ($ratePointLis.eq(0).length) {
        updatePercentLi($ratePointLis.eq(0), regPercent);
    }

    // 1: 동종산업 평균 (값 있을 때만 퍼블 값 덮어쓰기)
    if ($ratePointLis.eq(1).length && regAvgIndustry != null) {
        updatePercentLi($ratePointLis.eq(1), regAvgIndustry);
    }

    // 2: 중소기업 평균 (값 있을 때만 퍼블 값 덮어쓰기)
    if ($ratePointLis.eq(2).length && regAvgSme != null) {
        updatePercentLi($ratePointLis.eq(2), regAvgSme);
    }

    // -----------------------------
    // 3) 하단 "ESG규제별 대응도 상세"
    // -----------------------------
    const regDetails = data.regDetails || [];
    const regGradeTxtArr = config.regGradeTxt; // ['취약','미흡','보통','양호','우수']

    const $panel = $section.find('.regulation_panel');
    if (!$panel.length) return;

    // 3-1) 규제 카테고리 이름 (왼쪽)
    const $categoryBoxes = $panel.find('.reg_category_list .reg_category_box');
    $categoryBoxes.each(function (idx) {
        const item = regDetails[idx];
        if (!item) return;
        // title 에 이미 <br> 포함됨
        $(this).html(item.title || '');
    });

    // 3-2) 규제별 상태 텍스트 (오른쪽 상단 박스 리스트)
    const $statusList = $panel.find('.reg_status_list');
    $statusList.empty();

    regDetails.forEach(function (item) {
        const $box = $('<div/>', { 'class': 'reg_status_box' });

        // score 가 null 이면 "미대상" 처리
        if (item.score == null) {
            const label = item.text || '미대상';
            $('<strong/>').text(label).appendTo($box);
        } else {
            const label = regGradeTxtArr[item.score] || '';
            $('<strong/>').text(label).appendTo($box);

            if (item.text) {
                // (10/16, 62.5%) 형태로 출력
                $('<span/>').text('(' + item.text + ')').appendTo($box);
            }
        }

        $statusList.append($box);
    });

    // 3-3) 규제별 슬라이더 (아래쪽)
    const $sliderList = $panel.find('.reg_slider_list');
    $sliderList.empty();

    regDetails.forEach(function (item) {
        const percent = parsePercentFromText(item.text);

        // 미대상 or 퍼센트 없음 -> empty 슬라이더
        if (item.score == null || percent == null) {
            $('<div/>', { 'class': 'reg_slider empty' }).appendTo($sliderList);
            return;
        }

        // 일반 슬라이더 생성
        const $slider = $('<div/>', { 'class': 'reg_slider' });

        $('<span/>', { 'class': 'label_top', text: 'GOOD' }).appendTo($slider);

        const $track = $('<div/>', { 'class': 'slider_track' }).appendTo($slider);
        // 배경 눈금 5개
        for (let i = 0; i < 5; i++) {
            $('<div/>', { 'class': 'slider_bg' }).appendTo($track);
        }

        const $inner = $('<div/>', { 'class': 'slider_inner' }).appendTo($track);
        $('<div/>', {
            'class': 'slider_point',
            'style': 'bottom: ' + percent + '%;'
        }).appendTo($inner);

        $('<span/>', { 'class': 'label_bottom', text: 'BAD' }).appendTo($slider);

        $sliderList.append($slider);
    });
}

function bindPoint() {
    const { config, data } = getCurrentGate03Data();
    if (!data) return;

    // 1) 종합 등급 텍스트 (#gradeTxt)
    const gradeIndex = data.grade; // 0~6
    let gradeText = '';

    if (config && Array.isArray(config.gradeTxt) &&
        typeof gradeIndex === 'number' &&
        gradeIndex >= 0 && gradeIndex < config.gradeTxt.length) {
        gradeText = config.gradeTxt[gradeIndex];
    }

    $('#gradeTxt').text(gradeText || '-');

    // 2) 종합 점수 (#gradePoint) - 최신 연도 기준
    const history = data.pointHistory || {};
    const years = Object.keys(history).sort((a, b) => Number(a) - Number(b));

    if (!years.length) {
        $('#gradePoint').text('-');
        return;
    }

    const latestYear = years[years.length - 1];
    const latest = history[latestYear] || {};
    const latestPoint = latest.gradePoint != null ? Number(latest.gradePoint) : null;

    // formatPointText: 82.5 -> "82.5점", null -> "-"
    $('#gradePoint').text(Number(latestPoint).toFixed(1));
}

function getCurrentGate03DiagData() {
    const config = getGate03DiagData();
    const fragment = getFragment();
    const key = (fragment && config[fragment]) ? fragment : '1';
    const data = config[key];

    return { config, key, data };
}

function getGate03DiagData() {
    const config = {
        "1": {
            e: [
                { item: "환경경영체계", grade: "S" },
                { item: "환경 인허가 관리", grade: "A+" },
                { item: "온실가스 및 에너지 관리", grade: "B+" },
                { item: "온실가스 배출량 감축", grade: "A", popup: true, panelId: 'pop01' },
                { item: "에너지 사용량 감축", grade: "A" },
                { item: "폐기물 관리", grade: "A" },
                { item: "용수 관리", grade: "B" },
                { item: "유해화학물질 관리", grade: "S" },
                { item: "대기오염물질 관리", grade: "S" },
                { item: "수질오염물질 관리", grade: "A+" },
                { item: "scope3 온실가스 배출량 산정 체계", grade: "B" },
                { item: "잔류성 오염물질 관리", grade: "A+" },
                { item: "배터리 규제 대상 원료 재활용", grade: "A" },
                { item: "제품 단위 온실가스 배출량 산정 체계", grade: "A+" },
                { item: "포장재 감축 및 대체", grade: "A+" },
                { item: "제품 내 유해물질 관리", grade: "A+" }
            ],
            s: [
                { item: "인권 관리", grade: "A+" },
                { item: "고충 처리 제도", grade: "S" },
                { item: "괴롭힘, 차별 금지", grade: "A" },
                { item: "근로조건", grade: "A" },
                { item: "복리후생", grade: "A" },
                { item: "강제노동 금지", grade: "B+" },
                { item: "아동노동 금지", grade: "A+" },
                { item: "노사관계 수준", grade: "A+" },
                { item: "안전보건 관리체계", grade: "A+" },
                { item: "안전보건 관리활동", grade: "S", popup: true, panelId: 'pop02' },
                { item: "지역사회 공헌", grade: "B" },
                { item: "외국인근로자 근로 관리", grade: "A" },
                { item: "책임있는 원부자재 조달 정책", grade: "S" },
                { item: "협력사 및 공급망 관리", grade: "A+" }
            ],
            g: [
                { item: "윤리경영 정책", grade: "B+" },
                { item: "부패 및 불공정거래 방지 활동", grade: "S" },
                { item: "윤리준법 신고제도", grade: "A" },
                { item: "ESG 정보 공시", grade: "A", popup: true, panelId: 'pop03' },
                { item: "경영 안정성", grade: "A+" },
                { item: "주주권리", grade: "A" }
            ]
        },
        "2": {
            e: [
                { item: "환경경영체계", grade: "A" },
                { item: "환경 인허가 관리", grade: "B+" },
                { item: "온실가스 및 에너지 관리", grade: "B+" },
                { item: "온실가스 배출량 감축", grade: "B+", popup: true, panelId: 'pop01' },
                { item: "에너지 사용량 감축", grade: "B" },
                { item: "폐기물 관리", grade: "C" },
                { item: "용수 관리", grade: "S" },
                { item: "유해화학물질 관리", grade: "B" },
                { item: "대기오염물질 관리", grade: "A" },
                { item: "수질오염물질 관리", grade: "A+" },
                { item: "scope3 온실가스 배출량 산정 체계", grade: "A+" },
                { item: "잔류성 오염물질 관리", grade: "B" },
                { item: "분쟁광물 관리", grade: "B" },
                { item: "제품 내 유해물질 관리", grade: "B+" },
                { item: "오존층 관련 규제대상물질 관리", grade: "C" },
                { item: "수은 또는 수은 화합물 관리", grade: "B+" },
                { item: "잔류성오염물질 함유 기기 관리", grade: "B+" }
            ],
            s: [
                { item: "인권 관리", grade: "B" },
                { item: "고충 처리 제도", grade: "B+" },
                { item: "괴롭힘, 차별 금지", grade: "A" },
                { item: "근로조건", grade: "A" },
                { item: "복리후생", grade: "A" },
                { item: "강제노동 금지", grade: "B" },
                { item: "아동노동 금지", grade: "S" },
                { item: "노사관계 수준", grade: "S" },
                { item: "안전보건 관리체계", grade: "A+" },
                { item: "안전보건 관리활동", grade: "B", popup: true, panelId: 'pop02' },
                { item: "지역사회 공헌", grade: "A+" },
                { item: "외국인근로자 근로 관리", grade: "B" },
                { item: "협력사 및 공급망 관리", grade: "B" }
            ],
            g: [
                { item: "윤리경영 정책", grade: "S" },
                { item: "부패 및 불공정거래 방지 활동", grade: "A+" },
                { item: "윤리준법 신고제도", grade: "B" },
                { item: "ESG 정보 공시", grade: "A+", popup: true, panelId: 'pop03' },
                { item: "경영 안정성", grade: "B" },
                { item: "주주권리", grade: "B+" }
            ]
        },
        "3": {
            e: [
                { item: "환경경영체계", grade: "B+" },
                { item: "환경 인허가 관리", grade: "B" },
                { item: "온실가스 및 에너지 관리", grade: "B" },
                { item: "온실가스 배출량 감축", grade: "B+", popup: true, panelId: 'pop01' },
                { item: "에너지 사용량 감축", grade: "C" },
                { item: "폐기물 관리", grade: "C" },
                { item: "용수 관리", grade: "A" },
                { item: "유해화학물질 관리", grade: "B" },
                { item: "대기오염물질 관리", grade: "A" },
                { item: "수질오염물질 관리", grade: "B" },
                { item: "scope3 온실가스 배출량 산정 체계", grade: "B+" },
                { item: "잔류성 오염물질 관리", grade: "C" },
                { item: "동물실험 축소 및 대체", grade: "C" },
                { item: "생태계 교란 생물 반입/반출 관리", grade: "D" },
                { item: "해외 유전자원 관리", grade: "A+" },
                { item: "유전자변형생물체 관리", grade: "A" },
                { item: "멸종위기종 관리", grade: "D" }
            ],
            s: [
                { item: "인권 관리", grade: "A" },
                { item: "고충 처리 제도", grade: "B+" },
                { item: "괴롭힘, 차별 금지", grade: "B" },
                { item: "근로조건", grade: "C" },
                { item: "복리후생", grade: "S" },
                { item: "강제노동 금지", grade: "B" },
                { item: "아동노동 금지", grade: "A" },
                { item: "노사관계 수준", grade: "A+" },
                { item: "안전보건 관리체계", grade: "A+" },
                { item: "안전보건 관리활동", grade: "B", popup: true, panelId: 'pop02' },
                { item: "지역사회 공헌", grade: "A+" },
                { item: "외국인근로자 근로 관리", grade: "B+" }
            ],
            g: [
                { item: "윤리경영 정책", grade: "B+" },
                { item: "부패 및 불공정거래 방지 활동", grade: "B+" },
                { item: "윤리준법 신고제도", grade: "B+" },
                { item: "ESG 정보 공시", grade: "A", popup: true, panelId: 'pop03' },
                { item: "경영 안정성", grade: "B" },
                { item: "주주권리", grade: "B" }
            ]
        },
        "4": {
            e: [
                { item: "환경경영체계", grade: "B+" },
                { item: "환경 인허가 관리", grade: "B" },
                { item: "온실가스 및 에너지 관리", grade: "B" },
                { item: "온실가스 배출량 감축", grade: "B+", popup: true, panelId: 'pop01' },
                { item: "에너지 사용량 감축", grade: "C" },
                { item: "폐기물 관리", grade: "C" },
                { item: "용수 관리", grade: "A" },
                { item: "유해화학물질 관리", grade: "B" },
                { item: "대기오염물질 관리", grade: "A" },
                { item: "수질오염물질 관리", grade: "B" },
                { item: "scope3 온실가스 배출량 산정 체계", grade: "B+" },
                { item: "잔류성 오염물질 관리", grade: "C" }
            ],
            s: [
                { item: "인권 관리", grade: "A" },
                { item: "고충 처리 제도", grade: "C" },
                { item: "괴롭힘, 차별 금지", grade: "A" },
                { item: "근로조건", grade: "A+" },
                { item: "복리후생", grade: "A+" },
                { item: "강제노동 금지", grade: "B" },
                { item: "아동노동 금지", grade: "B" },
                { item: "노사관계 수준", grade: "B+" },
                { item: "안전보건 관리체계", grade: "C" },
                { item: "안전보건 관리활동", grade: "B+", popup: true, panelId: 'pop02' },
                { item: "지역사회 공헌", grade: "B+" },
                { item: "외국인근로자 근로 관리", grade: "A" },
                { item: "도급/용역/위탁 안전관리", grade: "C" },
                { item: "정보보호 관리체계", grade: "A+" },
                { item: "근로시간 준수", grade: "B" },
                { item: "개인정보 수집 동의", grade: "A+" }
            ],
            g: [
                { item: "윤리경영 정책", grade: "C" },
                { item: "부패 및 불공정거래 방지 활동", grade: "B+" },
                { item: "윤리준법 신고제도", grade: "A+" },
                { item: "ESG 정보 공시", grade: "D", popup: true, panelId: 'pop03' },
                { item: "경영 안정성", grade: "B+" },
                { item: "주주권리", grade: "B+" }
            ]
        }
    }

    return config;
}

function getCurrentSummaryGrades() {
    const config = getGate03SummaryGrades();
    const fragment = getFragment();
    const key = (fragment && config[fragment]) ? fragment : '1';
    return config[key] || null;
}

// E/S/G 요약 등급 데이터
function getGate03SummaryGrades() {
    return {
        "1": { e: "A+", s: "A+", g: "A+" },
        "2": { e: "B+",  s: "A",  g: "A" },
        "3": { e: "B", s: "A",  g: "B+"  },
        "4": { e: "B",  s: "B+", g: "B" }
    };
}

function getCurrentPopupDatas() {
    const config   = getGate03PopupDatas();
    const fragment = getFragment();
    const key      = (fragment && config[fragment]) ? fragment : "1";
    const data     = config[key];

    return { config, key, data };
}

// 팝업 데이터
function getGate03PopupDatas() {
    return {
        "1": {
            pop01: {
                d1: 0.123,
                d2: 0.115,
                d3: 0.107,
                d4: 90.3,
                d5: {
                    class: "ty1",
                    percent: 9.7
                },
                d6: "L4",
                d7: "(10점)"
            },
            pop02: {
                chkIdx: [1, 2, 3, 4, 5, 6]
            },
            pop03: {
                chkIdx: 4
            }
        },
        "2": {
            pop01: {
                d1: 0.176,
                d2: 0.199,
                d3: 0.184,
                d4: 98.0,
                d5: {
                    class: "ty1",
                    percent: 2.0
                },
                d6: "L2",
                d7: "(5점)"
            },
            pop02: {
                chkIdx: [1, 2, 4, 5, 6]
            },
            pop03: {
                chkIdx: 3
            }
        },
        "3": {
            pop01: {
                d1: 0.153,
                d2: 0.199,
                d3: 0.245,
                d4: 139.2,
                d5: {
                    class: "ty2",
                    percent: 39.2
                },
                d6: "L0",
                d7: "(0점)"
            },
            pop02: {
                chkIdx: [2, 3, 6]
            },
            pop03: {
                chkIdx: 2
            }
        },
        "4": {
            pop01: {
                d1: 0.153,
                d2: 0.199,
                d3: 0.245,
                d4: 139.2,
                d5: {
                    class: "ty2",
                    percent: 39.2
                },
                d6: "L0",
                d7: "(0점)"
            },
            pop02: {
                chkIdx: [0]
            },
            pop03: {
                chkIdx: 1
            }
        }
    };
}

/**
 * fragment(1~4)에 맞는 팝업 데이터 → pop01 / pop02 / pop03 DOM에 바인딩
 */
function bindPopupData() {
    const { data } = getCurrentPopupDatas();
    if (!data) return;

    Object.keys(data).forEach((panelId) => {
        const popupData = data[panelId];
        const panel     = document.getElementById(panelId);
        if (!panel || !popupData) return;

        if (panelId === "pop01") {
            bindPopup01(panel, popupData);
        } else if (panelId === "pop02") {
            bindPopup02(panel, popupData);
        } else if (panelId === "pop03") {
            bindPopup03(panel, popupData);
        }
    });
}

/* ===========================
   pop01: 수치 + 화살표 규칙
   =========================== */

function bindPopup01(panel, popupData) {
    // 숫자 포맷 (집약도 3자리 소수)
    const fmt3 = (v) =>
        (typeof v === "number" ? v.toFixed(3) : v);

    // 1) 진단 데이터 (집약도 3개) d1, d2, d3
    const valueSpans = panel.querySelectorAll(".info_box .info_li li .d1");
    if (valueSpans[0] && popupData.d1 != null) valueSpans[0].textContent = fmt3(popupData.d1);
    if (valueSpans[1] && popupData.d2 != null) valueSpans[1].textContent = fmt3(popupData.d2);
    if (valueSpans[2] && popupData.d3 != null) valueSpans[2].textContent = fmt3(popupData.d3);

    const grid = panel.querySelector(".info_grid");
    if (!grid) return;

    const blocks = grid.querySelectorAll("div");

    // 2) 총 온실가스 감축률 (d4)
    if (blocks[0]) {
        const emTotal = blocks[0].querySelector(".t2 em");
        if (emTotal && popupData.d4 != null) {
            emTotal.textContent =
                (typeof popupData.d4 === "number" ? popupData.d4.toFixed(1) : popupData.d4);
        }
    }

    // 3) 성과(집약도): d5.class + d5.percent (▲ / ▼ 규칙 적용)
    if (blocks[1] && popupData.d5) {
        const emPerf = blocks[1].querySelector(".t2 em");
        if (emPerf) {
            // 클래스 적용 (ty1 / ty2 등)
            if (popupData.d5.class) {
                emPerf.className = popupData.d5.class;
            }

            if (popupData.d5.percent != null) {
                const p    = popupData.d5.percent;
                const sign = p > 0 ? "▲ " : (p < 0 ? "▼ " : "");
                // 화살표 + 절대값, 소수 1자리
                emPerf.textContent = sign + Math.abs(p).toFixed(1);
            }
        }
    }

    // 4) 진단 점수: d6, d7
    if (blocks[2]) {
        const scoreEm   = blocks[2].querySelector(".t2.lg em");
        const scoreSpan = blocks[2].querySelector(".t2.lg span");

        if (scoreEm && popupData.d6 != null) {
            scoreEm.textContent = popupData.d6;
        }
        if (scoreSpan && popupData.d7 != null) {
            scoreSpan.textContent = popupData.d7;
        }
    }
}

/* ===========================
   pop02: 체크박스 선택 상태
   chkIdx: [0..n] (0기준 index)
   =========================== */

function bindPopup02(panel, popupData) {
    const chkIdxArr = popupData.chkIdx || [];
    const inputs = panel.querySelectorAll(".info_chk_li input[type='checkbox']");

    // 초기화
    inputs.forEach((input) => {
        input.checked = false;
    });

    chkIdxArr.forEach((idx) => {
        if (typeof idx !== "number") return;
        const input = inputs[idx];
        if (input) {
            input.checked = true;
        }
    });
}

/* ===========================
   pop03: 라디오 선택 상태
   chkIdx: number (0기준 index)
   =========================== */

function bindPopup03(panel, popupData) {
    const idx = popupData.chkIdx;
    const inputs = panel.querySelectorAll(".info_chk_li input[type='radio']");

    // 초기화
    inputs.forEach((input) => {
        input.checked = false;
    });

    if (typeof idx === "number" && inputs[idx]) {
        inputs[idx].checked = true;
    }
}