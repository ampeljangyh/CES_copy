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

  const isASET = company === "에이에스이티";

  let items = [];
  let order = [];
  let grades = [];

  if (language === "kor") {
    if (isASET) {
      items = ["기업가 정신과 신뢰", "최고 경영자", "경영진"];
      order = ["entrepreneurshipTrust", "ceo", "executives"];
      grades = order.map(key => korData?.evaluation?.companyCapability?.[key]?.grade ?? "");
    } else {
      items = ["경영주 역량", "관리 능력", "기술 개발 능력", "제품화 역량", "수익 전망"];
      order = ["owner", "management", "techDevelopment", "productization", "profit"];
      grades = order.map(key => korData?.bizCapability?.[key]?.grade ?? "");
    }
  } else if (language === "eng") {
    if (isASET) {
      items = ["entrepreuneurial spirit and credibility", "CEO / Top management", "Executive team (Managers)"];
      order = ["entrepreneurshipTrust", "ceo", "executives"];
      grades = order.map(key => engData?.evaluation?.companyCapability?.[key]?.grade ?? "");
    } else {
      items = ["CEO capabiity", "Management capability", "Technology development capability", "commercialization capability", "Profit outlook"];
      order = ["owner", "management", "techDevelopment", "productization", "profit"];
      grades = order.map(key => engData?.bizCapability?.[key]?.grade ?? "");
    }
  }

  // ✅ ASET는 comments / evaluation.companyCapability.grade 를 써야 함
  const comments =
    language === "kor"
      ? (isASET ? (korData?.comments ?? {}) : (korData?.bizComments ?? {}))
      : (isASET ? (engData?.comments ?? {}) : (engData?.bizComments ?? {}));

  const totalGrade =
    language === "kor"
      ? (isASET ? (korData?.evaluation?.companyCapability?.grade ?? "") : (korData?.bizCapability?.grade ?? ""))
      : (isASET ? (engData?.evaluation?.companyCapability?.grade ?? "") : (engData?.bizCapability?.grade ?? ""));

  return { items, grades, comments, totalGrade };
}

const ASET_COMMENT_MAP = {
  "기업가 정신과 신뢰": "경영 역량",
  "최고 경영자": "경영 역량",
  "경영진": "경영 역량"
  // (원하면 여기서 더 세분화 가능)
};

function getBizComment(language, company, itemName) {
  const korData = COMPANY_DATA_KOR?.[company];
  const engData = COMPANY_DATA_ENG?.[company];
  const isASET = company === "에이에스이티";

  const data = language === "kor" ? korData : engData;
  if (!data) return "";

  if (isASET) {
    const key = ASET_COMMENT_MAP[itemName];
    return key ? (data.comments?.[key] ?? "") : "";
  }

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
  const isASET = company === "에이에스이티";

  const data = (language === "kor") ? korData : (language === "eng") ? engData : null;
  if (!data) return null;

  // ✅ ASET 전용: Step2 = 기술성(technology) 하위 5개로 구성
  if (isASET) {
    const tech = data.evaluation?.technology;
    if (!tech) return null;

    const itemsKor = ["개발 실적/수상", "개발 역량", "혁신성", "자립/확장성", "보호수준"];
    const itemsEng = ["Development & Awards", "Development Capability", "Innovation", "Independence & Expansion", "Protection"];
    const items = (language === "kor") ? itemsKor : itemsEng;

    // 5개 탭의 grade (각 덩어리의 grade)
    const grades = [
      tech.devStatus?.grade,
      tech.devCapability?.grade,
      tech.innovation?.grade,
      tech.independenceExpansion?.grade,
      tech.protection?.grade
    ];

    return {
      totalGrade: tech.grade ?? "",
      items,
      grades,
      // ASET 코멘트는 data.comments에 "기술성"으로 묶여 있으니
      comments: data.comments ?? {}   // 필요하면 view에서 "기술성" 키로 꺼내 쓰도록
    };
  }

  // ✅ 기존 회사들
  const tech = data.techCompetitiveness;
  if (!tech) return null;

  return {
    totalGrade: tech.grade,
    items: (language === "kor")
      ? ["기술 혁신성", "시장 현황", "제품 우위성"]
      : ["technology innovation", "market status", "Product superiority"],
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

  // 1) 기존 회사들: bizCapability가 있는 경우 (듀셀 등)
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

  // 2) 에이에스이티처럼 bizCapability가 없고 evaluation.companyCapability만 있는 경우
  const cc = data.evaluation && data.evaluation.companyCapability;
  if (cc) {
    // [경영주, 관리, 개발, 제품화, 수익] 자리에 최대한 비슷하게 매핑
    const grades = [
      cc.entrepreneurshipTrust && cc.entrepreneurshipTrust.grade, // 경영주
      cc.ceo && cc.ceo.grade,                                     // 관리 (대표이사)
      cc.executives && cc.executives.grade,                       // 개발/경영진
      cc.grade,                                                   // 제품화 (전체 기업역량 등급)
      cc.grade                                                    // 수익 (전체 기업역량 등급 재사용)
    ];

    return grades.map(g => gradeToScore(g));
  }

  // 3) 그래도 없으면 안전하게 0으로 채움
  return [0, 0, 0, 0, 0];
}

// 4) 기술경쟁력(3각형) 레이더용 점수 배열 (나중에 쓸 거면)
function getTechRadarValues(company, language) {
  const data =
    language === "kor" ? COMPANY_DATA_KOR?.[company] :
    language === "eng" ? COMPANY_DATA_ENG?.[company] :
    null;

  if (!data) return [];

  const isASET = company === "에이에스이티";

  // ✅ ASET: 4축(기업역량/기술성/시장성/사업성) 레이더
  if (isASET) {
    const e = data.evaluation || {};
    return [
      gradeToScore(e.companyCapability?.grade),
      gradeToScore(e.technology?.grade),
      gradeToScore(e.market?.grade),
      gradeToScore(e.business?.grade)
    ];
  }

  // ✅ 기존 회사: 3축(기술혁신성/시장현황/제품우위성)
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
    title: "CEO capabiity",
    fields: [
      { prop: "experience", label: "Experience in the same industry" },
      { prop: "techKnowledge", label: "Technical knowledge" },
      { prop: "techManagement", label: "Technology management / skills managment" }
    ]
  },
  {
    key: "management",
    title: "Management capability",
    fields: [
      { prop: "techStaffManagement", label: "Technical employees management (human ressources)" },
      { prop: "executiveExpertise", label: "Executive expertise" },
      { prop: "capitalParticipation", label: "Executive capital participation" }
    ]
  },
  {
    key: "techDevelopment",
    title: "Technology development capability",
    fields: [
      { prop: "rndOrg", label: "R&D organization" },
      { prop: "rndInvestment", label: "R&D investment ratio" },
      { prop: "techExpertise", label: "Technical employee expertise" },
      { prop: "awards", label: "Technology development & award/certification achievments" },
      { prop: "ipStatus", label: "intellectual property rights" }
    ]
  },
  {
    key: "productization",
    title: "commercialization capability",
    fields: [
      { prop: "productionCapability", label: "production capability" },
      { prop: "investmentAdequacy", label: "appropriateness of investment scale" },
      { prop: "capitalRaising", label: "capital raising ability" }
    ]
  },
  {
    key: "profit",
    title: "Profit outlook",
    fields: [
      { prop: "marketing", label: "Marketing capability" },
      { prop: "salesStability", label: "diversity and stability of sales channels/outlets" },
      { prop: "revenueCreation", label: "profit-generation capability" }
    ]
  }
];

// 에이에스이티 전용 기업역량 바차트 설정
const ASIT_BIZ_BAR_CONFIG_KOR = [
  {
    key: "entrepreneurshipTrust",
    title: "기업가 정신과 신뢰",
    fields: [
      { prop: "entrepreneurship", label: "기업가 정신" },
      { prop: "reliability", label: "신뢰성" }
    ]
  },
  {
    key: "ceo",
    title: "최고 경영자",
    fields: [
      { prop: "sameIndustryExperience", label: "동업종 경험" },
      { prop: "techKnowledge", label: "기술 지식" },
      { prop: "techUnderstanding", label: "기술 이해도" }
    ]
  },
  {
    key: "executives",
    title: "경영진",
    fields: [
      { prop: "executiveExpertise", label: "경영진 전문성" },
      { prop: "executiveCapitalParticipation", label: "경영진 자본 참여도" },
      { prop: "teamworkWithOwner", label: "경영주와의 팀워크" }
    ]
  }
];

const ASIT_BIZ_BAR_CONFIG_ENG = [
  {
    key: "entrepreneurshipTrust",
    title: "entrepreuneurial spirit and credibility",
    fields: [
      { prop: "entrepreneurship", label: "entrepreuneurial spirit" },
      { prop: "reliability", label: "reliability" }
    ]
  },
  {
    key: "ceo",
    title: "CEO / Top management",
    fields: [
      { prop: "sameIndustryExperience", label: "Experience in the same industry" },
      { prop: "techKnowledge", label: "Technical knowledge" },
      { prop: "techUnderstanding", label: "Technical understanding" }
    ]
  },
  {
    key: "executives",
    title: "Executive team (Managers)",
    fields: [
      { prop: "executiveExpertise", label: "Executive expertise" },
      { prop: "executiveCapitalParticipation", label: "executive captal participation" },
      { prop: "teamworkWithOwner", label: "teamwork with the managers/executives" }
    ]
  }
];

// 에이에스이티 전용: 기술성 바차트 구성
const ASIT_TECH_BAR_CONFIG_KOR = [
  {
    key: "devStatus",
    title: "기술 개발 현황",
    fields: [
      { prop: "devAndAwards", label: "기술개발 및 수상실적" },
      { prop: "ipHolding", label: "지식재산권 등 보유현황" },
      { prop: "rndInvestment", label: "연구개발 투자" }
    ]
  },
  {
    key: "devCapability",
    title: "기술 개발 능력",
    fields: [
      { prop: "devOrg", label: "기술개발 전담조직" },
      { prop: "techStaff", label: "기술인력" },
      { prop: "techStaffManagement", label: "기술인력 관리" }
    ]
  },
  {
    key: "innovation",
    title: "기술 혁신성",
    fields: [
      { prop: "itemInnovation", label: "아이템의 혁신성" },
      { prop: "lifecyclePosition", label: "기술의 수명주기상 위치" }
    ]
  },
  {
    key: "independenceExpansion",
    title: "기술자립도 및 확장성",
    fields: [
      { prop: "independence", label: "기술의 자립도" },
      { prop: "rippleEffect", label: "기술적 파급효과" },
      { prop: "completeness", label: "기술의 완성도" }
    ]
  },
  {
    key: "protection",
    title: "기술 보호성",
    fields: [
      { prop: "imitationDifficulty", label: "모방의 난이도" },
      { prop: "protectionLevel", label: "기술보호" }
    ]
  }
];

const ASIT_TECH_BAR_CONFIG_ENG = [
  {
    key: "devStatus",
    title: "status of technology development",
    fields: [
      { prop: "devAndAwards", label: "technology development and award acheivments" },
      { prop: "ipHolding", label: "status of intellectual property rights" },
      { prop: "rndInvestment", label: "R&D investment" }
    ]
  },
  {
    key: "devCapability",
    title: "Technology development capability",
    fields: [
      { prop: "devOrg", label: "dedicated R&D organization" },
      { prop: "techStaff", label: "technical employees" },
      { prop: "techStaffManagement", label: "technical employees managment" }
    ]
  },
  {
    key: "innovation",
    title: "technology innovation",
    fields: [
      { prop: "itemInnovation", label: "innovation of the item" },
      { prop: "lifecyclePosition", label: "position in the technology lifecycle" }
    ]
  },
  {
    key: "independenceExpansion",
    title: "technological independence and scalability",
    fields: [
      { prop: "independence", label: "degree of technological independence" },
      { prop: "rippleEffect", label: "technological ripple effect" },
      { prop: "completeness", label: "technological completness" }
    ]
  },
  {
    key: "protection",
    title: "technology pretectability / security",
    fields: [
      { prop: "imitationDifficulty", label: "difficulty of imitation" },
      { prop: "protectionLevel", label: "technlogy protection" }
    ]
  }
];

// 에이에스이티 전용: 시장성 바차트 구성
const ASIT_MARKET_BAR_CONFIG_KOR = [
  {
    key: "marketStatus",
    title: "시장 현황",
    fields: [
      { prop: "marketSize", label: "시장규모" },
      { prop: "marketGrowth", label: "시장 성장성" }
    ]
  },
  {
    key: "competition",
    title: "경쟁상황",
    fields: [
      { prop: "competitionStatus", label: "경쟁 상황" },
      { prop: "regulation", label: "법규제 등 제약/장려요인" },
      { prop: "entryEase", label: "시장 진입 용이성" }
    ]
  },
  {
    key: "productCompetitiveness",
    title: "제품 경쟁력",
    fields: [
      { prop: "comparativeAdvantage", label: "경쟁제품과 비교 우위성" }
    ]
  }
];

const ASIT_MARKET_BAR_CONFIG_ENG = [
  {
    key: "marketStatus",
    title: "market status",
    fields: [
      { prop: "marketSize", label: "market size" },
      { prop: "marketGrowth", label: "market growth potential" }
    ]
  },
  {
    key: "competition",
    title: "regulations and laws",
    fields: [
      { prop: "competitionStatus", label: "regulations and laws" },
      { prop: "regulation", label: "regulations and laws" },
      { prop: "entryEase", label: "ease of market entry" }
    ]
  },
  {
    key: "productCompetitiveness",
    title: "product competivness",
    fields: [
      { prop: "comparativeAdvantage", label: "comparative advantage over competing products" }
    ]
  }
];

// 에이에스이티 전용: 사업성 바차트 구성
const ASIT_BUSINESS_BAR_CONFIG_KOR = [
  {
    key: "capability",
    title: "사업능력",
    fields: [
      { prop: "productionPlan", label: "생산계획의 타당성" },
      { prop: "salesPlan", label: "판매계획의 타당성" },
      { prop: "salesSecuring", label: "판매처 확보여부" },
      { prop: "capitalRaising", label: "자본조달 능력" }
    ]
  },
  {
    key: "outlook",
    title: "향후 전망",
    fields: [
      { prop: "growthOutlook", label: "성장 전망" },
      { prop: "profitOutlook", label: "수익 전망" }
    ]
  }
];

const ASIT_BUSINESS_BAR_CONFIG_ENG = [
  {
    key: "capability",
    title: "business capability",
    fields: [
      { prop: "productionPlan", label: "feasibility pf production plan" },
      { prop: "salesPlan", label: "feasibility of sales plan" },
      { prop: "salesSecuring", label: "availability of secured sales channels/outlets" },
      { prop: "capitalRaising", label: "capital raising ability" }
    ]
  },
  {
    key: "outlook",
    title: "futur outlook",
    fields: [
      { prop: "growthOutlook", label: "growth outlook" },
      { prop: "profitOutlook", label: "profit outlook" }
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
    title: "technology innovation",
    fields: [
      { prop: "differentiation", label: "differenciation of technology" },
      { prop: "imitationDifficulty", label: "difficulty of imitation" },
      { prop: "completeness", label: "technologicy completness" },
      { prop: "independence", label: "technology independence" },
      { prop: "scalability", label: "technologicy scalability" }
    ]
  },
  {
    key: "market",
    title: "Market status",
    fields: [
      { prop: "marketSize", label: "Market size" },
      { prop: "growth", label: "Market growth potential" },
      { prop: "structure", label: "Market structure and characteristics" }
    ]
  },
  {
    key: "productAdvantage",
    title: "Product superiority",
    fields: [
      { prop: "awareness", label: "awarness / recognition" },
      { prop: "marketSecuring", label: "Market acquisition possibility" },
      { prop: "competitiveness", label: "comparative advantage over competing products" }
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

  // 에이에스이티: evaluation.companyCapability 세부 항목으로 바차트 구성
  if (company === "에이에스이티") {
    const evalData = korData.evaluation && korData.evaluation.companyCapability;
    if (!evalData) return null;

    let conf;
    if (language === 'kor') {
      conf = ASIT_BIZ_BAR_CONFIG_KOR[index];
    } else if (language === 'eng') {
      conf = ASIT_BIZ_BAR_CONFIG_ENG[index];
    }
    if (!conf) return null;

    const block = evalData[conf.key];   // entrepreneurshipTrust / ceo / executives
    if (!block) return null;

    const metrics = conf.fields.map(f => {
      const g = block[f.prop];          // 예: block.entrepreneurship
      return {
        label: f.label,                 // 예: "기업가 정신"
        grade: g,
        score: gradeToScore(g)
      };
    });

    return {
      title: conf.title,                // "기업가 정신과 신뢰" 같은 블록 이름
      grade: block.grade,               // 블록 전체 등급 (B, C 등)
      metrics                           // 세부 항목들
    };
  }

  // 기본 구조(듀셀 등) 처리
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

  // 에이에스이티: evaluation.technology 기반
  if (company === "에이에스이티") {
    const tech = korData.evaluation && korData.evaluation.technology;
    if (!tech) return null;

    let conf;
    if (language === 'kor') {
      conf = ASIT_TECH_BAR_CONFIG_KOR[index];
    } else if (language === 'eng') {
      conf = ASIT_TECH_BAR_CONFIG_ENG[index];
    }
    if (!conf) return null;

    const block = tech[conf.key];
    if (!block) return null;

    const metrics = conf.fields.map(f => {
      const g = block[f.prop];
      return {
        label: f.label,
        score: gradeToScore(g),
        detail: ""
      };
    });

    return {
      title: conf.title,
      grade: block.grade,
      metrics
    };
  }

  // 기존 회사들: techCompetitiveness + TECH_BAR_CONFIG 그대로 사용
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

function getMarketBarDetail(language, company, index) {
  const korData = COMPANY_DATA_KOR[company];
  if (company !== "에이에스이티" || !korData || !korData.evaluation) return null;

  const market = korData.evaluation.market;
  if (!market) return null;

  let conf;
  if (language === 'kor') {
    conf = ASIT_MARKET_BAR_CONFIG_KOR[index];
  } else if (language === 'eng') {
    conf = ASIT_MARKET_BAR_CONFIG_ENG[index];
  }
  if (!conf) return null;

  const block = market[conf.key];
  if (!block) return null;

  const metrics = conf.fields.map(f => {
    const g = block[f.prop];
    return {
      label: f.label,
      score: gradeToScore(g),
      detail: ""
    };
  });

  return {
    title: conf.title,
    grade: block.grade,
    metrics
  };
}

function getBusinessBarDetail(language, company, index) {
  const korData = COMPANY_DATA_KOR[company];
  if (company !== "에이에스이티" || !korData || !korData.evaluation) return null;

  const biz = korData.evaluation.business;
  if (!biz) return null;

  let conf;
  if (language === 'kor') {
    conf = ASIT_BUSINESS_BAR_CONFIG_KOR[index];
  } else if (language === 'eng') {
    conf = ASIT_BUSINESS_BAR_CONFIG_ENG[index];
  }
  if (!conf) return null;

  const block = biz[conf.key];
  if (!block) return null;

  const metrics = conf.fields.map(f => {
    const g = block[f.prop];
    return {
      label: f.label,
      score: gradeToScore(g),
      detail: ""
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
