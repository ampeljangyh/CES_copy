(function () {
  'use strict';

  var COMPANY = '에이에스이티';

  // -----------------------------
  // DOM helpers
  // -----------------------------
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // -----------------------------
  // Lang helpers
  // -----------------------------
  function normLang(v) {
    if (!v) return null;
    v = String(v).toLowerCase();
    if (v === 'lang_en' || v === 'en' || v === 'eng') return 'eng';
    if (v === 'lang_kr' || v === 'kr' || v === 'ko' || v === 'kor') return 'kor';
    return null;
  }

  function getLang() {
    var v = null;
    try { v = localStorage.getItem('siteLang'); } catch (_) { }
    v = normLang(v); if (v) return v;

    try { v = localStorage.getItem('language'); } catch (_) { }
    v = normLang(v); if (v) return v;

    v = normLang(window.language || window.siteLang);
    if (v) return v;

    var bid = document.body && document.body.id;
    return (bid === 'lang_en') ? 'eng' : 'kor';
  }

  function safeCall(fn) {
    try {
      if (typeof fn !== 'function') return null;
      return fn.apply(null, Array.prototype.slice.call(arguments, 1));
    } catch (e) {
      return null;
    }
  }

  // -----------------------------
  // Titles / Nav labels
  // -----------------------------
  function setStepTitle(stepEl, text) {
    if (!stepEl) return;
    var el = q('.tech_process_item_tit span', stepEl);
    if (el) el.textContent = text;
  }

  function setStepNavLabels(stepEl, labels) {
    if (!stepEl || !Array.isArray(labels)) return;
    var nodes = qa('.step_examine_list ul li div span:last-child', stepEl);
    if (!nodes.length) nodes = qa('.step_examine_list ul li span', stepEl);
    if (!nodes.length) return;

    for (var i = 0; i < Math.min(nodes.length, labels.length); i++) {
      nodes[i].textContent = labels[i];
    }
  }

  // -----------------------------
  // CSS bar text updater (✅ panel scoped)
  // -----------------------------
  function updateCssBarTextOnly(panelEl, metrics) {
    if (!panelEl) return;
    var mList = Array.isArray(metrics) ? metrics : [];
    var items = qa('.inve_examine_gp_item', panelEl);
    if (!items.length) return;

    items.forEach(function (item, idx) {
      var m = mList[idx] || null;

      var labelEl = q('.txt strong', item);
      var detailEl = q('.txt p', item);

      // ✅ metric이 없으면(데이터 부족/키 불일치) 기존 텍스트(한글)가 남지 않도록 '-'로 정리
      if (!m) {
        if (labelEl) labelEl.textContent = '-';
        if (detailEl) detailEl.textContent = '-';
        var g0 = q('.bar .gauge', item);
        if (g0) g0.dataset.percent = '0';
        return;
      }

      if (labelEl && m.label != null) labelEl.textContent = m.label;

      if (detailEl) {
        var d = (m.detail == null) ? '-' : String(m.detail).trim();
        detailEl.textContent = (!d || d.toUpperCase() === 'N/A') ? '-' : d;
      }

      // width 애니메이션은 gate HTML에서 이미 돌고 있으니, 여기서는 dataset만 갱신
      var gaugeEl = q('.bar .gauge', item);
      if (gaugeEl && m.score != null) {
        gaugeEl.dataset.percent = String(Number(m.score) || 0);
      }
    });
  }

  // stepEl 내부에서 li(index)의 data-target → 해당 panelElement 찾기
  // ⚠ ASET HTML은 examine01 같은 id가 step마다 중복이라 getElementById 사용 금지
  function getPanelByIndex(stepEl, idx) {
    if (!stepEl) return null;
    var li = qa('.step_examine_list ul li', stepEl)[idx];
    if (!li) return null;
    var box = q('div[data-target]', li) || q('div', li);
    if (!box) return null;
    var target = box.getAttribute('data-target');
    if (!target) return null;
    // stepEl 스코프에서 같은 id를 찾는다.
    return q('[id="' + target + '"]', stepEl);
  }

  // step 내 모든 패널(bar 텍스트)을 언어에 맞게 한 번에 갱신
  function refreshBarsAllPanels(stepEl, lang, type) {
    if (!stepEl) return;
    var lis = qa('.step_examine_list ul li', stepEl);
    if (!lis.length) return;

    for (var i = 0; i < lis.length; i++) {
      var barData = null;
      if (type === 'biz') barData = safeCall(window.getBizBarDetail, lang, COMPANY, i);
      else if (type === 'tech') barData = safeCall(window.getTechBarDetail, lang, COMPANY, i);
      else if (type === 'market') barData = safeCall(window.getMarketBarDetail, lang, COMPANY, i);
      else if (type === 'business') barData = safeCall(window.getBusinessBarDetail, lang, COMPANY, i);
      else if (type === 'growth') barData = safeCall(window.getGrowthBarDetail, lang, COMPANY, i);

      if (!barData || !Array.isArray(barData.metrics)) continue;
      var panel = getPanelByIndex(stepEl, i);
      if (panel) updateCssBarTextOnly(panel, barData.metrics);
    }
  }

  // -----------------------------
  // Data getters (service.js 기반)
  // -----------------------------
  function gradeToScoreSafe(g) {
    var fn = (typeof window.gradeToScore === 'function') ? window.gradeToScore : null;
    if (!fn) return 0;
    return fn(g);
  }

  function getBizRadar(lang) {
    var d = safeCall(window.getBizCapabilityData, lang, COMPANY) || {};
    var labels = d.items || d.names || d.labels;
    var grades = d.grades || d.values || [];
    if (!labels || !labels.length) {
      // fallback: 최소 구성
      labels = (lang === 'eng')
        ? ['Entrepreneurial spirit & credibility', 'CEO / Top management', 'Executive team']
        : ['기업가 정신과 신뢰', '최고 경영자', '경영진'];
    }
    if (!grades || grades.length < 3) {
      var kor = window.COMPANY_DATA_KOR && window.COMPANY_DATA_KOR[COMPANY];
      var cc = kor && kor.evaluation && kor.evaluation.companyCapability;
      if (cc) {
        grades = [
          cc.entrepreneurshipTrust && cc.entrepreneurshipTrust.grade,
          cc.ceo && cc.ceo.grade,
          cc.executives && cc.executives.grade
        ];
      }
    }
    return { labels: labels.slice(0, 3), data: (grades.slice(0, 3) || []).map(gradeToScoreSafe) };
  }

  function getTechRadar(lang) {
    var labels = [], grades = [];
    for (var i = 0; i < 5; i++) {
      var det = safeCall(window.getTechBarDetail, lang, COMPANY, i);
      if (det && det.title != null) labels.push(det.title);
      if (det && det.grade != null) grades.push(det.grade);
    }
    // det.title이 일부만 영어/한국어 섞여있을 수 있어서, 'eng'일 때는 config 기반으로 강제 통일
    // (service.js에 ASIT_TECH_BAR_CONFIG_ENG가 이미 있음)
    if (lang === 'eng' && labels.length === 5) {
      // labels가 섞여있을 가능성: title이 한글이면 교체
      for (var j = 0; j < labels.length; j++) {
        // 한글 포함 여부
        if (/[\u3131-\uD79D]/.test(String(labels[j]))) {
          // 강제 재호출: eng로 다시 (혹시 caller가 잘못 넘겼던 케이스 방어)
          var det2 = safeCall(window.getTechBarDetail, 'eng', COMPANY, j);
          if (det2 && det2.title) labels[j] = det2.title;
        }
      }
    }
    return { labels: labels, data: grades.map(gradeToScoreSafe) };
  }

  function getMarketRadar(lang) {
    var labels = [], grades = [];
    for (var i = 0; i < 3; i++) {
      var det = safeCall(window.getMarketBarDetail, lang, COMPANY, i);
      if (det && det.title != null) labels.push(det.title);
      if (det && det.grade != null) grades.push(det.grade);
    }
    if (lang === 'eng' && labels.length === 3) {
      for (var j = 0; j < labels.length; j++) {
        if (/[\u3131-\uD79D]/.test(String(labels[j]))) {
          var det2 = safeCall(window.getMarketBarDetail, 'eng', COMPANY, j);
          if (det2 && det2.title) labels[j] = det2.title;
        }
      }
    }
    return { labels: labels, data: grades.map(gradeToScoreSafe) };
  }

  function getBusinessBars(lang) {
    var labels = [], grades = [];
    for (var i = 0; i < 2; i++) {
      var det = safeCall(window.getBusinessBarDetail, lang, COMPANY, i);
      if (det && det.title != null) labels.push(det.title);
      if (det && det.grade != null) grades.push(det.grade);
    }
    if (lang === 'eng' && labels.length === 2) {
      for (var j = 0; j < labels.length; j++) {
        if (/[\u3131-\uD79D]/.test(String(labels[j]))) {
          var det2 = safeCall(window.getBusinessBarDetail, 'eng', COMPANY, j);
          if (det2 && det2.title) labels[j] = det2.title;
        }
      }
    }
    return { labels: labels, data: grades.map(gradeToScoreSafe) };
  }

  function getGrowthRadar(lang) {
    var r = safeCall(window.getGrowthRadarValues, lang, COMPANY);
    if (!r) return { labels: [], data: [] };
    return { labels: r.labels || [], data: r.myScores || [] };
  }

  // -----------------------------
  // Chart writers
  // -----------------------------
  function renderRadar(ctrl, labels, data) {
    if (!ctrl) return;

    if (typeof ctrl.setLabels === 'function') ctrl.setLabels(labels);
    if (typeof ctrl.setData === 'function') ctrl.setData(data);

    // Chart.js instance or wrapper
    if (ctrl.data && typeof ctrl.update === 'function') {
      if (labels && Array.isArray(labels)) ctrl.data.labels = labels.slice();
      if (data && ctrl.data.datasets && ctrl.data.datasets[0]) ctrl.data.datasets[0].data = data.slice();
      try { ctrl.update('none'); } catch (e) { try { ctrl.update(); } catch (_) { } }
      return;
    }
    if (ctrl.chart && ctrl.chart.data && typeof ctrl.chart.update === 'function') {
      if (labels && Array.isArray(labels)) ctrl.chart.data.labels = labels.slice();
      if (data && ctrl.chart.data.datasets && ctrl.chart.data.datasets[0]) ctrl.chart.data.datasets[0].data = data.slice();
      try { ctrl.chart.update('none'); } catch (e) { try { ctrl.chart.update(); } catch (_) { } }
      return;
    }

    if (typeof ctrl.renderNow === 'function') {
      try { ctrl.renderNow(); } catch (_) { }
    }
  }

  function renderBar(ctrl, labels, data) {
    if (!ctrl) return;

    if (typeof ctrl.setLabels === 'function') ctrl.setLabels(labels);
    if (typeof ctrl.setData === 'function') ctrl.setData(data);

    // Chart.js instance or wrapper
    if (ctrl.data && typeof ctrl.update === 'function') {
      if (labels && Array.isArray(labels)) ctrl.data.labels = labels.slice();
      if (data && ctrl.data.datasets && ctrl.data.datasets[0]) ctrl.data.datasets[0].data = data.slice();
      try { ctrl.update('none'); } catch (e) { try { ctrl.update(); } catch (_) { } }
      return;
    }
    if (ctrl.chart && ctrl.chart.data && typeof ctrl.chart.update === 'function') {
      if (labels && Array.isArray(labels)) ctrl.chart.data.labels = labels.slice();
      if (data && ctrl.chart.data.datasets && ctrl.chart.data.datasets[0]) ctrl.chart.data.datasets[0].data = data.slice();
      try { ctrl.chart.update('none'); } catch (e) { try { ctrl.chart.update(); } catch (_) { } }
      return;
    }

    if (typeof ctrl.renderNow === 'function') {
      try { ctrl.renderNow(); } catch (_) { }
    }
  }


  // -----------------------------
  // Apply all
  // -----------------------------
  function applyAll(lang) {
    var step01 = document.getElementById('techItemStep01');
    var step02 = document.getElementById('techItemStep02');
    var step03 = document.getElementById('techItemStep03');
    var step04 = document.getElementById('techItemStep04');
    var stepLast = document.getElementById('techItemStepLast');

    // 제목(상단)
    setStepTitle(step01, (lang === 'eng') ? 'Step 1. Company capability' : 'Step 1. 기업역량');
    setStepTitle(step02, (lang === 'eng') ? 'Step 2. Technology' : 'Step 2. 기술성');
    setStepTitle(step03, (lang === 'eng') ? 'Step 3. Marketability' : 'Step 3. 시장성');
    setStepTitle(step04, (lang === 'eng') ? 'Step 4. Business feasibility' : 'Step 4. 사업성');
    setStepTitle(stepLast, (lang === 'eng') ? 'Technology business assessment' : '기술 사업 평가');

    // step nav + radar/bar labels
    var biz = getBizRadar(lang);
    var tech = getTechRadar(lang);
    var market = getMarketRadar(lang);
    var bizBars = getBusinessBars(lang);
    var growth = getGrowthRadar(lang);

    // ✅ ENG일 때만 레이더 라벨 줄바꿈(차트용)
    var bizRadarLabels = wrapRadarLabelsIfEng(biz.labels, lang);
    var techRadarLabels = wrapRadarLabelsIfEng(tech.labels, lang);
    var marketRadarLabels = wrapRadarLabelsIfEng(market.labels, lang);
    var growthRadarLabels = wrapRadarLabelsIfEng(growth.labels, lang);

    // 바 차트는 줄바꿈 불필요(원하면 bar도 적용 가능하지만 보통 X)
    var bizBarLabels = bizBars.labels;

    if (step01 && biz.labels.length) setStepNavLabels(step01, biz.labels);
    if (step02 && tech.labels.length) setStepNavLabels(step02, tech.labels);
    if (step03 && market.labels.length) setStepNavLabels(step03, market.labels);
    if (step04 && bizBars.labels.length) setStepNavLabels(step04, bizBars.labels);
    if (stepLast && growth.labels.length) setStepNavLabels(stepLast, growth.labels);

    // charts: (HTML inline에서 생성된 컨트롤러에 주입)
    // ⚠ gate_01_01_ty_02_aset.html에서 techRadar01Ctrl/02Ctrl/03Ctrl/04Ctrl + techBar01Ctrl를 생성하고 있음
    renderRadar(window.techRadar02Ctrl, bizRadarLabels, biz.data);
    renderRadar(window.techRadar01Ctrl, techRadarLabels, tech.data);
    renderRadar(window.techRadar03Ctrl, marketRadarLabels, market.data);
    renderBar(window.techBar01Ctrl, bizBarLabels, bizBars.data);
    renderRadar(window.techRadar04Ctrl, growthRadarLabels, growth.data);

    // ✅ 좌측 CSS바 텍스트: step 내 모든 panel을 전부 갱신
    refreshBarsAllPanels(step01, lang, 'biz');
    refreshBarsAllPanels(step02, lang, 'tech');
    refreshBarsAllPanels(step03, lang, 'market');
    refreshBarsAllPanels(step04, lang, 'business');
    refreshBarsAllPanels(stepLast, lang, 'growth');
  }

  function refresh() {
    var lang = getLang();
    // 애니메이션/DOM 업데이트 타이밍 때문에 1~2프레임 뒤에 적용
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        applyAll(lang);
      });
    });
  }

  // -----------------------------
  // Boot + Events
  // -----------------------------
  function boot() {
    refresh();

    // ASET 화면은 내부 시퀀스(runInnerStepsForItem)가 class(on/done)을 계속 바꾸므로,
    // step 클릭/시퀀스 진행 도중에도 텍스트가 따라가도록, click 후에도 전체 갱신
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      // step_examine_list 안에서 클릭했을 때
      if (t.closest && t.closest('.step_examine_list')) {
        refresh();
      }
    });

    // 컨트롤러 생성 지연/순서 보정
    setTimeout(refresh, 50);
    setTimeout(refresh, 250);
    setTimeout(refresh, 800);
  }

  // lang_toggle_patched_v2.js가 dispatch하는 이벤트
  window.addEventListener('lang:changed', function () {
    refresh();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // -----------------------------
  // Radar label wrapper (ENG only)
  // - Chart.js radar point labels: Array form is multiline-safe
  // -----------------------------
  function wrapRadarLabelsIfEng(labels, lang, opts) {
    if (!Array.isArray(labels)) return labels;
    if (lang !== 'eng') return labels;

    opts = opts || {};
    var maxLineLen = opts.maxLineLen || 16;
    var minBreakWordLen = opts.minBreakWordLen || 7;

    return labels.map(function (s) {
      if (!s) return s;
      if (typeof s !== 'string') return s;
      if (s.indexOf(' ') < 0) return s;
      return wrapByWordsToLines(s, maxLineLen, minBreakWordLen); // ✅ returns array
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

    return lines; // ✅ array => multiline
  }
})();
