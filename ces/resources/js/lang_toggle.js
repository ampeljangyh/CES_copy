document.addEventListener('DOMContentLoaded', function () {
  var langBtn = document.querySelector('.btn_lang');
  if (!langBtn) return;

  var body = document.body;

  // 1) localStorage에 저장된 언어 상태 불러오기
  var savedLang = localStorage.getItem('siteLang'); // 'lang_kr' or 'lang_en'

  if (savedLang === 'lang_kr' || savedLang === 'lang_en') {
    // 저장된 언어가 있으면 그걸로 body id 세팅
    body.id = savedLang;
  } else {
    // 저장된 값이 없으면: 기존 id 유지, 없으면 기본 lang_kr
    if (!body.id) {
      body.id = 'lang_kr';
    }
  }

  // 2) 버튼 클릭 시 토글 + localStorage 저장
  langBtn.addEventListener('click', function () { 
    var currentId = body.id || 'lang_kr';
    var nextId    = currentId === 'lang_kr' ? 'lang_en' : 'lang_kr';

    body.id = nextId;                  // 실제 DOM 적용
    localStorage.setItem('siteLang', nextId); // 다음 페이지에서도 유지
  });
});
