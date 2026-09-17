/* netFold — Unit 8 (Volume & Surface Area).
   A net is only a net if it folds. This tool lets a student lay out squares on
   a grid and find out whether theirs closes into a cube — and if it doesn't,
   which specific rule it broke. Paper tells you it failed; this tells you why.
   Declare before curriculum-core.js. */
window.__EXTRA_TOOLS__=Object.assign(window.__EXTRA_TOOLS__||{},(function(){
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const T="#1F8A7D", A="#E4A03C", P="#6B7FB3", INK="#1B3A5C", MUT="#5B7189", ROSE="#C2536B";

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

function netFold(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Folding a net<span class="mins">tool</span></h3>
    <p class="sense">touch · spatial reasoning</p>
    <p class="how">Click squares to lay out a net, then fold it. Paper tells you a bad net failed. This tells you which rule it broke — too few squares, a gap, or two faces trying to land in the same place.</p>
    <div class="ctl picker" id="nfp"></div>
    <div class="ctl">
      <button class="btn go" id="nffold">Fold it</button>
      <button class="btn sm" id="nfclear">Clear</button>
      <span id="nfcount" style="font-family:var(--mono);font-size:.85rem;color:var(--muted)">0 of 6 squares</span>
    </div>
    <div class="stage-area"><svg viewBox="0 0 700 330" role="img" style="width:100%;height:auto"></svg></div>
    <div class="out" id="nfout"></div>
    <p class="note">There are exactly eleven nets that fold into a cube. Five are loaded as presets and two deliberate failures are too — try those on purpose, and read what the tool says is wrong with them.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"), out=box.querySelector("#nfout"), $=s=>box.querySelector(s);
  $("#nfp").innerHTML=PRESETS.map((p,i)=>`<button class="btn sm" data-i="${i}">${p.k}</button>`).join("");

  let cells=[], folded=null;
  const COLS=8, ROWS=5, CW=54, GX=120, GY=24;
  const has=(x,y)=>cells.some(c=>c.x===x&&c.y===y);

  function draw(){
    let s="";
    /* grid */
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const on=has(x,y);
      let fill="#fff", stroke="#D3DCE4", sw=1;
      let label="";
      if(on){
        fill=T; stroke=INK; sw=2;
        if(folded&&folded.ok){
          const v=folded.faces.get(x+","+y);
          if(v){label=FACE_NAME[v.join(",")]||"";}
        }
        if(folded&&folded.reason==="overlap"&&folded.clash&&
           folded.clash.some(c=>c.x===x&&c.y===y)){ fill=ROSE; }
      }
      s+=`<rect class="nfsq" data-x="${x}" data-y="${y}" x="${GX+x*CW}" y="${GY+y*CW}" width="${CW}" height="${CW}" fill="${fill}" fill-opacity="${on?".85":"1"}" stroke="${stroke}" stroke-width="${sw}" style="cursor:pointer"/>`;
      if(label){
        s+=`<text x="${GX+x*CW+CW/2}" y="${GY+y*CW+CW/2+4}" font-family="Roboto Mono" font-size="11" fill="#fff" text-anchor="middle" pointer-events="none">${label}</text>`;
      }
    }
    svg.innerHTML=s;
    $("#nfcount").textContent=`${cells.length} of 6 squares`;

    const desc = cells.length
      ? `A grid with ${cells.length} shaded square${cells.length===1?"":"s"} forming a net layout.`
      : `An empty grid, ready for squares to be placed.`;
    svg.setAttribute("aria-label", desc + (folded
      ? (folded.ok
         ? ` This net folds into a cube; each square is labelled with the cube face it becomes: front, back, top, bottom, left and right.`
         : ` This net does not fold into a cube.`)
      : ""));
  }

  function report(){
    if(!folded){out.innerHTML=`<span style="color:${MUT}">Lay out six squares, then press Fold it.</span>`;return;}
    if(folded.ok){
      out.innerHTML=`<b style="color:${T}">It folds.</b> Every square landed on a different face of the cube — front, back, top, bottom, left and right, all six filled exactly once.<br>
        <span style="color:${MUT}">The labels show where each square ends up. Notice that squares far apart on the flat net can end up next to each other on the cube; flat distance and folded distance are different things.</span>`;
      return;
    }
    const R=folded.reason;
    const msg = R==="count"
      ? `<b style="color:${ROSE}">Not six squares.</b> You have ${folded.count}. A cube has six faces, so a net needs exactly six squares — no more, no fewer.`
      : R==="disconnected"
        ? `<b style="color:${ROSE}">The squares are not all joined.</b> Only ${folded.connected} of your 6 connect to each other along edges. A net has to be one piece — if you cut it out, it must come away in a single flat shape.`
        : R==="overlap"
          ? `<b style="color:${ROSE}">Two faces land in the same place.</b> When this folds, two of your squares try to occupy the same face of the cube — so some other face is left open. The shaded red squares are the pair that clash.`
          : `<b style="color:${ROSE}">This one doesn't fold.</b>`;
    out.innerHTML = msg + `<br><span style="color:${MUT}">Change one square and try again. Knowing which rule a net breaks is more useful than knowing it failed.</span>`;
  }

  svg.addEventListener("click",e=>{
    const r=e.target.closest("rect[data-x]");if(!r)return;
    const x=+r.dataset.x, y=+r.dataset.y;
    if(has(x,y)) cells=cells.filter(c=>!(c.x===x&&c.y===y));
    else cells.push({x,y});
    folded=null; draw(); report();
  });
  $("#nffold").addEventListener("click",()=>{folded=foldNet(cells);draw();report();});
  $("#nfclear").addEventListener("click",()=>{cells=[];folded=null;draw();report();});
  $("#nfp").addEventListener("click",e=>{
    const b=e.target.closest("button[data-i]");if(!b)return;
    cells=PRESETS[+b.dataset.i].cells.map(([x,y])=>({x,y}));
    folded=null;draw();report();
  });
  draw();report();
}
return {netFold};
})());
window.__EXTRA_NAMES__=Object.assign(window.__EXTRA_NAMES__||{},{netFold:"Folding a net"});
