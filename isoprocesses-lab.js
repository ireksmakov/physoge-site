/* ФИЗМАТ: лаборатория газовых изопроцессов, 5 экспериментов. */
(function(){
'use strict';
const modeNames=['Изотермический','Изобарный','Изохорный'];
const tests=[
 ['На p(V) изображена гипербола. Какой это процесс?',0],
 ['На p(V) изображена горизонтальная прямая. Какой это процесс?',1],
 ['На p(V) изображена вертикальная прямая. Какой это процесс?',2],
 ['На V(T) прямая выходит из начала координат. Какой процесс?',1],
 ['На p(T) прямая выходит из начала координат. Какой процесс?',2]
];
const st={exp:0,unknown:1,test:0,variable:2,play:false,phase:0,answer:null,teacher:false,condition:true};
const byId=()=>document.getElementById('fizmat-iso-lab');
const currentMode=()=>st.exp<3?st.exp:st.exp===3?st.unknown:tests[st.test][1];
const state=()=>{
 const m=currentMode(),T=m===0?300:st.variable,V=m===0?st.variable:m===1?2*T/300:2,p=m===0?200/V:m===1?100:100*T/300;
 return{T,V,p};
};
const format=(n,d=1)=>n.toLocaleString('ru-RU',{maximumFractionDigits:d});
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const css='.iso-lab{background:#061c30;color:#e9f7ff;padding:16px;border:1px solid #34678a;border-radius:18px;font-family:Arial,sans-serif;max-width:1250px;margin:auto}.iso-lab *{box-sizing:border-box}.iso-lab h2{font-size:clamp(20px,3vw,29px);color:#fff}.iso-lab h3{font-size:18px;margin:0 0 10px;color:#fff}.iso-tabs,.iso-controls,.iso-answers{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.iso-lab button{padding:10px 13px;border-radius:9px;border:1px solid #427b9d;background:#144364;color:#e9f7ff;cursor:pointer;font-size:13px}.iso-lab button:hover{border-color:#14d8ff}.iso-lab button[aria-selected=true]{background:#1dd0f2;color:#062039}.iso-lab button:focus-visible,.iso-lab input:focus-visible{outline:3px solid #ffca60;outline-offset:2px}.iso-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}.iso-panel{background:#102e48;padding:15px;border:1px solid #3b6c8d;border-radius:14px;min-width:0}.iso-chart{display:block;width:100%;height:auto;background:#09263c;border-radius:12px}.iso-charts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.iso-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.iso-metrics span{display:block;text-align:center;background:#08253e;border-radius:8px;padding:9px 3px}.iso-metrics strong{display:block;color:#50e0ff;font-size:clamp(15px,2vw,23px)}.iso-metrics small,.iso-muted{font-size:12px;color:#b5d6eb}.iso-lab input[type=range]{width:100%;accent-color:#22d5f8}.iso-note{padding:12px;border:1px solid #426d8a;border-radius:10px;background:#0a2942;line-height:1.5}.iso-lab:fullscreen{padding:22px;overflow:auto;background:#061c30}@media(max-width:850px){.iso-cols{grid-template-columns:1fr}}@media(max-width:530px){.iso-charts{grid-template-columns:1fr}}';
function addStyles(){if(document.getElementById('iso-lab-styles'))return;const tag=document.createElement('style');tag.id='iso-lab-styles';tag.textContent=css;document.head.appendChild(tag)}
function graph(kind,secondary){
 const m=kind,w=300,h=208,x0=40,y0=170,x1=285,y1=24;
 const x=v=>x0+v/5*(x1-x0),y=v=>y0-v/260*(y0-y1);
 const xT=v=>x0+v/650*(x1-x0);
 let d='',xl='V',yl='p';
 if(!secondary){
 if(m===0)d=Array.from({length:70},(_,i)=>{const vx=.82+i*.055;return(i?'L':'M')+x(vx).toFixed(1)+' '+y(200/vx).toFixed(1)}).join(' ');
 if(m===1)d='M'+x(.25)+' '+y(100)+'L'+x(4.7)+' '+y(100);
 if(m===2)d='M'+x(2)+' '+y(10)+'L'+x(2)+' '+y(235);
 }else{
 xl='T';yl=m===1?'V':'p';
 const Y=v=>y0-v/(m===1?5:250)*(y0-y1);
 if(m===0)d='M'+xT(300)+' '+Y(10)+'L'+xT(300)+' '+Y(220);
 if(m===1)d='M'+xT(0)+' '+Y(0)+'L'+xT(620)+' '+Y(4.133);
 if(m===2)d='M'+xT(0)+' '+Y(0)+'L'+xT(620)+' '+Y(206.67);
 }
 return '<svg class="iso-chart" viewBox="0 0 300 208" aria-label="График '+yl+' от '+xl+'" role="img"><path d="M40 22 V170 H285" fill="none" stroke="#94bed7" stroke-width="2"/><path d="M36 30 L40 22 L44 30 M277 166 L285 170 L277 174" fill="none" stroke="#94bed7" stroke-width="2"/><text x="13" y="24" font-size="15" fill="#eefaff">'+yl+'</text><text x="278" y="191" font-size="15" fill="#eefaff">'+xl+'</text><path d="'+d+'" stroke="#18d4ff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
}
function piston(){
 const s=state(),height=clamp(s.V*35,38,170),top=220-height;
 let dots='';
 for(let i=0;i<20;i++){const xp=75+(i%5)*31,yp=top+22+Math.floor(i/5)*(height-28)/4;if(yp<218)dots+='<circle cx="'+xp+'" cy="'+yp+'" r="4" fill="#31d7ff"/>'}
 return '<svg viewBox="0 0 300 260" style="display:block;width:100%;height:auto;max-height:245px" role="img" aria-label="Газ под поршнем"><path d="M60 20 V225 H240 V20" stroke="#62c5ff" stroke-width="5" fill="none"/><rect x="64" y="'+top+'" width="172" height="'+height+'" fill="#1276b5" fill-opacity=".26"/>'+dots+'<rect x="58" y="'+(top-9)+'" width="184" height="15" rx="3" fill="#c7e2ef"/><rect x="144" y="6" width="12" height="'+(top-12)+'" fill="#71b5d3"/><text x="150" y="250" text-anchor="middle" fill="#bcdff4" font-size="14">Модель идеального газа</text></svg>';
}
function draw(){
 const root=byId();if(!root)return;
 const m=currentMode(),s=state(),quiz=st.exp>=3,revealed=!st.teacher&&st.exp!==3||st.answer!==null;
 const law=[['T = const','pV = const','При V ↑ давление p ↓.'],['p = const','V/T = const','При T ↑ объём V ↑.'],['V = const','p/T = const','При T ↑ давление p ↑.']][m];
 root.innerHTML='<div class="iso-lab"><h2>Виртуальная лаборатория · Изопроцессы</h2><p class="iso-muted">ЕГЭ · Физика · Урок 46 · ν = const, p₀ = 100 кПа, V₀ = 2 л, T₀ = 300 К</p>'+
 '<div class="iso-tabs" role="tablist">'+['Изотермический','Изобарный','Изохорный','Угадай процесс','Перестрой график'].map((t,i)=>'<button type="button" role="tab" data-iso-exp="'+i+'" aria-selected="'+(st.exp===i)+'">'+(i+1)+'. '+t+'</button>').join('')+'</div>'+
 '<div class="iso-controls"><button type="button" data-iso-action="fullscreen">⛶ Полный экран</button><button type="button" data-iso-action="teacher">'+(st.teacher?'Показать законы':'Режим учителя')+'</button><button type="button" data-iso-action="condition">'+(st.condition?'Скрыть условие':'Показать условие')+'</button></div>'+
 '<div class="iso-cols"><section class="iso-panel"><h3>'+(quiz?'Эксперимент с вопросом':modeNames[m])+'</h3>'+
 (st.condition?'<p class="iso-muted">'+(st.exp===3?'Определите неизвестный процесс по графику и показаниям.':st.exp===4?tests[st.test][0]:'Изменяйте параметр газа и проверьте соответствующий закон.')+'</p>':'')+
 piston()+'<div class="iso-metrics"><span><small>p, кПа</small><strong>'+format(s.p)+'</strong></span><span><small>V, л</small><strong>'+format(s.V,2)+'</strong></span><span><small>T, К</small><strong>'+format(s.T,0)+'</strong></span></div>'+
 (st.exp===4?'':'<label for="iso-control-range">'+(m===0?'Объём V':'Температура T')+': '+(m===0?format(st.variable,2)+' л':format(st.variable,0)+' К')+'</label><input id="iso-control-range" type="range" min="'+(m===0?'0.9':'200')+'" max="'+(m===0?'4':'600')+'" step="'+(m===0?'0.05':'5')+'" value="'+st.variable+'">')+
 '<div class="iso-controls"><button type="button" data-iso-action="play">'+(st.play?'⏸ Пауза':'▶ Старт')+'</button><button type="button" data-iso-action="reset">↺ Сброс</button></div></section>'+
 '<section class="iso-panel"><h3>Графики и проверка</h3><div class="iso-charts">'+graph(m,false)+graph(m,true)+'</div>'+
 '<p class="iso-note" style="margin-top:12px">'+(revealed?'<strong>'+law[0]+' · '+law[1]+'</strong> '+law[2]:'Закон скрыт. Сделайте вывод самостоятельно.')+'</p>'+
 (quiz?'<div class="iso-answers">'+modeNames.map((name,i)=>'<button type="button" data-iso-answer="'+i+'">'+name+'</button>').join('')+'</div><p class="iso-note" role="status">'+(st.answer===null?'Выберите ответ.':st.answer===m?'Верно! '+law[2]:'Неверно. Сравните форму графика с формулами газовых законов.')+'</p><div class="iso-controls"><button type="button" data-iso-action="next">Следующее задание</button></div>':
 '<p class="iso-note">Эксперимент: измените параметр ползунком и сравните показания приборов.</p>')+
 '</section></div></div>';
}
function setExp(i){st.exp=i;st.play=false;st.answer=null;if(i===3)st.unknown=Math.floor(Math.random()*3);if(i===4)st.test=0;st.variable=currentMode()===0?2:300;draw()}
function reset(){st.play=false;st.answer=null;st.variable=currentMode()===0?2:300;draw()}
function advance(){st.play=false;st.answer=null;if(st.exp===3)st.unknown=(st.unknown+1)%3;else st.test=(st.test+1)%tests.length;st.variable=currentMode()===0?2:300;draw()}
function animate(){if(!st.play)return;const root=byId();if(!root||!root.isConnected){st.play=false;return}st.phase+=.045;st.variable=currentMode()===0?Number((2.3+1.2*Math.sin(st.phase)).toFixed(2)):Math.round(400+170*Math.sin(st.phase));draw();requestAnimationFrame(animate)}
window.renderIsoprocessLab=function(){addStyles();st.play=false;return '<div id="fizmat-iso-lab" aria-label="Интерактивная лаборатория изопроцессов"></div>'};
window.mountIsoprocessLab=function(){addStyles();draw()};
document.addEventListener('click',function(e){
 const root=e.target.closest('#fizmat-iso-lab');if(!root)return;
 const t=e.target.closest('[data-iso-exp]');if(t){setExp(Number(t.dataset.isoExp));return}
 const a=e.target.closest('[data-iso-answer]');if(a){st.play=false;st.answer=Number(a.dataset.isoAnswer);draw();return}
 const b=e.target.closest('[data-iso-action]');if(!b)return;
 switch(b.dataset.isoAction){
 case 'play':st.play=!st.play;if(st.play)requestAnimationFrame(animate);else draw();break;
 case 'reset':reset();break;
 case 'next':advance();break;
 case 'teacher':st.teacher=!st.teacher;draw();break;
 case 'condition':st.condition=!st.condition;draw();break;
 case 'fullscreen':if(document.fullscreenElement)document.exitFullscreen?.();else root.requestFullscreen?.();break;
 }
});
document.addEventListener('input',function(e){if(e.target.id!=='iso-control-range'||!e.target.closest('#fizmat-iso-lab'))return;st.play=false;st.variable=Number(e.target.value);draw()});
})();