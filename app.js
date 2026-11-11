/* 유한양행 인사팀 워크다이어트 — slide engine · © Data Thinking Lab */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const store={get(k){try{return localStorage.getItem("wd:"+k)}catch(e){return null}},set(k,v){try{localStorage.setItem("wd:"+k,v)}catch(e){}},del(k){try{localStorage.removeItem("wd:"+k)}catch(e){}}};
const stage=$("#stage"), slides=$$(".slide");
const TOTAL=22;
const PRACTICE_ICON='<svg width="20" height="20"><use href="#i-clock"/></svg>';

/* ---------- chrome ---------- */
slides.forEach((s,i)=>{
  const no=s.dataset.no, mod=s.dataset.mod||"";
  if(!s.classList.contains("cover")){
    const h=document.createElement("div"); h.className="hdr";
    let right="";
    if(s.dataset.virtual) right+='<span class="vchip">교육용 가상 예시</span>';
    if(s.dataset.practice) right+=`<span class="pchip time">${PRACTICE_ICON}실습 ${s.dataset.min}분</span>`;
    else if(s.dataset.min) right+=`<span class="pchip" style="background:#EEF2F6;color:#475569">${s.dataset.min}분</span>`;
    h.innerHTML=`<div class="mod"><b>■</b>${mod}</div><div class="right">${right}</div>`;
    s.appendChild(h);
  }
  const f=document.createElement("div"); f.className="ftr";
  f.innerHTML=`<div class="l"><img src="assets/logo.png" alt="Data Thinking Lab"><span>© 2026 Data Thinking Lab. All rights reserved. 본 자료의 저작권은 Data Thinking Lab에 있으며 무단 복제·배포를 금합니다.</span></div>`+
    `<div class="pg">${no?no+' <span>/ '+TOTAL+'</span>':'<span>'+(s.dataset.label||'PROFILE')+'</span>'}</div>`;
  s.appendChild(f);
  const sp=document.createElement("div"); sp.className="spot"; s.prepend(sp);
});

/* ---------- kinetic words ---------- */
$$("[data-kin]").forEach(el=>{
  let i=0;
  const walk=(node)=>{
    Array.from(node.childNodes).forEach(n=>{
      if(n.nodeType===3){
        const parts=n.textContent.split(/(\s+)/); const frag=document.createDocumentFragment();
        parts.forEach(p=>{ if(!p) return; if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(" "));return;}
          const w=document.createElement("span"); w.className="w"; w.style.setProperty("--i",i++); w.textContent=p; frag.appendChild(w);});
        node.replaceChild(frag,n);
      } else if(n.nodeType===1 && n.tagName!=="BR"){ walk(n); }
    });
  };
  walk(el);
});

/* ---------- scaling ---------- */
function fit(){
  const w=innerWidth,h=innerHeight, sc=Math.min(w/1920,h/1080)*0.985;
  stage.style.transform=`translate(${-960*sc}px,${-540*sc}px) scale(${sc})`;
  stage.dataset.sc=sc;
}
addEventListener("resize",fit); fit();

/* ---------- navigation ---------- */
let cur=0;
function go(n,force){
  n=Math.max(0,Math.min(slides.length-1,n));
  if(n===cur && !force) return;
  slides.forEach((s,i)=>{s.classList.toggle("active",i===n); s.classList.toggle("prev",i<n); if(i!==n) s.classList.remove("step1");});
  cur=n; history.replaceState(null,"","#"+(n+1));
  $("#prog").style.width=((n+1)/slides.length*100)+"%";
  onEnter(slides[n]);
  renderNotes();
  updNav();
}
function next(){
  const s=slides[cur];
  if(s.dataset.steps && !s.classList.contains("step1")){ reveal(s); return; }
  go(cur+1);
}
function prev(){
  const s=slides[cur];
  if(s.dataset.steps && s.classList.contains("step1")){ s.classList.remove("step1"); return; }
  go(cur-1);
}
function reveal(s){
  s.classList.add("step1");
  if(s.dataset.no==="19") runCSV(true);
}
function replay(){ const s=slides[cur]; s.classList.remove("active","step1"); void s.offsetWidth; go(cur,true); }

const typing=()=>{const a=document.activeElement; return a && (a.tagName==="TEXTAREA"||a.tagName==="INPUT"||a.tagName==="SELECT"||a.isContentEditable);};
addEventListener("keydown",e=>{
  if(typing()){ if(e.key==="Escape") document.activeElement.blur(); return; }
  const k=e.key;
  if(["ArrowRight","PageDown"," ","Enter"].includes(k)){e.preventDefault();next();}
  else if(["ArrowLeft","PageUp","Backspace"].includes(k)){e.preventDefault();prev();}
  else if(k==="Home") go(0); else if(k==="End") go(slides.length-1);
  else if(k==="o"||k==="O") toggleOv(); else if(k==="n"||k==="N") toggleNotes();
  else if(k==="f"||k==="F") fs(); else if(k==="r"||k==="R") replay();
  else if(k==="p"||k==="P") print(); else if(k==="Escape") $("#ov").classList.remove("on");
});
// click to reveal on step slides (only on non-interactive area)
stage.addEventListener("click",e=>{
  const s=slides[cur]; if(!s.dataset.steps || s.classList.contains("step1")) return;
  if(e.target.closest("button,textarea,input,select,a,[contenteditable],.ba,.app")) return;
  reveal(s);
});
// swipe
let tx=null; addEventListener("touchstart",e=>{tx=e.touches[0].clientX},{passive:true});
addEventListener("touchend",e=>{ if(tx===null) return; const d=e.changedTouches[0].clientX-tx; if(Math.abs(d)>60){ d<0?next():prev(); } tx=null; });

function updNav(){
  const p=$("#nav-prev"), q=$("#nav-next"); if(!p) return;
  p.disabled=cur===0 && !slides[cur].classList.contains("step1");
  q.disabled=cur===slides.length-1;

}
/* ---------- toolbar / overlays ---------- */
function toast(m){const t=$("#toast"); t.textContent=m; t.classList.add("on"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("on"),1600);}
function fs(){ if(!document.fullscreenElement) document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
function toggleNotes(){ $("#notes").classList.toggle("on"); }
function renderNotes(){ const s=slides[cur]; $("#notes-h").textContent=`발표자 노트 · ${s.dataset.no||s.dataset.label||"강사 소개"} ${s.dataset.title||""}`; $("#notes-b").textContent=s.dataset.note||""; }
function toggleOv(){ $("#ov").classList.toggle("on"); }
(function buildOv(){
  const g=$("#ov-grid"); let lastMod="";
  slides.forEach((s,i)=>{
    const mod=s.dataset.mod;
    if(mod!==lastMod){ const h=document.createElement("div"); h.className="modh"; h.textContent=mod; g.appendChild(h); lastMod=mod; }
    const d=document.createElement("div"); d.className="it";
    d.innerHTML=`<small>${s.dataset.no||s.dataset.label||"PROFILE"}</small><div>${s.dataset.title||""}</div><em>${s.dataset.practice?"실습 ":""}${s.dataset.min?s.dataset.min+"분":""}</em>`;
    d.onclick=()=>{ $("#ov").classList.remove("on"); go(i); };
    g.appendChild(d);
  });
  $("#ov").addEventListener("click",e=>{ if(e.target.id==="ov") toggleOv(); });
})();
$("#nav-prev").onclick=e=>{e.stopPropagation();prev();}; $("#nav-next").onclick=e=>{e.stopPropagation();next();};
$("#b-toc").onclick=toggleOv; $("#b-notes").onclick=toggleNotes; $("#b-fs").onclick=fs; $("#b-pdf").onclick=()=>print();

/* ---------- hover: tilt, parallax, spotlight ---------- */
function stagePoint(e){ const r=stage.getBoundingClientRect(), sc=+stage.dataset.sc||1; return {x:(e.clientX-r.left)/sc, y:(e.clientY-r.top)/sc}; }
stage.addEventListener("mousemove",e=>{
  const s=slides[cur]; const p=stagePoint(e);
  s.style.setProperty("--mx",p.x+"px"); s.style.setProperty("--my",p.y+"px");
  const dx=(p.x-960)/960, dy=(p.y-540)/540;
  $$(".orb",s).forEach(o=>{const d=+o.dataset.depth||15; o.style.transform=`translate(${dx*d}px,${dy*d}px)`;});
});
document.addEventListener("mousemove",e=>{
  const c=e.target.closest&&e.target.closest(".tilt");
  if(tilt.el && tilt.el!==c){ tilt.el.style.transform=""; tilt.el=null; }
  if(!c || c.closest(".slide")!==slides[cur]) return;
  tilt.el=c; const r=c.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
  c.style.transform=`perspective(900px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) translateY(-4px)`;
});
const tilt={el:null};
document.addEventListener("mouseleave",()=>{ if(tilt.el){tilt.el.style.transform="";tilt.el=null;} });

/* ---------- count-up & rings ---------- */
function countUp(s){
  $$("[data-count]",s).forEach(el=>{
    const to=+el.dataset.count, t0=performance.now(), dur=1300;
    const step=t=>{ const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=Math.round(to*e); if(k<1) requestAnimationFrame(step); };
    el.textContent="0"; requestAnimationFrame(step);
  });
  $$("[data-ring]",s).forEach(c=>{ c.style.transition="none"; c.style.strokeDashoffset=553; void c.getBoundingClientRect();
    c.style.transition="stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1) .3s"; c.style.strokeDashoffset=553*(1-(+c.dataset.ring)); });
}

/* ---------- cover canvas: molecule network following mouse ---------- */
const cv=$("#cv-net"); let net=null;
if(cv){
  cv.width=1920; cv.height=1080; const ctx=cv.getContext("2d");
  const pts=[]; for(let i=0;i<70;i++){ pts.push({x:1100+Math.random()*820,y:Math.random()*1080,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:3+Math.random()*7,o:Math.random()<.12}); }
  let m={x:1500,y:500};
  cv.parentElement.addEventListener("mousemove",e=>{ m=stagePoint(e); });
  function draw(){
    if(slides[cur]!==cv.parentElement){ net=requestAnimationFrame(draw); return; }
    ctx.clearRect(0,0,1920,1080);
    // soft helix ribbon
    ctx.lineWidth=2;
    for(let k=0;k<2;k++){ ctx.beginPath(); for(let y=0;y<=1080;y+=8){ const x=1520+Math.sin(y/120+performance.now()/2200+k*Math.PI)*150+(m.x-1500)*.03; y===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.strokeStyle=k?"rgba(242,107,29,.25)":"rgba(31,42,64,.15)"; ctx.stroke(); }
    for(let y=20;y<=1080;y+=46){ const a=Math.sin(y/120+performance.now()/2200), x1=1520+a*150+(m.x-1500)*.03, x2=1520-a*150+(m.x-1500)*.03; ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.strokeStyle="rgba(148,163,184,.25)"; ctx.stroke(); }
    pts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.x<900||p.x>1920)p.vx*=-1; if(p.y<0||p.y>1080)p.vy*=-1;
      const dx=m.x-p.x, dy=m.y-p.y, d=Math.hypot(dx,dy); if(d<220){ p.x-=dx/d*.9; p.y-=dy/d*.9; } });
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){ const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y); if(d<150){ ctx.strokeStyle=`rgba(71,85,105,${(1-d/150)*.22})`; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } }
    pts.forEach(p=>{ const g=ctx.createRadialGradient(p.x-p.r/3,p.y-p.r/3,1,p.x,p.y,p.r); if(p.o){g.addColorStop(0,"#FFD2B5");g.addColorStop(1,"#F26B1D");} else {g.addColorStop(0,"#fff");g.addColorStop(1,"#B9C5D3");} ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill(); });
    net=requestAnimationFrame(draw);
  }
  draw();
}

/* ---------- prompts: editable + copy + reset + persist ---------- */
function copyText(t){
  if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
  return new Promise((res,rej)=>{ const ta=document.createElement("textarea"); ta.value=t; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");res();}catch(e){rej(e);} ta.remove(); });
}
$$(".prompt").forEach(p=>{
  const ta=$("textarea",p), key=ta.dataset.key, def=ta.value;
  const saved=store.get("p:"+key); if(saved!==null) ta.value=saved;
  ta.addEventListener("input",()=>store.set("p:"+key,ta.value));
  const msg=$(".msg",p);
  const flash=(m)=>{ msg.textContent=m; msg.classList.add("on"); setTimeout(()=>msg.classList.remove("on"),1500); };
  const c=$("[data-copy]",p); if(c) c.onclick=()=>copyText(ta.value).then(()=>flash("복사했습니다 ✓")).catch(()=>{ta.select();flash("Ctrl+C로 복사하세요");});
  const r=$("[data-reset]",p); if(r) r.onclick=()=>{ ta.value=def; store.del("p:"+key); flash("원래 문구로 되돌렸습니다"); };
  const mm=$("[data-memo]",p); if(mm) mm.onclick=()=>{ const memo=$('textarea[data-key="memo"]').value.trim(); ta.value=ta.value.replace(/\[최근 업무 메모\][\s\S]*$/,"[최근 업무 메모]\n"+memo+"\n"); store.set("p:"+key,ta.value); flash("06장 메모를 넣었습니다"); };
});
$$("[data-save]").forEach(el=>{ const k="e:"+el.dataset.save, v=store.get(k); if(v) el.textContent=v; el.addEventListener("input",()=>store.set(k,el.textContent)); el.addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault(); el.blur();} }); });

/* ---------- before/after sliders ---------- */
$$("[data-ba]").forEach(ba=>{
  let drag=false; const set=e=>{ const r=ba.getBoundingClientRect(); let x=((e.clientX-r.left)/r.width)*100; x=Math.max(4,Math.min(96,x)); ba.style.setProperty("--pos",x+"%"); };
  ba.addEventListener("pointerdown",e=>{drag=true; ba.setPointerCapture(e.pointerId); set(e);});
  ba.addEventListener("pointermove",e=>{ if(drag) set(e); });
  ba.addEventListener("pointerup",()=>drag=false);
});
function baIntro(s){ $$("[data-ba]",s).forEach(ba=>{ let t0=performance.now(); const an=t=>{ const k=Math.min(1,(t-t0)/1600); const x=50+Math.sin(k*Math.PI*2)*22*(1-k); ba.style.setProperty("--pos",x+"%"); if(k<1) requestAnimationFrame(an); }; requestAnimationFrame(an); }); }

/* ---------- 15: scenario runner ---------- */
const SC={
  normal:{path:["in","in-chk","chk","chk-rev","rev","rev-ok","ok"],end:"okk",msg:"정상 — 누락·불일치가 없으면 담당자 검토를 거쳐 최종 승인으로 넘어갑니다. ▸ 최종 승인이 있는가?"},
  exception:{path:["in","in-chk","chk","chk-ask","ask","ask-loop","re","ask-chk","chk","chk-rev","rev"],end:"lit",msg:"예외 — 불일치는 담당 부서에 확인하고, 회신 후 다시 대조합니다. ▸ 누가 원본을 대조하는가?"},
  fail:{path:["in","in-chk","chk","stop"],end:"stop",msg:"실패 — 형식 오류·권한 문제는 담당자에게 돌리고 다음 단계를 멈춥니다. ▸ 검증되지 않은 자료가 넘어가는가?"}
};
let scTimers=[];
function runSc(name){
  scTimers.forEach(clearTimeout); scTimers=[];
  const svg=$("#runner"); $$(".node,.edge",svg).forEach(n=>n.classList.remove("lit","stop","okk"));
  $$(".scbtn").forEach(b=>b.classList.toggle("on",b.dataset.sc===name));
  const sc=SC[name]; $("#runmsg").textContent="";
  sc.path.forEach((id,i)=>scTimers.push(setTimeout(()=>{
    const el=svg.querySelector(`[data-n="${id}"],[data-e="${id}"]`); if(!el) return;
    if(id==="stop"){ el.classList.add("stop"); } else el.classList.add("lit");
    if(i===sc.path.length-1){ if(sc.end==="okk") el.classList.add("okk"); $("#runmsg").innerHTML="<b style='color:#172B3A'>"+sc.msg+"</b>"; }
  },i*380)));
}
$$(".scbtn").forEach(b=>b.onclick=()=>runSc(b.dataset.sc));

/* ---------- charts ---------- */
const FONT="'Paperlogy','Malgun Gothic',sans-serif";
if(window.Chart){ Chart.defaults.font.family=FONT; Chart.defaults.font.size=18; Chart.defaults.color="#475569"; }
const charts={};
function mk(id,cfg){ if(!window.Chart) return null; if(charts[id]) charts[id].destroy(); charts[id]=new Chart($("#"+id),cfg); return charts[id]; }

// 16: bar chart + calculator
function calc16(){ const a=+$("#c16a").value||0,b=+$("#c16b").value||0,c=+$("#c16c").value||0; const r=(a-b)*c/60;
  $("#f16").textContent=`(${a} − ${b}) × ${c} ÷ 60 =`; $("#r16").textContent=(Math.round(r*10)/10).toLocaleString("ko-KR");
  const ch=charts.ch16; if(ch){ ch.data.datasets[0].data=[a,b]; ch.update(); } }
function chart16(){
  mk("ch16",{type:"bar",data:{labels:["현재 1회 작업",["개선 후 1회 작업","(검토·재작업 포함)"]],datasets:[{label:"직접 작업분",data:[+$("#c16a").value,+$("#c16b").value],backgroundColor:["#1F2A40","#F26B1D"],borderRadius:12,maxBarThickness:150}]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:1200,easing:"easeOutQuart"},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.parsed.y}분`}},title:{display:true,text:"1회 직접 작업분 (분)",font:{size:20,weight:"700"},color:"#172B3A"}},
      scales:{y:{beginAtZero:true,grid:{color:"#E2E8F0"},ticks:{callback:v=>v+"분"}},x:{grid:{display:false},ticks:{font:{size:19,weight:"700"},color:"#172B3A"}}}}});
  calc16();
}
["c16a","c16b","c16c"].forEach(id=>$("#"+id).addEventListener("input",calc16));

// 19: CSV checker
const CATS=["정상","누락","중복","불일치","숫자 오류"], EXPECT=[1,1,2,1,1];
function parseCSV(text,tol){
  const lines=text.trim().split(/\r?\n/).filter(Boolean); const rows=lines.slice(1).map((l,i)=>{const c=l.split(","); return {n:i+1,id:(c[0]||"").trim(),dept:(c[1]||"").trim(),base:(c[2]||"").trim(),sub:(c[3]||"").trim()};});
  const cnt={}; rows.forEach(r=>cnt[r.id]=(cnt[r.id]||0)+1);
  const isNum=v=>/^-?\d+(\.\d+)?$/.test(v);
  rows.forEach(r=>{ r.flags=[]; r.diff="";
    if(cnt[r.id]>1) r.flags.push("dup");
    if(r.base===""||r.sub==="") r.flags.push("miss");
    else if(!isNum(r.base)||!isNum(r.sub)) r.flags.push("err");
    else { r.diff=(+r.sub)-(+r.base); if(Math.abs(r.diff)>tol || (tol===0 && r.diff!==0)) r.flags.push("diff"); }
    if(!r.flags.length) r.flags.push("ok");
  });
  return rows;
}
const FL={ok:"정상",miss:"누락",dup:"중복 ID",diff:"불일치",err:"숫자 형식 오류"};
function runCSV(show){
  const tol=+$("#tol").value; const rows=parseCSV($("#csv19").value,tol);
  $("#out19 tbody").innerHTML=rows.map(r=>`<tr><td>${r.n}</td><td><b>${r.id}</b></td><td>${r.dept}</td><td>${r.base}</td><td>${r.sub||'<span style="color:#A9B4C2">(빈칸)</span>'}</td><td>${r.diff===""?"":(r.diff>0?"+":"")+r.diff}</td><td>${r.flags.map(f=>`<span class="flag ${f}">${FL[f]}</span>`).join("")}</td></tr>`).join("");
  const actual=[rows.filter(r=>r.flags.includes("ok")).length,rows.filter(r=>r.flags.includes("miss")).length,rows.filter(r=>r.flags.includes("dup")).length,rows.filter(r=>r.flags.includes("diff")).length,rows.filter(r=>r.flags.includes("err")).length];
  const ex=rows.filter(r=>r.flags.includes("diff"));
  const rq=$("#req19");
  if(ex.length){ rq.style.display="block"; rq.innerHTML="<b>AI 요청문 초안 (검증한 예외만 입력)</b> — "+ex.map(r=>`${r.id}의 기준 ${r.base}분과 제출 ${r.sub}분에 ${Math.abs(r.diff)}분 차이가 있습니다. 기준·제출 값과 관련 근거를 확인해 주세요.`).join(" / ")+" <span class='flag err'>담당자 확인 후 발송</span>"; }
  else rq.style.display="none";
  const ch=charts.ch19; if(ch){ ch.data.datasets[1].data=actual; ch.update(); }
  if(show && !slides[cur].classList.contains("step1")) slides[cur].classList.add("step1");
}
function chart19(){
  mk("ch19",{type:"bar",data:{labels:CATS,datasets:[{label:"기대 결과",data:EXPECT,backgroundColor:"rgba(31,42,64,.85)",borderRadius:8},{label:"실제 출력",data:[0,0,0,0,0],backgroundColor:"#F26B1D",borderRadius:8}]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:900},plugins:{legend:{position:"top",labels:{font:{size:18,weight:"700"},boxWidth:18}},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${c.parsed.y}행`}}},
      scales:{y:{beginAtZero:true,suggestedMax:3,ticks:{stepSize:1,callback:v=>v+"행"},grid:{color:"#E2E8F0"}},x:{grid:{display:false},ticks:{font:{size:17,weight:"700"},color:"#172B3A"}}}}});
}
$("#run19").onclick=()=>runCSV(true);
let last19=[];
$$(".t19").forEach(b=>b.onclick=()=>{
  $$(".t19").forEach(x=>{x.classList.toggle("on",x===b); x.classList.toggle("navy",x===b); x.classList.toggle("sec",x!==b);});
  $$(".tp19").forEach(p=>p.style.display=p.dataset.p===b.dataset.t?"flex":"none");
  if(b.dataset.t==="chart" && charts.ch19) charts.ch19.resize();
});
$("#ins19").onclick=()=>{
  const ta=$('textarea[data-key="p19r"]'), msg=$("#ins19").parentElement.querySelector(".msg");
  const rows=parseCSV($("#csv19").value,+$("#tol").value).filter(r=>!r.flags.includes("ok"));
  const list=rows.map(r=>`- 행 ${r.n} / ${r.id} / 부서 ${r.dept} / 기준 ${r.base||"(빈칸)"}분 / 제출 ${r.sub||"(빈칸)"} / 차이 ${r.diff===""?"(계산 안 함)":r.diff+"분"} / 예외: ${r.flags.map(f=>FL[f]).join(", ")}`).join("\n");
  ta.value=ta.value.replace(/\[검증된 예외 목록\][\s\S]*$/,"[검증된 예외 목록]\n"+list+"\n");
  store.set("p:p19r",ta.value);
  msg.textContent="검사 결과를 넣었습니다 — 발송 전 원본 확인"; msg.classList.add("on"); setTimeout(()=>msg.classList.remove("on"),1800);
};

const CSV_DEF=$("#csv19").value;
$("#reset19").onclick=()=>{ $("#csv19").value=CSV_DEF; $("#tol").value="0"; $("#out19 tbody").innerHTML='<tr><td colspan="7" style="color:#8A97A8;font-size:20px">‘검사 실행’을 누르면 결과가 표시됩니다.</td></tr>'; $("#req19").style.display="none"; if(charts.ch19){charts.ch19.data.datasets[1].data=[0,0,0,0,0];charts.ch19.update();} slides[cur].classList.remove("step1"); };
$("#tol").onchange=()=>{ if(slides[cur].classList.contains("step1")) runCSV(false); };

// agenda: time allocation
function chartAg(){
  const center={id:"ctr",afterDraw(c){const a=c.chartArea, ctx=c.ctx; const x=(a.left+a.right)/2,y=(a.top+a.bottom)/2; ctx.save(); ctx.textAlign="center"; ctx.fillStyle="#172B3A"; ctx.font="900 44px Paperlogy"; ctx.fillText("240분",x,y+6); ctx.font="700 18px Paperlogy"; ctx.fillStyle="#8A97A8"; ctx.fillText("13:30–17:30",x,y+34); ctx.restore();}};
  mk("chAg",{type:"doughnut",data:{labels:["1. 소개","2. AS-IS","휴식","3. 병목·TO-BE","4. 도구·시연","5. 발표·마무리"],datasets:[{data:[20,60,10,90,35,25],backgroundColor:["#FFC7A4","#F26B1D","#E2E8F0","#1F2A40","#075E4E","#94A3B8"],borderColor:"#fff",borderWidth:3,hoverOffset:14}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"60%",animation:{animateRotate:true,duration:1300},plugins:{legend:{position:"bottom",labels:{font:{size:16,weight:"700"},boxWidth:14,padding:10}},tooltip:{callbacks:{label:c=>` ${c.label}: ${c.parsed}분`}}}},plugins:[center]});
}
// 21: doughnut + timer
function chart21(){
  mk("ch21",{type:"doughnut",data:{labels:["1조 발표","1조 피드백","2조 발표","2조 피드백","3조 발표","3조 피드백"],datasets:[{data:[5,2,5,2,5,2],backgroundColor:["#F26B1D","#FFC7A4","#1F2A40","#94A3B8","#075E4E","#A7DCCB"],borderWidth:3,borderColor:"#fff",hoverOffset:14}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"58%",animation:{animateRotate:true,duration:1300},plugins:{legend:{position:"right",labels:{font:{size:17,weight:"700"},boxWidth:16,padding:10}},tooltip:{callbacks:{label:c=>` ${c.label}: ${c.parsed}분`}}}}});
}
let tmLeft=300, tmRun=null;
function tmShow(){ const m=Math.floor(tmLeft/60), s=tmLeft%60; const el=$("#tm"); el.textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"); el.classList.toggle("warn",tmLeft<=30); }
$$("[data-tm]").forEach(b=>b.onclick=()=>{ clearInterval(tmRun); tmRun=null; tmLeft=+b.dataset.tm; tmShow(); });
$("#tmgo").onclick=()=>{ if(tmRun){clearInterval(tmRun);tmRun=null;return;} tmRun=setInterval(()=>{ if(tmLeft>0){tmLeft--;tmShow();} else {clearInterval(tmRun);tmRun=null;toast("시간이 끝났습니다");} },1000); };

/* ---------- on enter ---------- */
function onEnter(s){
  countUp(s);
  const no=s.dataset.no;
  if(s.dataset.label==="AGENDA") setTimeout(chartAg,350);
  if(no==="16") setTimeout(chart16,250);
  if(no==="19") setTimeout(()=>{ chart19(); },250);
  if(no==="21") setTimeout(chart21,250);
  if(no==="10"||no==="14") setTimeout(()=>baIntro(s),700);
  if(no==="15") setTimeout(()=>runSc("exception"),900);
}

/* ---------- start ---------- */
const h=parseInt((location.hash||"#1").slice(1),10); cur=-1; go(isNaN(h)?0:h-1,true);
addEventListener("hashchange",()=>{ const n=parseInt(location.hash.slice(1),10); if(!isNaN(n)&&n-1!==cur) go(n-1); });
addEventListener("beforeprint",()=>{ slides.forEach(s=>s.classList.add("step1")); });
})();
