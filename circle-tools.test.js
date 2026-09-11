const {JSDOM}=require("jsdom");const fs=require("fs");
const dom=new JSDOM(`<!doctype html><body></body>`,{runScripts:"outside-only"});
const w=dom.window;w.matchMedia=()=>({matches:false});
Object.defineProperty(w.SVGElement.prototype,"offsetWidth",{get(){return 100}});
w.eval(fs.readFileSync("circle-tools.js","utf8"));
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};

console.log("\ncircleUnroll — deriving pi by measurement");
const h=w.document.createElement("div");w.document.body.appendChild(h);
w.__EXTRA_TOOLS__.circleUnroll(h);
const q=s=>h.querySelector(s), txt=()=>q("#cuout").textContent.replace(/\s+/g," ");
const aria=()=>h.querySelector("svg").getAttribute("aria-label");
const set=(d,c)=>{q("#cud").value=d;q("#cuc").value=c;q("#cugo").click();};

set(10,31.4);
ok(/31\.4 ÷ 10 = 3\.14/.test(txt()),"10cm / 31.4cm gives ratio 3.14");
ok(/3d/.test(txt())&&/4d/.test(txt()),"describes landing past 3d, short of 4d");
ok(/close to the true ratio as hand measurement gets/.test(txt()),"near-exact measurement gets the tight-tolerance message");
ok(aria().includes("3.14"),"aria-label states the ratio reached");

set(7.4,23.5);
ok(/3\.18/.test(txt()),"jar lid 23.5/7.4 gives 3.18");
ok(/Off the true ratio by/.test(txt()),"plausible hand-measurement scatter is named as measuring error");
ok(/overshooting three diameters by 0\.18 of one/.test(txt()),"quantifies the overshoot past three diameters");

set(10,38);
ok(/more than measuring error usually explains/.test(txt()),"an implausible ratio (3.8) is flagged for re-measuring");
set(10,29);
ok(/more than measuring error usually explains/.test(txt()),"a too-small ratio (2.9) is also flagged");

const btns=h.querySelectorAll("#cup button");
ok(btns.length===6,"six real objects offered as presets (got "+btns.length+")");
btns[2].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
ok(/82 ÷ 26/.test(txt()),"dinner plate preset loads its measurements");
ok(/3\.15/.test(txt()),"and computes its ratio");

let unl=0;h.querySelectorAll(".ctl input").forEach(i=>{if(!i.getAttribute("aria-label")&&!h.querySelector(`label[for=${i.id}]`))unl++;});
ok(unl===0,"every control is labelled");

console.log("\ncircleWedges — area by rearrangement");
const h2=w.document.createElement("div");w.document.body.appendChild(h2);
w.__EXTRA_TOOLS__.circleWedges(h2);
const q2=s=>h2.querySelector(s), txt2=()=>q2("#cwout").textContent.replace(/\s+/g," ");
const aria2=()=>h2.querySelectorAll("svg")[0].getAttribute("aria-label");
const setW=(r,n)=>{q2("#cwr").value=r;q2("#cwn").value=n;q2("#cwr").dispatchEvent(new w.Event("input"));};

setW(5,8);
ok(/8 wedges/.test(txt2()),"reports the wedge count");
ok(/still visibly bumpy/.test(txt2()),"8 wedges described as bumpy");
ok(/78\.54/.test(txt2()),"radius 5 gives area 78.54");
ok(/πr² /.test(txt2())||/πr²/.test(txt2()),"states the formula it derived");
ok(/height/.test(txt2())&&/πr/.test(txt2()),"names height r and base pi-r");

setW(5,24);
ok(/almost perfectly flat/.test(txt2()),"24 wedges described as almost flat");
ok(/too small to draw/.test(txt2()),"high wedge count gets the limiting-argument message");
setW(5,14);
ok(/noticeably flatter/.test(txt2()),"14 wedges is the middle description");

setW(3,20);
ok(/28\.27/.test(txt2()),"radius 3 gives area 28.27");
ok(aria2().includes("20 equal wedges"),"aria-label counts the wedges");
ok(aria2().includes("half the circumference"),"aria-label describes the derived base");
const beforeN=aria2();
setW(3,6);
ok(aria2()!==beforeN,"aria-label changes with the wedge count");

let unl2=0;h2.querySelectorAll(".ctl input").forEach(i=>{if(!i.getAttribute("aria-label")&&!h2.querySelector(`label[for=${i.id}]`))unl2++;});
ok(unl2===0,"every control is labelled");
console.log(fail?`\n${fail} FAILURES`:"\nall passed");
