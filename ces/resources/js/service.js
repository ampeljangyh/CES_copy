// =========================
// 기술 사업 역량 데이터 가공
// =========================

/**
 * 기술사업역량(5각형)용 항목/등급/코멘트 데이터 반환
 * 화면에 직접 접근하지 않음 (DOM X)
 */
function getBizCapabilityData(language, company) {
  const engData = COMPANY_DATA_ENG?.[company];
  const korData = COMPANY_DATA_KOR?.[company];

  if (!korData || !engData) return null;

  let items = [];
  let order = [];
  let grades = [];

  if (language === "kor") {
    items = ["경영주 역량", "관리 능력", "기술 개발 능력", "제품화 역량", "수익 전망"];
    order = ["owner", "management", "techDevelopment", "productization", "profit"];
    grades = order.map(key => korData?.bizCapability?.[key]?.grade ?? "");
  } else if (language === "eng") {
    items = ["CEO Capabiity", "Management Capability", "Technology Development Capability", "Commercialization Capability", "Profit Outlook"];
    order = ["owner", "management", "techDevelopment", "productization", "profit"];
    grades = order.map(key => engData?.bizCapability?.[key]?.grade ?? "");
  }

  const comments =
    language === "kor"
      ? (korData?.bizComments ?? {}) : (engData?.bizComments ?? {});

  const totalGrade =
    language === "kor"
      ? (korData?.bizCapability?.grade ?? "") : (engData?.bizCapability?.grade ?? "");

  return { items, grades, comments, totalGrade };
}

function getBizComment(language, company, itemName) {
  const korData = COMPANY_DATA_KOR?.[company];
  const engData = COMPANY_DATA_ENG?.[company];

  const data = language === "kor" ? korData : engData;
  if (!data) return "";

  // 기존 회사들
  const map = language === "kor" ? data.bizComments : data.bizComments;
  return map?.[itemName] ?? "";
}

/**
 * 기술 경쟁력(3각형)용 데이터 (필요하면 확장)
 */
function getTechCompetitivenessData(language, company) {
  const korData = COMPANY_DATA_KOR?.[company];
  const engData = COMPANY_DATA_ENG?.[company];

  const data = (language === "kor") ? korData : (language === "eng") ? engData : null;
  if (!data) return null;

  const tech = data.techCompetitiveness;
  if (!tech) return null;

  return {
    totalGrade: tech.grade,
    items: (language === "kor")
      ? ["기술 혁신성", "시장 현황", "제품 우위성"]
      : ["Technology Innovation", "Market Status", "Product Superiority"],
    grades: [
      tech.innovation?.grade,
      tech.market?.grade,
      tech.productAdvantage?.grade
    ],
    comments: (language === "kor") ? (korData?.techComments || {}) : (engData?.techComments || {})
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
function getBizRadarValues(company, language) {
  let data;
  if (language === "kor") {
    data = COMPANY_DATA_KOR[company];
  } else if (language === "eng") {
    data = COMPANY_DATA_ENG[company];
  }

  // 데이터 자체가 없으면 그냥 0으로 채워서 리턴
  if (!data) {
    return [0, 0, 0, 0, 0];
  }

  if (data.bizCapability) {
    const biz = data.bizCapability;
    return [
      gradeToScore(biz.owner.grade),
      gradeToScore(biz.management.grade),
      gradeToScore(biz.techDevelopment.grade),
      gradeToScore(biz.productization.grade),
      gradeToScore(biz.profit.grade)
    ];
  }

  return [0, 0, 0, 0, 0];
}

// 4) 기술경쟁력(3각형) 레이더용 점수 배열 (나중에 쓸 거면)
function getTechRadarValues(company, language) {
  const data =
    language === "kor" ? COMPANY_DATA_KOR?.[company] :
    language === "eng" ? COMPANY_DATA_ENG?.[company] :
    null;

  if (!data) return [];

  const tech = data.techCompetitiveness;
  if (!tech) return [0, 0, 0];

  return [
    gradeToScore(tech.innovation?.grade),
    gradeToScore(tech.market?.grade),
    gradeToScore(tech.productAdvantage?.grade)
  ];
}

// =========================
// 바 차트용 상세 데이터
// =========================

// 메인 항목별(경영주 역량, 관리 능력, ...) 서브 항목 정의
// company 공통 구조 기준 (듀셀, 포트래이, 브이투브이 등)
const BIZ_BAR_CONFIG_KOR = [
  {
    key: "owner",
    title: "경영주 역량",
    fields: [
      { prop: "experience", label: "동업종 경험" },
      { prop: "techKnowledge", label: "기술지식" },
      { prop: "techManagement", label: "기술경영 관리 능력" }
    ]
  },
  {
    key: "management",
    title: "관리 능력",
    fields: [
      { prop: "techStaffManagement", label: "기술인력관리" },
      { prop: "executiveExpertise", label: "경영진 전문성" },
      { prop: "capitalParticipation", label: "경영진 자본참여도" }
    ]
  },
  {
    key: "techDevelopment",
    title: "기술 개발 능력",
    fields: [
      { prop: "rndOrg", label: "연구개발조직" },
      { prop: "rndInvestment", label: "연구개발투자비율" },
      { prop: "techExpertise", label: "기술인력 전문성" },
      { prop: "awards", label: "기술개발 및 수상(인증) 실적" },
      { prop: "ipStatus", label: "지식재산 보유현황" }
    ]
  },
  {
    key: "productization",
    title: "제품화 역량",
    fields: [
      { prop: "productionCapability", label: "생산역량" },
      { prop: "investmentAdequacy", label: "투자규모의 적정성" },
      { prop: "capitalRaising", label: "자본조달능력" }
    ]
  },
  {
    key: "profit",
    title: "수익 전망",
    fields: [
      { prop: "marketing", label: "마케팅 역량" },
      { prop: "salesStability", label: "판매처의 다양성 및 안정성" },
      { prop: "revenueCreation", label: "수익창출 역량" }
    ]
  }
];

const BIZ_BAR_CONFIG_ENG = [
  {
    key: "owner",
    title: "CEO Capabiity",
    fields: [
      { prop: "experience", label: "Experience in the Same Industry" },
      { prop: "techKnowledge", label: "Technical Knowledge" },
      { prop: "techManagement", label: "Technology Management / Skills Managment" }
    ]
  },
  {
    key: "management",
    title: "Management Capability",
    fields: [
      { prop: "techStaffManagement", label: "Technical Employees Management (Human Ressources)" },
      { prop: "executiveExpertise", label: "Executive Expertise" },
      { prop: "capitalParticipation", label: "Executive Capital Participation" }
    ]
  },
  {
    key: "techDevelopment",
    title: "Technology Development Capability",
    fields: [
      { prop: "rndOrg", label: "R&D Organization" },
      { prop: "rndInvestment", label: "R&D Investment Ratio" },
      { prop: "techExpertise", label: "Technical Employee Expertise" },
      { prop: "awards", label: "Technology Development & Award/Certification Achievments" },
      { prop: "ipStatus", label: "Intellectual Property Rights" }
    ]
  },
  {
    key: "productization",
    title: "Commercialization Capability",
    fields: [
      { prop: "productionCapability", label: "Production Capability" },
      { prop: "investmentAdequacy", label: "Appropriateness of Investment Scale" },
      { prop: "capitalRaising", label: "Capital Raising Ability" }
    ]
  },
  {
    key: "profit",
    title: "Profit Outlook",
    fields: [
      { prop: "marketing", label: "Marketing Capability" },
      { prop: "salesStability", label: "Diversity and Stability of Sales Channels/Outlets" },
      { prop: "revenueCreation", label: "Profit-Generation Capability" }
    ]
  }
];

// 기술경쟁력(3각형) 서브 항목 정의
const TECH_BAR_CONFIG_KOR = [
  {
    key: "innovation",
    title: "기술 혁신성",
    fields: [
      { prop: "differentiation", label: "기술의 차별성" },
      { prop: "imitationDifficulty", label: "모방의 난이도" },
      { prop: "completeness", label: "기술완성도" },
      { prop: "independence", label: "기술자립도" },
      { prop: "scalability", label: "기술확장성" }
    ]
  },
  {
    key: "market",
    title: "시장 현황",
    fields: [
      { prop: "marketSize", label: "시장규모" },
      { prop: "growth", label: "시장성장성" },
      { prop: "structure", label: "시장구조 및 특성" }
    ]
  },
  {
    key: "productAdvantage",
    title: "제품 우위성",
    fields: [
      { prop: "awareness", label: "인지도" },
      { prop: "marketSecuring", label: "시장확보 가능성" },
      { prop: "competitiveness", label: "경쟁제품과의 비교우위성" }
    ]
  }
];

const TECH_BAR_CONFIG_ENG = [
  {
    key: "innovation",
    title: "Technology Innovation",
    fields: [
      { prop: "differentiation", label: "Differenciation of Technology" },
      { prop: "imitationDifficulty", label: "Difficulty of Imitation" },
      { prop: "completeness", label: "Technologicy Completness" },
      { prop: "independence", label: "Technology Independence" },
      { prop: "scalability", label: "Technologicy Scalability" }
    ]
  },
  {
    key: "market",
    title: "Market Status",
    fields: [
      { prop: "marketSize", label: "Market Size" },
      { prop: "growth", label: "Market Growth Potential" },
      { prop: "structure", label: "Market Structure and Characteristics" }
    ]
  },
  {
    key: "productAdvantage",
    title: "Product Superiority",
    fields: [
      { prop: "awareness", label: "Awarness / Recognition" },
      { prop: "marketSecuring", label: "Market Acquisition Possibility" },
      { prop: "competitiveness", label: "Comparative Advantage Over Competing Products" }
    ]
  }
];

// 등급 → 한글 설명 (뱃지 오른쪽)
function getGradeLabel(grade) {
  if (!grade) return "";
  const g = grade.charAt(0); // A+, A, B+ 등에서 첫 글자만
  let map;
  if (language === 'kor') {
    map = {
      "A": "(우수)",
      "B": "(양호)",
      "C": "(보통)",
      "D": "(미흡)",
      "E": "(취약)"
    };
  } else if (language === 'eng') {
    map = {
      "A": "(Excellent)",
      "B": "(Good)",
      "C": "(Average)",
      "D": "(Insufficient)",
      "E": "(Weak)"
    };
  }
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

  if (!korData || !engData) return null;

  let biz;
  if (language === "kor") {
    biz = korData.bizCapability;
  } else if (language === "eng") {
    biz = engData.bizCapability;
  }
  if (!biz) return null;

  let conf;
  if (language === 'kor') {
    conf = BIZ_BAR_CONFIG_KOR[index];
  } else if (language === 'eng') {
    conf = BIZ_BAR_CONFIG_ENG[index];
  }
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

  if (!korData || !engData) return null;

  const techComp = language === "kor"
    ? korData.techCompetitiveness
    : engData.techCompetitiveness;

  if (!techComp) return null;

  let conf;
  if (language === 'kor') {
    conf = TECH_BAR_CONFIG_KOR[index];
  } else if (language === 'eng') {
    conf = TECH_BAR_CONFIG_ENG[index];
  }
  if (!conf) return null;

  const block = techComp[conf.key];
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
  if (language === 'kor') {
    data = COMPANY_DATA_KOR[company];
  } else if (language === 'eng') {
    data = COMPANY_DATA_ENG[company];
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
    { key: 'assets', label: '자산', group: 'bs' }, // 재무상태표
    { key: 'liabilities', label: '부채', group: 'bs' },
    { key: 'capital', label: '자본', group: 'bs' },
    { key: 'sales', label: '매출', group: 'pl' }, // 손익계산서
    { key: 'opProfit', label: '영업이익', group: 'pl' },
    { key: 'netProfit', label: '당기순이익', group: 'pl' }
  ],
  en: [
    { key: 'assets', label: 'assets', group: 'bs' },
    { key: 'liabilities', label: 'liabilities', group: 'bs' },
    { key: 'capital', label: 'capital', group: 'bs' },
    { key: 'sales', label: 'sales', group: 'pl' },
    { key: 'opProfit', label: 'operating profit', group: 'pl' },
    { key: 'netProfit', label: 'net profit', group: 'pl' }
  ]
};

const FIN_KEY_MAP = {
  assets: 'assets',
  liabilities: 'debt',
  capital: 'capital',
  sales: 'sales',
  opProfit: 'opIncome',
  netProfit: 'netIncome'
};

/**
 * mode: 'all' | 'bs' | 'pl'
 *  - all: 전체 (자산~당기순이익 6개 전부)
 *  - bs : 재무상태표 (자산/부채/자본)
 *  - pl : 손익계산서 (매출/영업이익/당기순이익)
 */
function getFinanceViewData(company, lang, mode) {
  const isEng = (lang === 'en' || lang === 'eng');
  const source = isEng ? COMPANY_DATA_ENG : COMPANY_DATA_KOR;
  const comp = JSON.parse(JSON.stringify(source[company]));
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
      const n = normalizeFinanceValue(raw);

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

      // 1) null / undefined → "-"
      if (raw == null) {
        return "-";
      }

      const text = String(raw).trim();

      // 2) "N/A" (대소문자 무관) → "-"
      if (text.toUpperCase() === "N/A") {
        return "-";
      }

      // 3) 숫자로 파싱 가능한 경우 → 숫자로 포맷해서 표시
      const n = normalizeFinanceValue(raw);
      if (n != null) {
        return n.toLocaleString();
      }

      // 4) 그 외(비공개, not disclosed, 기타 텍스트) → 원본 텍스트 그대로
      return text;
    });

    return {
      key: m.key,
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

  // 숫자는 그대로
  if (typeof raw === 'number') return raw;

  const t = String(raw).trim();

  // N/A (대소문자 무관) 는 차트용으로는 값 없음 처리
  if (t.toUpperCase() === 'N/A') {
    return null;
  }

  // 숫자 문자열이면 숫자로 변환
  const n = Number(t.replace(/,/g, ''));
  return Number.isNaN(n) ? null : n;
}
