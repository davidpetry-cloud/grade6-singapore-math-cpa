/* netFoldGeometry — the maths behind Unit 8's fold preview. No Three.js, no DOM.
   The 3D view places every square from the matrices computed here, so what the
   tests assert is exactly what students see (docs/3d-tools.md).

   A net is laid flat in the x–y plane, one unit per square, grid y running down
   the page. The first square stays put, facing the viewer (+z). Every other
   square hangs off the square it was reached from (the same walk netFold's
   foldNet uses, so face names agree), hinged on their shared edge. Folding by
   t (0 = flat, 1 = closed) turns every hinge by t × 90°, away from the viewer.
   A good net closes into the unit cube behind the first square.

   Works as a plain <script> (window.NetFoldGeometry) and with require(). */
(function(root){
"use strict";

/* Same order as foldNet's DIRS: up, right, down, left (grid y down). */
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const FACES={"0,0,1":"front","0,0,-1":"back","0,1,0":"top","0,-1,0":"bottom","1,0,0":"right","-1,0,0":"left"};
const FACE_ORDER=["front","back","top","bottom","left","right"];

/* 3×3 matrices as flat row-major arrays */
const I3=[1,0,0, 0,1,0, 0,0,1];
function mul(a,b){
  const r=new Array(9);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)
    r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[3+j]+a[i*3+2]*b[6+j];
  return r;
}
function apply(m,v){return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];}
/* Rotation by angle a about a unit axis (Rodrigues) */
function rot(axis,a){
  const [x,y,z]=axis, c=Math.cos(a), s=Math.sin(a), k=1-c;
  return [c+x*x*k, x*y*k-z*s, x*z*k+y*s,
          y*x*k+z*s, c+y*y*k, y*z*k-x*s,
          z*x*k-y*s, z*y*k+x*s, c+z*z*k];
}
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const scale=(v,s)=>[v[0]*s,v[1]*s,v[2]*s];
const snap=v=>v.map(n=>Math.abs(n)<1e-9?0:Math.round(n*1e6)/1e6);

/* Squares numbered in reading order (top row first, left to right), so the
   flat grid, the 3D labels and the messages all use the same numbers. */
function numberCells(cells){
  const sorted=cells.slice().sort((a,b)=>a.y-b.y||a.x-b.x);
  const num=new Map(sorted.map((c,i)=>[c.x+","+c.y,i+1]));
  return c=>num.get(c.x+","+c.y);
}

/* The hinge tree: a breadth-first walk from cells[0], as in foldNet.
   Returns null unless there are six edge-connected squares. */
function foldTree(cells){
  if(!cells||cells.length!==6)return null;
  const key=(x,y)=>x+","+y, at=new Map(cells.map(c=>[key(c.x,c.y),c]));
  const numOf=numberCells(cells);
  const nodes=[{cell:cells[0],num:numOf(cells[0]),parent:-1,dir:null}];
  const seen=new Set([key(cells[0].x,cells[0].y)]);
  for(let i=0;i<nodes.length;i++){
    const c=nodes[i].cell;
    for(const [dx,dy] of DIRS){
      const k=key(c.x+dx,c.y+dy);
      if(at.has(k)&&!seen.has(k)){
        seen.add(k);
        const n=at.get(k);
        nodes.push({cell:n,num:numOf(n),parent:i,dir:[dx,dy]});
      }
    }
  }
  return nodes.length===6?nodes:null;
}

/* Where every square is at fold amount t: rotation R (its local x, y, z axes),
   centre p, and outward normal n. Parents always come before children. */
function pose(tree,t){
  const angle=Math.max(0,Math.min(1,t))*Math.PI/2, out=[];
  for(const node of tree){
    if(node.parent<0){out.push({R:I3.slice(),p:[0,0,0],n:[0,0,1]});continue;}
    const par=out[node.parent];
    const d=[node.dir[0],-node.dir[1],0];          /* grid y down → 3D y up */
    const axis=[-d[1],d[0],0];                     /* z × d: folds away from the viewer */
    const R=mul(par.R,rot(axis,angle));
    const p=add(add(par.p,apply(par.R,scale(d,.5))),apply(R,scale(d,.5)));
    out.push({R,p,n:apply(R,[0,0,1])});
  }
  return out;
}

/* The centre of the shape at fold amount t, so the view can keep it centred. */
function centre(poses){
  const s=poses.reduce((a,q)=>add(a,q.p),[0,0,0]);
  return scale(s,1/poses.length);
}

/* Fully folded: which face each square becomes, which faces get two squares,
   and which are left open. This is the result students read. */
function closeUp(cells){
  const tree=foldTree(cells);
  if(!tree)return null;
  const poses=pose(tree,1);
  const squares=tree.map((node,i)=>({num:node.num,x:node.cell.x,y:node.cell.y,
    face:FACES[snap(poses[i].n).join(",")]}));
  const byFace={};
  squares.forEach(s=>{(byFace[s.face]=byFace[s.face]||[]).push(s.num);});
  Object.values(byFace).forEach(a=>a.sort((p,q)=>p-q));
  const clashes=FACE_ORDER.filter(f=>byFace[f]&&byFace[f].length>1)
    .map(f=>({face:f,squares:byFace[f]}));
  const open=FACE_ORDER.filter(f=>!byFace[f]);
  return {closes:clashes.length===0,squares:squares.sort((a,b)=>a.num-b.num),clashes,open};
}

/* Plain-language summary, shared by the flat tool and the 3D view's label */
function list(words){return words.length<2?words.join(""):words.slice(0,-1).join(", ")+" and "+words[words.length-1];}
function describe(result){
  if(!result)return "";
  if(result.closes)return "It closes into a cube: every face gets exactly one square.";
  const parts=result.clashes.map(c=>`squares ${list(c.squares.map(String))} both land on the ${c.face}`);
  const s=parts.join("; ");
  return s.charAt(0).toUpperCase()+s.slice(1)+
    `, so the ${list(result.open)} ${result.open.length===1?"is":"are"} left open.`;
}

const api={DIRS,FACES,FACE_ORDER,foldTree,pose,centre,closeUp,describe,numberCells};
if(typeof module==="object"&&module.exports)module.exports=api;
else root.NetFoldGeometry=api;
})(typeof self!=="undefined"?self:this);
