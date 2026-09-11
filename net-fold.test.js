const {JSDOM}=require("jsdom");const fs=require("fs");
const dom=new JSDOM(`<!doctype html><body></body>`,{runScripts:"outside-only"});
const w=dom.window;w.matchMedia=()=>({matches:false});
Object.defineProperty(w.SVGElement.prototype,"offsetWidth",{get(){return 100}});
w.eval(fs.readFileSync("net-fold.js","utf8"));
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};
const h=w.document.createElement("div");w.document.body.appendChild(h);
w.__EXTRA_TOOLS__.netFold(h);
const q=s=>h.querySelector(s), txt=()=>q("#nfout").textContent.replace(/\s+/g," ");
const click=(x,y)=>{const r=h.querySelector(`rect[data-x="${x}"][data-y="${y}"]`);r.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));};
const setCells=cs=>{q("#nfclear").click();cs.forEach(([x,y])=>click(x,y));};
const fold=()=>q("#nffold").click();

/* All 11 cube nets, normalised to fit the 8x5 grid. */
const ELEVEN=[
 ["1-4-1 a",[[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]]],
 ["1-4-1 b",[[1,0],[0,1],[1,1],[2,1],[3,1],[2,2]]],
 ["1-4-1 c",[[1,0],[0,1],[1,1],[2,1],[3,1],[3,2]]],
 ["1-4-1 d",[[0,0],[0,1],[1,1],[2,1],[3,1],[3,2]]],
 ["1-4-1 e",[[1,0],[0,1],[1,1],[2,1],[3,1],[0,2]]],
 ["1-4-1 f",[[0,0],[0,1],[1,1],[2,1],[3,1],[2,2]]],
 ["2-3-1 a",[[0,0],[1,0],[1,1],[2,1],[3,1],[3,2]]],
 ["2-3-1 b",[[0,0],[1,0],[1,1],[2,1],[3,1],[1,2]]],
 ["2-3-1 c",[[0,0],[1,0],[1,1],[2,1],[3,1],[2,2]]],
 ["2-2-2",  [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]]],
 ["3-3",    [[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]]],
];

console.log("\nall eleven valid cube nets must fold");
let good=0;
for(const [name,cs] of ELEVEN){
  setCells(cs);fold();
  const passed=/It folds/.test(txt());
  if(passed)good++; else console.log("    (failed: "+name+" -> "+txt().slice(0,70)+")");
}
ok(good===11,`all 11 known cube nets fold (got ${good}/11)`);

console.log("\ndeliberate failures, each named correctly");
setCells([[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]]);fold();
ok(/same place/.test(txt()),"strip of 6 fails as an overlap");
setCells([[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]);fold();
ok(/same place/.test(txt()),"2x3 block fails as an overlap");
setCells([[0,0],[1,0],[2,0]]);fold();
ok(/Not six squares/.test(txt())&&/have 3/.test(txt()),"three squares reports the count and the actual number");
setCells([[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0]]);fold();
ok(/have 7/.test(txt()),"seven squares reports count too");
setCells([[0,0],[1,0],[2,0],[3,0],[5,0],[6,0]]);fold();
ok(/not all joined/.test(txt()),"a gap is reported as disconnected, not as overlap");
ok(/Only 4 of your 6/.test(txt()),"disconnected message states how many actually connect");

console.log("\nface labelling on a valid net");
setCells([[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]]);fold();
ok(/It folds/.test(txt()),"the cross net folds");
const labels=[...h.querySelectorAll("svg text")].map(t=>t.textContent);
ok(labels.length===6,"six squares carry a face label (got "+labels.length+")");
const uniq=new Set(labels);
ok(uniq.size===6,"all six labels are different faces");
["front","back","top","bottom","left","right"].forEach(f=>{
  if(!uniq.has(f)){fail++;console.log("  FAIL missing face label: "+f);}
});
ok([...uniq].every(l=>["front","back","top","bottom","left","right"].includes(l)),"labels are the six cube faces");

console.log("\ninteraction");
q("#nfclear").click();
ok(/0 of 6/.test(q("#nfcount").textContent),"clear resets the counter");
click(2,2);click(3,2);
ok(/2 of 6/.test(q("#nfcount").textContent),"counter tracks placed squares");
click(2,2);
ok(/1 of 6/.test(q("#nfcount").textContent),"clicking a placed square removes it");
const btns=h.querySelectorAll("#nfp button");
ok(btns.length===7,"seven presets, five valid and two failures (got "+btns.length+")");
btns[5].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));fold();
ok(/same place/.test(txt()),"the 'strip of 6 (fails)' preset loads and fails as labelled");
btns[0].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));fold();
ok(/It folds/.test(txt()),"the 'cross' preset loads and folds");

console.log("\naccessibility");
ok(h.querySelector("svg").getAttribute("aria-label").includes("folds into a cube"),"aria-label reports a successful fold");
btns[6].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));fold();
ok(h.querySelector("svg").getAttribute("aria-label").includes("does not fold"),"aria-label reports a failed fold");
console.log(fail?`\n${fail} FAILURES`:"\nall passed");
