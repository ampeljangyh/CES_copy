document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // 기본 설정 (언어, 회사)
  // -----------------------------
  const bizScores = getBizRadarValues(currentCompany, language);

  radarValues = bizScores;

  const tabButtons = document.querySelectorAll(".grp_tab_box .grp_tab_item");
  const radarBiz   = document.querySelector(".radial_wrap.te_01"); // 기술 사업 역량(5각형)
  const radarTech  = document.querySelector(".radial_wrap.te_02"); // 기술 경쟁력(3각형)

  // ===============================
  // 공통: 코멘트 영역 업데이트
  // ===============================
  function setComment(text) {
    const commentEl = document.querySelector(".comm_box .desc p");
    if (!commentEl) return;
    commentEl.textContent = text || "";
  }

  // ===============================
  // 기술 사업 역량 데이터 / 뷰
  // ===============================
  function getBizCapabilityData(lang, company) {
    const korData = COMPANY_DATA_KOR[company];
    if (!korData) return null;

    const biz = korData.bizCapability;

    return {
      items: [
        "경영주 역량",
        "관리 능력",
        "기술 개발 능력",
        "제품화 역량",
        "수익 전망"
      ],
      grades: [
        biz.owner.grade,
        biz.management.grade,
        biz.techDevelopment.grade,
        biz.productization.grade,
        biz.profit.grade
      ]
    };
  }

  function getBizComment(lang, company, itemName) {
    const korData = COMPANY_DATA_KOR[company];
    const engData = COMPANY_DATA_ENG[company];
    return lang === "kor" ? korData.bizComments[itemName] || "" : engData.bizComments[itemName] || "";
  }

  function renderBizCapabilityView(lang, company) {
    const data = getBizCapabilityData(lang, company);
    if (!data) return;

    const itemList  = document.querySelector(".grp_btn_list .list_item:first-child ul");
    const gradeList = document.querySelector(".grp_btn_list .list_item:last-child ul");
    if (!itemList || !gradeList) return;

    // 항목 리스트 생성
    itemList.innerHTML = data.items
      .map((text, i) => `
        <li>
          <button type="button"
                  class="list_btn arrow"
                  data-index="${i}">
            <span>${text}</span>
          </button>
        </li>
      `)
      .join("");

    // 등급 리스트 생성
    gradeList.innerHTML = data.grades
      .map((g, i) => `
        <li>
          <div class="btn" data-index="${i}">
            <span>${g}</span>
          </div>
        </li>
      `)
      .join("");

    // 버튼 이벤트 바인딩
    bindBizRadialButtons(lang, company);
    bindBizItemListButtons(lang, company);

    // 초기 진입: 0번 항목 활성화
    setBizActiveByIndex(0, lang, company, data);
  }

  function setBizActiveByIndex(idx, lang, company, dataOpt) {
    const data = dataOpt || getBizCapabilityData(lang, company);
    if (!data) return;

    const radialButtons = document.querySelectorAll(
      ".radial_wrap.te_01 .radial_btn_list .radial_btn"
    );
    const itemButtons  = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
    const gradeButtons = document.querySelectorAll(".grp_btn_list .list_item:last-child .btn");

    // on 토글 동기화
    radialButtons.forEach((btn, i) => btn.classList.toggle("on", i === idx));
    itemButtons.forEach((btn, i)  => btn.classList.toggle("on", i === idx));
    gradeButtons.forEach((btn, i) => btn.classList.toggle("on", i === idx));

    // 코멘트 변경
    const itemName = data.items[idx];
    const comment  = getBizComment(lang, company, itemName);
    setComment(comment);

    // 오각형 레이더 전체 점수 갱신
    updateBizRadar(company, 'kor');
    
    // 상단 타이틀 / 뱃지 / 바차트 갱신
    const barData = getBizBarDetail(lang, company, idx);   // ← service.js에서 가져옴
    if (barData) {
      const titleEl = document.querySelector(".bar_grp_box_tit .tit");
      const badgeL  = document.querySelector(".badge_box .l");
      const badgeR  = document.querySelector(".badge_box .r");

      if (titleEl) titleEl.textContent = barData.title;          // 예: "경영주 역량"
      if (badgeL)  badgeL.textContent  = barData.grade;          // 예: "B"
      if (badgeR)  badgeR.textContent  = getGradeLabel(barData.grade); // 예: "(양호)"

      // 바 차트 실제 데이터 넣기
      updateSkillBarChart(barData.metrics);
    }
  }

  function bindBizRadialButtons(lang, company) {
    const buttons = document.querySelectorAll(
      ".radial_wrap.te_01 .radial_btn_list .radial_btn"
    );
    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        setBizActiveByIndex(i, lang, company);
      });
    });
  }

  function bindBizItemListButtons(lang, company) {
    const buttons = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        setBizActiveByIndex(i, lang, company);
      });
    });
  }

  // ===============================
  // 기술 경쟁력 데이터 / 뷰
  // ===============================
  function getTechCompetitivenessData(lang, company) {
    const korData = COMPANY_DATA_KOR[company];
    if (!korData) return null;

    const tech = korData.techCompetitiveness;

    return {
      items: [
        "기술 혁신성",
        "시장 현황",
        "제품 우위성"
      ],
      grades: [
        tech.innovation.grade,
        tech.market.grade,
        tech.productAdvantage.grade
      ]
    };
  }

  function getTechComment(lang, company, itemName) {
    const korData = COMPANY_DATA_KOR[company];
    if (!korData || !korData.techComments) return "";
    return korData.techComments[itemName] || "";
  }

  function renderTechCompetitivenessView(lang, company) {
    const data = getTechCompetitivenessData(lang, company);
    if (!data) return;

    const itemList  = document.querySelector(".grp_btn_list .list_item:first-child ul");
    const gradeList = document.querySelector(".grp_btn_list .list_item:last-child ul");
    if (!itemList || !gradeList) return;

    // 항목 리스트 생성
    itemList.innerHTML = data.items
      .map((text, i) => `
        <li>
          <button type="button"
                  class="list_btn arrow"
                  data-index="${i}">
            <span>${text}</span>
          </button>
        </li>
      `)
      .join("");

    // 등급 리스트 생성
    gradeList.innerHTML = data.grades
      .map((g, i) => `
        <li>
          <div class="btn" data-index="${i}">
            <span>${g}</span>
          </div>
        </li>
      `)
      .join("");

    // 버튼 이벤트 바인딩
    bindTechRadialButtons(lang, company);
    bindTechItemListButtons(lang, company);

    // 초기 진입: 0번 항목 활성화
    setTechActiveByIndex(0, lang, company, data);
  }

  function setTechActiveByIndex(idx, lang, company, dataOpt) {
    const data = dataOpt || getTechCompetitivenessData(lang, company);
    if (!data) return;

    const radialButtons = document.querySelectorAll(
      ".radial_wrap.te_02 .radial_btn_list .radial_btn"
    );
    const itemButtons  = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
    const gradeButtons = document.querySelectorAll(".grp_btn_list .list_item:last-child .btn");

    // on 토글 동기화
    radialButtons.forEach((btn, i) => btn.classList.toggle("on", i === idx));
    itemButtons.forEach((btn, i)  => btn.classList.toggle("on", i === idx));
    gradeButtons.forEach((btn, i) => btn.classList.toggle("on", i === idx));

    // 코멘트 변경
    const itemName = data.items[idx];
    const comment  = getTechComment(lang, company, itemName);
    setComment(comment);

    // 삼각형 레이더 갱신
    updateTechRadar(company, 'kor');
    
    // 상단 타이틀 / 뱃지 / 바차트 갱신
    const barData = getTechBarDetail(lang, company, idx);   // ← service.js에 추가한 함수
    if (barData) {
      const titleEl = document.querySelector(".bar_grp_box_tit .tit");
      const badgeL  = document.querySelector(".badge_box .l");
      const badgeR  = document.querySelector(".badge_box .r");

      if (titleEl) titleEl.textContent = barData.title;          // "기술 혁신성" 등
      if (badgeL)  badgeL.textContent  = barData.grade;
      if (badgeR)  badgeR.textContent  = getGradeLabel(barData.grade);

      updateSkillBarChart(barData.metrics);
    }
  }

  function bindTechRadialButtons(lang, company) {
    const buttons = document.querySelectorAll(
      ".radial_wrap.te_02 .radial_btn_list .radial_btn"
    );
    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        setTechActiveByIndex(i, lang, company);
      });
    });
  }

  function bindTechItemListButtons(lang, company) {
    const buttons = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        setTechActiveByIndex(i, lang, company);
      });
    });
  }

  // ===============================
  // 상단 탭 전환
  // ===============================
  function activateTopTab(index) {
    // 탭 on/off
    tabButtons.forEach(btn => btn.classList.remove("on"));
    tabButtons[index].classList.add("on");
    

    // 그래프 on/off
    [radarBiz, radarTech].forEach(el => el && el.classList.remove("on"));

    const itemList  = document.querySelector(".grp_btn_list .list_item:first-child ul");
    const gradeList = document.querySelector(".grp_btn_list .list_item:last-child ul");
    if (itemList)  itemList.innerHTML  = "";
    if (gradeList) gradeList.innerHTML = "";
    setComment("");

    if (index === 0) {
      // 기술 사업 역량
      if (radarBiz) radarBiz.classList.add("on");
      renderBizCapabilityView(language, currentCompany);
    } else if (index === 1) {
      // 기술 경쟁력
      if (radarTech) radarTech.classList.add("on");
      document.getElementById('abilityRadar02').style.height = '22.1425vw';
      renderTechCompetitivenessView(language, currentCompany);
    }
  }

  // 상단 탭 클릭 이벤트
  tabButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      activateTopTab(idx);
    });
  });

  // 기술사업역량 레이더 차트 갱신
  function updateBizRadar(company, language) {
    const scores = getBizRadarValues(company, language);

    if (window.abilityRadarChart) {
      window.abilityRadarChart.data.datasets[0].data = scores;
      window.abilityRadarChart.update();
    } else {
      // 혹시 차트가 아직 안 만들어졌으면, 그냥 global 값만 바꿔둔다.
      window.radarValues = scores;
    }
  }

  function updateTechRadar(company, language = 'kor') {
    const scores = getTechRadarValues(company, language);

    if (window.abilityRadarChart02) {    // 3각형 차트 인스턴스 이름 가정
      window.abilityRadarChart02.data.datasets[0].data = scores;
      window.abilityRadarChart02.update();
    }
  }

  // ===============================
  // 바 차트 그리기 / 업데이트
  // ===============================
  function updateSkillBarChart(metrics) {
    console.log(metrics);
    skillLabels = metrics.map(m => m.label);
    skillValues   = metrics.map(m => m.score);

    // 이미 chart가 생성되어 있을 때 (정상적으로)
    if (
      window.skillBarChart &&
      window.skillBarChart.data &&
      window.skillBarChart.data.datasets &&
      window.skillBarChart.data.datasets[0]
    ) {
      window.skillBarChart.data.labels = skillLabels;
      window.skillBarChart.data.datasets[0].data = skillValues;
      window.skillBarChart.update();
      return;
    }

    // ❗ 차트가 없거나 구조가 손상된 경우 → 새로 생성
    const canvas = document.getElementById("skillBarChart02");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
  }

  // ===============================
  // 초기 진입 시 기본 탭 활성화
  // ===============================
  let defaultIndex = 0;
  tabButtons.forEach((btn, idx) => {
    if (btn.classList.contains("on")) {
      defaultIndex = idx;
    }
  });
  activateTopTab(defaultIndex);

  // ===============================
  // 성장성 레이더 차트 (abilityRadar04)
  // ===============================
  function updateGrowthRadar(language, company) {
    const data = getGrowthRadarValues(language, company);
    if (!data) return;

    console.log(data);

    radarValuesCompany8 = data.myScores;
    radarValuesTop8   = data.topScores;

    // 차트 인스턴스가 이미 만들어져 있으면 즉시 업데이트
    if (window.growthRadarChart) {
      window.growthRadarChart.data.datasets[0].data = radarValuesCompany8;
      window.growthRadarChart.data.datasets[1].data = radarValuesTop8;
      window.growthRadarChart.update();
    }
  }

  // ===============================
  // 성장성 바 차트 (skillBarChart02)
  // ===============================
  function updateGrowthBarChart(detail) {
    const canvas = document.getElementById("skillBarChart02");
    if (!canvas || !detail) return;
    console.log("detail.metrics:",detail.metrics);

    const labels = detail.metrics.map(m => m.label);   // "4-7년차투자단계" ...
    const scores = detail.metrics.map(m => m.score);   // 100, 100, ...
    const amounts = detail.metrics.map(m => m.detail);   // "1.5단계, "0.3건", ...

    if (window.growthBarChart) {
      window.growthBarChart.data.labels = labels;
      window.growthBarChart.data.datasets[0].data = scores;
      window.growthBarChart.data.datasets[0].amounts = amounts;
      window.growthBarChart.update();
    }
  }

  // ===============================
  // 성장성 뷰 렌더링
  // ===============================
  function renderGrowthView(language, company) {
    const model = getGrowthModel(language, company);
    if (!model) return;

    // 1) 레이더 차트 값 세팅 / 업데이트 (그래프 버튼 텍스트는 그대로)
    updateGrowthRadar(language, company);

    // 2) 레이더 안 버튼(text는 그대로, on + data-index만 맞추기)
    const radialButtons = document.querySelectorAll(".radial_btn_list.ty_02 .radial_btn");
    model.factors.forEach((f, i) => {
      const btn = radialButtons[i];
      if (!btn) return;
      btn.dataset.index = i;
      btn.classList.toggle("on", i === 0);
    });

    // 3) 아래 항목/점수 리스트
    const itemListUl  = document.querySelector(".grp_btn_list.ty_02 .list_item:first-child ul");
    const scoreListUl = document.querySelector(".grp_btn_list.ty_02 .list_item:last-child ul");
    if (!itemListUl || !scoreListUl) return;

    itemListUl.innerHTML = model.factors
      .map((f, i) => `
        <li>
          <button type="button"
                  class="list_btn arrow ${i === 0 ? "on" : ""}"
                  data-index="${i}">
            <span>${f.name}</span>
          </button>
        </li>
      `)
      .join("");

    scoreListUl.innerHTML = model.factors
      .map((f, i) => `
        <li>
          <div class="btn ${i === 0 ? "on" : ""}" data-index="${i}">
            <span>${f.score}</span>
          </div>
        </li>
      `)
      .join("");

    // 4) 버튼 이벤트 바인딩
    bindGrowthButtons(language, company);

    // 5) 초기 선택 0번 반영 (타이틀/배지/바차트)
    setGrowthActiveByIndex(0, language, company);
  }

  function setGrowthActiveByIndex(idx, language, company) {
  const model = getGrowthModel(language, company);
  if (!model) return;

  const radialButtons = document.querySelectorAll(".radial_btn_list.ty_02 .radial_btn");
  const itemButtons   = document.querySelectorAll(".grp_btn_list.ty_02 .list_item:first-child .list_btn");
  const scoreButtons  = document.querySelectorAll(".grp_btn_list.ty_02 .list_item:last-child .btn");

  // 버튼 on 동기화
  radialButtons.forEach((btn, i) => btn.classList.toggle("on", i === idx));
  itemButtons.forEach((btn, i)   => btn.classList.toggle("on", i === idx));
  scoreButtons.forEach((btn, i)  => btn.classList.toggle("on", i === idx));

  const factor = model.factors[idx]; // { name, score, topCompanyScore }

  // 🔹 상단 "외형 지표 가시화" 타이틀 (그 큰 제목)
  const grpTitle = document.querySelector(".grp_lg_info_wrap .grp_tit_box span");
  if (grpTitle) grpTitle.textContent = factor.name;

  // 🔹 성장성 bar 박스 안에서만 타이틀/점수 찾기
  const growthCanvas = document.getElementById("skillBarChart02");
  const growthBarBox = growthCanvas ? growthCanvas.closest(".bar_grp_box") : null;

  if (growthBarBox) {
    const barTitle = growthBarBox.querySelector(".bar_grp_box_tit .tit");
    const badgeL   = growthBarBox.querySelector(".badge_box .l");
    const badgeR   = growthBarBox.querySelector(".badge_box .r");

    if (barTitle) barTitle.textContent = factor.name;   // 선택된 요인 이름
    if (badgeL)   badgeL.textContent   = factor.score;  // 혹은 model.totalScore 써도 됨
    if (badgeR)   badgeR.textContent   = "(점)";

    console.log("growth title:", barTitle && barTitle.textContent);
  }

  // 바차트 데이터 세팅 (이미 쓰던 거 그대로)
  const detail = getGrowthBarDetail(language, company, idx);
  if (detail) {
    updateGrowthBarChart(detail);
  }
}


  function bindGrowthButtons(language, company) {
    const radialButtons = document.querySelectorAll(".radial_btn_list.ty_02 .radial_btn");
    const itemButtons   = document.querySelectorAll(".grp_btn_list.ty_02 .list_item:first-child .list_btn");
    const scoreButtons  = document.querySelectorAll(".grp_btn_list.ty_02 .list_item:last-child .btn");

    radialButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index || 0);
        setGrowthActiveByIndex(idx, language, company);
      });
    });

    itemButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index || 0);
        setGrowthActiveByIndex(idx, language, company);
      });
    });

    scoreButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index || 0);
        setGrowthActiveByIndex(idx, language, company);
      });
    });
  }

  window.addEventListener('load', () => {
    renderGrowthView(language, currentCompany);
  });
});
