/* lesson-book-embed.js
 * Shows the student book (the pages made from the teacher's PDF) inside the lesson page,
 * as a new section "كتاب الطالب". It does NOT edit your HTML: it builds the section itself.
 *
 * Install: put this file next to your index.html and add ONE line before </body>:
 *     <script src="lesson-book-embed.js" defer></script>
 */
(function () {
  'use strict';

  /* ===== 1) SETTINGS: edit only this part ===== */

  // Where the exported student book is stored on your site (relative to your index.html).
  var BOOK_URL = 'data/subjects/english/test/test_lessons.json';

  // Lesson title (exactly as it appears in the lesson page)  ->  which book pages belong to it.
  // from / to are 1-based page numbers of the book. Leave "to" out to show until the last page.
  var LESSONS = {
    'Unit 1 علمي': { from: 5,  to: 12 },
    'Unit 2 علمي': { from: 13, to: 20 }
    // 'Unit 3 علمي': { from: 21, to: 30 },
  };

  // Optional: you may also define the table in another file: window.RF_LESSON_BOOKS = {...}
  if (window.RF_LESSON_BOOKS) { for (var k in window.RF_LESSON_BOOKS) LESSONS[k] = window.RF_LESSON_BOOKS[k]; }

  /* ===== 2) CODE (no need to edit) ===== */

  var SECTION_ID = 'lesson-book-section';
  var norm = function (t) { return String(t || '').replace(/\s+/g, ' ').trim(); };
  var $ = function (id) { return document.getElementById(id); };

  var css = document.createElement('style');
  css.textContent =
    '.lb-frame-wrap{position:relative;width:100%;border-radius:14px;overflow:hidden;background:#2a2b4d;' +
    'box-shadow:0 10px 30px rgba(20,20,60,.28);border:1px solid rgba(0,0,0,.08)}' +
    '.lb-frame-wrap iframe{display:block;width:100%;height:min(88vh,860px);min-height:440px;border:0}' +
    '.lb-hint{margin:8px 2px 0;font-size:.85em;opacity:.75;text-align:center}';
  document.head.appendChild(css);

  function buildSection() {
    var sec = document.createElement('div');
    sec.className = 'lesson-section lesson-book';
    sec.id = SECTION_ID;
    sec.innerHTML =
      '<h3><i class="fas fa-book-open"></i> كتاب الطالب</h3>' +
      '<div class="lesson-section-content">' +
        '<div class="lb-frame-wrap"><iframe title="كتاب الطالب" allow="fullscreen" allowfullscreen loading="lazy"></iframe></div>' +
        '<p class="lb-hint">اضغط بإصبعين للتكبير والتصغير، واستخدم أزرار اليمين للتنقل بين الصفحات. زر الشاشة الكاملة في الأعلى.</p>' +
      '</div>';
    var panel = $('lesson-content-panel');
    var anchor = document.querySelector('.external-links-section');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else if (panel) panel.appendChild(sec);
    else document.body.appendChild(sec);
    return sec;
  }

  function bookSrc(conf) {
    var q = ['embed=1'];
    if (conf.from) q.push('page=' + conf.from);
    if (conf.to) q.push('to=' + conf.to);
    return BOOK_URL + '?' + q.join('&');
  }

  function update() {
    var titleEl = $('lesson-title-display');
    if (!titleEl) return;
    var title = norm(titleEl.textContent);
    var conf = LESSONS[title];
    var sec = $(SECTION_ID);

    if (!conf) {                                   // lesson without a book
      if (sec) { sec.hidden = true; var f0 = sec.querySelector('iframe'); if (f0 && f0.getAttribute('src')) f0.removeAttribute('src'); }
      if (title && title !== 'عنوان الدرس') console.info('[lesson-book] no book pages set for lesson title:', JSON.stringify(title));
      return;
    }
    if (!sec) sec = buildSection();
    sec.hidden = false;
    var frame = sec.querySelector('iframe');
    var src = bookSrc(conf);
    if (frame.getAttribute('src') !== src) frame.setAttribute('src', src);
  }

  function start() {
    update();
    var titleEl = $('lesson-title-display');
    if (titleEl) {
      new MutationObserver(update).observe(titleEl, { childList: true, characterData: true, subtree: true });
    } else {                                       // title element not in the page yet: wait for it
      var wait = new MutationObserver(function () {
        if ($('lesson-title-display')) { wait.disconnect(); start(); }
      });
      wait.observe(document.documentElement, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
