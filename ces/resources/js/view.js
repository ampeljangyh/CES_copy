document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // 기본 설정 (언어, 회사)
  // -----------------------------
  const isAsit = (typeof currentCompany !== "undefined" && currentCompany === "에이에스이티");

  const bizScores = getBizRadarValues(currentCompany, language);

  radarValues = bizScores;

  const tabButtons = document.querySelectorAll(".grp_tab_box .grp_tab_item");
  const radarBiz   = document.querySelector(".radial_wrap.te_01"); // 기술 사업 역량(5각형)
  const radarTech  = document.querySelector(".radial_wrap.te_02"); // 기술 경쟁력(3각형)
  const radarBiz2  = document.querySelector(".radial_wrap.te_03");

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
    const engData = COMPANY_DATA_ENG[company];
    if (!korData) return null;
    if (!engData) return null;

    let biz;

    if (lang === 'kor') {
      biz = korData.bizCapability;
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
    } else if (lang === 'eng') {
      biz = engData.bizCapability;
      return {
        items: [
          "CEO Capabiity",
          "Management Capability",
          "Technology Development Capability",
          "Commercialization Capability",
          "Profit Outlook"
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
    updateBizRadar(company, lang);
    
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
    const engData = COMPANY_DATA_ENG[company];
    if (!korData) return null;
    if (!engData) return null;

    let tech;

    if (lang === 'kor') {
      tech = korData.techCompetitiveness;
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
    } else if (lang === 'eng') {
      tech = engData.techCompetitiveness;
      return {
        items: [
          "technology innovation",
          "market status",
          "Product superiority"
        ],
        grades: [
          tech.innovation.grade,
          tech.market.grade,
          tech.productAdvantage.grade
        ]
      };
    }  
  }

  function getTechComment(lang, company, itemName) {
    const korData = COMPANY_DATA_KOR[company];
    const engData = COMPANY_DATA_ENG[company];
    if (!korData || !korData.techComments) return "";
    if (!engData || !engData.techComments) return "";
    return lang === 'kor' ? korData.techComments[itemName] || "" : engData.techComments[itemName] || "";
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
  // 에이에스이티 전용 데이터/뷰
  // ===============================

  // 5각형 레이더 값 세팅
  function setRadar5Data(values) {
    if (window.abilityRadarChart) {
      window.abilityRadarChart.data.datasets[0].data = values;
      window.abilityRadarChart.update();
    } else {
      // HTML 쪽에서 초기 그릴 때 참조하는 전역값
      window.radarValues = values;
    }
  }

  // 3각형 레이더 값 세팅
  function setRadar3Data(values) {
    if (window.abilityRadarChart02) {
      window.abilityRadarChart02.data.datasets[0].data = values;
      window.abilityRadarChart02.update();
    } else {
      // HTML 스크립트에서 쓰는 전역
      window.radarValues02 = values;
    }
  }

  // 사업성 2-Bar 그래프 값 세팅
  function setBiz2BarData(values) {
    if (window.abilityBarChart03) {
      window.abilityBarChart03.data.datasets[0].data = values;
      window.abilityBarChart03.update();
    } else {
      window.barValues03 = values;
    }
  }

    // ASIT: 기업역량 탭용 상단 타이틀 / 뱃지 / barData 기반 막대 그래프
  function updateAsitCompanyHeaderAndBar(idx) {
    const barData = getBizBarDetail(language, currentCompany, idx);
    if (!barData) return;

    const titleEl = document.querySelector(".bar_grp_box_tit .tit");
    const badgeL  = document.querySelector(".badge_box .l");
    const badgeR  = document.querySelector(".badge_box .r");

    if (titleEl) titleEl.textContent = barData.title;             // 예: "기업가 정신과 신뢰"
    if (badgeL)  badgeL.textContent  = barData.grade;             // 예: "B"
    if (badgeR)  badgeR.textContent  = getGradeLabel(barData.grade); // "(양호)"

    // 여기서 metrics는 service.js에서 만든 세부 항목들
    updateSkillBarChart(barData.metrics);
  }

  // 기술성 탭: service.js의 getTechBarDetail 사용
  function updateAsitTechHeaderAndBar(idx) {
    const barData = getTechBarDetail(language, currentCompany, idx);
    if (!barData) return;

    const titleEl = document.querySelector(".bar_grp_box_tit .tit");
    const badgeL  = document.querySelector(".badge_box .l");
    const badgeR  = document.querySelector(".badge_box .r");

    if (titleEl) titleEl.textContent = barData.title;
    if (badgeL)  badgeL.textContent  = barData.grade;
    if (badgeR)  badgeR.textContent  = getGradeLabel(barData.grade);

    updateSkillBarChart(barData.metrics);
  }

  // 시장성 탭: getMarketBarDetail 사용
  function updateAsitMarketHeaderAndBar(idx) {
    const barData = getMarketBarDetail(language, currentCompany, idx);
    if (!barData) return;

    const titleEl = document.querySelector(".bar_grp_box_tit .tit");
    const badgeL  = document.querySelector(".badge_box .l");
    const badgeR  = document.querySelector(".badge_box .r");

    if (titleEl) titleEl.textContent = barData.title;
    if (badgeL)  badgeL.textContent  = barData.grade;
    if (badgeR)  badgeR.textContent  = getGradeLabel(barData.grade);

    updateSkillBarChart(barData.metrics);
  }

  // 사업성 탭: getBusinessBarDetail 사용
  function updateAsitBusinessHeaderAndBar(idx) {
    const barData = getBusinessBarDetail(language, currentCompany, idx);
    if (!barData) return;

    const titleEl = document.querySelector(".bar_grp_box_tit .tit");
    const badgeL  = document.querySelector(".badge_box .l");
    const badgeR  = document.querySelector(".badge_box .r");

    if (titleEl) titleEl.textContent = barData.title;
    if (badgeL)  badgeL.textContent  = barData.grade;
    if (badgeR)  badgeR.textContent  = getGradeLabel(barData.grade);

    updateSkillBarChart(barData.metrics);
  }

    // 리스트/등급 공통 렌더링 (선택 인덱스 콜백 추가)
  function renderAsitListAndGrades(items, grades, onChangeIndex) {
    const itemList  = document.querySelector(".grp_btn_list .list_item:first-child ul");
    const gradeList = document.querySelector(".grp_btn_list .list_item:last-child ul");
    if (!itemList || !gradeList) return;

    itemList.innerHTML = items.map((text, i) => `
      <li>
        <button type="button"
                class="list_btn arrow ${i === 0 ? "on" : ""}"
                data-index="${i}">
          <span>${text}</span>
        </button>
      </li>
    `).join("");

    gradeList.innerHTML = grades.map((g, i) => `
      <li>
        <div class="btn ${i === 0 ? "on" : ""}" data-index="${i}">
          <span>${g}</span>
        </div>
      </li>
    `).join("");

    const itemButtons  = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
    const gradeButtons = document.querySelectorAll(".grp_btn_list .list_item:last-child .btn");

    function syncOn(idx) {
      itemButtons.forEach((b, i)  => b.classList.toggle("on", i === idx));
      gradeButtons.forEach((b, i) => b.classList.toggle("on", i === idx));
      if (typeof onChangeIndex === "function") {
        onChangeIndex(idx);
      }
    }

    itemButtons.forEach((btn, i) => {
      btn.addEventListener("click", () => syncOn(i));
    });
    gradeButtons.forEach((btn, i) => {
      btn.addEventListener("click", () => syncOn(i));
    });

    // 초기 0번 선택 반영 → tit / badge / skillBarChart까지 세팅
    if (items.length > 0) {
      syncOn(0);
    }
  }

  // 기업 역량(삼각형) 탭
  function renderAsitCompanyView(lang, company) {
    const korData = COMPANY_DATA_KOR[company];
    const engData = COMPANY_DATA_ENG[company];
    if (!korData || !korData.evaluation) return;
    if (!engData || !engData.evaluation) return;

    let ev;
    let items;
    if (lang === 'kor') {
      ev = korData.evaluation;
      items = ["기업가 정신과 신뢰", "최고 경영자", "경영진"];
    } else if (lang === 'eng') {
      ev = engData.evaluation;
      items = ["entrepreuneurial spirit and credibility", "CEO / Top management", "Executive team (Managers)"];
    }
    const grades = [
      ev.companyCapability.entrepreneurshipTrust.grade,
      ev.companyCapability.ceo.grade,
      ev.companyCapability.executives.grade
    ];

    const values = grades.map(g =>
      (typeof gradeToScore === "function" ? gradeToScore(g) : 0)
    );

    // 리스트 선택 시 도형 on + 헤더/바차트 갱신
    renderAsitListAndGrades(items, grades, function(idx) {
      if (radarTech) {
        const radialBtns = radarTech.querySelectorAll(".radial_btn");
        radialBtns.forEach((b, i) => b.classList.toggle("on", i === idx));
      }
      updateAsitCompanyHeaderAndBar(idx);
    });

    const commentText = lang === 'kor' ? (korData.comments && korData.comments["경영 역량"]) || "" : (engData.comments && engData.comments["경영 역량"]) || "";
    setComment(commentText);

    // 도형 버튼 → 리스트 버튼 클릭 위임
    if (radarTech) {
      const radialBtns = radarTech.querySelectorAll(".radial_btn");
      radialBtns.forEach((b, i) => b.classList.toggle("on", i === 0));

      const itemButtons = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
      radialBtns.forEach((btn, i) => {
        btn.addEventListener("click", () => {
          if (itemButtons[i]) itemButtons[i].click();
        });
      });
    }

    setRadar3Data(values);
  }

  // 기술성(오각형) 탭
  function renderAsitTechView(lang, company) {
    const korData = COMPANY_DATA_KOR[company];
    const engData = COMPANY_DATA_ENG[company];
    if (!korData || !korData.evaluation) return;
    if (!engData || !engData.evaluation) return;

    let tech;
    let items
    if (lang === 'kor') {
      tech = korData.evaluation.technology;
      items = ["기술 개발 현황", "기술 개발 능력", "기술 혁신성", "기술자립도 및 확장성", "기술 보호성"];
    } else if (lang === 'eng') {
      tech = engData.evaluation.technology;
      items = ["status of technology development", "Technology development capability", "technology innovation", "technological independence and scalability", "technology pretectability / security"];
    }

    const grades = [
      tech.devStatus.grade,
      tech.devCapability.grade,
      tech.innovation.grade,
      tech.independenceExpansion.grade,
      tech.protection.grade
    ];

    const values = grades.map(g =>
      (typeof gradeToScore === "function" ? gradeToScore(g) : 0)
    );

        renderAsitListAndGrades(items, grades, function(idx) {
      if (radarBiz) {
        const radialBtns = radarBiz.querySelectorAll(".radial_btn");
        radialBtns.forEach((b, i) => b.classList.toggle("on", i === idx));
      }

      updateAsitTechHeaderAndBar(idx);
    });

    const commentText = lang === 'kor' ? (korData.comments && korData.comments["기술성"]) || "" : (engData.comments && engData.comments["기술성"]);
    setComment(commentText);

    if (radarBiz) {
      const radialBtns = radarBiz.querySelectorAll(".radial_btn");
      radialBtns.forEach((b, i) => b.classList.toggle("on", i === 0));

      const itemButtons = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
      radialBtns.forEach((btn, i) => {
        btn.addEventListener("click", () => {
          if (itemButtons[i]) itemButtons[i].click();
        });
      });
    }

    setRadar5Data(values);
  }

  // 시장성(삼각형) 탭
  function renderAsitMarketView(lang, company) {
    const korData = COMPANY_DATA_KOR[company];
    const engData = COMPANY_DATA_ENG[company];
    if (!korData || !korData.evaluation) return;
    if (!engData || !engData.evaluation) return;

    let mkt;
    let items;

    if(lang === 'kor') {
      mkt = korData.evaluation.market;
      items = ["시장 현황", "경쟁 상황", "제품 경쟁력"];
    } else if (lang === 'eng') {
      mkt = engData.evaluation.market;
      items = ["market growth potential", "competitive landscape (benchmark)", "product competivness"];
    }

    const grades = [
      mkt.marketStatus.grade,
      mkt.competition.grade,
      mkt.productCompetitiveness.grade
    ];

    const values = grades.map(g =>
      (typeof gradeToScore === "function" ? gradeToScore(g) : 0)
    );

        renderAsitListAndGrades(items, grades, function(idx) {
      if (radarTech) {
        const radialBtns = radarTech.querySelectorAll(".radial_btn");
        radialBtns.forEach((b, i) => b.classList.toggle("on", i === idx));
      }

      updateAsitMarketHeaderAndBar(idx);
    });


    const commentText = lang === 'kor' ? (korData.comments && korData.comments["시장성"]) || "" : (engData.comments && engData.comments["시장성"]);
    setComment(commentText);

    if (radarTech) {
      const radialBtns = radarTech.querySelectorAll(".radial_btn");
      radialBtns.forEach((b, i) => b.classList.toggle("on", i === 0));

      const itemButtons = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
      radialBtns.forEach((btn, i) => {
        btn.addEventListener("click", () => {
          if (itemButtons[i]) itemButtons[i].click();
        });
      });
    }

    setRadar3Data(values);
  }

  // 사업성(2-Bar) 탭
  function renderAsitBusinessView(lang, company) {
    const korData = COMPANY_DATA_KOR[company];
    const engData = COMPANY_DATA_ENG[company];
    if (!korData || !korData.evaluation) return;
    if (!engData || !engData.evaluation) return;

    let biz;
    let items;
    if (lang === 'kor') {
      biz = korData.evaluation.business;
      items  = ["사업능력", "향후전망"];
    } else if (lang === 'eng') {
      biz = engData.evaluation.business;
      items  = ["business capability", "futur outlook"];
    }
    const grades = [biz.capability.grade, biz.outlook.grade];
    const values = grades.map(g =>
      (typeof gradeToScore === "function" ? gradeToScore(g) : 0)
    );

    renderAsitListAndGrades(items, grades, function(idx) {
      if (radarBiz2) {
        const radialBtns = radarBiz2.querySelectorAll(".radial_btn");
        radialBtns.forEach((b, i) => b.classList.toggle("on", i === idx));
      }
      updateAsitBusinessHeaderAndBar(idx);
    });

    const commentText = lang === 'kor' ? (korData.comments && korData.comments["사업성"]) || "" : (engData.comments && engData.comments["사업성"]) || "";
    setComment(commentText);

    if (radarBiz2) {
      const radialBtns = radarBiz2.querySelectorAll(".radial_btn");
      radialBtns.forEach((b, i) => b.classList.toggle("on", i === 0));

      const itemButtons = document.querySelectorAll(".grp_btn_list .list_item:first-child .list_btn");
      radialBtns.forEach((btn, i) => {
        btn.addEventListener("click", () => {
          if (itemButtons[i]) itemButtons[i].click();
        });
      });
    }

    setBiz2BarData(values);
  }

  // ASIT용 상단 탭 전환
  function activateAsitTopTab(index) {
    // 탭 on/off
    tabButtons.forEach(btn => btn.classList.remove("on"));
    if (tabButtons[index]) {
      tabButtons[index].classList.add("on");
    }

    // 그래프 on/off
    [radarBiz, radarTech, radarBiz2].forEach(el => el && el.classList.remove("on"));

    const itemList  = document.querySelector(".grp_btn_list .list_item:first-child ul");
    const gradeList = document.querySelector(".grp_btn_list .list_item:last-child ul");
    if (itemList)  itemList.innerHTML  = "";
    if (gradeList) gradeList.innerHTML = "";
    setComment("");

    // 0: 기업역량(삼각형) / 1: 기술성(오각형) / 2: 시장성(삼각형) / 3: 사업성(2-Bar)
    if (index === 0) {
      if (radarTech) radarTech.classList.add("on");
      renderAsitCompanyView(language, currentCompany);
    } else if (index === 1) {
      if (radarBiz) radarBiz.classList.add("on");
      document.getElementById('abilityRadar').style.height = '22.1425vw';
      renderAsitTechView(language, currentCompany);
    } else if (index === 2) {
      if (radarTech) radarTech.classList.add("on");
      renderAsitMarketView(language, currentCompany);
    } else if (index === 3) {
      if (radarBiz2) radarBiz2.classList.add("on");
      renderAsitBusinessView(language, currentCompany);
    } else {
      // 기본은 0번
      if (radarTech) radarTech.classList.add("on");
      renderAsitCompanyView(language, currentCompany);
    }
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
      if (isAsit) {
        activateAsitTopTab(idx);
      } else {
        activateTopTab(idx);
      }
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
    // 전역 값 갱신 (나중에 차트 만들 때도 이 값 사용 가능)
    skillLabels = metrics.map(m => m.label);
    skillValues = metrics.map(m => m.score);

    // 아직 차트 인스턴스가 없거나 구조가 준비 안 되어 있으면 그냥 리턴
    if (
      !window.skillBarChart ||
      !window.skillBarChart.data ||
      !window.skillBarChart.data.datasets ||
      !window.skillBarChart.data.datasets[0]
    ) {
      return;
    }

    // 여기까지 왔으면 차트가 준비된 상태
    window.skillBarChart.data.labels = skillLabels;
    window.skillBarChart.data.datasets[0].data = skillValues;
    window.skillBarChart.update();
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

  if (isAsit) {
    activateAsitTopTab(defaultIndex);
  } else {
    activateTopTab(defaultIndex);
  }

  // ===============================
  // 성장성 레이더 차트 (abilityRadar04)
  // ===============================
  function updateGrowthRadar(language, company) {
    const data = getGrowthRadarValues(language, company);
    if (!data) return;

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

    let labels = detail.metrics.map(m => m.label);   // "4-7년차투자단계" ...
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

    // 상단 "외형 지표 가시화" 타이틀 (그 큰 제목)
    const grpTitle = document.querySelector(".grp_lg_info_wrap .grp_tit_box span");
    if (grpTitle) grpTitle.textContent = factor.name;

    // 성장성 bar 박스 안에서만 타이틀/점수 찾기
    const growthCanvas = document.getElementById("skillBarChart02");
    const growthBarBox = growthCanvas ? growthCanvas.closest(".bar_grp_box") : null;

    if (growthBarBox) {
      const barTitle = growthBarBox.querySelector(".bar_grp_box_tit .tit");
      const badgeL   = growthBarBox.querySelector(".badge_box .l");
      const badgeR   = growthBarBox.querySelector(".badge_box .r");

      if (barTitle) barTitle.textContent = factor.name;   // 선택된 요인 이름
      if (badgeL)   badgeL.textContent   = factor.score;  // 혹은 model.totalScore 써도 됨
      if (badgeR)   badgeR.textContent   = language === 'kor' ? "(점)" : "(score)";
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
  window.renderBizCapabilityView = renderBizCapabilityView;
  window.activateAsitTopTab = activateAsitTopTab;
  window.renderGrowthView = renderGrowthView;
});

document.addEventListener('DOMContentLoaded', () => {
  initFinanceSection();
});

/*****************************************
 *  재무정보: 섹션 초기화
 *****************************************/
function initFinanceSection() {
  const section = document.querySelector('.tab_cont.cs_02');
  if (!section) return;

  const company =
    (typeof currentCompany !== 'undefined')
      ? currentCompany
      : '듀셀바이오테라퓨틱스';

  const tabBtns = section.querySelectorAll('.tab_round_ty .tab_btn');
  if (!tabBtns.length) return;

  window.finCharts = window.finCharts || {};
  const MODES = ['all', 'bs', 'pl'];

  function activateBtn(targetBtn) {
    tabBtns.forEach(b => b.classList.toggle('on', b === targetBtn));
  }

  function getModeFromBtn(btn, idx) {
    if (btn.dataset.mode) return btn.dataset.mode;

    if (btn.classList.contains('rd_tab_02')) return 'bs';
    if (btn.classList.contains('rd_tab_03')) return 'pl';
    if (btn.classList.contains('rd_tab_01')) return 'all';

    if (typeof idx === 'number' && MODES[idx]) return MODES[idx];
    return 'all';
  }

  // ★★ 여기서 언어는 매번 전역에서 읽어오게 함
  function getLang() {
    if (typeof language !== 'undefined') return language;
    // 혹시 language 전역이 없을 때 대비
    const bodyLang = (typeof getCurrentLangFromBody === 'function')
      ? getCurrentLangFromBody()
      : 'kor';
    return (bodyLang === 'en') ? 'eng' : 'kor';
  }

  function render(mode) {
    const lang = getLang();
    const data = getFinanceViewData(company, lang, mode);
    if (!data) return;

    renderFinanceCharts(section, data);
    renderFinanceTable(section, data, mode);
  }

  // 버튼 이벤트 (공통 스크립트 막는 버전 그대로)
  tabBtns.forEach((btn, idx) => {
    const mode = getModeFromBtn(btn, idx);
    btn.dataset.mode = mode;

    btn.addEventListener(
      'click',
      function (e) {
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();

        const clickMode = this.dataset.mode || 'all';

        activateBtn(this);
        render(clickMode);
      },
      true
    );
  });

  // ★★ 언어 변경 시 재렌더링을 위해 전역 함수 하나 노출
  window.refreshFinanceSection = function () {
    const activeBtn =
      section.querySelector('.tab_round_ty .tab_btn.on') || tabBtns[0];
    const mode = activeBtn ? activeBtn.dataset.mode || 'all' : 'all';
    render(mode);
  };

  // 최초 로딩
  const defaultBtn =
    section.querySelector('.tab_round_ty .rd_tab_01') || tabBtns[0];
  if (defaultBtn) {
    activateBtn(defaultBtn);
  }
  render('all');
}

/*****************************************
 *  재무 차트 렌더링
 *****************************************/
function renderFinanceCharts(section, data) {
  if (typeof Chart === 'undefined') return;

  // 화면에 보이는 연도 순서 기준으로 매핑
  // HTML: finChart2022 아래에 "2024", finChart2023 아래에 "2023", finChart2024 아래에 "2022"
  const canvasIdByYear = {
    2024: 'finChart2022',
    2023: 'finChart2023',
    2022: 'finChart2024'
  };

  // 전체 값 기준으로 y축 범위 계산
  let allValues = [];
  data.years.forEach(year => {
    const arr = data.chartValuesByYear[year] || [];
    allValues = allValues.concat(arr);
  });

  const absVals = allValues.map(v => Math.abs(v));
  const maxVal  = absVals.length ? Math.max.apply(null, absVals) : 0;
  const margin  = maxVal * 0.2;
  const axisMax = maxVal ? Math.ceil((maxVal + margin) / 10) * 10 : 10;
  const axisMin = -axisMax;

  // 라벨별 색상 매핑 (kr/en 둘 다 지원)
  const FIN_LABEL_COLOR = {
    // 한글
    '자산':       '#E4EDFF',
    '부채':       '#A9C6FF',
    '자본':       '#6FAEFF',
    '매출':       '#2B7CFF',
    '영업이익':   '#0071FE',
    '당기순이익': '#0B4EA9',
    // 영문
    'assets':           '#E4EDFF',
    'liabilities':      '#A9C6FF',
    'capital':          '#6FAEFF',
    'sales':            '#2B7CFF',
    'operating profit': '#0071FE',
    'net profit':       '#0B4EA9'
  };

  const colors = data.labels.map(label => FIN_LABEL_COLOR[label] || '#2B7CFF');

  const padTop        = designPxToRealPx(20);
  const padRight      = designPxToRealPx(20);
  const padLeft       = designPxToRealPx(20);
  const padBottom     = designPxToRealPx(40);
  const zeroLineWidth = designPxToRealPx(1);

  // 연도별 차트 인스턴스 저장
  window.finCharts = window.finCharts || {};

  data.years.forEach(year => {
    const canvasId = canvasIdByYear[year];
    if (!canvasId) return;

    const canvas = section.querySelector('#' + canvasId);
    if (!canvas) return;

    const ctx    = canvas.getContext('2d');
    const values = data.chartValuesByYear[year] || [];
    const labels = data.labels;

    // 1) 이미 저장해둔 Chart 인스턴스가 있으면 그걸 우선 사용
    let chart = window.finCharts[year];

    // 2) 없으면, HTML에서 먼저 만들어둔 Chart를 가져오기
    if (!chart && typeof Chart.getChart === 'function') {
      chart = Chart.getChart(canvas) || null;
    }

    if (chart) {
      // 이미 있는 차트 → 데이터만 덮어쓰기
      chart.data.labels                   = labels;
      chart.data.datasets[0].data         = values;
      chart.data.datasets[0].backgroundColor = colors;
      chart.options.scales.y.min          = axisMin;
      chart.options.scales.y.max          = axisMax;
      chart.update();

      // 우리 쪽 전역에도 다시 저장
      window.finCharts[year] = chart;
    } else {
      // HTML에서 안 그려줬거나 getChart가 안 될 경우 → 새로 생성
      window.finCharts[year] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderRadius: 0,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          layout: {
            padding: {
              top:    padTop,
              right:  padRight,
              left:   padLeft,
              bottom: padBottom
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { display: false }
            },
            y: {
              min: axisMin,
              max: axisMax,
              ticks: { display: false },
              grid: {
                drawBorder: false,
                color: function (ctx) {
                  return ctx.tick.value === 0 ? '#FFFFFF' : 'transparent';
                },
                lineWidth: function (ctx) {
                  return ctx.tick.value === 0 ? zeroLineWidth : 0;
                }
              }
            }
          },
          animation: {
            duration: 800
          }
        }
      });
    }
  });
}

/*****************************************
 *  재무 테이블 렌더링
 *****************************************/
function renderFinanceTable(section, data, mode) {
  const lang    = (typeof language !== 'undefined') ? language : 'kor';
  const langKey = (lang === 'en' || lang === 'eng') ? 'en' : 'kr';

  // 현재 언어에 맞는 테이블만 갱신 (kr_t / en_t)
  const tableInner = section.querySelector(
    langKey === 'kr' ? '.fin_table_inner.kr_t' : '.fin_table_inner.en_t'
  );
  if (!tableInner) return;

  const tableLine = tableInner.querySelector('.table_line');
  if (!tableLine) return;

  // 단위 라벨
  const unitSpan = tableInner.querySelector('.table_sub span');
  if (unitSpan) {
    unitSpan.textContent = data.unitLabel;
  }

  const years = data.years;
  const yearTitle = (langKey === 'kr') ? '년도' : 'Year';

  let html = '';

  // 1) 헤더 행 (년도 / Year)
  html += `
    <div class="t_line year">
      <div class="t_tit"><span>${yearTitle}</span></div>
      ${years.map(y => `
        <div class="t_cont"><span>${y}</span></div>
      `).join('')}
    </div>
  `;

  // 2) 데이터 행 (자산/부채/자본/매출/영업이익/당기순이익)
  data.tableRows.forEach(row => {
    const lineClass = row.group === 'bs' ? 'fin' : 'income';
    html += `
      <div class="t_line ${lineClass}">
        <div class="t_tit"><span>${row.label}</span></div>
        ${row.values.map(v => `
          <div class="t_cont"><span>${v}</span></div>
        `).join('')}
      </div>
    `;
  });

  tableLine.innerHTML = html;
}

/*****************************************
 *  DOM 로드 시 재무 섹션 초기화
 *****************************************/
document.addEventListener('DOMContentLoaded', function () {
  initFinanceSection();
});
