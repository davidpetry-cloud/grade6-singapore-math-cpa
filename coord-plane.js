/* coordPlane — Unit 10 (Integers & the Coordinate Plane).
   Three modes sharing one grid: plotting points and reading their quadrant,
   reflecting a point across an axis, and building an axis-aligned polygon
   from its vertices to find perimeter and area. Declare before
   curriculum-core.js. */
window.__EXTRA_TOOLS__=Object.assign(window.__EXTRA_TOOLS__||{},(function(){
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const T="#1F8A7D", A="#E4A03C", P="#6B7FB3", INK="#1B3A5C", MUT="#5B7189", ROSE="#C2536B";
const LETTERS="ABCDEFGH";

function quadrant(x,y){
  if(x===0&&y===0)return "the origin";
  if(x===0)return "on the y-axis";
  if(y===0)return "on the x-axis";
  if(x>0&&y>0)return "Quadrant I";
  if(x<0&&y>0)return "Quadrant II";
  if(x<0&&y<0)return "Quadrant III";
  return "Quadrant IV";
}

function coordPlane(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Coordinate plane<span class="mins">tool</span></h3>
    <p class="sense">sight · position and distance</p>
    <p class="how">Click grid intersections to place points. Every mode uses the same plane — plotting, reflecting, and outlining a shape are all the same skill of reading a pair of numbers as a position.</p>
    <div class="ctl">
      <label for="cpm">mode</label>
      <select id="cpm">
        <option value="plot">plotting points</option>
        <option value="reflect">reflecting across an axis</option>
        <option value="polygon">outlining a shape</option>
      </select>
      <button class="btn sm" id="cpclear">Clear</button>
      <span id="cpmsg" style="font-family:var(--mono);font-size:.82rem;color:var(--muted)"></span>
    </div>
    <div class="ctl" id="cprefl" hidden>
      <button class="btn" data-op="x">reflect across the x-axis</button>
      <button class="btn" data-op="y">reflect across the y-axis</button>
    </div>
    <div class="ctl" id="cppoly" hidden>
      <button class="btn go" data-op="close">Close the shape</button>
      <span style="font-family:var(--mono);font-size:.8rem;color:var(--muted)">sides must run only horizontal or vertical</span>
    </div>
    <div class="stage-area"><svg viewBox="0 0 560 560" role="img" style="width:100%;height:auto;max-width:480px;margin:0 auto;display:block"></svg></div>
    <div class="out" id="cpout"></div>
    <p class="note">Every point here is an integer pair — no estimating between gridlines. Read across first, then up or down: that order is the whole convention.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"), out=box.querySelector("#cpout"), $=s=>box.querySelector(s), $m=$("#cpm");

  const RANGE=8, CELL=30, CX=280, CY=280;
  const px=x=>CX+x*CELL, py=y=>CY-y*CELL;
  const snap=v=>Math.max(-RANGE,Math.min(RANGE,Math.round(v)));

  let points=[];      /* plot mode: {x,y,label} */
  let reflectPt=null, reflected=null, reflectAxis=null;
  let poly=[];         /* polygon mode: [{x,y}], closed:boolean */
  let polyClosed=false;

  function gridSVG(){
    let s="";
    for(let i=-RANGE;i<=RANGE;i++){
      const major=i===0;
      s+=`<line x1="${px(i)}" y1="${py(-RANGE)}" x2="${px(i)}" y2="${py(RANGE)}" stroke="${major?INK:'#D3DCE4'}" stroke-width="${major?2:1}"/>`;
      s+=`<line x1="${px(-RANGE)}" y1="${py(i)}" x2="${px(RANGE)}" y2="${py(i)}" stroke="${major?INK:'#D3DCE4'}" stroke-width="${major?2:1}"/>`;
    }
    for(let i=-RANGE;i<=RANGE;i+=2){
      if(i!==0)s+=`<text x="${px(i)}" y="${py(0)+16}" font-family="Lexend" font-size="10" fill="${MUT}" text-anchor="middle">${i}</text>`;
      if(i!==0)s+=`<text x="${px(0)-8}" y="${py(i)+3}" font-family="Lexend" font-size="10" fill="${MUT}" text-anchor="end">${i}</text>`;
    }
    s+=`<text x="${px(RANGE)+10}" y="${py(0)+4}" font-family="Lexend" font-size="12" fill="${INK}">x</text>`;
    s+=`<text x="${px(0)-6}" y="${py(RANGE)-8}" font-family="Lexend" font-size="12" fill="${INK}">y</text>`;
    /* clickable intersections */
    for(let x=-RANGE;x<=RANGE;x++)for(let y=-RANGE;y<=RANGE;y++){
      s+=`<circle class="cpgrid" data-x="${x}" data-y="${y}" cx="${px(x)}" cy="${py(y)}" r="9" fill="transparent" style="cursor:pointer"/>`;
    }
    return s;
  }
  function dot(x,y,fill,label,dy){
    return `<circle cx="${px(x)}" cy="${py(y)}" r="6" fill="${fill}" stroke="#fff" stroke-width="1.5"/>` +
      (label?`<text x="${px(x)}" y="${py(y)+(dy||-12)}" font-family="Lexend" font-size="13" fill="${fill}" text-anchor="middle">${label} (${x}, ${y})</text>`:"");
  }

  function vis(){
    $("#cprefl").hidden = $m.value!=="reflect";
    $("#cppoly").hidden = $m.value!=="polygon";
  }

  function drawPlot(){
    let s=gridSVG();
    points.forEach(p=>{ s+=dot(p.x,p.y,T,p.label); });
    svg.innerHTML=s;
    svg.setAttribute("aria-label", points.length
      ? `A coordinate plane with ${points.length} plotted point${points.length===1?"":"s"}: `+points.map(p=>`${p.label} at (${p.x}, ${p.y}), in ${quadrant(p.x,p.y)}`).join("; ")+"."
      : "An empty coordinate plane with x and y axes marked from negative eight to eight.");
    if(!points.length){ out.innerHTML=`<span style="color:${MUT}">Click grid points to plot up to 8 points.</span>`; return; }
    out.innerHTML = points.map(p=>`<b>${p.label}</b> (${p.x}, ${p.y}) — ${quadrant(p.x,p.y)}`).join("<br>");
  }

  function drawReflect(){
    let s=gridSVG();
    if(reflectPt) s+=dot(reflectPt.x,reflectPt.y,T,"P");
    if(reflected) s+=dot(reflected.x,reflected.y,A,"P'");
    if(reflectPt&&reflected){
      if(reflectAxis==="x") s+=`<line x1="${px(reflectPt.x)}" y1="${py(reflectPt.y)}" x2="${px(reflected.x)}" y2="${py(reflected.y)}" stroke="${MUT}" stroke-width="1" stroke-dasharray="3 3"/>`;
      else s+=`<line x1="${px(reflectPt.x)}" y1="${py(reflectPt.y)}" x2="${px(reflected.x)}" y2="${py(reflected.y)}" stroke="${MUT}" stroke-width="1" stroke-dasharray="3 3"/>`;
    }
    svg.innerHTML=s;
    svg.setAttribute("aria-label", reflectPt
      ? `Point P at (${reflectPt.x}, ${reflectPt.y})`+(reflected?`, reflected across the ${reflectAxis==="x"?"x":"y"}-axis to P prime at (${reflected.x}, ${reflected.y})`:"")+"."
      : "An empty coordinate plane, ready for a point to be placed and reflected.");
    if(!reflectPt){ out.innerHTML=`<span style="color:${MUT}">Click one point, then choose which axis to reflect it across.</span>`; return; }
    if(!reflected){ out.innerHTML=`P is at (${reflectPt.x}, ${reflectPt.y}). Choose an axis to reflect across.`; return; }
    const rule = reflectAxis==="x" ? "the x-coordinate stays the same and the y-coordinate flips sign" : "the y-coordinate stays the same and the x-coordinate flips sign";
    out.innerHTML=`P (${reflectPt.x}, ${reflectPt.y}) reflected across the ${reflectAxis==="x"?"x":"y"}-axis is <b>P' (${reflected.x}, ${reflected.y})</b>.<br>
      <span style="color:${MUT}">Reflecting across the ${reflectAxis==="x"?"x":"y"}-axis means ${rule}. Both points sit the same distance from the axis, on opposite sides.</span>`;
  }

  function polyValid(next){
    if(!poly.length)return true;
    const last=poly[poly.length-1];
    return next.x===last.x || next.y===last.y;
  }
  function polyMetrics(){
    let perim=0;
    for(let i=0;i<poly.length;i++){
      const a=poly[i], b=poly[(i+1)%poly.length];
      perim+=Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
    }
    /* shoelace, valid for any simple polygon including rectilinear ones */
    let area2=0;
    for(let i=0;i<poly.length;i++){
      const a=poly[i], b=poly[(i+1)%poly.length];
      area2+=a.x*b.y-b.x*a.y;
    }
    return {perim, area:Math.abs(area2)/2};
  }
  function drawPolygon(){
    let s=gridSVG();
    poly.forEach((v,i)=>{ s+=dot(v.x,v.y,T,LETTERS[i]); });
    for(let i=0;i<poly.length-1;i++){
      s+=`<line x1="${px(poly[i].x)}" y1="${py(poly[i].y)}" x2="${px(poly[i+1].x)}" y2="${py(poly[i+1].y)}" stroke="${P}" stroke-width="2.5"/>`;
    }
    if(polyClosed && poly.length>=3){
      s+=`<line x1="${px(poly[poly.length-1].x)}" y1="${py(poly[poly.length-1].y)}" x2="${px(poly[0].x)}" y2="${py(poly[0].y)}" stroke="${P}" stroke-width="2.5"/>`;
      s+=`<polygon points="${poly.map(v=>px(v.x)+","+py(v.y)).join(" ")}" fill="${T}" opacity=".15"/>`;
    }
    svg.innerHTML=s;
    svg.setAttribute("aria-label", poly.length
      ? `A ${polyClosed?"closed":"partly drawn"} shape with vertices at `+poly.map((v,i)=>`${LETTERS[i]} (${v.x}, ${v.y})`).join(", ")+"."
      : "An empty coordinate plane, ready for polygon vertices to be placed in order.");
    if(!poly.length){ out.innerHTML=`<span style="color:${MUT}">Click vertices in order. Each new side must run straight across or straight up-down from the last point.</span>`; return; }
    if(!polyClosed){
      out.innerHTML=`${poly.length} vertex${poly.length===1?"":"es"} placed: `+poly.map((v,i)=>`${LETTERS[i]} (${v.x}, ${v.y})`).join(", ")+
        `.<br><span style="color:${MUT}">Add more vertices, or press "Close the shape" once you have at least 3 and the last one aligns with the first.</span>`;
      return;
    }
    const m=polyMetrics();
    out.innerHTML=`Vertices: `+poly.map((v,i)=>`${LETTERS[i]} (${v.x}, ${v.y})`).join(", ")+`.<br>
      Each side length is found by subtracting coordinates — no measuring needed.<br>
      <b>Perimeter: ${m.perim} units</b> &nbsp;·&nbsp; <b>Area: ${m.area} square units</b>`;
  }

  function draw(){
    if($m.value==="plot")drawPlot();
    else if($m.value==="reflect")drawReflect();
    else drawPolygon();
  }

  svg.addEventListener("click",e=>{
    const g=e.target.closest("circle.cpgrid"); if(!g)return;
    const x=+g.dataset.x, y=+g.dataset.y;
    if($m.value==="plot"){
      const i=points.findIndex(p=>p.x===x&&p.y===y);
      if(i>-1) points.splice(i,1);
      else if(points.length<8) points.push({x,y,label:LETTERS[points.length]});
    } else if($m.value==="reflect"){
      reflectPt={x,y}; reflected=null; reflectAxis=null;
    } else {
      if(polyClosed)return;
      const exists=poly.some(v=>v.x===x&&v.y===y);
      if(exists)return;
      if(!polyValid({x,y})){
        $("#cpmsg").textContent="that side isn't straight — pick a point sharing an x or a y with the last vertex";
        return;
      }
      $("#cpmsg").textContent="";
      poly.push({x,y});
    }
    draw();
  });
  $("#cprefl").addEventListener("click",e=>{
    const b=e.target.closest("button[data-op]"); if(!b||!reflectPt)return;
    reflectAxis=b.dataset.op;
    reflected = reflectAxis==="x" ? {x:reflectPt.x,y:-reflectPt.y} : {x:-reflectPt.x,y:reflectPt.y};
    draw();
  });
  $("#cppoly").addEventListener("click",e=>{
    const b=e.target.closest("button[data-op]"); if(!b)return;
    if(poly.length<3){$("#cpmsg").textContent="need at least 3 vertices to close a shape";return;}
    const first=poly[0], last=poly[poly.length-1];
    if(first.x!==last.x && first.y!==last.y){
      $("#cpmsg").textContent="the last vertex doesn't align with the first — add one more point first";
      return;
    }
    polyClosed=true; $("#cpmsg").textContent=""; draw();
  });
  $("#cpclear").addEventListener("click",()=>{
    points=[]; reflectPt=null; reflected=null; reflectAxis=null;
    poly=[]; polyClosed=false; $("#cpmsg").textContent=""; draw();
  });
  $m.addEventListener("change",()=>{vis();draw();});
  vis(); draw();
}
return {coordPlane};
})());
window.__EXTRA_NAMES__=Object.assign(window.__EXTRA_NAMES__||{},{coordPlane:"Coordinate plane"});
