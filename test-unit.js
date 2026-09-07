const {JSDOM}=require("jsdom");const fs=require("fs"),path=require("path");
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};
const FILE=process.argv[2]||"unit-02-fractions-and-decimals.html";
JSDOM.fromFile(FILE,{
  runScripts:"dangerously",resources:"usable",pretendToBeVisual:true,
  beforeParse(w){
    w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
    w.scrollTo=()=>{};
    try{Object.defineProperty(w.SVGElement.prototype,"offsetWidth",{get(){return 100}});}catch(e){}
  }
}).then(dom=>{
 setTimeout(()=>{
  const w=dom.window,d=w.document;
  const EXPECT={1:"fractionModel",9:"fractionDivide",11:"decimalGrid",15:"shift",17:"shift",19:"barModel"};
  ok(!!d.querySelector('link[href="curriculum.css"]'),"links shared stylesheet");
  ok(typeof w.MathTools==="object","core loaded and MathTools present");
  const N=w.LESSONS.length;
  ok(N>0,N+" lessons present");
  const nav=d.getElementById("daynav");
  ok(nav.children.length===N,N+" day tabs rendered");

  // structural completeness of every lesson object
  const REQ=["day","short","title","objective","standards","vocab","materials","warmup","stages","guided","worksheet","exit","crit","support","extend","access"];
  let bad=[];
  w.LESSONS.forEach((L,i)=>{
    REQ.forEach(k=>{if(L[k]===undefined||(Array.isArray(L[k])&&!L[k].length))bad.push(`day${i+1}.${k}`);});
    if(L.day!==i+1)bad.push(`day numbering at index ${i}`);
    if(L.stages.length!==3)bad.push(`day${i+1} stage count`);
    const ks=L.stages.map(s=>s.k).join("");
    if(ks!=="cpa")bad.push(`day${i+1} CPA order (${ks})`);
    L.stages.forEach(s=>{if(!s.sense)bad.push(`day${i+1} stage missing sense`);});
    if(!L.access.length)bad.push(`day${i+1} access notes`);
  });
  ok(!bad.length,"every lesson complete + CPA order held"+(bad.length?" :: "+bad.slice(0,6).join(", "):""));

  // total minutes per lesson
  let mins=[];
  w.LESSONS.forEach(L=>{const t=L.warmup.mins+L.stages.reduce((s,x)=>s+x.mins,0);mins.push(t);});
  ok(mins.every(m=>m>=40&&m<=48),"stage timings leave room for guided+worksheet+exit (range "+Math.min(...mins)+"-"+Math.max(...mins)+" of 55)");

  // click through every tab
  let mounted=0,toolFails=[];
  for(let i=0;i<N;i++){
    nav.children[i].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
    const host=d.getElementById("toolmount");
    const tools=host.querySelectorAll(".tool").length;
    if(tools)mounted++;
    if(!tools)toolFails.push(i+1);
    ok(d.querySelector("#content h2")!==null,`day ${i+1} renders a lesson heading`);
  }
  ok(mounted===N,"a tool mounts on all "+N+" days"+(toolFails.length?" (missing: "+toolFails+")":""));

  // day 20 station picker
  nav.children[N-1].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  const picks=d.querySelectorAll("#toolmount .picker .btn").length;
  ok(picks>=10,"day 20 station picker offers all tools (got "+picks+")");

  // aria-labels on every svg across all days
  let noAria=[];
  for(let i=0;i<N;i++){
    nav.children[i].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
    d.querySelectorAll("#toolmount svg").forEach(s=>{
      const a=s.getAttribute("aria-label");
      if(!a||a.length<30)noAria.push(i+1);
    });
  }
  ok(!noAria.length,"every mounted SVG carries a descriptive aria-label"+(noAria.length?" (day "+[...new Set(noAria)]+")":""));

  // sidebar renders
  nav.children[0].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  ok(d.querySelectorAll("#side .card").length===6,"sidebar renders all six cards");
  ok(d.querySelector(".exit .crit").textContent.length>40,"mastery criterion present and specific");

  console.log(fail?`\n${fail} FAILURES`:"\nall passed");
 },1800);
}).catch(e=>{console.log("LOAD ERROR",e.message);});
