(function(){
'use strict';

const HOMEWORK_API_URL='api/homework.php';
const HW_TEACHER_KEY_STORAGE='fizmat_teacher_key_v1';
const HW_STUDENT_STORAGE='fizmat_hw_student_v1';
const HW_LOCAL_PROGRESS_STORAGE='fizmat_hw_progress_v1';
const HW_ASSIGNMENT_ID='ege-phy-39-hw-01';
const HW_ASSIGNMENT_TITLE='ЕГЭ физика · Урок 39 · Преобразование энергии в колебательных процессах';

function hwEsc(value){
  return String(value==null?'':value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function hwInjectStyles(){
  if(document.getElementById('fizmatHomeworkTrackingStyles')) return;
  const style=document.createElement('style');
  style.id='fizmatHomeworkTrackingStyles';
  style.textContent=`
.hw-student-box{margin:0 0 16px;padding:16px;border:1px solid rgba(8,216,255,.28);border-radius:14px;background:linear-gradient(145deg,rgba(5,20,36,.96),rgba(3,13,25,.94));box-shadow:0 14px 34px rgba(0,0,0,.16)}
.hw-student-title{font-family:var(--fh);font-size:15px;font-weight:900;color:var(--white);margin-bottom:5px}
.hw-student-note{font-size:12px;color:var(--gray);line-height:1.55;margin-bottom:12px}
.hw-student-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(120px,.55fr) auto;gap:10px;align-items:end}
.hw-student-field{display:grid;gap:6px}.hw-student-field span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--gray);font-weight:800}
.hw-student-input,.hw-match-select,.teacher-key-input{width:100%;min-width:0;background:rgba(4,12,22,.82);border:1px solid rgba(8,216,255,.26);border-radius:9px;color:var(--white);padding:10px 11px;font-family:var(--fb);font-size:13px;outline:none}
.hw-student-input:focus,.hw-match-select:focus,.teacher-key-input:focus{border-color:rgba(8,216,255,.76);box-shadow:0 0 0 3px rgba(8,216,255,.1)}
.hw-student-consent{display:flex;gap:8px;align-items:flex-start;margin-top:11px;color:var(--gray);font-size:11px;line-height:1.45}.hw-student-consent input{margin-top:2px;accent-color:var(--cyan)}
.hw-student-status{min-height:18px;margin-top:7px;font-size:11px;color:var(--gray)}.hw-student-status.ok{color:var(--green)}.hw-student-status.err{color:#ff8c00}
.hw-match-gate{display:grid;gap:10px;padding:13px;border:1px solid rgba(255,140,0,.22);border-left:3px solid var(--orange);border-radius:0 12px 12px 0;background:var(--bg2)}
.hw-match-row{display:grid;grid-template-columns:34px 1fr;gap:9px;align-items:center}.hw-match-letter{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:rgba(8,216,255,.1);border:1px solid rgba(8,216,255,.28);font-family:var(--fh);font-weight:900;color:var(--cyan)}
.hw-match-select option{background:#071423;color:#f2f8ff}
.hw-track-status{min-height:17px;font-size:11px;color:var(--gray)}.hw-track-status.ok{color:var(--green)}.hw-track-status.err{color:#ff8c00}
.hw39-condition{display:grid;gap:14px}.hw39-lead{font-size:15px;line-height:1.72;color:var(--white)}
.hw39-top{display:grid;grid-template-columns:minmax(0,1fr) 160px;gap:18px;align-items:center}.hw39-pendulum{width:100%;max-width:150px;justify-self:center}
.hw39-columns{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:18px}.hw39-panel{padding:13px;border:1px solid rgba(8,216,255,.18);border-radius:13px;background:rgba(4,12,22,.58)}
.hw39-panel h4{font-family:var(--fh);font-size:13px;margin:0 0 10px;color:var(--white)}.hw39-graphs{display:grid;gap:12px}.hw39-graph{background:#fff;border-radius:10px;padding:8px;color:#0f172a}.hw39-graph svg{display:block;width:100%;height:auto}
.hw39-quantities{display:grid;gap:8px;color:var(--gray);font-size:13px}.hw39-quantities strong{color:var(--white)}
.hw39-solution{display:grid;gap:10px;color:var(--gray);line-height:1.65}.hw39-solution strong{color:var(--white)}.hw39-answer{padding:10px 12px;border-radius:10px;background:rgba(57,255,20,.08);border:1px solid rgba(57,255,20,.24);color:var(--green);font-weight:900;text-align:center}
.teacher-dashboard{max-width:1180px;margin:0 auto;padding:104px 24px 56px}
.teacher-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.teacher-hero h1{font-family:var(--fh);font-size:clamp(24px,3.4vw,42px);line-height:1.15;margin:6px 0 8px}.teacher-kicker{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--cyan);font-weight:900}.teacher-sub{color:var(--gray);max-width:720px}
.teacher-card{border:1px solid var(--border);border-radius:16px;background:var(--panel);box-shadow:var(--panel-shadow);padding:18px;margin-bottom:14px}.teacher-card h2{font-family:var(--fh);font-size:16px;margin-bottom:10px}
.teacher-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:14px 0}.teacher-stat{padding:16px;border:1px solid rgba(8,216,255,.18);border-radius:14px;background:rgba(8,216,255,.035)}.teacher-stat strong{display:block;font-family:var(--fh);font-size:26px;color:var(--cyan);line-height:1.1}.teacher-stat span{display:block;color:var(--gray);font-size:11px;margin-top:5px}
.teacher-link-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}.teacher-link-box{padding:11px 12px;border-radius:10px;background:rgba(4,12,22,.82);border:1px solid rgba(8,216,255,.24);color:#cfeeff;font-size:12px;overflow-wrap:anywhere}
.teacher-btn{border:1px solid rgba(8,216,255,.36);background:rgba(8,216,255,.09);color:var(--cyan);padding:10px 14px;border-radius:9px;font-family:var(--fb);font-weight:800;cursor:pointer}.teacher-btn:hover{background:rgba(8,216,255,.16);border-color:var(--cyan)}.teacher-btn.secondary{color:var(--gray);border-color:rgba(148,163,184,.28);background:rgba(148,163,184,.06)}
.teacher-table-wrap{overflow:auto;border:1px solid rgba(8,216,255,.16);border-radius:12px}.teacher-table{width:100%;border-collapse:collapse;min-width:760px}.teacher-table th,.teacher-table td{padding:11px 12px;text-align:left;border-bottom:1px solid rgba(148,163,184,.12);font-size:12px}.teacher-table th{color:var(--cyan);background:rgba(8,216,255,.045);font-size:10px;text-transform:uppercase;letter-spacing:.07em}.teacher-table td{color:var(--gray)}.teacher-table td strong{color:var(--white)}.teacher-status-ok{color:var(--green)!important;font-weight:800}.teacher-status-bad{color:#ff9f43!important;font-weight:800}
.teacher-key-tools{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;margin-top:10px}.teacher-help{font-size:11px;line-height:1.5;color:var(--gray);margin-top:8px}.teacher-error{border-color:rgba(255,140,0,.36);background:rgba(255,140,0,.05)}.teacher-error strong{color:#ffb45c}
.teacher-empty{padding:24px;text-align:center;color:var(--gray);font-size:13px}
.teacher-loading{padding:120px 24px;text-align:center;color:var(--gray)}
.hero-teacher-link{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--cyan);font-weight:800}
@media(max-width:800px){.hw-student-grid{grid-template-columns:1fr}.hw39-top,.hw39-columns{grid-template-columns:1fr}.hw39-pendulum{max-width:120px}.teacher-stats{grid-template-columns:1fr 1fr}.teacher-link-row,.teacher-key-tools{grid-template-columns:1fr}.teacher-hero{display:block}}
@media(max-width:480px){.teacher-stats{grid-template-columns:1fr}.teacher-dashboard{padding-left:14px;padding-right:14px}}
`;
  document.head.appendChild(style);
}

function hwAssignmentToken(){
  try{return new URLSearchParams(window.location.search).get('hwtoken')||'';}catch(e){return '';}
}
function hwStudentData(){
  try{
    const raw=localStorage.getItem(HW_STUDENT_STORAGE);
    const parsed=raw?JSON.parse(raw):{};
    return parsed&&typeof parsed==='object'?parsed:{};
  }catch(e){return {};}
}
function hwSaveStudentData(data){
  try{localStorage.setItem(HW_STUDENT_STORAGE,JSON.stringify(data||{}));}catch(e){}
}
function hwRenderStudentIdentity(){
  const token=hwAssignmentToken();
  if(!token)return '';
  const student=hwStudentData();
  return `<section class="hw-student-box" id="hwStudentIdentityBox">
    <div class="hw-student-title">Ученик · выполнение по ссылке преподавателя</div>
    <div class="hw-student-note">Укажите имя перед проверкой. ФИО/имя, класс и результаты попыток будут переданы преподавателю, который выдал эту ссылку.</div>
    <div class="hw-student-grid">
      <label class="hw-student-field"><span>ФИО или имя</span><input class="hw-student-input" id="hwStudentName" maxlength="120" autocomplete="name" value="${hwEsc(student.studentName||'')}" placeholder="Например: Иван Петров"></label>
      <label class="hw-student-field"><span>Класс</span><input class="hw-student-input" id="hwStudentClass" maxlength="40" value="${hwEsc(student.className||'')}" placeholder="11А"></label>
      <button class="teacher-btn" type="button" onclick="hwSaveStudentIdentity()">Сохранить</button>
    </div>
    <label class="hw-student-consent"><input id="hwStudentConsent" type="checkbox" ${student.consent?'checked':''}><span>Я согласен(на) передать преподавателю указанные данные и результаты выполнения этого домашнего задания.</span></label>
    <div class="hw-student-status ${student.studentName&&student.consent?'ok':''}" id="hwStudentStatus">${student.studentName&&student.consent?'Данные сохранены на этом устройстве.':''}</div>
  </section>`;
}
function hwReadIdentityFromForm(){
  const nameEl=document.getElementById('hwStudentName');
  const classEl=document.getElementById('hwStudentClass');
  const consentEl=document.getElementById('hwStudentConsent');
  return {
    studentName:nameEl?nameEl.value.trim():'',
    className:classEl?classEl.value.trim():'',
    consent:!!(consentEl&&consentEl.checked)
  };
}
window.hwSaveStudentIdentity=function(){
  const data=hwReadIdentityFromForm();
  const status=document.getElementById('hwStudentStatus');
  if(!data.studentName){
    if(status){status.className='hw-student-status err';status.textContent='Введите ФИО или имя ученика.';}
    document.getElementById('hwStudentName')?.focus();
    return false;
  }
  if(!data.consent){
    if(status){status.className='hw-student-status err';status.textContent='Нужно подтвердить передачу результата преподавателю.';}
    document.getElementById('hwStudentConsent')?.focus();
    return false;
  }
  hwSaveStudentData(data);
  if(status){status.className='hw-student-status ok';status.textContent='Данные сохранены. Результаты проверок будут видны преподавателю.';}
  return true;
};
function hwEnsureIdentity(){
  if(!hwAssignmentToken())return {ok:true,data:hwStudentData()};
  const ok=window.hwSaveStudentIdentity();
  return {ok:ok,data:ok?hwReadIdentityFromForm():null};
}

function hwLocalAttempt(itemId,answer,correct){
  try{
    const raw=localStorage.getItem(HW_LOCAL_PROGRESS_STORAGE);
    const data=raw?JSON.parse(raw):[];
    const list=Array.isArray(data)?data:[];
    list.push({itemId:itemId||'',answer:String(answer||''),correct:!!correct,at:new Date().toISOString()});
    localStorage.setItem(HW_LOCAL_PROGRESS_STORAGE,JSON.stringify(list.slice(-300)));
  }catch(e){}
}
async function hwApi(payload){
  const response=await fetch(HOMEWORK_API_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    cache:'no-store',
    credentials:'same-origin',
    body:JSON.stringify(payload||{})
  });
  let data=null;
  try{data=await response.json();}catch(e){}
  if(!response.ok||!data||data.ok!==true){
    const err=new Error(data&&data.error?data.error:'api_error');
    err.status=response.status;
    throw err;
  }
  return data;
}
async function hwSendAttempt(gate,itemId,answer,localCorrect){
  const token=hwAssignmentToken();
  if(!token)return;
  const identity=hwReadIdentityFromForm();
  const status=gate?gate.querySelector('.hw-track-status'):null;
  if(status){status.className='hw-track-status';status.textContent='Отправляем результат преподавателю…';}
  try{
    const result=await hwApi({
      action:'submit',
      assignmentToken:token,
      studentName:identity.studentName,
      className:identity.className,
      consent:identity.consent,
      homeworkId:itemId||'',
      answer:String(answer||'')
    });
    if(status){
      status.className='hw-track-status ok';
      status.textContent=result.correct===localCorrect?'Результат отправлен преподавателю ✓':'Результат сохранён преподавателю ✓';
    }
  }catch(err){
    if(status){
      status.className='hw-track-status err';
      status.textContent='Автопроверка выполнена, но отправить статистику преподавателю пока не удалось.';
    }
  }
}
function hwAfterCheck(gate,itemId,answer,ok,wrongMessage){
  if(!gate)return;
  const message=gate.querySelector('.hw-answer-message');
  const cardBtn=gate.querySelector('.hw-card-btn');
  if(ok){
    if(message){message.className='hw-answer-message ok';message.textContent='Верно. Можно открыть разбор.';}
    if(cardBtn){cardBtn.disabled=false;cardBtn.classList.remove('is-disabled');}
  }else{
    if(message){message.className='hw-answer-message err';message.textContent=wrongMessage||'Пока неверно. Проверьте выбор и попробуйте ещё раз.';}
    if(cardBtn){
      cardBtn.disabled=true;
      cardBtn.classList.add('is-disabled');
      const solution=cardBtn.dataset.hwTarget?document.getElementById(cardBtn.dataset.hwTarget):null;
      if(solution)solution.classList.remove('open');
      cardBtn.textContent='▶ Карточка';
    }
  }
  hwLocalAttempt(itemId,answer,ok);
  hwSendAttempt(gate,itemId,answer,ok);
}

function hwRenderMatchingGate(item,sid){
  const options=Array.isArray(item.matchingOptions)&&item.matchingOptions.length?item.matchingOptions:[
    {value:'1',label:'1'},
    {value:'2',label:'2'},
    {value:'3',label:'3'},
    {value:'4',label:'4'}
  ];
  const optionHtml='<option value="">— выберите —</option>'+options.map(function(opt){
    return '<option value="'+hwEsc(opt.value)+'">'+hwEsc(opt.label)+'</option>';
  }).join('');
  return `<div class="hw-match-gate hw-answer-gate" data-answer="${hwEsc(item.answer||'')}" data-item-id="${hwEsc(item.id||'')}" data-wrong-message="${hwEsc(item.wrongMessage||'')}">
    <div class="hw-answer-label">Установите соответствие</div>
    <div class="hw-match-row"><div class="hw-match-letter">А</div><select class="hw-match-select" data-match="A" aria-label="Ответ для графика А">${optionHtml}</select></div>
    <div class="hw-match-row"><div class="hw-match-letter">Б</div><select class="hw-match-select" data-match="B" aria-label="Ответ для графика Б">${optionHtml}</select></div>
    <div class="hw-answer-actions"><button class="pt-sol-btn hw-check-btn" type="button" onclick="hwCheckMatching(this)">Проверить</button><button class="pt-sol-btn hw-card-btn is-disabled" type="button" data-hw-target="${sid}" disabled onclick="hwToggle('${sid}',this)">▶ Карточка</button></div>
    <p class="hw-answer-message" aria-live="polite"></p>
    <div class="hw-track-status" aria-live="polite"></div>
  </div>`;
}
window.hwCheckMatching=function(btn){
  const gate=btn?btn.closest('.hw-match-gate'):null;
  if(!gate)return;
  const identity=hwEnsureIdentity();
  if(!identity.ok)return;
  const a=gate.querySelector('[data-match="A"]')?.value||'';
  const b=gate.querySelector('[data-match="B"]')?.value||'';
  const message=gate.querySelector('.hw-answer-message');
  if(!a||!b){
    if(message){message.className='hw-answer-message err';message.textContent='Выберите варианты для графиков А и Б.';}
    return;
  }
  const actual=a+b;
  const expected=String(gate.dataset.answer||'').replace(/\s+/g,'');
  const ok=actual===expected;
  hwAfterCheck(gate,gate.dataset.itemId||'',actual,ok,gate.dataset.wrongMessage||'Пока неверно. Сопоставьте форму графиков с изменением энергии маятника.');
};

const originalHwCheckAnswer=window.hwCheckAnswer;
window.hwCheckAnswer=function(btn){
  const gate=btn?btn.closest('.hw-answer-gate'):null;
  if(!gate||gate.classList.contains('hw-match-gate')){
    if(originalHwCheckAnswer)return originalHwCheckAnswer(btn);
    return;
  }
  const identity=hwEnsureIdentity();
  if(!identity.ok)return;
  const input=gate.querySelector('.hw-answer-input');
  const expected=Number(String(gate.dataset.answer||'').toLowerCase().replace(/,/g,'.').replace(/\s+/g,'').replace(/м\/с|м\/c|m\/s/g,''));
  const actual=Number(String(input?input.value:'').toLowerCase().replace(/,/g,'.').replace(/\s+/g,'').replace(/м\/с|м\/c|m\/s/g,''));
  const ok=Number.isFinite(expected)&&Number.isFinite(actual)&&Math.abs(actual-expected)<=0.01;
  hwAfterCheck(gate,gate.dataset.itemId||'',input?input.value:'',ok,gate.dataset.wrongMessage||'Пока неверно. Проверьте вычисления и попробуйте ещё раз.');
};

function hwSolutionContent(item){
  if(item.solutionHtml)return '<div class="pt-rich-card">'+item.solutionHtml+'</div>';
  if(item.image)return '<div class="pt-rich-card"><div class="pt-photo-wrap" data-solution-zoom="true"><img class="pt-photo-img" src="'+hwEsc(item.image)+'" alt="'+hwEsc(item.title||'Решение')+'"></div></div>';
  return '<div class="pt-rich-card"><div class="emp">Разбор будет добавлен позже.</div></div>';
}

window.renderHW=function(ld){
  const lessonName=lessonTitle(getLessonObject(AC,CM,CL));
  const items=LESSON_HOMEWORK[lessonName]||[];
  const identityBlock=hwRenderStudentIdentity();
  const cards=items.length?'<div style="font-size:12px;color:var(--gray);margin-bottom:14px">Выполните задание и нажмите «Проверить». При входе по ссылке преподавателя попытка сохранится в его статистике.</div>'+items.map(function(item,index){
    const sid='hwCard_'+index;
    const hasAnswer=item.answer!=null&&String(item.answer).trim()!=='';
    let side='';
    if(item.answerType==='matching'){
      side=hwRenderMatchingGate(item,sid);
    }else if(hasAnswer){
      side=`<div class="hw-answer-gate" data-answer="${hwEsc(item.answer||'')}" data-item-id="${hwEsc(item.id||'')}" data-wrong-message="${hwEsc(item.wrongMessage||'')}"><label class="hw-answer-label" for="${sid}_answer">${hwEsc(item.unitLabel||'Введите ответ')}</label><input class="hw-answer-input" id="${sid}_answer" type="text" inputmode="decimal" autocomplete="off" onkeydown="hwAnswerKey(event,this)"><div class="hw-answer-actions"><button class="pt-sol-btn hw-check-btn" type="button" onclick="hwCheckAnswer(this)">Проверить</button><button class="pt-sol-btn hw-card-btn is-disabled" type="button" data-hw-target="${sid}" disabled onclick="hwToggle('${sid}',this)">▶ Карточка</button></div><p class="hw-answer-message" aria-live="polite"></p><div class="hw-track-status" aria-live="polite"></div></div>`;
    }else{
      side=(item.given?'<div class="pt-given">'+item.given+'</div>':'')+'<button class="pt-sol-btn" type="button" onclick="hwToggle(\''+sid+'\',this)">▶ Карточка</button>';
    }
    return '<div class="pt-card hw-card"><div class="pt-head"><div class="pt-num">'+String(item.num).padStart(2,'0')+'</div><span class="pt-level pt-l2">'+hwEsc(item.level||'Домашняя')+'</span><span class="pt-exam">'+hwEsc(item.badge||'Для ученика')+'</span><span class="pt-title">'+hwEsc(item.title||'Задание')+'</span></div><div class="pt-body"><div class="pt-condition">'+(item.cond||'')+'</div><div class="pt-side">'+side+'</div></div><div class="pt-solution" id="'+sid+'">'+hwSolutionContent(item)+'</div></div>';
  }).join(''):'';
  const files=ld&&Array.isArray(ld.files)?ld.files:[];
  return identityBlock+cards+`<label class="hwd" for="hwi"><div class="hwi">📎</div><p>Нажмите или перетащите файл сюда</p>
    <small>PDF, DOC, JPG, PNG — до 20 МБ</small>
    <input id="hwi" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple onchange="addHW(this)"></label>
  <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--cyan);margin-bottom:10px">Сданные работы</div>
  ${files.map((f,i)=>'<div class="fli"><span style="font-size:18px">📄</span><div style="flex:1"><div style="font-size:13px;font-weight:600">'+hwEsc(f.name)+'</div><div style="font-size:11px;color:var(--gray)">'+hwEsc(f.size)+' · '+hwEsc(f.date)+'</div></div><span class="fbadge">новое</span><button class="db" onclick="delF('+i+')">✕</button></div>').join('')||'<div class="emp">Работы не сданы</div>'}`;
};

const lesson39Condition=`
<div class="hw39-condition">
  <div class="hw39-top">
    <div class="hw39-lead">Маятник отклонили от положения равновесия и отпустили в момент времени <strong>t = 0</strong> с нулевой начальной скоростью. Графики А и Б отображают изменение с течением времени физических величин, характеризующих движение груза маятника после этого. Установите соответствие между графиками и физическими величинами, изменение которых со временем эти графики могут отображать. <strong>T</strong> — период колебаний маятника. Сопротивлением воздуха пренебречь.</div>
    <svg class="hw39-pendulum" viewBox="0 0 150 170" role="img" aria-label="Маятник отклонён влево от положения равновесия">
      <rect x="48" y="8" width="72" height="8" rx="3" fill="#9aa7b5"/>
      <line x1="84" y1="16" x2="48" y2="112" stroke="#ff8c00" stroke-width="4"/>
      <ellipse cx="43" cy="122" rx="11" ry="19" transform="rotate(26 43 122)" fill="#ff8c00"/>
      <line x1="84" y1="16" x2="84" y2="145" stroke="#5f748c" stroke-width="2" stroke-dasharray="5 5"/>
      <line x1="84" y1="145" x2="140" y2="145" stroke="#e5edf7" stroke-width="2"/>
      <line x1="84" y1="145" x2="84" y2="80" stroke="#e5edf7" stroke-width="2"/>
      <text x="137" y="162" fill="#dbeafe" font-size="16">x</text><text x="91" y="86" fill="#dbeafe" font-size="16">y</text><text x="78" y="163" fill="#dbeafe" font-size="14">0</text>
    </svg>
  </div>
  <div class="hw39-columns">
    <div class="hw39-panel">
      <h4>Графики</h4>
      <div class="hw39-graphs">
        <div class="hw39-graph"><strong>А)</strong>
          <svg viewBox="0 0 340 135" role="img" aria-label="График А: два положительных максимума за период T, нули при 0, T/2 и T">
            <line x1="35" y1="112" x2="320" y2="112" stroke="#111827" stroke-width="2"/><line x1="35" y1="112" x2="35" y2="16" stroke="#111827" stroke-width="2"/>
            <path d="M35 112 C55 112 65 28 95 28 C125 28 135 112 165 112 C195 112 205 28 235 28 C265 28 275 112 305 112" fill="none" stroke="#111827" stroke-width="4"/>
            <text x="22" y="128" fill="#111827" font-size="16">0</text><text x="297" y="130" fill="#111827" font-size="16">T</text><text x="319" y="126" fill="#111827" font-size="16">t</text>
          </svg>
        </div>
        <div class="hw39-graph"><strong>Б)</strong>
          <svg viewBox="0 0 340 120" role="img" aria-label="График Б: постоянная положительная величина в течение периода T">
            <line x1="35" y1="98" x2="320" y2="98" stroke="#111827" stroke-width="2"/><line x1="35" y1="98" x2="35" y2="15" stroke="#111827" stroke-width="2"/>
            <line x1="35" y1="48" x2="305" y2="48" stroke="#111827" stroke-width="4"/>
            <line x1="305" y1="48" x2="305" y2="98" stroke="#6b7280" stroke-width="2" stroke-dasharray="6 6"/>
            <text x="22" y="114" fill="#111827" font-size="16">0</text><text x="297" y="114" fill="#111827" font-size="16">T</text><text x="319" y="112" fill="#111827" font-size="16">t</text>
          </svg>
        </div>
      </div>
    </div>
    <div class="hw39-panel">
      <h4>Физические величины</h4>
      <div class="hw39-quantities">
        <div><strong>1)</strong> потенциальная энергия E<sub>п</sub></div>
        <div><strong>2)</strong> полная механическая энергия E<sub>мех</sub></div>
        <div><strong>3)</strong> кинетическая энергия E<sub>к</sub></div>
        <div><strong>4)</strong> координата x</div>
      </div>
      <p style="margin:12px 0 0;color:var(--gray);font-size:12px">Для каждой позиции первого столбца выберите номер из второго столбца.</p>
    </div>
  </div>
</div>`;

const lesson39Solution=`<div class="hw39-solution">
  <div><strong>График А → 3, кинетическая энергия.</strong> В момент отпускания скорость груза равна нулю, поэтому E<sub>к</sub>=0. При прохождении положения равновесия скорость максимальна, значит кинетическая энергия достигает максимума. За один период это происходит дважды.</div>
  <div><strong>График Б → 2, полная механическая энергия.</strong> Сопротивлением воздуха пренебрегаем, поэтому сумма потенциальной и кинетической энергий остаётся постоянной.</div>
  <div class="hw39-answer">Ответ: 32</div>
</div>`;

if(typeof LESSON_HOMEWORK!=='undefined'){
  LESSON_HOMEWORK['Преобразование энергии в колебательных процессах']=[{
    id:HW_ASSIGNMENT_ID,
    num:1,
    title:'Маятник: графики энергии',
    level:'Домашняя',
    badge:'ЕГЭ · соответствие',
    answerType:'matching',
    answer:'32',
    matchingOptions:[
      {value:'1',label:'1 — потенциальная энергия Eп'},
      {value:'2',label:'2 — полная механическая энергия Eмех'},
      {value:'3',label:'3 — кинетическая энергия Eк'},
      {value:'4',label:'4 — координата x'}
    ],
    wrongMessage:'Пока неверно. Учтите, что маятник отпускают с нулевой скоростью, а полная механическая энергия без сопротивления сохраняется.',
    cond:lesson39Condition,
    solutionHtml:lesson39Solution
  }];
}

function ensureTeacherPage(){
  let page=document.getElementById('teacher-dashboard-page');
  if(!page){
    page=document.createElement('div');
    page.id='teacher-dashboard-page';
    page.className='page-hidden';
    document.body.appendChild(page);
  }
  return page;
}
function teacherStoredKey(){
  try{return localStorage.getItem(HW_TEACHER_KEY_STORAGE)||'';}catch(e){return '';}
}
function teacherSaveKey(key){
  try{localStorage.setItem(HW_TEACHER_KEY_STORAGE,key||'');}catch(e){}
}
function teacherFormatDate(value){
  if(!value)return '—';
  try{return new Date(value).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return value;}
}
function teacherAssignmentLink(token){
  const url=new URL(window.location.href);
  url.search='';
  url.searchParams.set('hwtoken',token);
  url.hash='#course/ege-phy/m/4/l/5/t/hw';
  return url.toString();
}
window.teacherCopyText=async function(value,btn){
  try{
    await navigator.clipboard.writeText(value);
    if(btn){const old=btn.textContent;btn.textContent='Скопировано ✓';setTimeout(()=>btn.textContent=old,1400);}
  }catch(e){
    window.prompt('Скопируйте:',value);
  }
};
window.teacherUseExistingKey=function(){
  const input=document.getElementById('teacherKeyImport');
  const key=input?input.value.trim():'';
  if(!key)return;
  teacherSaveKey(key);
  teacherLoadDashboard(true);
};
window.teacherCreateNewKey=async function(){
  if(!confirm('Создать новый кабинет? Старый ключ останется действительным, но этот браузер переключится на новый кабинет.'))return;
  try{
    const created=await hwApi({action:'create_teacher'});
    teacherSaveKey(created.teacherKey);
    await teacherLoadDashboard(true);
  }catch(e){
    teacherRenderError(e);
  }
};
window.teacherRefreshDashboard=function(){teacherLoadDashboard(true);};

function teacherRenderError(err){
  const page=ensureTeacherPage();
  page.innerHTML=`<main class="teacher-dashboard">
    <div class="teacher-hero"><div><div class="teacher-kicker">Кабинет преподавателя</div><h1>Статистика учеников</h1><p class="teacher-sub">Домашние задания с автопроверкой и результаты по персональной ссылке.</p></div></div>
    <section class="teacher-card teacher-error"><h2>Серверная статистика пока недоступна</h2><p style="color:var(--gray);line-height:1.65"><strong>Домашнее задание и автопроверка работают в браузере.</strong> Для общей статистики учеников сервер должен выполнять PHP-файл <code>api/homework.php</code> и иметь право записи в <code>/var/tmp</code>.</p><p class="teacher-help">Ошибка API: ${hwEsc(err&&err.message?err.message:'неизвестная ошибка')}</p><div class="teacher-key-tools"><input class="teacher-key-input" id="teacherKeyImport" placeholder="Ключ кабинета, если он уже есть"><button class="teacher-btn" onclick="teacherUseExistingKey()">Использовать ключ</button></div></section>
  </main>`;
}
async function teacherLoadDashboard(force){
  const page=ensureTeacherPage();
  page.innerHTML='<div class="teacher-loading">Загружаем статистику…</div>';
  try{
    let key=teacherStoredKey();
    if(!key){
      const created=await hwApi({action:'create_teacher'});
      key=created.teacherKey;
      teacherSaveKey(key);
    }
    const assignment=await hwApi({
      action:'ensure_assignment',
      teacherKey:key,
      assignmentId:HW_ASSIGNMENT_ID,
      title:HW_ASSIGNMENT_TITLE,
      correctAnswer:'32'
    });
    const stats=await hwApi({action:'stats',teacherKey:key});
    const students=Array.isArray(stats.students)?stats.students:[];
    const totalAttempts=students.reduce((sum,s)=>sum+Number(s.attempts||0),0);
    const solved=students.filter(s=>Number(s.correctCount||0)>0).length;
    const link=teacherAssignmentLink(assignment.assignmentToken);
    const rows=students.map(function(s){
      return '<tr><td><strong>'+hwEsc(s.studentName||'—')+'</strong></td><td>'+hwEsc(s.className||'—')+'</td><td>'+Number(s.attempts||0)+'</td><td>'+Number(s.correctCount||0)+'</td><td>'+hwEsc(s.lastAnswer||'—')+'</td><td class="'+(s.lastCorrect?'teacher-status-ok':'teacher-status-bad')+'">'+(s.lastCorrect?'Верно':'Пока неверно')+'</td><td>'+hwEsc(teacherFormatDate(s.lastAt))+'</td></tr>';
    }).join('');
    page.innerHTML=`<main class="teacher-dashboard">
      <div class="teacher-hero">
        <div><div class="teacher-kicker">Кабинет преподавателя</div><h1>Статистика учеников</h1><p class="teacher-sub">Выдавайте домашнее задание по ссылке. После каждой проверки здесь появляются имя ученика, число попыток и результат.</p></div>
        <button class="teacher-btn secondary" onclick="teacherRefreshDashboard()">↻ Обновить</button>
      </div>
      <section class="teacher-card">
        <h2>Домашнее задание · ЕГЭ физика · Урок 39</h2>
        <p style="color:var(--gray);margin-bottom:11px">Преобразование энергии в колебательных процессах · задание «Маятник: графики энергии».</p>
        <div class="teacher-link-row"><div class="teacher-link-box">${hwEsc(link)}</div><button class="teacher-btn" onclick="teacherCopyText(${JSON.stringify(link)},this)">Копировать ссылку</button></div>
        <div class="teacher-help">Ученику отправляется только ссылка задания. Ключ вашего кабинета в неё не входит.</div>
      </section>
      <div class="teacher-stats">
        <div class="teacher-stat"><strong>${students.length}</strong><span>учеников в статистике</span></div>
        <div class="teacher-stat"><strong>${totalAttempts}</strong><span>всего попыток</span></div>
        <div class="teacher-stat"><strong>${solved}</strong><span>решили верно</span></div>
        <div class="teacher-stat"><strong>${students.length?Math.round(solved/students.length*100):0}%</strong><span>выполняемость</span></div>
      </div>
      <section class="teacher-card">
        <h2>Результаты учеников</h2>
        ${rows?'<div class="teacher-table-wrap"><table class="teacher-table"><thead><tr><th>Ученик</th><th>Класс</th><th>Попытки</th><th>Верно</th><th>Последний ответ</th><th>Статус</th><th>Последняя активность</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="teacher-empty">Пока нет результатов. Скопируйте ссылку выше и отправьте её ученику.</div>'}
      </section>
      <section class="teacher-card">
        <h2>Доступ к кабинету</h2>
        <details><summary style="cursor:pointer;color:var(--cyan);font-weight:800">Показать ключ кабинета</summary><div class="teacher-link-row" style="margin-top:10px"><div class="teacher-link-box">${hwEsc(key)}</div><button class="teacher-btn" onclick="teacherCopyText(${JSON.stringify(key)},this)">Копировать ключ</button></div></details>
        <p class="teacher-help">Сохраните этот ключ отдельно. Он позволяет открыть статистику на другом устройстве. Не отправляйте его ученикам.</p>
        <div class="teacher-key-tools"><input class="teacher-key-input" id="teacherKeyImport" placeholder="Вставить существующий ключ кабинета"><button class="teacher-btn secondary" onclick="teacherUseExistingKey()">Открыть другой кабинет</button></div>
        <div style="margin-top:9px"><button class="teacher-btn secondary" onclick="teacherCreateNewKey()">Создать новый кабинет</button></div>
      </section>
    </main>`;
  }catch(err){
    teacherRenderError(err);
  }
}
window.showTeacherDashboard=function(){
  if(typeof hideAll==='function')hideAll();
  const page=ensureTeacherPage();
  page.classList.remove('page-hidden');
  page.classList.add('page-active');
  page.style.display='block';
  page.style.pointerEvents='auto';
  const back=document.getElementById('backBtn');
  if(back){back.classList.add('on');back.setAttribute('href','#home');}
  if(typeof updateActiveNav==='function')updateActiveNav('#teacher');
  window.scrollTo(0,0);
  teacherLoadDashboard(false);
};

function hwAddTeacherHeroLink(){
  const hero=document.querySelector('.hero-cta');
  if(!hero||hero.querySelector('.hero-teacher-link'))return;
  const a=document.createElement('a');
  a.href='#teacher';
  a.className='hero-teacher-link';
  a.innerHTML='<span class="arr">📊</span> Кабинет преподавателя';
  hero.appendChild(a);
}

hwInjectStyles();
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',hwAddTeacherHeroLink,{once:true});
}else{
  hwAddTeacherHeroLink();
}
})();