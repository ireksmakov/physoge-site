/* ФИЗМАТ · ЕГЭ Физика · Электростатика · теория «Потенциал и потенциальная энергия».
   Подключается после основного скрипта сайта. Изображение сохраняется как есть. */
(function () {
  'use strict';
  const src = 'images/ege-physics/lesson-62/theory/potential-energy.png';
  const marker = 'fizmat-potential-energy-theory-62';
  const targetTitle = /потенциал\s+и\s+потенциальная\s+энергия/i;

  function isTargetLesson() {
    try {
      if (typeof AC !== 'undefined' && AC !== 'ege-phy') return false;
      if (typeof getLessonObject !== 'function' || typeof lessonTitle !== 'function') return false;
      const lesson = getLessonObject(AC, CM, CL);
      return targetTitle.test(String(lessonTitle(lesson) || ''));
    } catch (_) {
      return false;
    }
  }

  function imageMarkup() {
    return '<figure id="' + marker + '" style="width:100%;max-width:100%;margin:22px 0;overflow:visible;">'
      + '<img class="universal-viewable-image" src="' + src + '"'
      + ' alt="Потенциал и потенциальная энергия — инфографика по электростатике"'
      + ' loading="lazy" decoding="async"'
      + ' style="display:block;width:100%;max-width:100%;height:auto;object-fit:contain;border-radius:12px;cursor:zoom-in"'
      + ' onerror="this.closest(\'figure\').style.display=\'none\'">'
      + '</figure>';
  }

  if (typeof renderTheory !== 'function' || typeof getLessonObject !== 'function') return;
  const original = renderTheory;
  renderTheory = function () {
    const html = original.apply(this, arguments);
    if (!isTargetLesson() || typeof html !== 'string' || html.includes('id="' + marker + '"')) return html;
    return html + imageMarkup();
  };
})();
