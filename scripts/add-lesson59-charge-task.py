#!/usr/bin/env python3
"""ФИЗМАТ: безопасное добавление задачи в урок 59 и задачи в урок 60 к штатному renderPTasks.
Запускается только в каталоге checkout перед отправкой index.html на Zomro.
Не изменяет PNG/SVG и не переписывает другие задачи."""
from pathlib import Path

page = Path("index.html")
html = page.read_text(encoding="utf-8")
marker = "fizmat-lesson59-charge-direction"
if marker in html:
    print("Урок 59: подключение уже существует.")
    raise SystemExit(0)

anchor = (
    "  const baseTasks=getLessonTasks(name).map(t=>Object.assign({},t,{isBlank:!!(t&&t.isBlank)}));"
)
if html.count(anchor) != 1:
    raise SystemExit("Не найден ровно один штатный renderPTasks; публикация остановлена")

task_script = r"""
  // fizmat-lesson59-charge-direction: штатная задача с кнопкой «Решение».
  if (AC==='ege-phy' && CM===8 && CL===1 && name==='Закон сохранения заряда'
      && !baseTasks.some(t=>t && t.id==='fizmat-lesson59-charge-direction')) {
    baseTasks.push({
      id:'fizmat-lesson59-charge-direction',
      boardMode:'fizmat-lesson59-charge-direction',
      mode:'fizmat-lesson59-charge-direction',
      num:baseTasks.length+1,
      level:1,
      exam:'ЕГЭ',
      title:'Направление ускорения отрицательного заряда',
      cond:'<img src="images/course/ege-phy/m-8/l-1/tasks/59-task-charge-direction.svg" alt="Условие задачи о зарядах −q, +Q и −Q" class="universal-viewable-image image-carousel-img" style="display:block;width:100%;height:auto;object-fit:contain;background:white;border-radius:8px">',
      solutionImage:'images/course/ege-phy/m-8/l-1/tasks/59-task-charge-direction-solution.svg',
      solutionTitle:'Куда направлено ускорение заряда −q? Решение',
      ans:'вниз',
      hasAnimation:false
    });
  }
  // fizmat-lesson59-field-midpoint: задача о напряжённости переносится в урок 60.
  if (AC==='ege-phy' && CM===8 && name==='Электрическое поле'
      && !baseTasks.some(t=>t && t.id==='fizmat-lesson59-field-midpoint')) {
    baseTasks.push({
      id:'fizmat-lesson59-field-midpoint',
      boardMode:'fizmat-lesson59-field-midpoint',
      mode:'fizmat-lesson59-field-midpoint',
      num:baseTasks.length+1,
      level:1,
      exam:'ЕГЭ',
      title:'Направление напряжённости поля в точке B',
      cond:'<img src="images/course/ege-phy/m-8/l-1/tasks/59-task-electric-field-midpoint.svg" alt="Точка B — середина AC, в точке A заряд +q, в точке C заряд −5q. Найдите направление напряжённости поля в B." class="universal-viewable-image image-carousel-img" style="display:block;width:100%;height:auto;object-fit:contain;background:white;border-radius:8px">',
      solutionImage:'images/course/ege-phy/m-8/l-3/tasks/60-task-electric-field-midpoint-solution.svg',
      solutionTitle:'Куда направлена напряжённость поля в точке B? Решение',
      ans:'вправо',
      hasAnimation:false
    });
  }
"""
html = html.replace(anchor, anchor + "\n" + task_script, 1)
page.write_text(html, encoding="utf-8")
print("Урок 59: первая задача сохранена; урок 60: задача про точку B добавлена.")
