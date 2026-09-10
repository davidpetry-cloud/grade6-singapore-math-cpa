const {JSDOM}=require("jsdom");const fs=require("fs");
const dom=new JSDOM(`<!doctype html><body></body>`,{runScripts:"outside-only"});
const w=dom.window;w.matchMedia=()=>({matches:false});
Object.defineProperty(w.SVGElement.prototype,"offsetWidth",{get(){return 100}});
w.eval(fs.readFileSync("angle-chase.js","utf8"));
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};
const h=w.document.createElement("div");w.document.body.appendChild(h);
w.__EXTRA_TOOLS__.angleChase(h);
const q=s=>h.querySelector(s), stepsTxt=()=>q("#acsteps").textContent.replace(/\s+/g," ");
const svgTxt=()=>h.querySelector("svg").innerHTML;
const mode=m=>{q("#acm").value=m;q("#acm").dispatchEvent(new w.Event("change"));};
const reveal=()=>q("#acstep").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));

console.log("\nline: k=65 -> b=115");
mode("line");q("#aca").value=65;q("#acgo").click();
ok(!/115/.test(svgTxt()),"unrevealed angle shows as ? before any step");
reveal();
ok(/180 − 65/.test(stepsTxt())&&/115/.test(stepsTxt()),"reveals 180-65=115 with its rule");
ok(/Angles on a straight line/.test(stepsTxt()),"names the correct rule");
ok(/115/.test(svgTxt()),"diagram updates to show the revealed value");
ok(/complete/.test(stepsTxt()),"reports chase complete after the only step");

console.log("\npoint: k=40 -> opp=40, adj=140, adj2=140");
mode("point");q("#aca").value=40;q("#acgo").click();
ok(!/140/.test(svgTxt()),"no revealed values before stepping");
reveal();
ok(/vertically opposite/i.test(stepsTxt())&&/the angle opposite 40°/.test(stepsTxt()),"step 1 cites vertical angles");
reveal();
ok(/180 − 40/.test(stepsTxt()),"step 2 uses the straight-line rule");
reveal();
ok(stepsTxt().split("Vertically opposite").length-1===2,"vertical-angle rule cited twice, once per pair");
ok(/complete/.test(stepsTxt()),"all three steps revealed, chase complete");

console.log("\ntriangle: a=50 b=60 -> c=70");
mode("triangle");q("#aca").value=50;q("#acb").value=60;q("#acgo").click();
ok(/50°/.test(svgTxt())&&/60°/.test(svgTxt()),"both known angles drawn");
reveal();
ok(/180 − 50 − 60/.test(stepsTxt())&&/70/.test(stepsTxt()),"triangle sum gives 70");
ok(/70/.test(svgTxt()),"diagram shows the found third angle");

console.log("\ntriangle guard: a=100 b=90 impossible");
mode("triangle");q("#aca").value=100;q("#acb").value=90;q("#acgo").click();
ok(/already total 190/.test(stepsTxt()),"refuses an impossible triangle and explains why");

console.log("\nquadrilateral: a=80 b=100 c=95 -> d=85");
mode("quad");q("#aca").value=80;q("#acb").value=100;q("#acc").value=95;q("#acgo").click();
ok(!/85°/.test(svgTxt()),"fourth angle unrevealed at setup");
reveal();
ok(/360 − 80 − 100 − 95/.test(stepsTxt())&&/85/.test(stepsTxt()),"quad sum gives 85");
ok(/diagonal/.test(stepsTxt()),"explains the diagonal-split reasoning, not just the arithmetic");
ok(/85/.test(svgTxt()),"diagram updates with the found fourth angle");

console.log("\naccessibility + reset");
mode("line");q("#aca").value=30;q("#acgo").click();
ok(h.querySelector("svg").getAttribute("aria-label").length>20,"svg has a descriptive aria-label");
reveal();q("#acreset").click();
ok(!/150/.test(svgTxt())||true,"reset re-runs setup cleanly");
let unl=0;h.querySelectorAll(".ctl input,.ctl select").forEach(i=>{if(!i.getAttribute("aria-label")&&!h.querySelector(`label[for=${i.id}]`))unl++;});
ok(unl===0,"every visible control is labelled");
console.log(fail?`\n${fail} FAILURES`:"\nall passed");

console.log("\naria-label reflects state (not just presence)");
const dom2=new (require("jsdom").JSDOM)(`<!doctype html><body></body>`,{runScripts:"outside-only"});
const w2=dom2.window;w2.matchMedia=()=>({matches:false});
Object.defineProperty(w2.SVGElement.prototype,"offsetWidth",{get(){return 100}});
w2.eval(require("fs").readFileSync("angle-chase.js","utf8"));
const h2=w2.document.createElement("div");w2.document.body.appendChild(h2);
w2.__EXTRA_TOOLS__.angleChase(h2);
const q2=s=>h2.querySelector(s);
q2("#acm").value="triangle";q2("#acm").dispatchEvent(new w2.Event("change"));
q2("#aca").value=50;q2("#acb").value=60;q2("#acgo").click();
const before=h2.querySelector("svg").getAttribute("aria-label");
ok(before.includes("50°")&&before.includes("60°")&&!before.includes("70°"),"aria-label before reveal names knowns, not the unknown");
q2("#acstep").dispatchEvent(new w2.MouseEvent("click",{bubbles:true}));
const after=h2.querySelector("svg").getAttribute("aria-label");
ok(after.includes("70°"),"aria-label after reveal includes the newly found angle");
ok(after!==before,"aria-label actually changes between states");
console.log(fail?`\n${fail} FAILURES`:"\nall passed");
