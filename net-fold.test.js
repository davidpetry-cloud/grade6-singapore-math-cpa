const {JSDOM}=require("jsdom");const fs=require("fs");
const dom=new JSDOM(`<!doctype html><body></body>`,{runScripts:"outside-only"});
const w=dom.window;w.matchMedia=()=>({matches:false});
Object.defineProperty(w.SVGElement.prototype,"offsetWidth",{get(){return 100}});
w.eval(fs.readFileSync("net-fold-geometry.js","utf8"));
w.eval(fs.readFileSync("net-fold.js","utf8"));
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};
const h=w.document.createElement("div");w.document.body.appendChild(h);
w.__EXTRA_TOOLS__.netFold(h);
const q=s=>h.querySelector(s), txt=()=>q("#nfout").textContent.replace(/\s+/g," ");
const cell=(x,y)=>h.querySelector(`button.nf-cell[data-x="${x}"][data-y="${y}"]`);
const click=(x,y)=>cell(x,y).dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
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
const labels=[...h.querySelectorAll(".nf-cell .f")].map(t=>t.textContent);
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
const grid=q(".nf-grid");
ok(grid.getAttribute("role")==="group"&&/8 columns by 5 rows/.test(grid.getAttribute("aria-label")),"the grid is a labelled group");
ok(h.querySelectorAll(".nf-cell").length===40,"forty square buttons");
ok([...h.querySelectorAll(".nf-cell")].filter(b=>b.tabIndex===0).length===1,"the grid is one Tab stop (roving focus)");
btns[0].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));fold();
ok(/It folds/.test(txt())&&/square \d, (front|back|top|bottom|left|right)/.test(cell(1,1).getAttribute("aria-label")),
   "each square's name gives its number and face after a fold ("+cell(1,1).getAttribute("aria-label")+")");
ok(/WebGL/.test(q("#nf3d").textContent),"without WebGL the 3D area says so, and the flat check still works");

console.log("\nkeyboard");
q("#nfclear").click();
const key=k=>grid.dispatchEvent(new w.KeyboardEvent("keydown",{key:k,bubbles:true}));
cell(0,0).focus();key("ArrowRight");key("ArrowDown");
ok(w.document.activeElement===cell(1,1)&&cell(1,1).tabIndex===0&&cell(0,0).tabIndex===-1,"arrow keys move focus and the Tab stop");
key("End");ok(w.document.activeElement===cell(7,1),"End jumps to the end of the row");
key("Home");ok(w.document.activeElement===cell(0,1),"Home jumps to the start of the row");
key("ArrowUp");key("ArrowUp");ok(w.document.activeElement===cell(0,0),"focus stops at the edge");
cell(0,0).click();
ok(cell(0,0).getAttribute("aria-pressed")==="true"&&/1 of 6/.test(q("#nfcount").textContent),"pressing a square (Space or Enter) places it");

console.log("\nclashes are marked by more than colour");
btns[5].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));fold();
const clashed=[...h.querySelectorAll(".nf-cell.clash")];
ok(clashed.length===4,"strip of six: four clashing squares are marked (got "+clashed.length+")");
ok(clashed.every(b=>/clash/.test(b.textContent)&&/clashes/.test(b.getAttribute("aria-label"))),"each shows the word clash and says so in its name");
ok(/Squares 1 and 5 both land on the front; squares 2 and 6 both land on the right, so the top and bottom are left open\./.test(txt()),
   "the message names the squares, the face and what is left open");
q("#nfclear").click();
ok(!h.querySelector(".nf-cell.clash"),"clearing removes the marks");

console.log("\nthe 3D view agrees with the flat fold");
const G=w.NetFoldGeometry;let agree=0;
for(const [name,cs] of ELEVEN){
  setCells(cs);fold();
  const flat={};h.querySelectorAll(".nf-cell[aria-pressed=true]").forEach(b=>{flat[b.querySelector(".n").textContent]=b.querySelector(".f").textContent;});
  const r=G.closeUp(cs.map(([x,y])=>({x,y})));
  if(r.closes&&r.squares.every(s=>flat[s.num]===s.face))agree++;
  else console.log("    (disagrees: "+name+")");
}
ok(agree===11,"for all 11 nets, every square gets the same face in the flat tool and the 3D maths (got "+agree+")");

console.log(fail?`\n${fail} FAILURES`:"\nall passed");
