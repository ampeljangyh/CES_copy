
/**
 * view_chart_main_clean_lang.js
 * ------------------------------------------------------------
 * 목표
 *  - 언어 변경 시( CustomEvent('lang:changed') ) DOM 재생성/애니 재시작 없이
 *    1) 타이틀
 *    2) Step 토글(탭 라벨)
 *    3) 텍스트/바(라벨/디테일/뱃지/타이틀)
 *    4) 레이더 차트 라벨(데이터는 유지)
 *    를 "제자리"에서 한/영 전환.
 *
 * 전제
 *  - 아래 함수/전역은 기존 파일/서비스에 이미 존재:
 *    currentCompany, language
 *    getBizCapabilityData(lang, company) -> { items:[], grades:[] }
 *    getTechCompetitivenessData(lang, company) -> { items:[], grades:[] }
 *    getGrowthModel(lang, company) -> { factors:[{name,score..}] }
 *    getBizBarDetail/getTechBarDetail/getGrowthBarDetail(lang, company, idx) -> { title, grade, metrics:[{label,score,detail}] }
 *    getGradeLabel(grade) -> "(양호)" 등
 *    techRadar01Ctrl / techRadar02Ctrl / techRadar04Ctrl (createRadarController)
 *
 *  - 이 파일은 "언어 변경 처리 + i18n 적용"만 담당.
 *    (초기 렌더/클릭 로직은 기존 그대로 두고, 언어 변경 때만 흔들림을 막는다.)
 * ------------------------------------------------------------
 */

(function () {
  'use strict';

  // -------------------------
  // helpers
  // -------------------------
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function setText(el, t) { if (el && t != null) el.textContent = String(t); }

  // ✅ localStorage까지 보는 "진짜" getLang (초기 FOUC 방지용)
  function normLang(v) {
    if (!v) return null;
    v = String(v).toLowerCase();
    if (v === 'lang_en' || v === 'en' || v === 'eng') return 'eng';
    if (v === 'lang_kr' || v === 'kr' || v === 'ko' || v === 'kor') return 'kor';
    return null;
  }

  function getLang() {
    var v = null;

    // 1) localStorage 우선
    try { v = localStorage.getItem('siteLang'); } catch (_) { }
    v = normLang(v); if (v) return v;

    try { v = localStorage.getItem('language'); } catch (_) { }
    v = normLang(v); if (v) return v;

    // 2) 전역 변수
    v = normLang(window.language || window.siteLang || (typeof language !== 'undefined' ? language : null));
    if (v) return v;

    // 3) body id fallback
    return (document.body && document.body.id === 'lang_en') ? 'eng' : 'kor';
  }

  function setLang(lang) {
    window.language = lang;
    try { language = lang; } catch (_) { }
    if (document.body) document.body.id = (lang === 'eng') ? 'lang_en' : 'lang_kr';
  }

  // ✅ FOUC 방지: getLang 정의 "후" 실행해야 안전함
  (function earlySetBodyLang() {
    var early = getLang();
    window.language = early;

    if (document.body) {
      document.body.id = (early === 'eng') ? 'lang_en' : 'lang_kr';
      return;
    }

    document.addEventListener('DOMContentLoaded', function () {
      document.body.id = (early === 'eng') ? 'lang_en' : 'lang_kr';
    }, { once: true });
  })();

  // -------------------------
  // helpers
  // -------------------------
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function setText(el, t) { if (el && t != null) el.textContent = String(t); }

  function getLang() {
    // project convention: 'kor' / 'eng'
    if (typeof window.language === 'string' && window.language) return window.language;
    if (typeof language === 'string' && language) return language;
    // fallback by body id (lang_en/lang_kr)
    return (document.body && document.body.id === 'lang_en') ? 'eng' : 'kor';
  }

  function setLang(lang) {
    window.language = lang;
    try { language = lang; } catch (_) { }
    if (document.body) document.body.id = (lang === 'eng') ? 'lang_en' : 'lang_kr';
  }

  function safeCall(fn, ...args) {
    try { return (typeof fn === 'function') ? fn(...args) : null; }
    catch (e) { console.error(e); return null; }
  }

  // -------------------------
  // 현재 선택 인덱스 유지 (없으면 0)
  // -------------------------
  function readActiveIndexFromStep(stepRootSel) {
    const root = q(stepRootSel);
    if (!root) return 0;

    const btns = qa('.step_examine_list [data-target]', root);
    // 케이스1: li/span에 on이 붙는 구조
    for (let i = 0; i < btns.length; i++) {
      if (btns[i].classList.contains('on')) return i;
      const li = btns[i].closest('li');
      if (li && li.classList.contains('on')) return i;
    }

    // 케이스2: examine 패널 display로 판단
    const targets = btns.map(b => b.getAttribute('data-target')).filter(Boolean);
    for (let i = 0; i < targets.length; i++) {
      const panel = q('#' + targets[i], root);
      if (panel && panel.style.display !== 'none') return i;
    }

    return 0;
  }

  // -------------------------
  // Step 타이틀/토글 라벨(탭) i18n
  // -------------------------
  function applyTitles(lang) {
    const isEn = (lang === 'eng');

    setText(q('#techItemStep01 .tech_process_item_tit span'),
      isEn ? 'Step 1. Technology Business Capability Assessment' : 'Step 1. 기술 사업 역량 평가');
    setText(q('#techItemStep02 .tech_process_item_tit span'),
      isEn ? 'Step 2. Technology Competitiveness Assessment' : 'Step 2. 기술 경쟁력 평가');
    setText(q('#techItemStepLast .tech_process_item_tit span'),
      isEn ? 'Step 3. Growth Potential Assessment' : 'Step 3. 성장성 평가');
  }

  function applyStepToggleLabels(lang, company) {
    // ✅ nav 줄바꿈 CSS 보장(1회)
    ensureStepNavPreLineCSS();

    // Step01 (오각형)
    const biz = safeCall(window.getBizCapabilityData || getBizCapabilityData, lang, company);
    if (biz && Array.isArray(biz.items)) {
      const navLabels = wrapNavLabelsIfEng(biz.items, lang);

      qa('#techItemStep01 .step_examine_list [data-target]').forEach((el, i) => {
        const spans = el.querySelectorAll('span');
        const span = spans.length >= 2 ? spans[1] : spans[0]; // ✅ 2개면 2번째, 아니면 1번째
        if (span && navLabels[i] != null) span.textContent = navLabels[i];
      });
    }

    // Step02 (삼각형)
    const tech = safeCall(window.getTechCompetitivenessData || getTechCompetitivenessData, lang, company);
    if (tech && Array.isArray(tech.items)) {
      const navLabels = wrapNavLabelsIfEng(tech.items, lang);

      qa('#techItemStep02 .step_examine_list [data-target]').forEach((el, i) => {
        const spans = el.querySelectorAll('span');
        const span = spans.length >= 2 ? spans[1] : spans[0]; // ✅ 2개면 2번째, 아니면 1번째
        if (span && navLabels[i] != null) span.textContent = navLabels[i];
      });
    }

    // StepLast (팔각형)
    const model = safeCall(window.getGrowthModel || getGrowthModel, lang, company);
    if (model && Array.isArray(model.factors)) {
      const rawNames = model.factors.map(f => f?.name || f?.label || f?.title || '');
      const navLabels = wrapNavLabelsIfEng(rawNames, lang);

      qa('#techItemStepLast .step_examine_list [data-target]').forEach((el, i) => {
        const spans = el.querySelectorAll('span');
        const span = spans.length >= 2 ? spans[1] : spans[0]; // ✅ 2개면 2번째, 아니면 1번째
        if (span && navLabels[i]) span.textContent = navLabels[i];
      });
    }
  }

  // -------------------------
  // 레이더 차트: 라벨만 업데이트(애니 재시작 금지)
  // -------------------------
  function isVisibleCanvas(canvas) {
    if (!canvas) return false;
    if (canvas.offsetParent === null) return false;
    const r = canvas.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function radarLabelsOnly(ctrl, labels, values, canvasId) {
    if (!ctrl) return;

    const canvas = canvasId ? document.getElementById(canvasId)
      : (ctrl.chart && ctrl.chart.canvas) || ctrl.canvas || (ctrl.ctx && ctrl.ctx.canvas) || null;

    // ✅ 라벨/데이터는 항상 "저장"만 해둔다
    if (typeof ctrl.setLabels === 'function' && labels) ctrl.setLabels(labels);
    if (typeof ctrl.setData === 'function' && values) ctrl.setData(values);

    // ✅ 숨겨진 상태면 여기서 절대 그리지 않는다 (삼각형 문제 원인)
    if (!isVisibleCanvas(canvas)) return;

    // ✅ 보이는 경우에만 즉시 반영(무애니)
    if (ctrl.chart && typeof ctrl.chart.resize === 'function') {
      try { ctrl.chart.resize(); } catch (_) { }
    }

    if (ctrl.chart && typeof ctrl.chart.update === 'function') {
      if (labels) ctrl.chart.data.labels = labels.slice();
      if (values && ctrl.chart.data?.datasets?.[0]) ctrl.chart.data.datasets[0].data = values.slice();
      ctrl.chart.update('none');
      return;
    }

    if (typeof ctrl.renderNow === 'function') {
      ctrl.renderNow();
      return;
    }
  }

  function updateAllRadarsLabelsOnly(lang, company) {
    // Step01: 5각형
    const biz = safeCall(window.getBizCapabilityData || getBizCapabilityData, lang, company);
    const bizLabelsRaw = biz?.items || null;
    const bizLabels = wrapRadarLabelsIfEng(bizLabelsRaw, lang);
    const bizValues = (typeof getBizRadarValues === 'function') ? getBizRadarValues(company, lang) : null;

    radarLabelsOnly(window.techRadar01Ctrl, bizLabels, bizValues);

    // Step02: 3각형
    // Step02: 3각형
    const tech = safeCall(window.getTechCompetitivenessData || getTechCompetitivenessData, lang, company);
    const techLabelsRaw = tech?.items || null;
    const techLabels = wrapRadarLabelsIfEng(techLabelsRaw, lang);
    const techValues = (typeof getTechRadarValues === 'function') ? getTechRadarValues(company, lang) : null;

    radarLabelsOnly(window.techRadar02Ctrl, techLabels, techValues, 'techRadar02');



    // StepLast: 8각형 (labels는 getGrowthRadarValues에 이미 번역본이 있을 수도)
    let gLabels = null;
    let gValues = null;

    if (typeof getGrowthRadarValues === 'function') {
      const g = getGrowthRadarValues(lang, company);
      if (g) {
        const raw = g.labels || null;
        gLabels = wrapRadarLabelsIfEng(raw, lang);
        gValues = g.myScores || null;
      }
    } else {
      const model = safeCall(window.getGrowthModel || getGrowthModel, lang, company);
      if (model && Array.isArray(model.factors)) {
        const rawLabels = model.factors
          .map(f => f.name || f.label || f.title)
          .filter(Boolean);

        gLabels = wrapRadarLabelsIfEng(rawLabels, lang);
        gValues = model.factors.map(f => f.score || 0);
      }
    }

    radarLabelsOnly(window.techRadar04Ctrl, gLabels, gValues);
  }

  // ✅ Step02(삼각형) 전용: 보일 때 값/라벨을 실제로 캔버스에 반영
  function refreshTechRadar02(lang, company) {
    const ctrl = window.techRadar02Ctrl;
    const canvas = document.getElementById('techRadar02');
    if (!ctrl || !canvas) return;

    // "보일 때만" 그려야 애니/상태 꼬임이 없음
    const r = canvas.getBoundingClientRect();
    const visible = r.width > 0 && r.height > 0 && canvas.offsetParent !== null;
    if (!visible) return;

    // labels / values 가져오기 (데이터는 그대로)
    const labelsRaw = (typeof getTechCompetitivenessData === 'function')
      ? (getTechCompetitivenessData(lang, company)?.items || null)
      : null;

    const labels = wrapRadarLabelsIfEng(labelsRaw, lang);
    const values = (typeof getTechRadarValues === 'function')
      ? (getTechRadarValues(company, lang) || null)
      : null;

    if (labels && ctrl.setLabels) ctrl.setLabels(labels);
    if (values && ctrl.setData) ctrl.setData(values);

    // ✅ 실제 반영(무애니)
    if (ctrl.chart && typeof ctrl.chart.update === 'function') {
      if (labels) ctrl.chart.data.labels = labels.slice();
      if (values && ctrl.chart.data?.datasets?.[0]) ctrl.chart.data.datasets[0].data = values.slice();
      ctrl.chart.update('none');
      return;
    }
    if (typeof ctrl.renderNow === 'function') {
      ctrl.renderNow();
      return;
    }

    // 최후: 그래도 안 찍히면 start(보일 때만)
    if (typeof ctrl.start === 'function') ctrl.start();
  }

  // -------------------------
  // 텍스트/바: "제자리" 텍스트 업데이트
  //  - gauge width는 건드리지 않음 (위치/애니 흔들림 방지)
  // -------------------------
  function applyHeaderTitleBadge(barData) {
    if (!barData) return;
    const titleEl = q('.bar_grp_box_tit .tit');
    const badgeL = q('.badge_box .l');
    const badgeR = q('.badge_box .r');

    if (titleEl && barData.title != null) titleEl.textContent = barData.title;
    if (badgeL && barData.grade != null) badgeL.textContent = barData.grade;

    const gradeLabelFn = (typeof getGradeLabel === 'function') ? getGradeLabel : null;
    if (badgeR && gradeLabelFn && barData.grade != null) badgeR.textContent = gradeLabelFn(barData.grade);
  }

  function updateCssBarTextOnly(stepEl, metrics, opts) {
    if (!stepEl) return;
    opts = opts || {};
    const hideDash = !!opts.hideDash;                 // ✅ '-'일 때 숨김
    const hideMode = opts.hideMode || 'display';      // 'display' | 'opacity'

    const mList = Array.isArray(metrics) ? metrics : [];
    const items = qa('.inve_examine_gp_item', stepEl);
    if (!items.length) return;

    items.forEach((item, idx) => {
      const m = mList[idx];

      const labelEl = q('.txt strong', item);
      const detailEl = q('.txt p', item);
      const gaugeEl = q('.bar .gauge', item);

      // 기본: 보이도록 복원 (토글/재적용 대비)
      item.style.display = '';
      item.style.opacity = '';
      item.style.pointerEvents = '';

      if (!m) {
        // 데이터 자체가 없으면 그냥 숨기거나 '-' 처리 중 택1
        if (hideDash) {
          if (hideMode === 'opacity') {
            item.style.opacity = '0';
            item.style.pointerEvents = 'none';
          } else {
            item.style.display = 'none';
          }
          if (gaugeEl) gaugeEl.dataset.percent = '0';
          return;
        }
        if (labelEl) labelEl.textContent = '-';
        if (detailEl) detailEl.textContent = '-';
        if (gaugeEl) gaugeEl.dataset.percent = '0';
        return;
      }

      const rawLabel = (m.label == null) ? '' : String(m.label).trim();
      const isDash = (!rawLabel || rawLabel === '-' || rawLabel.toUpperCase() === 'N/A');

      // ✅ 라벨이 '-'면 줄 전체 숨김
      if (hideDash && isDash) {
        if (hideMode === 'opacity') {
          item.style.opacity = '0';
          item.style.pointerEvents = 'none';
        } else {
          item.style.display = 'none';
        }
        if (gaugeEl) gaugeEl.dataset.percent = '0';
        return;
      }

      // 정상 출력
      if (labelEl) labelEl.textContent = rawLabel || '-';

      if (detailEl) {
        const d = (m.detail == null) ? '-' : String(m.detail).trim();
        detailEl.textContent = (!d || d.toUpperCase() === 'N/A') ? '-' : d;
      }

      if (gaugeEl) {
        const score = Number(m.score ?? 0) || 0;
        gaugeEl.dataset.percent = String(score);
      }
    });
  }

  // Step별: 전체 패널 텍스트 업데이트(재생성 X)
  function updateBarsTextOnly_AllPanels(lang, company) {
    // Step01: examine01~05
    for (let i = 0; i < 5; i++) {
      const barData = (typeof getBizBarDetail === 'function') ? getBizBarDetail(lang, company, i) : null;
      if (!barData?.metrics) continue;
      const panel = q('#examine' + String(i + 1).padStart(2, '0')); // examine01...
      if (panel) updateCssBarTextOnly(panel, barData.metrics);
    }

    // Step02: root 스코프에서만 (examine01이 중복될 수 있음)
    const step2 = q('#techItemStep02');
    if (step2) {
      for (let i = 0; i < 3; i++) {
        const barData = (typeof getTechBarDetail === 'function') ? getTechBarDetail(lang, company, i) : null;
        if (!barData?.metrics) continue;
        const panel = q('#examine0' + (i + 1), step2); // examine01..03 (step2 내부)
        if (panel) updateCssBarTextOnly(panel, barData.metrics);
      }
    }

    // StepLast: root 스코프에서만 (examine01 중복)
    const stepL = q('#techItemStepLast');
    if (stepL) {
      const targets = qa('.step_examine_list [data-target]', stepL)
        .map(el => el.getAttribute('data-target'))
        .filter(Boolean);

      for (let i = 0; i < targets.length; i++) {
        const barData = (typeof getGrowthBarDetail === 'function') ? getGrowthBarDetail(lang, company, i) : null;
        if (!barData?.metrics) continue;
        const panel = q('#' + targets[i], stepL);

        // ✅ 성장성 패널에서는 '-' 항목 숨김
        if (panel) updateCssBarTextOnly(panel, barData.metrics, { hideDash: true, hideMode: 'opacity' });
        // hideMode: 'opacity' 로 바꾸면 공간은 유지하고 투명 처리됨
      }
    }
  }

  // 현재 선택 인덱스의 헤더/바 타이틀/뱃지 업데이트
  function updateHeadersForActive(lang, company) {
    // 어느 스텝이 화면에 노출인지 알기 어렵고, 헤더는 공용이라
    // "현재 보여지는 Step" 기준으로만 갱신하는 게 안전.
    // -> 우선순위: Step02 on 이면 Step02 idx, 아니면 StepLast, 아니면 Step01
    const step2On = q('#techItemStep02') && q('#techItemStep02').style.display !== 'none';
    const stepLOn = q('#techItemStepLast') && q('#techItemStepLast').style.display !== 'none';
    const step1On = q('#techItemStep01') && q('#techItemStep01').style.display !== 'none';

    if (step2On) {
      const idx = (window.currentTechIdx != null) ? window.currentTechIdx : readActiveIndexFromStep('#techItemStep02');
      const barData = (typeof getTechBarDetail === 'function') ? getTechBarDetail(lang, company, idx) : null;
      applyHeaderTitleBadge(barData);
      return;
    }

    if (stepLOn) {
      const idx = (window.currentGrowthIdx != null) ? window.currentGrowthIdx : readActiveIndexFromStep('#techItemStepLast');
      const barData = (typeof getGrowthBarDetail === 'function') ? getGrowthBarDetail(lang, company, idx) : null;
      applyHeaderTitleBadge(barData);
      return;
    }

    if (step1On) {
      // Step01은 getBizBarDetail 기준
      const idx = (window.currentBizIdx != null) ? window.currentBizIdx : readActiveIndexFromStep('#techItemStep01');
      const barData = (typeof getBizBarDetail === 'function') ? getBizBarDetail(lang, company, idx) : null;
      applyHeaderTitleBadge(barData);
    }
  }

  // -------------------------
  // public: 한 번에 적용
  // -------------------------
  function applyAllLangChange(lang) {
    ensureStepNavPreLineCSS();
    const company = (typeof currentCompany !== 'undefined') ? currentCompany : null;
    if (!company) return;

    setLang(lang);

    // 1) 고정 텍스트
    applyTitles(lang);
    applyStepToggleLabels(lang, company);

    // 2) 레이더 라벨만 교체 (애니 재시작 금지)
    updateAllRadarsLabelsOnly(lang, company);

    // 3) 바/텍스트 라벨만 교체 (width 유지)
    updateBarsTextOnly_AllPanels(lang, company);

    // 4) 상단 타이틀/뱃지 현재 활성 기준으로 교체
    updateHeadersForActive(lang, company);

    refreshTechRadar02(lang, company);
  }

  // -------------------------
  // event bind
  // -------------------------
  function bindLangChangedOnce() {
    if (window.__ty02CleanLangBound) return;
    window.__ty02CleanLangBound = true;

    window.addEventListener('lang:changed', function (e) {
      const next = (e && e.detail && e.detail.language) ? e.detail.language : getLang();
      applyAllLangChange(next);

      // 일부 DOM이 rAF 이후에 다시 덮이는 케이스 방지(최소 1회 재적용)
      requestAnimationFrame(() => {
        applyAllLangChange(getLang());
      });
    });
  }

  // 초기: 현재 언어 기준으로 한 번 정렬(재생성 없이 텍스트 정합)
  document.addEventListener('DOMContentLoaded', function () {
    bindLangChangedOnce();

    try {
      // ✅ 즉시 1회 적용 (딜레이 최소화)
      applyAllLangChange(getLang());

      // ✅ 삼각형은 생성 지연/가시성 이슈가 있어서 별도로 계속 보정
      ensureTechRadar02HasData();
    } catch (e) {
      console.error(e);
    }
  });

  // 외부에서도 호출 가능하게
  window.applyTy02LangInPlace = applyAllLangChange;

  // ✅ Step02가 활성화되는 순간 techRadar02 값을 강제 반영하도록 패치
  (function hookStep2VisibleRefresh() {
    if (window.__hookStep2VisibleRefresh) return;
    window.__hookStep2VisibleRefresh = true;

    const orig = window.setTechActiveByIndex;
    if (typeof orig !== 'function') return;

    window.setTechActiveByIndex = function (idx, lang, company) {
      const ret = orig.apply(this, arguments);

      // showOnly 이후, 실제로 보이는 프레임에서 한 번 더 반영
      requestAnimationFrame(() => {
        const useLang = lang || (typeof language !== 'undefined' ? language : window.language);
        const useCompany = company || (typeof currentCompany !== 'undefined' ? currentCompany : window.currentCompany);

        const tech = (typeof getTechCompetitivenessData === 'function')
          ? getTechCompetitivenessData(useLang, useCompany)
          : null;
        const labelsRaw = tech?.items || null;
        const labels = wrapRadarLabelsIfEng(labelsRaw, useLang);
        const values = (typeof getTechRadarValues === 'function')
          ? getTechRadarValues(useCompany, useLang)
          : null;

        radarLabelsOnly(window.techRadar02Ctrl, labels, values, 'techRadar02');
      });

      return ret;
    };
  })();

  function ensureTechRadar02HasData() {
    let tries = 0;
    const maxTries = 240; // 12초(50ms*240)

    const tick = () => {
      tries++;

      const ctrl = window.techRadar02Ctrl;
      const chart = ctrl && ctrl.chart;
      const company = window.currentCompany;
      const lang = window.language || getLang();

      // 1) 컨트롤러/차트/회사값이 아직 없으면 기다림
      if (!chart || !company) {
        if (tries < maxTries) return setTimeout(tick, 50);
        return;
      }

      // 2) 값/라벨 소스 준비 확인
      let values = null;
      if (typeof getTechRadarValues === 'function') {
        // 프로젝트에 따라 인자 순서가 다를 수 있어 둘 다 시도
        values = getTechRadarValues(company, lang);
        if (!Array.isArray(values)) values = getTechRadarValues(lang, company);
      }

      const labelsRaw = (typeof getTechCompetitivenessData === 'function')
        ? (getTechCompetitivenessData(lang, company)?.items || null)
        : null;

      const labels = wrapRadarLabelsIfEng(labelsRaw, lang);

      // 값이 아직 준비 안 되었으면 기다림
      const valuesOk = Array.isArray(values) && values.length === 3 && values.every(v => typeof v === 'number' && isFinite(v));
      const labelsOk = Array.isArray(labels) && labels.length === 3;

      if (!valuesOk || !labelsOk) {
        if (tries < maxTries) return setTimeout(tick, 50);
        return;
      }

      // 3) 주입 + 스케일 고정 + 리사이즈/업데이트(무애니)
      if (ctrl.setLabels) ctrl.setLabels(labels);
      if (ctrl.setData) ctrl.setData(values);

      chart.options.scales = chart.options.scales || {};
      chart.options.scales.r = chart.options.scales.r || {};
      chart.options.scales.r.min = 0;
      chart.options.scales.r.max = 100;
      chart.options.scales.r.suggestedMin = 0;
      chart.options.scales.r.suggestedMax = 100;

      try { chart.resize(); } catch (_) { }
      chart.update('none');
    };

    tick();


    if (tries < maxTries) setTimeout(tick, 50);
  };

  // 영문일 때만 레이더 라벨에 개행 삽입
  function wrapRadarLabelsIfEng(labels, lang, opts) {
    if (!Array.isArray(labels)) return labels;
    if (lang !== 'eng') return labels;

    opts = opts || {};
    var maxLineLen = opts.maxLineLen || 16;
    var minBreakWordLen = opts.minBreakWordLen || 7;

    return labels.map(function (s) {
      if (!s) return s;
      if (typeof s !== 'string') return s;
      if (s.indexOf(' ') < 0) return s; // 공백 없으면 그대로

      // ✅ Chart.js 레이더 포인트 라벨은 "배열"이 멀티라인 확실
      return wrapByWordsToLines(s, maxLineLen, minBreakWordLen);
    });
  }

  function wrapByWordsToLines(text, maxLineLen, minBreakWordLen) {
    var words = String(text).trim().split(/\s+/);
    if (!words.length) return text;

    var hasLongWord = words.some(function (w) { return w.length >= minBreakWordLen; });
    var targetLen = hasLongWord ? Math.min(maxLineLen, 14) : maxLineLen;

    var lines = [];
    var line = '';

    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var candidate = line ? (line + ' ' + w) : w;

      if (candidate.length > targetLen && line) {
        lines.push(line);
        line = w;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);

    // ✅ 멀티라인은 배열
    return lines;
  }

  // =========================
  // Step nav(label) multiline (ENG only)
  // - DOM 텍스트는 '\n' 문자열로 넣고, CSS pre-line 필요
  // =========================
  function wrapNavLabelsIfEng(labels, lang, opts) {
    if (!Array.isArray(labels)) return labels;
    if (lang !== 'eng') return labels;

    opts = opts || {};
    var maxLineLen = opts.maxLineLen || 16;
    var minBreakWordLen = opts.minBreakWordLen || 7;

    return labels.map(function (s) {
      if (!s) return s;
      if (typeof s !== 'string') return s;
      if (s.indexOf(' ') < 0) return s;

      var lines = wrapByWordsToLines(s, maxLineLen, minBreakWordLen); // 이미 너 파일에 있음
      return Array.isArray(lines) ? lines.join('\n') : String(lines);
    });
  }

  function ensureStepNavPreLineCSS() {
    if (window.__ty02StepNavPreLineCSS) return;
    window.__ty02StepNavPreLineCSS = true;

    /* step_examine_list 라벨 전체(오각형/삼각형/팔각형) 줄바꿈 허용 */
    var css = `
    #techItemStep01 .step_examine_list ul li span,
    #techItemStep01 .step_examine_list ul li div span:last-child,
    #techItemStep02 .step_examine_list ul li span,
    #techItemStep02 .step_examine_list ul li div span:last-child,
    #techItemStepLast .step_examine_list ul li span,
    #techItemStepLast .step_examine_list ul li div span:last-child {
      white-space: pre-line;
    }
  `;

    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }
})();
