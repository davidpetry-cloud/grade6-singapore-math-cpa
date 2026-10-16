/* Tests for the fold preview's maths: node net-fold-geometry.test.js */
const G=require("./net-fold-geometry.js");
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};
const cellsOf=a=>a.map(([x,y])=>({x,y}));
const near=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-9);

/* The same eleven nets as net-fold.test.js */
const ELEVEN=[
 [[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]], [[1,0],[0,1],[1,1],[2,1],[3,1],[2,2]],
 [[1,0],[0,1],[1,1],[2,1],[3,1],[3,2]], [[0,0],[0,1],[1,1],[2,1],[3,1],[3,2]],
 [[1,0],[0,1],[1,1],[2,1],[3,1],[0,2]], [[0,0],[0,1],[1,1],[2,1],[3,1],[2,2]],
 [[0,0],[1,0],[1,1],[2,1],[3,1],[3,2]], [[0,0],[1,0],[1,1],[2,1],[3,1],[1,2]],
 [[0,0],[1,0],[1,1],[2,1],[3,1],[2,2]], [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]],
 [[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]]
];

console.log("\nall eleven cube nets close, with each square on its own face");
let good=0, placed=0;
for(const net of ELEVEN){
  const r=G.closeUp(cellsOf(net));
  if(r&&r.closes&&new Set(r.squares.map(s=>s.face)).size===6&&!r.open.length)good++;
  /* fully folded, every square sits exactly on a face of the unit cube behind square one */
  const tree=G.foldTree(cellsOf(net)), poses=G.pose(tree,1);
  if(poses.every(q=>near(q.p,[q.n[0]/2,q.n[1]/2,-.5+q.n[2]/2])))placed++;
}
ok(good===11,`all 11 close (got ${good})`);
ok(placed===11,`in all 11, each square sits exactly on a face of the cube (got ${placed})`);

console.log("\nfailures say which squares clash and what is left open");
const strip=G.closeUp(cellsOf([[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]]));
ok(!strip.closes,"a strip of six does not close");
ok(JSON.stringify(strip.clashes)==='[{"face":"front","squares":[1,5]},{"face":"right","squares":[2,6]}]',
   "strip: squares 1 and 5 share the front, 2 and 6 the right ("+JSON.stringify(strip.clashes)+")");
ok(strip.open.join()==="top,bottom","strip: top and bottom are left open");
ok(G.describe(strip)==="Squares 1 and 5 both land on the front; squares 2 and 6 both land on the right, so the top and bottom are left open.",
   "strip: the sentence reads correctly ("+G.describe(strip)+")");
const block=G.closeUp(cellsOf([[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]));
ok(!block.closes&&block.open.length===block.clashes.reduce((s,c)=>s+c.squares.length-1,0),
   "2×3 block: every open face is matched by one extra square on another face");
ok(G.describe(G.closeUp(cellsOf(ELEVEN[0])))==="It closes into a cube: every face gets exactly one square.","a good net's sentence");

console.log("\nonly six joined squares make a tree");
ok(G.foldTree(cellsOf([[0,0],[1,0],[2,0]]))===null,"three squares: no tree");
ok(G.foldTree(cellsOf([[0,0],[1,0],[2,0],[3,0],[5,0],[6,0]]))===null,"a gap: no tree");
ok(G.closeUp(cellsOf([[0,0]]))===null,"closeUp returns null without a tree");

console.log("\nthe fold in between");
const cross=cellsOf([[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]]);
const tree=G.foldTree(cross);
const flat=G.pose(tree,0);
ok(flat.every(q=>near(q.n,[0,0,1])),"at 0 every square faces the viewer");
ok(flat.every((q,i)=>near(q.p,[tree[i].cell.x-1,-(tree[i].cell.y-0),0])),"at 0 every square sits where it is on the grid");
const pair=G.foldTree(cellsOf([[0,0],[1,0],[2,0],[3,0],[0,1],[0,2]]));
const half=G.pose(pair,.5), s=Math.SQRT1_2;
ok(near(half[1].n,[s,0,s]),"at one half, a hinge has turned 45°");
ok(near(G.pose(pair,1.4)[1].n,G.pose(pair,1)[1].n)&&near(G.pose(pair,-1)[1].n,[0,0,1]),"fold amounts past 0 and 1 are clamped");

console.log("\nnumbering is reading order");
const num=G.numberCells(cellsOf([[2,1],[0,0],[1,1]]));
ok(num({x:0,y:0})===1&&num({x:1,y:1})===2&&num({x:2,y:1})===3,"top row first, then left to right");

console.log("\nevery hexomino: 35 shapes, exactly 11 fold into a cube");
/* Grow every fixed shape of six squares, then group by rotation and reflection. */
const norm=cs=>{const mx=Math.min(...cs.map(c=>c[0])),my=Math.min(...cs.map(c=>c[1]));
  return cs.map(([x,y])=>[x-mx,y-my]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);};
const key=cs=>norm(cs).map(c=>c.join(",")).join(" ");
const canon=cs=>{let best=null;
  for(let r=0;r<4;r++)for(const f of [false,true]){
    let t=cs.map(([x,y])=>f?[-x,y]:[x,y]);
    for(let i=0;i<r;i++)t=t.map(([x,y])=>[-y,x]);
    const k=key(t);if(best===null||k<best)best=k;}
  return best;};
let level=new Map([[key([[0,0]]),[[0,0]]]]);
for(let n=1;n<6;n++){
  const next=new Map();
  for(const cs of level.values())for(const [x,y] of cs)for(const [dx,dy] of G.DIRS){
    const c=[x+dx,y+dy];if(cs.some(d=>d[0]===c[0]&&d[1]===c[1]))continue;
    const grown=norm(cs.concat([c]));next.set(key(grown),grown);}
  level=next;
}
const free=new Map();for(const cs of level.values())free.set(canon(cs),cs);
ok(free.size===35,`35 free hexominoes (got ${free.size})`);
let nets=0,consistent=true;
for(const cs of free.values()){
  const shuffled=cellsOf(cs);
  const closes=G.closeUp(shuffled).closes;
  if(closes)nets++;
  /* the answer must not depend on which square the walk starts from */
  for(let i=1;i<6;i++){const rot=shuffled.slice(i).concat(shuffled.slice(0,i));
    if(G.closeUp(rot).closes!==closes)consistent=false;}
}
ok(nets===11,`exactly 11 of them fold into a cube (got ${nets})`);
ok(consistent,"whether a shape closes doesn't depend on the starting square");

console.log(fail?`\n${fail} FAILURES`:"\nall passed");
process.exitCode=fail?1:0;
