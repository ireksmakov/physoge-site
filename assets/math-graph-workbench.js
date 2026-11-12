/* ФИЗМАТ — учебный построитель графиков. Без eval и внешних библиотек. */
(function(){
'use strict';
const S={f1:'a*x^2+b*x+c',f2:'',base:'x',power:2,structured:true,a:1,b:0,c:0,scale:10,grid:true};
const COLORS=['#1265d9','#ed7b26'];
let current=null;
const TOK=/\s*([0-9]+(?:[.,][0-9]+)?(?:[eE][+-]?\d+)?|[a-zA-Zа-яА-Яπ]+|[()+\-*/^,])\s*/gy;
const FUNCTIONS={sin:Math.sin,cos:Math.cos,tan:Math.tan,tg:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sqrt:Math.sqrt,abs:Math.abs,ln:Math.log,log:Math.log10,exp:Math.exp, floor:Math.floor,ceil:Math.ceil};
function compile(source){
  const input=String(source||'').trim().replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/²/g,'^2').replace(/³/g,'^3').replace(/,/g,'.').replace(/^y\s*=/i,'').replace(/^f\s*\(\s*x\s*\)\s*=/i,'');
  if(!input)return null;
  const tokens=[];TOK.lastIndex=0;let p=0,match;
  while(p<input.length){
    TOK.lastIndex=p; match=TOK.exec(input);
    if(!match||match.index!==p)throw Error('Недопустимый символ у позиции '+(p+1));
    tokens.push(match[1].toLowerCase());p=TOK.lastIndex;
    if(tokens.length>160)throw Error('Формула слишком длинная');
  }
  let i=0;
  const peek=()=>tokens[i],next=()=>tokens[i++];
  function primary(){
    const token=next();
    if(token===undefined)throw Error('Ожидается число, x или скобка');
    if(token==='+'||token==='-'){const val=expression(3);return token==='-'?v=>-val(v):val;}
    if(token==='('){const inner=expression(0);if(next()!==')')throw Error('Закройте скобку )');return inner;}
    if(/^(?:\d|\.)/.test(token)){const n=Number(token);if(!Number.isFinite(n))throw Error('Неверное число');return ()=>n;}
    if(/^[a-zа-яπ]+$/i.test(token)){
      if(token==='x')return v=>v.x;
      if(token==='a'||token==='b'||token==='c')return v=>v[token];
      if(token==='pi'||token==='π')return ()=>Math.PI;
      if(token==='e')return ()=>Math.E;
      const f=FUNCTIONS[token];
      if(!f)throw Error('Неизвестная функция: '+token);
      if(next()!=='(')throw Error('После '+token+' нужны скобки');
      const arg=expression(0);if(next()!==')')throw Error('Закройте скобку функции');
      return v=>f(arg(v));
    }
    throw Error('Неожиданный знак: '+token);
  }
  function expression(min){
    let left=primary();
    while(true){
      const op=peek(),precedence=(op==='+'||op==='-')?1:(op==='*'||op==='/')?2:op==='^'?4:-1;
      if(precedence<min)break;
      next();
      const right=expression(op==='^'?precedence:precedence+1);
      const prev=left;
      if(op==='+')left=v=>prev(v)+right(v);
      else if(op==='-')left=v=>prev(v)-right(v);
      else if(op==='*')left=v=>prev(v)*right(v);
      else if(op==='/')left=v=>prev(v)/right(v);
      else left=v=>Math.pow(prev(v),right(v));
    }
    return left;
  }
  const fn=expression(0);
  if(i!==tokens.length)throw Error('Лишний знак: '+tokens[i]);
  return v=>fn(v);
}
function structuredFormula(){
  const base=String(S.base||'x').trim()||'x';
  const power=Number(S.power);
  return 'a*('+base+')^('+power+')+b*x+c';
}
function updateStructuredFormula(){
  if(!S.structured)return;
  S.f1=structuredFormula();
  const input=document.getElementById('fg-f1');
  if(input)input.value=S.f1;
  const preview=document.getElementById('fg-structured-preview');
  if(preview)preview.textContent='y = '+S.f1;
}
function applyParam(k,value){
  const n=Number(String(value).replace(',','.'));
  if(!Number.isFinite(n)||n< -10||n>10)return false;
  S[k]=Math.round(n*100)/100;
  const slider=document.getElementById('fg-'+k);
  const number=document.getElementById('fg-'+k+'-number');
  const output=document.getElementById('fg-'+k+'-value');
  if(slider)slider.value=S[k];
  if(number)number.value=S[k];
  if(output)output.textContent=S[k].toFixed(2);
  updateStructuredFormula();draw();return true;
}
function html(){
  return '<section class="fg-workbench" aria-label="Построитель графиков функций">'+
  '<div class="fg-header"><div><span class="fg-eyebrow">ФИЗМАТ · ИНТЕРАКТИВНАЯ МАТЕМАТИКА</span><h2>Графики функций</h2><p>Стройте, сравнивайте и исследуйте функции, изменяя параметры в реальном времени.</p></div><div class="fg-symbol">ƒ(x)</div></div>'+
  '<div class="fg-layout"><div class="fg-controls"><h3>Конструктор функции</h3>'+
  '<p class="fg-form-help">Заполните отдельные поля, чтобы получить график вида <strong>y = a·(f(x))ⁿ + b·x + c</strong>.</p>'+
  '<div class="fg-structured-box"><div class="fg-structured-grid">'+
  '<label class="fg-structured-field" for="fg-base">Основа функции f(x)<input id="fg-base" type="text" spellcheck="false" autocomplete="off" value="'+esc(S.base)+'" placeholder="x или sin(x)"></label>'+
  '<label class="fg-structured-field" for="fg-power">Степень n<input id="fg-power" type="number" inputmode="decimal" min="-10" max="10" step="0.5" value="'+esc(S.power)+'"></label></div>'+
  '<div class="fg-structured-preview" id="fg-structured-preview" aria-live="polite">y = '+esc(S.f1)+'</div>'+
  '<button type="button" class="fg-apply" id="fg-apply-structured">Построить по полям</button></div>'+
  '<h3 class="fg-second-heading">Полный ввод формулы</h3>'+
  '<label class="fg-label" for="fg-f1"><span class="fg-dot fg-blue"></span> Функция 1 · y =</label><input id="fg-f1" class="fg-formula" spellcheck="false" autocomplete="off" value="'+esc(S.f1)+'" placeholder="a*x^2+b*x+c">'+
  '<label class="fg-label" for="fg-f2"><span class="fg-dot fg-orange"></span> Функция 2 · y =</label><input id="fg-f2" class="fg-formula" spellcheck="false" autocomplete="off" value="'+esc(S.f2)+'" placeholder="Например: 2*x+1">'+
  '<div class="fg-heading">Готовые примеры</div><div class="fg-presets">'+[
    ['Линейная','a*x+b'],['Парабола','a*x^2+b*x+c'],['Гипербола','a/x'],['Синусоида','a*sin(b*x)+c'],['Косинусоида','a*cos(b*x)+c'],['Модуль','a*abs(x)+b'],['Корень','a*sqrt(x)+b'],['Показательная','a*exp(x)+b'],['Логарифм','a*ln(x)+b']
  ].map(([name,eq])=>'<button type="button" class="fg-preset" data-formula="'+esc(eq)+'">'+name+'</button>').join('')+'</div>'+
  '<div class="fg-heading">Параметры функции</div><p class="fg-mini-tip">Передвигайте ползунок или впишите точное значение коэффициента.</p>'+
  ['a','b','c'].map(k=>'<div class="fg-param"><label for="fg-'+k+'">Коэффициент <strong>'+k+'</strong> <output id="fg-'+k+'-value">'+S[k].toFixed(2)+'</output></label><div class="fg-param-row"><input type="range" id="fg-'+k+'" min="-10" max="10" step="0.01" value="'+S[k]+'"><input aria-label="Точное значение '+k+'" id="fg-'+k+'-number" class="fg-number-input" type="number" inputmode="decimal" min="-10" max="10" step="0.01" value="'+S[k]+'"></div></div>').join('')+
  '<div class="fg-help">Используйте <b>*</b> для умножения и <b>^</b> для степени. Доступны sin(x), cos(x), sqrt(x), abs(x), ln(x), log(x), exp(x), pi. Углы в радианах.</div>'+
  '</div><div class="fg-plot"><div class="fg-plot-top"><strong>Координатная плоскость</strong><span id="fg-range-label">от −10 до 10</span></div>'+
  '<div class="fg-canvas-area"><canvas id="fg-canvas" aria-label="Графики введённых функций">График недоступен: браузер не поддерживает canvas.</canvas></div>'+
  '<div class="fg-plot-actions"><button type="button" id="fg-zoom-in" aria-label="Увеличить масштаб">＋</button><button type="button" id="fg-zoom-out" aria-label="Уменьшить масштаб">－</button><button type="button" id="fg-reset">↺ Сброс масштаба</button><label class="fg-grid-label"><input id="fg-grid" type="checkbox" checked> Сетка</label></div>'+
  '<div class="fg-status" id="fg-status" role="status" aria-live="polite">Введите функцию, чтобы построить график.</div></div></div>'+
  '</section>';
}
function esc(x){return String(x).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function draw(){
  const container=document.getElementById('pan-graphs');const canvas=document.getElementById('fg-canvas');
  if(!container||!canvas||!container.classList.contains('active'))return;
  const rect=canvas.getBoundingClientRect(),w=Math.max(260,Math.floor(rect.width)),h=Math.max(230,Math.floor(rect.height));
  const pixelRatio=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(w*pixelRatio);canvas.height=Math.round(h*pixelRatio);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  ctx.fillStyle='#fcfeff';ctx.fillRect(0,0,w,h);
  const k=Math.min(w,h)/(2*S.scale),cx=w/2,cy=h/2;
  const xx=x=>cx+x*k, yy=y=>cy-y*k;
  const niceStep=target=>{let exp=Math.pow(10,Math.floor(Math.log10(target)));let v=target/exp;return (v>5?10:v>2?5:v>1?2:1)*exp;};
  const step=niceStep(54/k);
  if(S.grid){
    ctx.strokeStyle='#e3eff9';ctx.lineWidth=1;
    for(let x=Math.ceil(-cx/k/step)*step;x<=((w-cx)/k);x+=step){ctx.beginPath();ctx.moveTo(Math.round(xx(x))+.5,0);ctx.lineTo(Math.round(xx(x))+.5,h);ctx.stroke();}
    for(let y=Math.ceil((cy-h)/k/step)*step;y<=cy/k;y+=step){ctx.beginPath();ctx.moveTo(0,Math.round(yy(y))+.5);ctx.lineTo(w,Math.round(yy(y))+.5);ctx.stroke();}
  }
  ctx.strokeStyle='#6989aa';ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(w,cy);ctx.moveTo(cx,0);ctx.lineTo(cx,h);ctx.stroke();
  ctx.fillStyle='#486785';ctx.font='11px Arial,sans-serif';
  for(let x=Math.ceil(-cx/k/step)*step;x<=(w-cx)/k;x+=step){if(Math.abs(x)<step/10)continue;let px=xx(x);if(px<18||px>w-18)continue;ctx.fillText(Number(x.toPrecision(4)).toString(),px+3,cy+14);}
  for(let y=Math.ceil((cy-h)/k/step)*step;y<=cy/k;y+=step){if(Math.abs(y)<step/10)continue;let py=yy(y);if(py<12||py>h-10)continue;ctx.fillText(Number(y.toPrecision(4)).toString(),cx+6,py-4);}
  ctx.fillText('0',cx+5,cy+13);ctx.fillText('x',w-16,cy-8);ctx.fillText('y',cx+10,14);
  const errors=[];let plots=0;
  [S.f1,S.f2].forEach((source,index)=>{
    if(!source.trim())return;
    let f;
    try{f=compile(source);}catch(e){errors.push('Функция '+(index+1)+': '+e.message);return;}
    ctx.strokeStyle=COLORS[index];ctx.lineWidth=2.8;ctx.lineCap='round';ctx.lineJoin='round';
    let active=false,prevY=0;
    ctx.beginPath();
    for(let px=0;px<=w;px+=1.5){
      const x=(px-cx)/k;let y;try{y=f({x,a:S.a,b:S.b,c:S.c});}catch(e){y=NaN;}
      const py=yy(y);
      if(!Number.isFinite(py)||Math.abs(py)>h*6||active&&Math.abs(py-prevY)>h*.85){active=false;continue;}
      if(!active)ctx.moveTo(px,py);else ctx.lineTo(px,py);
      prevY=py;active=true;
    }
    ctx.stroke();plots++;
  });
  const status=document.getElementById('fg-status');
  if(status){status.textContent=errors.length?errors.join(' · '):plots?('Построено функций: '+plots+'. Изменяйте параметры для исследования графика.'):'Введите формулу, чтобы построить график.';status.classList.toggle('fg-error',!!errors.length);}
  const label=document.getElementById('fg-range-label');if(label)label.textContent='масштаб ±'+Number(S.scale.toFixed(2));
}
function init(){
  const panel=document.getElementById('pan-graphs');
  if(!panel||!panel.classList.contains('active'))return;
  if(!document.getElementById('fg-canvas'))panel.innerHTML=html();
  if(current!==panel){
    current=panel;
    ['f1','f2'].forEach(k=>document.getElementById('fg-'+k).addEventListener('input',e=>{S[k]=e.target.value;if(k==='f1')S.structured=false;draw();}));
    document.getElementById('fg-base').addEventListener('input',e=>{S.base=e.target.value;S.structured=true;updateStructuredFormula();draw();});
    document.getElementById('fg-power').addEventListener('input',e=>{
      if(e.target.value==='')return;
      const v=Number(e.target.value);
      if(Number.isFinite(v)&&v>=-10&&v<=10){S.power=v;S.structured=true;updateStructuredFormula();draw();}
    });
    document.getElementById('fg-apply-structured').addEventListener('click',()=>{S.structured=true;updateStructuredFormula();draw();});
    ['a','b','c'].forEach(k=>{
      document.getElementById('fg-'+k).addEventListener('input',e=>applyParam(k,e.target.value));
      const number=document.getElementById('fg-'+k+'-number');
      number.addEventListener('input',e=>{if(e.target.value!=='')applyParam(k,e.target.value);});
      number.addEventListener('change',()=>{number.value=S[k];});
    });
    panel.querySelectorAll('.fg-preset').forEach(btn=>btn.addEventListener('click',()=>{S.structured=false;S.f1=btn.dataset.formula;document.getElementById('fg-f1').value=S.f1;draw();}));
    document.getElementById('fg-zoom-in').addEventListener('click',()=>{S.scale=Math.max(.5,S.scale/1.5);draw();});
    document.getElementById('fg-zoom-out').addEventListener('click',()=>{S.scale=Math.min(250,S.scale*1.5);draw();});
    document.getElementById('fg-reset').addEventListener('click',()=>{S.scale=10;draw();});
    document.getElementById('fg-grid').addEventListener('change',e=>{S.grid=e.target.checked;draw();});
  }
  window.requestAnimationFrame(draw);
}
window.renderMathGraphWorkbench=()=>'<div class="fg-standby">Откройте вкладку, чтобы начать построение графиков.</div>';
window.initMathGraphWorkbench=init;
window.addEventListener('resize',()=>{if(document.getElementById('pan-graphs')?.classList.contains('active'))window.requestAnimationFrame(draw);});
})();