/* netFold — Unit 8 (Volume & Surface Area).
   A net is only a net if it folds. This tool lets a student lay out squares on
   a grid and find out whether theirs closes into a cube — and if it doesn't,
   which specific rule it broke. Paper tells you it failed; this tells you why.
   Declare before curriculum-core.js. */
window.__EXTRA_TOOLS__=Object.assign(window.__EXTRA_TOOLS__||{},(function(){
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
/* Text colours, each at least 4.5:1 on white. ROSE is terracotta now, not pink. */
const T="#0E7A6D", INK="#1B3A5C", MUT="#5B7189", ROSE="#AA4429";

/* A net folds into a cube iff: exactly 6 squares, all edge-connected, and no
   two squares land on the same cube face when folded. We fold it for real —
   walk the connected squares, carrying an orientation frame, and see which
   cube face each one lands on. That catches overlaps that a shape-matching
   lookup table would miss. */
const DIRS=[{dx:0,dy:-1,k:"up"},{dx:1,dy:0,k:"right"},{dx:0,dy:1,k:"down"},{dx:-1,dy:0,k:"left"}];

/* Cube faces as vectors. Start: front=+z toward viewer, up=+y, right=+x. */
function foldNet(cells){
  if(!cells.length) return {ok:false,reason:"empty",faces:null};
  if(cells.length!==6) return {ok:false,reason:"count",faces:null,count:cells.length};
  const key=(x,y)=>x+","+y;
  const set=new Map(cells.map(c=>[key(c.x,c.y),c]));
  /* connectivity */
  const seen=new Set(), stack=[cells[0]];
  seen.add(key(cells[0].x,cells[0].y));
  while(stack.length){
    const c=stack.pop();
    for(const d of DIRS){
      const k=key(c.x+d.dx,c.y+d.dy);
      if(set.has(k)&&!seen.has(k)){seen.add(k);stack.push(set.get(k));}
    }
  }
  if(seen.size!==6) return {ok:false,reason:"disconnected",faces:null,connected:seen.size};

  /* fold: BFS carrying (normal, up) orientation vectors */
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const neg=v=>[-v[0],-v[1],-v[2]];
  const vkey=v=>v.join(",");
  const start=cells[0];
  const faces=new Map();           /* cube-face vector -> grid cell */
  const placed=new Map();          /* grid cell -> cube-face vector */
  const q=[{c:start, normal:[0,0,1], up:[0,1,0]}];
  faces.set(vkey([0,0,1]), start);
  placed.set(key(start.x,start.y), [0,0,1]);
  const visited=new Set([key(start.x,start.y)]);
  while(q.length){
    const {c,normal,up}=q.shift();
    const right=cross(up,normal);          /* screen-right in 3D */
    for(const d of DIRS){
      const nk=key(c.x+d.dx,c.y+d.dy);
      if(!set.has(nk)||visited.has(nk))continue;
      /* rolling the cube in direction d: new normal is the old face we roll onto */
      let nn,nu;
      if(d.k==="up"){      nn=up;        nu=neg(normal); }
      else if(d.k==="down"){ nn=neg(up); nu=normal; }
      else if(d.k==="right"){ nn=right;  nu=up; }
      else {                nn=neg(right); nu=up; }
      const fk=vkey(nn);
      if(faces.has(fk)){
        return {ok:false,reason:"overlap",faces:null,
                clash:[faces.get(fk), set.get(nk)]};
      }
      faces.set(fk, set.get(nk));
      placed.set(nk, nn);
      visited.add(nk);
      q.push({c:set.get(nk), normal:nn, up:nu});
    }
  }
  return {ok:true, reason:"folds", faces:placed};
}

const FACE_NAME={"0,0,1":"front","0,0,-1":"back","0,1,0":"top","0,-1,0":"bottom","1,0,0":"right","-1,0,0":"left"};

/* the eleven cube nets, as preset layouts */
const PRESETS=[
 {k:"cross",   cells:[[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]]},
 {k:"T-shape", cells:[[0,0],[1,0],[2,0],[1,1],[1,2],[1,3]]},
 {k:"staircase",cells:[[0,0],[0,1],[1,1],[1,2],[2,2],[2,3]]},
 {k:"1-4-1",   cells:[[1,0],[0,1],[1,1],[2,1],[3,1],[3,2]]},
 {k:"2-2-2",   cells:[[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]]},
 {k:"strip of 6 (fails)", cells:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]]},
 {k:"2x3 block (fails)",  cells:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]}
];

/* Grid squares are real buttons: Tab reaches the grid once, the arrow keys
   move, and Space or Enter places or removes a square. Squares carry their
   number (reading order) so the grid, the 3D view and the messages agree.
   Colours: white text on #0E7A6D is 5.3:1; clashing squares are terracotta
   with hatching and the word "clash", so the cue isn't colour alone. */
const NF_CSS=`
.nf-grid{display:grid;grid-template-columns:repeat(8,minmax(24px,54px));justify-content:center;margin:0 auto}
.nf-cell{aspect-ratio:1;margin:0;padding:0;border:1px solid #7E8FA2;background:#fff;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
  font-family:var(--sans);color:#fff;line-height:1.05;position:relative}
.nf-cell:hover{background:#EEF3F6}
.nf-cell[aria-pressed="true"]{background:#0E7A6D;border-color:#102239}
.nf-cell.clash{background:repeating-linear-gradient(45deg,#AA4429 0 6px,#8E3A22 6px 12px)}
.nf-cell:focus-visible{outline:none;z-index:1;box-shadow:0 0 0 2px #fff,0 0 0 5px #102239}
.nf-cell .n{font-weight:700;font-size:.82rem}
.nf-cell .f{font-size:.68rem}
.nf3d h4{font-family:var(--serif);font-size:1.05rem;font-weight:600;margin:20px 0 4px;color:var(--ink)}
@media (max-width:420px){.nf-cell .f{display:none}}`;

function netFold(host){
  if(!document.getElementById("nf-style")){
    const st=document.createElement("style");st.id="nf-style";st.textContent=NF_CSS;document.head.appendChild(st);
  }
  const G=window.NetFoldGeometry;
  const box=el("div","tool");
  box.innerHTML=`<h3>Folding a net<span class="mins">tool</span></h3>
    <p class="sense">touch · spatial reasoning</p>
    <p class="how">Fold your paper net first. Then lay it out here: click squares, or reach the grid with Tab, move with the arrow keys and press Space. Fold it to find out whether it closes into a cube. Paper tells you a bad net failed. This tells you which rule it broke: too few squares, a gap, or two faces trying to land in the same place.</p>
    <div class="ctl picker" id="nfp"></div>
    <div class="ctl">
      <button class="btn go" id="nffold">Fold it</button>
      <button class="btn sm" id="nfclear">Clear</button>
      <span id="nfcount" style="font-family:var(--mono);font-size:.85rem;color:var(--muted)">0 of 6 squares</span>
    </div>
    <div class="stage-area"><div class="nf-grid" role="group" aria-label="Net grid, 8 columns by 5 rows" aria-describedby="nfout"></div></div>
    <div class="out" id="nfout" aria-live="polite"></div>
    <div class="nf3d" id="nf3d"></div>
    <p class="note">There are exactly eleven nets that fold into a cube. Five are loaded as presets and two deliberate failures are too. Try those on purpose, and read what the tool says is wrong with them.</p>`;
  host.appendChild(box);
  const grid=box.querySelector(".nf-grid"), out=box.querySelector("#nfout"), mount3d=box.querySelector("#nf3d"), $=s=>box.querySelector(s);
  $("#nfp").innerHTML=PRESETS.map((p,i)=>`<button class="btn sm" data-i="${i}">${p.k}</button>`).join("");

  let cells=[], folded=null, clash=new Set(), view=null, cursor={x:0,y:0};
  const COLS=8, ROWS=5;
  const has=(x,y)=>cells.some(c=>c.x===x&&c.y===y);
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const b=el("button","nf-cell");b.type="button";b.dataset.x=x;b.dataset.y=y;
    b.tabIndex=(x===0&&y===0)?0:-1;grid.appendChild(b);
  }
  const cellAt=(x,y)=>grid.children[y*COLS+x];

  function draw(){
    const num=G?G.numberCells(cells):(()=>{const s=cells.slice().sort((a,b)=>a.y-b.y||a.x-b.x);return c=>s.findIndex(d=>d.x===c.x&&d.y===c.y)+1;})();
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const b=cellAt(x,y), on=has(x,y);
      let face="";
      if(on&&folded&&folded.ok){const v=folded.faces.get(x+","+y);if(v)face=FACE_NAME[v.join(",")]||"";}
      const n=on?num({x,y}):0, isClash=on&&clash.has(n);
      b.setAttribute("aria-pressed",on?"true":"false");
      b.classList.toggle("clash",isClash);
      b.innerHTML=on?`<span class="n">${n}</span>${face?`<span class="f">${face}</span>`:isClash?`<span class="f">clash</span>`:""}`:"";
      b.setAttribute("aria-label",`Column ${x+1}, row ${y+1}: `+(on?`square ${n}${face?", "+face:""}${isClash?", clashes":""}`:"empty"));
    }
    $("#nfcount").textContent=`${cells.length} of 6 squares`;
  }

  function report(){
    if(!folded){out.innerHTML=`<span style="color:${MUT}">Lay out six squares, then press Fold it.</span>`;return;}
    if(folded.ok){
      out.innerHTML=`<b style="color:${T}">It folds.</b> Every square landed on a different face of the cube: front, back, top, bottom, left and right, all six filled exactly once.<br>
        <span style="color:${MUT}">The labels show where each square ends up. Notice that squares far apart on the flat net can end up next to each other on the cube; flat distance and folded distance are different things.</span>`;
      return;
    }
    const R=folded.reason;
    const detail=(R==="overlap"&&G)?" "+G.describe(G.closeUp(cells))+" Those squares are hatched and marked clash.":"";
    const msg = R==="count"
      ? `<b style="color:${ROSE}">Not six squares.</b> You have ${folded.count}. A cube has six faces, so a net needs exactly six squares, no more and no fewer.`
      : R==="disconnected"
        ? `<b style="color:${ROSE}">The squares are not all joined.</b> Only ${folded.connected} of your 6 connect to each other along edges. A net has to be one piece: if you cut it out, it must come away in a single piece.`
        : R==="overlap"
          ? `<b style="color:${ROSE}">Two faces land in the same place.</b>${detail}`
          : `<b style="color:${ROSE}">This one doesn't fold.</b>`;
    out.innerHTML = msg + `<br><span style="color:${MUT}">Change one square and try again. Knowing which rule a net breaks is more useful than knowing it failed.</span>`;
  }

  function clear3d(){if(view){view.destroy();view=null;}mount3d.innerHTML="";}
  function show3d(){
    clear3d();
    if(!G||!G.foldTree(cells))return;
    if(!(window.NetFold3D&&window.NetFold3D.supported())){
      mount3d.innerHTML=`<p class="note">The 3D view needs WebGL, which this browser isn't offering. The check above works without it.</p>`;
      return;
    }
    mount3d.innerHTML=`<h4>See it fold</h4><div></div>`;
    view=window.NetFold3D.mount(mount3d.lastElementChild,cells.map(c=>({x:c.x,y:c.y})));
    if(view)view.animateTo(1);
  }
  function changed(){folded=null;clash=new Set();clear3d();draw();report();}

  function toggle(x,y){
    if(has(x,y)) cells=cells.filter(c=>!(c.x===x&&c.y===y));
    else cells.push({x,y});
    changed();
  }
  grid.addEventListener("click",e=>{
    const b=e.target.closest("button[data-x]");if(!b)return;
    const x=+b.dataset.x,y=+b.dataset.y;
    moveTo(x,y,false);toggle(x,y);
  });
  function moveTo(x,y,focus=true){
    cellAt(cursor.x,cursor.y).tabIndex=-1;
    cursor={x:Math.max(0,Math.min(COLS-1,x)),y:Math.max(0,Math.min(ROWS-1,y))};
    const b=cellAt(cursor.x,cursor.y);b.tabIndex=0;if(focus)b.focus();
  }
  /* however a square gets focus (Tab, a click), the arrow keys start from it */
  grid.addEventListener("focusin",e=>{
    const b=e.target.closest("button[data-x]");if(b&&(+b.dataset.x!==cursor.x||+b.dataset.y!==cursor.y))moveTo(+b.dataset.x,+b.dataset.y,false);
  });
  grid.addEventListener("keydown",e=>{
    const m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
    if(m){e.preventDefault();moveTo(cursor.x+m[0],cursor.y+m[1]);return;}
    if(e.key==="Home"){e.preventDefault();moveTo(0,cursor.y);}
    if(e.key==="End"){e.preventDefault();moveTo(COLS-1,cursor.y);}
  });
  $("#nffold").addEventListener("click",()=>{
    folded=foldNet(cells);
    clash=new Set();
    if(folded.reason==="overlap"&&G){const r=G.closeUp(cells);if(r)r.clashes.forEach(c=>c.squares.forEach(n=>clash.add(n)));}
    draw();report();show3d();
  });
  $("#nfclear").addEventListener("click",()=>{cells=[];changed();});
  $("#nfp").addEventListener("click",e=>{
    const b=e.target.closest("button[data-i]");if(!b)return;
    cells=PRESETS[+b.dataset.i].cells.map(([x,y])=>({x,y}));
    changed();
  });
  draw();report();
}
return {netFold};
})());
window.__EXTRA_NAMES__=Object.assign(window.__EXTRA_NAMES__||{},{netFold:"Folding a net"});
