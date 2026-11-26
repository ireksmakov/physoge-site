/* ФИЗМАТ — изображение теории: ЕГЭ физика, урок 62.
   Не меняет данные курса, исходное PNG и другие уроки. */
(function () {
  'use strict';
  const imagePath = 'lesson-62-potential-energy.png';
  const imageId = 'fizmat-potential-energy-theory-62';
  const lessonRoute = /^#course\/ege-phy\/m\/8\/l\/9(?:\/|$)/i;

  function updateTheoryImage() {
    const old = document.getElementById(imageId);
    if (!lessonRoute.test(window.location.hash)) {
      if (old) old.remove();
      return;
    }
    const theory = document.getElementById('pan-theory');
    if (!theory || old || !theory.isConnected) return;
    const figure = document.createElement('figure');
    figure.id = imageId;
    figure.style.cssText = 'width:100%;max-width:100%;margin:22px 0;overflow:visible;';
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = 'Потенциал и потенциальная энергия — теория по электростатике';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.className = 'theory-carousel-img universal-viewable-image image-carousel-img';
    img.style.cssText = 'display:block;width:100%;max-width:100%;height:auto;object-fit:contain;border-radius:12px;cursor:zoom-in;';
    img.addEventListener('error', function () { figure.style.display = 'none'; });
    figure.appendChild(img);
    theory.prepend(figure);
  }

  let scheduled = false;
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () { scheduled = false; updateTheoryImage(); });
  }
  document.addEventListener('DOMContentLoaded', function () {
    scheduleUpdate();
    window.addEventListener('hashchange', scheduleUpdate);
    new MutationObserver(scheduleUpdate).observe(document.body, { childList:true, subtree:true });
  });
  if (document.readyState !== 'loading') {
    scheduleUpdate();
    window.addEventListener('hashchange', scheduleUpdate);
    new MutationObserver(scheduleUpdate).observe(document.body, { childList:true, subtree:true });
  }
})();
