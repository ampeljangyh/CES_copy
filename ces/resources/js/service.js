// =========================
// 기술 사업 역량 데이터 가공
// =========================

/**
 * 기술사업역량(5각형)용 항목/등급/코멘트 데이터 반환
 * 화면에 직접 접근하지 않음 (DOM X)
 */
function getBizCapabilityData(language, company) {
  const engData = COMPANY_DATA_ENG[company];
  const korData = COMPANY_DATA_KOR[company];
  
  if (!engData) return null;
  if (!korData) return null;

  let items = [];
  let order = [];
  let grades = [];

  if (language === "kor") {
    if (company === "에이에스이티") {
      // 회사별 특이 구조 있으면 여기서 분기
      items = ["기업가 정신과 신뢰", "최고 경영자", "경영진"];
      order = ["entrepreneurshipTrust", "ceo", "executives"];
      grades = order.map(key => korData.evaluation.companyCapability[key].grade);
    } else {
      // 기본 구조 (듀셀 등)
      items = ["경영주 역량", "관리 능력", "기술 개발 능력", "제품화 역량", "수익 전망"];
      order = ["owner", "management", "techDevelopment", "productization", "profit"];
      grades = order.map(key => korData.bizCapability[key].grade);
    }
  } else if (language === "eng") {
    if (company === "에이에스이티") {
      // 회사별 특이 구조 있으면 여기서 분기
      items = ["기업가 정신과 신뢰", "최고 경영자", "경영진"];
      order = ["entrepreneurshipTrust", "ceo", "executives"];
      grades = order.map(key => engData.evaluation.companyCapability[key].grade);
    } else {
      // 기본 구조 (듀셀 등)
      items = ["경영주 역량", "관리 능력", "기술 개발 능력", "제품화 역량", "수익 전망"];
      order = ["owner", "management", "techDevelopment", "productization", "profit"];
      grades = order.map(key => engData.bizCapability[key].grade);
    }
  }

  return {
    items,          // ["경영주 역량", ...]
    grades,         // ["B", "B+", ...]
    comments: language === "kor" ? korData.bizComments || {} : engData.bizComments || {},   // { "경영주 역량": "...", ... }
    totalGrade: language === "kor" ? korData.bizCapability.grade || {} : engData.bizCapability.grade || {} // 전체 등급 (C, B+ 등)
  };
}

/**
 * 항목 이름으로 코멘트 가져오기
 */
function getBizComment(language, company, itemName) {
  const korData = COMPANY_DATA_KOR[company];
  const engData = COMPANY_DATA_ENG[company];

  if (language === "kor") {
    if (!korData || !korData.bizComments) return "";
    return korData.bizComments[itemName] || "";
  } else if (language === "eng") {
    if (!engData || !engData.bizComments) return "";
    return engData.bizComments[itemName] || "";
  }
}

/**
 * 기술 경쟁력(3각형)용 데이터 (필요하면 확장)
 */
function getTechCompetitivenessData(language, company) {
  const korData = COMPANY_DATA_KOR[company];
  const engData = COMPANY_DATA_ENG[company];
  let tech;

  if (language === "kor") {
    if (!korData) return null;
    tech = korData.techCompetitiveness;
  } else if (language === "eng") {
    if (!engData) return null;
    tech = engData.techCompetitiveness;
  }
  

  return {
    totalGrade: tech.grade,
    items: ["기술 혁신성", "시장 현황", "제품 우위성"],
    grades: [
      tech.innovation.grade,
      tech.market.grade,
      tech.productAdvantage.grade
    ],
    comments: language === "kor" ? korData.techComments || {} : engData.techComments || {}
  };
}

// 1) 등급 → 점수 매핑
const GRADE_MAP = {
  "A+": 100,
  "A": 90,
  "B+": 70,
  "B": 70,
  "C+": 60,
  "C": 50,
  "D+": 40,
  "D": 30,
  "E+": 20,
  "E": 10,
  null: 0
};

// 2) 등급을 숫자 점수로 변환
function gradeToScore(grade) {
  return GRADE_MAP[grade] ?? 0;
}

// 3) 기술사업역량(5각형) 레이더용 점수 배열 가져오기
//    language는 일단 'kor'만 쓴다고 보고 만듦
function getBizRadarValues(company, language) {
  let data;
  if (language === "kor") {
    data = COMPANY_DATA_KOR[company];
  } else if ( language === "eng") {
    data = COMPANY_DATA_ENG[company];
  }
  
  const biz  = data.bizCapability;

  // [경영주, 관리, 개발, 제품화, 수익] 순서
  return [
    gradeToScore(biz.owner.grade),
    gradeToScore(biz.management.grade),
    gradeToScore(biz.techDevelopment.grade),
    gradeToScore(biz.productization.grade),
    gradeToScore(biz.profit.grade)
  ];
}

// 4) 기술경쟁력(3각형) 레이더용 점수 배열 (나중에 쓸 거면)
function getTechRadarValues(company, language) {
  let data;
  if (language === "kor") {
    data = COMPANY_DATA_KOR[company];
  } else if ( language === "eng") {
    data = COMPANY_DATA_ENG[company];
  }

  const tech = data.techCompetitiveness;

  // [기술혁신성, 시장현황, 제품우위성]
  return [
    gradeToScore(tech.innovation.grade),
    gradeToScore(tech.market.grade),
    gradeToScore(tech.productAdvantage.grade)
  ];
}

// =========================
// 바 차트용 상세 데이터
// =========================

// 메인 항목별(경영주 역량, 관리 능력, ...) 서브 항목 정의
// company 공통 구조 기준 (듀셀, 포트래이, 브이투브이 등)
const BIZ_BAR_CONFIG = [
  {
    key: "owner",
    title: "경영주 역량",
    fields: [
      { prop: "experience",     label: "동업종 경험" },
      { prop: "techKnowledge",  label: "기술지식" },
      { prop: "techManagement", label: "기술경영 관리 능력" }
    ]
  },
  {
    key: "management",
    title: "관리 능력",
    fields: [
      { prop: "techStaffManagement", label: "기술인력관리" },
      { prop: "executiveExpertise",  label: "경영진 전문성" },
      { prop: "capitalParticipation",label: "경영진 자본참여도" }
    ]
  },
  {
    key: "techDevelopment",
    title: "기술 개발 능력",
    fields: [
      { prop: "rndOrg",        label: "연구개발조직" },
      { prop: "rndInvestment", label: "연구개발투자비율" },
      { prop: "techExpertise", label: "기술인력 전문성" },
      { prop: "awards",        label: "기술개발 및 수상(인증) 실적" },
      { prop: "ipStatus",      label: "지식재산 보유현황" }
    ]
  },
  {
    key: "productization",
    title: "제품화 역량",
    fields: [
      { prop: "productionCapability", label: "생산역량" },
      { prop: "investmentAdequacy",   label: "투자규모의 적정성" },
      { prop: "capitalRaising",       label: "자본조달능력" }
    ]
  },
  {
    key: "profit",
    title: "수익 전망",
    fields: [
      { prop: "marketing",     label: "마케팅 역량" },
      { prop: "salesStability",label: "판매처의 다양성 및 안정성" },
      { prop: "revenueCreation",label: "수익창출 역량" }
    ]
  }
];

// 기술경쟁력(3각형) 서브 항목 정의
const TECH_BAR_CONFIG = [
  {
    key: "innovation",
    title: "기술 혁신성",
    fields: [
      { prop: "differentiation",     label: "기술의 차별성" },
      { prop: "imitationDifficulty", label: "모방의 난이도" },
      { prop: "completeness",        label: "기술완성도" },
      { prop: "independence",        label: "기술자립도" },
      { prop: "scalability",         label: "기술확장성" }
    ]
  },
  {
    key: "market",
    title: "시장 현황",
    fields: [
      { prop: "marketSize", label: "시장규모" },
      { prop: "growth",     label: "시장성장성" },
      { prop: "structure",  label: "시장구조 및 특성" }
    ]
  },
  {
    key: "productAdvantage",
    title: "제품 우위성",
    fields: [
      { prop: "awareness",       label: "인지도" },
      { prop: "marketSecuring",  label: "시장확보 가능성" },
      { prop: "competitiveness", label: "경쟁제품과의 비교우위성" }
    ]
  }
];

// 등급 → 한글 설명 (뱃지 오른쪽)
function getGradeLabel(grade) {
  if (!grade) return "";
  const g = grade.charAt(0); // A+, A, B+ 등에서 첫 글자만
  const map = {
    "A": "(우수)",
    "B": "(양호)",
    "C": "(보통)",
    "D": "(미흡)",
    "E": "(취약)"
  };
  return map[g] || "";
}

/**
 * 기술사업역량 바차트용 상세 데이터
 * @param {string} language
 * @param {string} company
 * @param {number} index - 0:경영주, 1:관리, 2:개발, 3:제품화, 4:수익
 * @returns { title, grade, metrics:[{label, grade, score}] }
 */
function getBizBarDetail(language, company, index) {
  const korData = COMPANY_DATA_KOR[company];
  const engData = COMPANY_DATA_ENG[company];

  if (!korData) return null;
  if (!engData) return null;

  let biz;

  if (language === "kor") {
    biz = korData.bizCapability;
  } else if (language === "eng") {
    biz = engData.bizCapability;
  }

  const conf = BIZ_BAR_CONFIG[index];
  if (!conf) return null;

  const block = biz[conf.key];
  if (!block) return null;

  const metrics = conf.fields.map(f => {
    const g = block[f.prop];         // ex) biz.owner.experience
    return {
      label: f.label,
      grade: g,
      score: gradeToScore(g)
    };
  });

  return {
    title: conf.title,
    grade: block.grade,   // 해당 블록의 종합 등급
    metrics               // 서브 항목들
  };
}

/**
 * 기술경쟁력 바차트용 상세 데이터
 */
function getTechBarDetail(language, company, index) {
  const korData = COMPANY_DATA_KOR[company];
  const engData = COMPANY_DATA_ENG[company];
  
  if (!korData) return null;
  if (!engData) return null;

  let tech;

  if (language === "kor") {
    tech = korData.techCompetitiveness;
  } else if (language === "eng") {
    tech = engData.techCompetitiveness;
  }

  const conf = TECH_BAR_CONFIG[index];
  if (!conf) return null;

  const block = tech[conf.key];
  if (!block) return null;

  const metrics = conf.fields.map(f => {
    const g = block[f.prop];
    return {
      label: f.label,
      grade: g,
      score: gradeToScore(g)
    };
  });

  return {
    title: conf.title,
    grade: block.grade,
    metrics
  };
}

// =========================
// 성장성(모형 결과) 데이터
// =========================

// 1) 성장성 레이더용 값
function getGrowthRadarValues(language, company) {
  let data;
  if (language === 'kor') {
    data = COMPANY_DATA_KOR[company];
  } else if (language === 'eng') {
    data = COMPANY_DATA_ENG[company];
  }
  if (!data || !data.modelResult) return null;

  const factors = data.modelResult.factors || [];

  return {
    labels: factors.map(f => f.name),          // ["추가 투자금 유치", ...]
    myScores: factors.map(f => f.score),       // 당사 점수
    topScores: factors.map(f => f.topCompanyScore) // 상위기업 점수
  };
}

// 2) 성장성 전체 모델(리스트용)
function getGrowthModel(language, company) {
  let data;
  if(language === 'kor') {
    data = COMPANY_DATA_KOR[company];
  } else if (language === 'eng') {
    data = COMPANY_DATA_ENG[company];
    console.log("getGrowthModel : ", data);
  }
  if (!data || !data.modelResult) return null;
  return data.modelResult;   // { totalScore, factors, barScores }
}

// 3) 성장성 바차트용 상세 (barScores 연결)
function getGrowthBarDetail(language, company, idx) {
  const model = getGrowthModel(language, company);
  if (!model) return null;

  const factor = model.factors[idx];
  if (!factor) return null;

  // barScores에서 key 매칭
  const metrics = (model.barScores || [])
    .filter(b => b.key === factor.name)
    .map(b => ({
      label: b.label,
      score: b.score,
      detail: b.detail
    }));

  return {
    title: factor.name,
    score: factor.score,
    metrics
  };
}

/*****************************************
 * 항목 정의 (라벨 + 어떤 탭에 속하는지)
 *****************************************/
const FIN_METRIC_DEF = {
  kr: [
    { key:'assets',      label:'자산',       group:'bs' }, // 재무상태표
    { key:'liabilities', label:'부채',       group:'bs' },
    { key:'capital',     label:'자본',       group:'bs' },
    { key:'sales',       label:'매출',       group:'pl' }, // 손익계산서
    { key:'opProfit',    label:'영업이익',   group:'pl' },
    { key:'netProfit',   label:'당기순이익', group:'pl' }
  ],
  en: [
    { key:'assets',      label:'assets',           group:'bs' },
    { key:'liabilities', label:'liabilities',      group:'bs' },
    { key:'capital',     label:'capital',          group:'bs' },
    { key:'sales',       label:'sales',            group:'pl' },
    { key:'opProfit',    label:'operating profit', group:'pl' },
    { key:'netProfit',   label:'net profit',       group:'pl' }
  ]
};

const FIN_KEY_MAP = {
  assets:      'assets',
  liabilities: 'debt',
  capital:     'capital',
  sales:       'sales',
  opProfit:    'opIncome',
  netProfit:   'netIncome'
};

/**
 * mode: 'all' | 'bs' | 'pl'
 *  - all: 전체 (자산~당기순이익 6개 전부)
 *  - bs : 재무상태표 (자산/부채/자본)
 *  - pl : 손익계산서 (매출/영업이익/당기순이익)
 */
function getFinanceViewData(company, lang, mode) {
  const isEng   = (lang === 'en' || lang === 'eng');
  const source  = isEng ? COMPANY_DATA_ENG : COMPANY_DATA_KOR;
  const comp    = JSON.parse(JSON.stringify(source[company]));
  if (!comp || !comp.finance) return null;

  // "2022","2023","2024" → [2024,2023,2022] 정렬
  const years = Object.keys(comp.finance)
    .map(y => Number(y))
    .sort((a, b) => b - a);

  const langKey = isEng ? 'en' : 'kr';
  const defList = FIN_METRIC_DEF[langKey];

  // 탭별 항목 필터링
  const metrics = defList.filter(d => {
    if (mode === 'bs') return d.group === 'bs';
    if (mode === 'pl') return d.group === 'pl';
    return true; // all
  });

  const labels = metrics.map(d => d.label);

  // 차트용 숫자 데이터
  const chartValuesByYear = {};
  years.forEach(year => {
    const yearData = comp.finance[String(year)] || {};

    chartValuesByYear[year] = metrics.map(m => {
      const srcKey = FIN_KEY_MAP[m.key];
      const raw = yearData[srcKey];
      const n   = normalizeFinanceValue(raw);

      // 비공개/null이면 막대는 0으로 처리
      return (n === null ? 0 : n);
    });
  });

  // 표용 문자열 데이터
  const tableRows = metrics.map(m => {
    const srcKey = FIN_KEY_MAP[m.key];

    const values = years.map(year => {
      const yearData = comp.finance[String(year)] || {};
      const raw = yearData[srcKey];
      const n   = normalizeFinanceValue(raw);

      if (n == null) {
        // 숫자 못 뽑는 애들은 전부 비공개 / not disclosed로 통일
        return langKey === 'kr' ? '비공개' : 'not disclosed';
      }

      return n.toLocaleString();
    });

    return {
      key:   m.key,
      group: m.group,
      label: m.label,
      values
    };
  });


  // 단위 라벨은 data.js에 없으니, 필요하면 company별/언어별로 추가 정의하거나 공통 문자열로 고정
  const unitLabel = langKey === 'kr' ? '(단위:억 원)' : '(USD, Million)';

  return { years, labels, chartValuesByYear, tableRows, unitLabel };
}

// 다른 스크립트에서 쓸 수 있게 전역에 노출
window.getFinanceViewData = getFinanceViewData;

function normalizeFinanceValue(raw) {
  if (raw == null) return null; // null / undefined

  if (typeof raw === 'string') {
    const t = raw.trim().toLowerCase();

    // 비공개 계열은 전부 null 취급
    if (t === '비공개' || t === 'not disclosed' || t === '-') {
      return null;
    }

    // 숫자 문자열이면 숫자로 변환
    const n = Number(raw.replace(/,/g, ''));
    return Number.isNaN(n) ? null : n;
  }

  if (typeof raw === 'number') return raw;

  return null;
}
