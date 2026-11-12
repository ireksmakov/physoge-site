/* ФИЗМАТ — математическая графическая студия. Самостоятельный учебный редактор. */
(function(){
'use strict';
const COLORS=['#196ddd','#ef813b','#24a399','#9c5ac8','#d44368','#678b32'];
const S={rows:[{id:1,expr:'x^2',visible:true,color:0},{id:2,expr:'sin(x)',visible:true,color:1}],shapes:[],nextId:3,
  selected:1,tool:'select',params:{a:1,b:0,c:0,n:2},scale:48,offsetX:0,offsetY:0,grid:true,axes:true,keyboard:true};
let root=null,canvas=null,ctx=null,w=0,h=0,ratio=1,pressed=null,first=null,activeField=null,frame=0;
const TOK=/\s*([0-9]+(?:\.[0-9]+)?(?:[eE][+-]?\d+)?|[a-zA-Zа-яА-Яπ]+|[()+\-*/^,])\s*/gy;
const FUNCTIONS={sin:Math.sin,cos:Math.cos,tan:Math.tan,tg:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sqrt:Math.sqrt,abs:Math.abs,ln:Math.log,log:Math.log10,exp:Math.exp, floor:Math.floor,ceil:Math.ceil};
function compile(source){
  const input=String(source||'').trim().replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/²/g,'^2').replace(/³/g,'^3').replace(/^y\s*=/i,'').replace(/^f\s*\(\s*x\s*\)\s*=/i,'');
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
      if(token==='a'||token==='b'||token==='c'||token==='n')return v=>v[token];
      if(token==='pi'||token==='π')return ()=>Math.PI;
      if(token==='e')return ()=>Math.E;
      const f=FUNCTIONS[token];
      if(!f)throw Error('Неизвестная функция: '+token);
      if(next()!=='(')throw Error('После '+token+' нужны скобки');
      const arg=expression(0);
      if(token==='log'&&peek()===','){
        next();
        const value=expression(0);
        if(next()!==')')throw Error('Закройте скобку логарифма');
        return v=>{
          const base=arg(v),x=value(v);
          return base>0&&base!==1&&x>0?Math.log(x)/Math.log(base):NaN;
        };
      }
      if(next()!==')')throw Error('Закройте скобку функции');
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

function safe(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw();});}
function coordinate(px,py){return {x:(px-w/2-S.offsetX)/S.scale,y:(h/2+S.offsetY-py)/S.scale};}
function px(x){return w/2+S.offsetX+x*S.scale;}
function py(y){return h/2+S.offsetY-y*S.scale;}
function message(text,error=false){const el=root?.querySelector('#fg-studio-status');if(el){el.textContent=text;el.classList.toggle('error',error);}}
const TOOLS=[
 ['select','↖','Выбор'],['point','•','Точка'],['line','╱','Прямая'],
 ['segment','／','Отрезок'],['circle','◯','Окружность'],['move','✥','Перемещение']
];
const KEYS=[
 ['123','x','y','π','a','b','c','n','(',')','⌫'],
 ['x²','xⁿ','√','|x|','sin','cos','tg','ln','log','logₐ','e','÷'],
 ['7','8','9','×','−','4','5','6','+','1','2','3','0','.','=']
];
function boardHTML(){
 return '<section class="fg-studio" aria-label="Интерактивная математическая студия ФИЗМАТ">'+
 '<div class="fg-studio-top">'+
 '<div class="fg-studio-brand"><strong>ФИЗ<span>МАТ</span></strong><small>Графики и геометрия</small></div>'+
 '<div class="fg-studio-tools" role="toolbar" aria-label="Инструменты построения">'+
 TOOLS.map(([id,sign,name])=>'<button type="button" class="fg-tool'+(S.tool===id?' selected':'')+'" data-tool="'+id+'" title="'+name+'" aria-label="'+name+'" aria-pressed="'+(S.tool===id)+'"><span>'+sign+'</span><small>'+name+'</small></button>').join('')+
 '</div><button class="fg-kb-toggle" type="button" data-cmd="keyboard" aria-label="Математическая клавиатура">⌨ <span>Клавиатура</span></button></div>'+
 '<div class="fg-studio-workspace"><aside class="fg-studio-side">'+
 '<div class="fg-studio-side-head"><strong>Функции и объекты</strong><button type="button" data-cmd="add" aria-label="Добавить функцию">＋</button></div>'+
 '<div id="fg-studio-rows" class="fg-studio-rows"></div>'+
 '<div class="fg-side-params"><div class="fg-mini-title">Параметры <span>a, b, c, n</span></div>'+
 ['a','b','c','n'].map(k=>'<label class="fg-slider-line" for="fg-par-'+k+'"><strong>'+k+'</strong><input id="fg-par-'+k+'" type="range" min="-10" max="10" step="0.1" value="'+S.params[k]+'"><input id="fg-num-'+k+'" class="fg-param-num" type="number" inputmode="decimal" min="-10" max="10" step="0.1" aria-label="Параметр '+k+'" value="'+S.params[k]+'"></label>').join('')+
 '<p class="fg-side-help">Пример: <code>a*x^n+b</code>. Логарифм с основанием: <code>log(2,x)</code>. Умножение через *, степень через ^.</p></div>'+
 '<div class="fg-side-objects" id="fg-shape-list"></div></aside>'+
 '<div class="fg-studio-graph"><div class="fg-graph-wrap"><canvas id="fg-studio-canvas" tabindex="0" aria-label="Координатная плоскость, инструменты построения"></canvas>'+
 '<div class="fg-graph-actions"><button type="button" data-cmd="zoomin" title="Увеличить масштаб" aria-label="Увеличить масштаб">＋</button><button type="button" data-cmd="zoomout" title="Уменьшить масштаб" aria-label="Уменьшить масштаб">－</button><button type="button" data-cmd="home" title="Вернуть исходный вид" aria-label="Исходный вид">⌂</button><button type="button" data-cmd="grid" title="Переключить сетку" aria-pressed="'+S.grid+'">▦</button></div>'+
 '<div class="fg-plot-hint" id="fg-plot-hint">Выберите инструмент и работайте на плоскости</div></div>'+
 '<div id="fg-studio-status" class="fg-studio-status" role="status" aria-live="polite">Готово к построению</div></div></div>'+
 '<div id="fg-studio-keyboard" class="fg-studio-keyboard">'+
 '<div class="fg-kb-head"><strong>Математическая клавиатура</strong><button type="button" data-cmd="hide-keyboard" aria-label="Скрыть клавиатуру">×</button></div>'+
 '<div class="fg-kb-layout">'+KEYS.map((r,idx)=>'<div class="fg-key-row fg-key-row-'+idx+'">'+r.map(k=>'<button type="button" class="fg-key" data-key="'+safe(k)+'">'+(k==='logₐ'?'<span class="fg-key-log">log<sub>a</sub></span>':safe(k))+'</button>').join('')+'</div>').join('')+'</div></div></section>';
}
/* Ввод остаётся текстовым, а логарифм показывается с редактируемым нижним индексом. */
function logarithmParts(expr){
 const text=String(expr||'');
 const m=/\blog\s*\(\s*([^,()]*)\s*,/i.exec(text);
 if(!m)return null;
 const start=m.index, open=text.indexOf('(',start),comma=start+m[0].lastIndexOf(',');
 let depth=1,close=-1;
 for(let i=comma+1;i<text.length;i++){
  if(text[i]==='(')depth++;
  else if(text[i]===')'&&--depth===0){close=i;break;}
 }
 const complete=close>=0;
 const argument=text.slice(comma+1,complete?close:text.length).trim();
 return {start,base:text.slice(open+1,comma).trim(),argument,
         prefix:text.slice(0,start),suffix:complete?text.slice(close+1):'',complete};
}
function logPreviewHTML(r){
 const p=logarithmParts(r.expr);
 if(!p)return '';
 const base=p.base||'□',argument=p.argument||'□';
 const notation=safe(p.prefix).replace(/\*/g,'·')+
   '<span class="fg-log-symbol">log<sub>'+safe(base)+'</sub></span>'+
   '<span class="fg-log-argument">('+safe(argument).replace(/-/g,'−')+(p.complete?'':'…')+')</span>'+
   safe(p.suffix).replace(/\*/g,'·');
 return '<div class="fg-log-preview" data-log-preview="'+r.id+'">'+
   '<div class="fg-log-intro">Математическая запись</div>'+
   '<div class="fg-log-math" aria-label="Логарифм по основанию '+safe(base)+'">y = '+notation+'</div></div>';
}
function refreshLogPreview(r){
 const holder=root?.querySelector('[data-log-preview-container="'+r.id+'"]');
 if(holder)holder.innerHTML=logPreviewHTML(r);
}
function rowHTML(r){
 return '<div class="fg-expression-entry" data-entry="'+r.id+'">'+
   '<div class="fg-expression-row" data-row="'+r.id+'"><button type="button" data-visible="'+r.id+'" class="fg-eye'+(!r.visible?' dim':'')+'" aria-label="'+(r.visible?'Скрыть':'Показать')+' функцию" title="Показать/скрыть"><span style="background:'+COLORS[r.color%COLORS.length]+'"></span></button>'+
   '<label class="fg-expression-label"><span>y =</span><input type="text" class="fg-expression-input" data-input="'+r.id+'" spellcheck="false" autocomplete="off" placeholder="Введите функцию" aria-label="Функция '+r.id+'" value="'+safe(r.expr)+'"></label>'+
   '<button type="button" class="fg-row-del" data-delete="'+r.id+'" aria-label="Удалить функцию">×</button></div>'+
   '<div class="fg-log-preview-container" data-log-preview-container="'+r.id+'" aria-live="polite">'+logPreviewHTML(r)+'</div></div>';
}
function renderRows(focusId=null){
 const area=root.querySelector('#fg-studio-rows');if(!area)return;
 area.innerHTML=S.rows.map(rowHTML).join('');
 area.querySelectorAll('input').forEach(input=>{
   input.addEventListener('focus',()=>{S.selected=Number(input.dataset.input);activeField=input;});
   input.addEventListener('input',()=>{const r=S.rows.find(r=>r.id===Number(input.dataset.input));if(r){r.expr=input.value;refreshLogPreview(r);message('Функция обновлена');schedule();}});
 });
 if(focusId!==null){let f=area.querySelector('[data-input="'+focusId+'"]');if(f){f.focus();f.setSelectionRange(f.value.length,f.value.length);}}
}
function renderObjects(){
 const target=root.querySelector('#fg-shape-list');if(!target)return;
 target.innerHTML=S.shapes.length?'<div class="fg-mini-title">Геометрические объекты</div>'+S.shapes.map((o,i)=>'<div class="fg-shape-row"><span>'+safe(o.kind==='point'?'Точка '+o.label:o.kind==='circle'?'Окружность '+(i+1):o.kind==='line'?'Прямая '+(i+1):'Отрезок '+(i+1))+'</span><button type="button" data-shape-del="'+i+'" aria-label="Удалить объект">×</button></div>').join(''):'';
}
function settings(){
 const kb=root.querySelector('#fg-studio-keyboard');kb.hidden=!S.keyboard;
 root.querySelectorAll('[data-tool]').forEach(b=>{const on=b.dataset.tool===S.tool;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
 root.querySelector('[data-cmd="grid"]')?.setAttribute('aria-pressed',String(S.grid));
 const hints={select:'Перемещайте плоскость перетаскиванием',move:'Перетаскивайте плоскость',point:'Нажмите на плоскость, чтобы поставить точку',line:'Укажите две точки для прямой',segment:'Укажите начало и конец отрезка',circle:'Укажите центр, затем точку на окружности'};
 root.querySelector('#fg-plot-hint').textContent=first?'Укажите вторую точку':hints[S.tool];
}
function keyValue(k){
 const map={'x²':'^2','xⁿ':'^(','√':'sqrt(','|x|':'abs(','sin':'sin(','cos':'cos(','tg':'tan(','ln':'ln(','log':'log(','logₐ':'log(2,','π':'pi','×':'*','÷':'/','−':'-','=':'','⌫':null};
 return Object.prototype.hasOwnProperty.call(map,k)?map[k]:k;
}
function keyboard(k){
 const input=activeField&&activeField.isConnected?activeField:root.querySelector('[data-input="'+S.selected+'"]')||root.querySelector('.fg-expression-input');
 if(!input)return;
 const a=input.selectionStart??input.value.length,b=input.selectionEnd??a;
 let text=keyValue(k),start=a,end=b;
 if(k==='⌫'){if(a===b)start=Math.max(0,a-1);text='';}
 if(text===null)return;
 input.value=input.value.slice(0,start)+text+input.value.slice(end);
 input.focus();input.setSelectionRange(start+text.length,start+text.length);input.dispatchEvent(new Event('input',{bubbles:true}));
}
function labelPoint(x,y){
 const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 let i=S.shapes.filter(s=>s.kind==='point').length;
 return chars[i%chars.length]+(i>=chars.length?Math.floor(i/chars.length)+1:'');
}
function createShape(p){
 if(S.tool==='point'){S.shapes.push({kind:'point',x:p.x,y:p.y,label:labelPoint(p.x,p.y)});renderObjects();schedule();return;}
 if(!['line','segment','circle'].includes(S.tool))return;
 if(!first){first=p;settings();schedule();return;}
 if(Math.hypot(first.x-p.x,first.y-p.y)<.04){message('Выберите две разные точки',true);return;}
 S.shapes.push({kind:S.tool,p1:first,p2:p});
 first=null;renderObjects();settings();schedule();
}
function niceStep(pixelStep){const val=65/pixelStep,p=Math.pow(10,Math.floor(Math.log10(val))),d=val/p;return (d>5?10:d>2?5:d>1?2:1)*p;}
function curve(f,color){
 ctx.strokeStyle=color;ctx.lineWidth=2.65;ctx.lineJoin='round';ctx.lineCap='round';
 ctx.beginPath();let last=null,segments=0;
 for(let x=0;x<=w;x+=1.2){
  const domain=(x-w/2-S.offsetX)/S.scale;
  let y;try{y=f({x:domain,...S.params});}catch(_){y=NaN;}
  const ypx=py(y);
  if(!Number.isFinite(ypx)||Math.abs(ypx)>h*8||last!==null&&Math.abs(ypx-last)>h*.65){last=null;continue;}
  if(last===null)ctx.moveTo(x,ypx);else ctx.lineTo(x,ypx);
  segments++;last=ypx;
 }
 if(segments)ctx.stroke();
}
function drawShape(o){
 ctx.lineWidth=2;ctx.strokeStyle='#8b50b4';ctx.fillStyle='#8b50b4';
 if(o.kind==='point'){
  ctx.beginPath();ctx.arc(px(o.x),py(o.y),4.5,0,2*Math.PI);ctx.fill();
  ctx.font='bold 12px Arial';ctx.fillText(o.label,px(o.x)+9,py(o.y)-8);return;
 }
 const a=o.p1,b=o.p2;
 if(o.kind==='circle'){
  ctx.beginPath();ctx.arc(px(a.x),py(a.y),Math.hypot(b.x-a.x,b.y-a.y)*S.scale,0,2*Math.PI);ctx.stroke();
 }else{
  ctx.beginPath();
  if(o.kind==='line'){
   const dx=b.x-a.x,dy=b.y-a.y,factor=10000;
   ctx.moveTo(px(a.x-dx*factor),py(a.y-dy*factor));ctx.lineTo(px(a.x+dx*factor),py(a.y+dy*factor));
  }else{ctx.moveTo(px(a.x),py(a.y));ctx.lineTo(px(b.x),py(b.y));}
  ctx.stroke();
 }
}
function draw(){
 if(!root||!root.isConnected||!root.closest('#pan-graphs')?.classList.contains('active'))return;
 const rect=canvas.getBoundingClientRect();
 if(rect.width<50||rect.height<50)return;
 ratio=Math.min(window.devicePixelRatio||1,2);w=rect.width;h=rect.height;
 canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
 ctx=canvas.getContext('2d');if(!ctx)return;ctx.setTransform(ratio,0,0,ratio,0,0);
 ctx.fillStyle='#fbfdff';ctx.fillRect(0,0,w,h);
 const step=niceStep(S.scale),ox=px(0),oy=py(0);
 if(S.grid){
  const startX=Math.ceil((-ox/S.scale)/step)*step,endX=(w-ox)/S.scale;
  const startY=Math.ceil((oy-h)/S.scale/step)*step,endY=oy/S.scale;
  ctx.strokeStyle='#d9e6f4';ctx.lineWidth=1;
  for(let x=startX,c=0;x<=endX&&c++<400;x+=step){ctx.beginPath();ctx.moveTo(Math.round(px(x))+.5,0);ctx.lineTo(Math.round(px(x))+.5,h);ctx.stroke();}
  for(let y=startY,c=0;y<=endY&&c++<400;y+=step){ctx.beginPath();ctx.moveTo(0,Math.round(py(y))+.5);ctx.lineTo(w,Math.round(py(y))+.5);ctx.stroke();}
 }
 if(S.axes){
  ctx.strokeStyle='#40536c';ctx.lineWidth=1.55;ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(w,oy);ctx.moveTo(ox,0);ctx.lineTo(ox,h);ctx.stroke();
  ctx.fillStyle='#42576c';ctx.font='11px Arial';
  const xstart=Math.ceil((-ox/S.scale)/step)*step, xend=(w-ox)/S.scale;
  for(let x=xstart,c=0;x<=xend&&c++<300;x+=step){if(Math.abs(x)<step*.01)continue;const place=px(x);if(place>15&&place<w-25&&oy>8&&oy<h-8)ctx.fillText(String(Number(x.toPrecision(5))),place+2,clamp(oy+14,14,h-5));}
  const ystart=Math.ceil((oy-h)/S.scale/step)*step,yend=oy/S.scale;
  for(let y=ystart,c=0;y<=yend&&c++<300;y+=step){if(Math.abs(y)<step*.01)continue;const place=py(y);if(place>12&&place<h-9&&ox>12&&ox<w-40)ctx.fillText(String(Number(y.toPrecision(5))),clamp(ox+6,2,w-34),place-4);}
 }
 let errors=[];
 for(const r of S.rows){
  if(!r.visible||!r.expr.trim())continue;
  try{curve(compile(r.expr),COLORS[r.color%COLORS.length]);}
  catch(e){errors.push('Функция '+r.id+': '+e.message);}
 }
 S.shapes.forEach(drawShape);
 if(first){ctx.setLineDash([5,5]);ctx.strokeStyle='#7853ba';ctx.beginPath();ctx.arc(px(first.x),py(first.y),7,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
 if(errors.length)message(errors.join(' · '),true);
 else if(root.querySelector('#fg-studio-status')?.classList.contains('error'))message('Готово к построению');
}
function getPos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function onDown(e){
 if(e.button!==0&&e.pointerType==='mouse')return;
 const p=getPos(e);
 pressed={x:p.x,y:p.y,ox:S.offsetX,oy:S.offsetY,moved:false};
 try{canvas.setPointerCapture(e.pointerId);}catch(_){}
}
function onMove(e){
 if(!pressed)return;
 const p=getPos(e),dx=p.x-pressed.x,dy=p.y-pressed.y;
 if(Math.abs(dx)+Math.abs(dy)>5)pressed.moved=true;
 if((S.tool==='select'||S.tool==='move')&&pressed.moved){S.offsetX=pressed.ox+dx;S.offsetY=pressed.oy+dy;schedule();}
}
function onUp(e){
 if(!pressed)return;
 const wasMoved=pressed.moved;pressed=null;
 if(!wasMoved&&['point','line','segment','circle'].includes(S.tool)){const p=getPos(e);createShape(coordinate(p.x,p.y));}
}
function onWheel(e){
 e.preventDefault();
 const v=e.deltaY<0?1.12:1/1.12;
 const p=getPos(e);const c=coordinate(p.x,p.y);
 S.scale=clamp(S.scale*v,7,600);S.offsetX=p.x-w/2-c.x*S.scale;S.offsetY=p.y-h/2+c.y*S.scale;schedule();
}
function updateParams(k,val,origin){
 if(val===''||val==='-'||val==='.')return;
 const number=Number(val);if(!Number.isFinite(number)||number< -10||number>10)return;
 S.params[k]=number;
 const r=root.querySelector('#fg-par-'+k),n=root.querySelector('#fg-num-'+k);
 if(r&&origin!=='range')r.value=number;
 if(n&&origin!=='number')n.value=number;
 schedule();
}
function click(e){
 const btn=e.target.closest('button');if(!btn||!root.contains(btn))return;
 const d=btn.dataset;
 if(d.tool){S.tool=d.tool;first=null;settings();schedule();return;}
 if(d.key){keyboard(d.key);return;}
 if(d.visible){const row=S.rows.find(r=>r.id===Number(d.visible));if(row){row.visible=!row.visible;renderRows();schedule();}return;}
 if(d.delete){S.rows=S.rows.filter(r=>r.id!==Number(d.delete));renderRows();schedule();return;}
 if(d.shapeDel!==undefined){S.shapes.splice(Number(d.shapeDel),1);renderObjects();schedule();return;}
 switch(d.cmd){
 case 'add':{const id=S.nextId++;S.rows.push({id,expr:'',visible:true,color:(id-1)%COLORS.length});renderRows(id);break;}
 case 'keyboard':S.keyboard=!S.keyboard;settings();break;
 case 'hide-keyboard':S.keyboard=false;settings();break;
 case 'zoomin':S.scale=clamp(S.scale*1.3,7,600);schedule();break;
 case 'zoomout':S.scale=clamp(S.scale/1.3,7,600);schedule();break;
 case 'home':S.scale=48;S.offsetX=0;S.offsetY=0;schedule();break;
 case 'grid':S.grid=!S.grid;settings();schedule();break;
 }
}
function init(){
 const panel=document.getElementById('pan-graphs');if(!panel||!panel.classList.contains('active'))return;
 if(root&&root.isConnected&&panel.contains(root)){schedule();return;}
 panel.innerHTML=boardHTML();root=panel.querySelector('.fg-studio');canvas=root.querySelector('#fg-studio-canvas');
 renderRows();renderObjects();settings();
 root.addEventListener('click',click);
 ['a','b','c','n'].forEach(k=>{
  root.querySelector('#fg-par-'+k).addEventListener('input',e=>updateParams(k,e.target.value,'range'));
  const input=root.querySelector('#fg-num-'+k);
  input.addEventListener('input',e=>updateParams(k,e.target.value,'number'));
  input.addEventListener('change',()=>{input.value=S.params[k];});
 });
 canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);
 canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',()=>{pressed=null;});
 canvas.addEventListener('wheel',onWheel,{passive:false});
 canvas.addEventListener('keydown',e=>{if(e.key==='Escape'){first=null;settings();schedule();}});
 schedule();
}
window.renderMathGraphWorkbench=()=>'<div class="fg-standby">Откройте вкладку «Графики функций».</div>';
window.initMathGraphWorkbench=init;
window.addEventListener('resize',()=>{if(root?.isConnected)schedule();});
})();