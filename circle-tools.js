/* circleUnroll — Unit 7 (Circles).
   Two tools in one file. This one derives pi by measurement, not assertion:
   the circumference straightens out against a line marked in diameter-lengths,
   and lands a little past the third mark every time, whatever the circle.
   Declare before curriculum-core.js. */
window.__EXTRA_TOOLS__=Object.assign(window.__EXTRA_TOOLS__||{},(function(){
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const T="#1F8A7D", A="#E4A03C", P="#6B7FB3", INK="#1B3A5C", MUT="#5B7189", ROSE="#C2536B";
const r2=x=>Math.round(x*100)/100;

/* Real classroom measurements are never exactly pi. These are plausible
   hand-measured values for common round objects, with the scatter left in —
   the lesson depends on students seeing the spread, not a clean 3.14. */
const OBJECTS=[
 {k:"jar lid",        d:7.4,  c:23.5},
 {k:"tin can",        d:10.2, c:31.8},
 {k:"dinner plate",   d:26.0, c:82.0},
 {k:"coin",           d:2.4,  c:7.4},
 {k:"bucket",         d:29.5, c:93.0},
 {k:"roll of tape",   d:9.8,  c:30.5}
];

function circleUnroll(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Unrolling a circle<span class="mins">tool</span></h3>
    <p class="sense">sight · measurement</p>
    <p class="how">The circumference is straightened out along a line already marked off in diameter-lengths. It always lands just past the third mark — a bit more than three diameters, never exactly three, and never four.</p>
    <div class="ctl">
      <label for="cud">diameter</label>
      <input id="cud" type="number" value="10" min="1" max="40" step="0.1" aria-label="diameter in centimetres">
      <span aria-hidden="true">cm</span>
      <label for="cuc">measured circumference</label>
      <input id="cuc" type="number" value="31.4" min="1" max="200" step="0.1" aria-label="measured circumference in centimetres">
      <span aria-hidden="true">cm</span>
      <button class="btn go" id="cugo">Unroll it</button>
    </div>
    <div class="ctl picker" id="cup"></div>
    <div class="stage-area"><svg viewBox="0 0 700 260" role="img" style="width:100%;height:auto"></svg></div>
    <div class="out" id="cuout"></div>
    <p class="note">Every real measurement here is slightly off, and that is honest. The ratio is the same for every circle ever measured; the wobble is in the string and the ruler, not in the circle.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"), out=box.querySelector("#cuout"), $=s=>box.querySelector(s);
  $("#cup").innerHTML=OBJECTS.map((o,i)=>`<button class="btn sm" data-i="${i}">${o.k}</button>`).join("");

  function draw(){
    const d=Math.max(0.1,+$("#cud").value||1);
    const c=Math.max(0.1,+$("#cuc").value||1);
    const ratio=c/d;
    const X0=60, W=580;
    /* the line is scaled so 4 diameter-lengths span the full width */
    const per = W/4;
    const cLen = Math.min(W, per*ratio);
    const noAnim=rm();

    let s="";
    /* the circle, drawn to a fixed display size regardless of real diameter */
    const R=52, cx=110, cy=68;
    s+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
    s+=`<line x1="${cx-R}" y1="${cy}" x2="${cx+R}" y2="${cy}" stroke="${A}" stroke-width="2.5"/>`;
    s+=`<text x="${cx}" y="${cy-8}" font-family="Roboto Mono" font-size="12" fill="${A}" text-anchor="middle">d = ${r2(d)}</text>`;
    s+=`<text x="${cx}" y="${cy+R+20}" font-family="Roboto Mono" font-size="12" fill="${MUT}" text-anchor="middle">circumference ${r2(c)}</text>`;

    /* the measuring line, marked in diameter-lengths */
    const LY=190;
    s+=`<line x1="${X0}" y1="${LY}" x2="${X0+W}" y2="${LY}" stroke="${MUT}" stroke-width="1.5"/>`;
    for(let i=0;i<=4;i++){
      const x=X0+i*per;
      s+=`<line x1="${x}" y1="${LY-9}" x2="${x}" y2="${LY+9}" stroke="${INK}" stroke-width="2"/>`;
      s+=`<text x="${x}" y="${LY+26}" font-family="Roboto Mono" font-size="12" fill="${MUT}" text-anchor="middle">${i}d</text>`;
      if(i<4){
        s+=`<line x1="${x+3}" y1="${LY+13}" x2="${x+per-3}" y2="${LY+13}" stroke="${A}" stroke-width="1" opacity=".5"/>`;
      }
    }
    /* the unrolled circumference laid along it */
    s+=`<rect class="bmseg" x="${X0}" y="${LY-24}" width="${cLen}" height="14" rx="3" fill="${T}" opacity=".85"${noAnim?"":' style="transform-origin:left center"'}/>`;
    s+=`<line x1="${X0+cLen}" y1="${LY-30}" x2="${X0+cLen}" y2="${LY+9}" stroke="${ROSE}" stroke-width="2"/>`;
    s+=`<text x="${X0+cLen}" y="${LY-38}" font-family="Roboto Mono" font-size="13" fill="${ROSE}" text-anchor="middle">lands here</text>`;
    /* the leftover past 3d, called out */
    if(ratio>3&&ratio<4){
      const x3=X0+3*per;
      s+=`<path d="M${x3} ${LY+44} L${x3} ${LY+52} L${X0+cLen} ${LY+52} L${X0+cLen} ${LY+44}" fill="none" stroke="${ROSE}" stroke-width="1.5"/>`;
      s+=`<text x="${(x3+X0+cLen)/2}" y="${LY+68}" font-family="Roboto Mono" font-size="12" fill="${ROSE}" text-anchor="middle">a bit more: ${r2(ratio-3)} of a diameter</text>`;
    }
    svg.innerHTML=s;
    svg.setAttribute("aria-label",
      `A circle of diameter ${r2(d)} centimetres beside a horizontal line marked at zero, one, two, three and four diameter-lengths. The circumference of ${r2(c)} centimetres is drawn as a bar laid along that line, reaching ${r2(ratio)} diameter-lengths — past the third mark but short of the fourth.`);

    const off=Math.abs(ratio-Math.PI);
    out.innerHTML=`Circumference ÷ diameter = ${r2(c)} ÷ ${r2(d)} = <b>${r2(ratio)}</b>.<br>
      The bar reached past the <b>3d</b> mark but nowhere near <b>4d</b>${ratio>3&&ratio<4?`, overshooting three diameters by ${r2(ratio-3)} of one`:""}.<br>
      <span style="color:${MUT}">${off<0.02
        ? "That is about as close to the true ratio as hand measurement gets."
        : off<0.08
          ? `Off the true ratio by ${r2(off)} — normal for string and a ruler. The circle is exact; the measuring is not.`
          : `Off by ${r2(off)}, which is more than measuring error usually explains. Worth re-measuring — did the string slip, or was the diameter taken off-centre?`}</span><br>
      <span style="color:${T}">Whatever circle you pick, this number keeps coming out the same. That is why it earned its own name.</span>`;
  }
  $("#cugo").addEventListener("click",draw);
  box.querySelectorAll("input").forEach(i=>i.addEventListener("input",draw));
  $("#cup").addEventListener("click",e=>{
    const b=e.target.closest("button[data-i]");if(!b)return;
    const o=OBJECTS[+b.dataset.i];
    $("#cud").value=o.d;$("#cuc").value=o.c;draw();
  });
  draw();
}

/* ---------- circle area by rearranging wedges ---------- */
function circleWedges(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Rearranging a circle<span class="mins">tool</span></h3>
    <p class="sense">sight · decomposition</p>
    <p class="how">Cut the circle into wedges and fan them out, points alternating up and down. The more wedges you cut, the flatter the top and bottom get — until it is a shape you already know how to measure.</p>
    <div class="ctl">
      <label for="cwr">radius</label>
      <input id="cwr" type="number" value="5" min="1" max="20" step="0.5" aria-label="radius in centimetres">
      <span aria-hidden="true">cm</span>
      <label for="cwn">number of wedges</label>
      <input id="cwn" type="range" min="4" max="40" step="2" value="8" aria-label="number of wedges" style="width:180px">
      <span id="cwnv" style="font-family:var(--mono);font-size:.9rem;color:var(--ink-2)">8</span>
    </div>
    <div class="stage-area"><svg viewBox="0 0 700 300" role="img" style="width:100%;height:auto"></svg></div>
    <div class="out" id="cwout"></div>
    <p class="note">Drag the slider up slowly. Nothing about the circle changes — the same paper is on the table throughout. Only how it is arranged changes, and the rearrangement is what makes it measurable.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"), out=box.querySelector("#cwout"), $=s=>box.querySelector(s);

  function wedgePath(cx,cy,r,a0,a1,flip){
    const rad=a=>Math.PI*a/180;
    const x0=cx+r*Math.cos(rad(a0)), y0=cy-r*Math.sin(rad(a0));
    const x1=cx+r*Math.cos(rad(a1)), y1=cy-r*Math.sin(rad(a1));
    const large=(a1-a0)>180?1:0;
    return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${large} 0 ${x1} ${y1} Z`;
  }

  function draw(){
    const r=Math.max(0.5,+$("#cwr").value||1);
    const n=Math.max(4,+$("#cwn").value||8);
    $("#cwnv").textContent=n;
    const per=360/n;
    const R=64;

    let s="";
    /* left: the intact circle, cut into wedges */
    const cx=120, cy=90;
    for(let i=0;i<n;i++){
      const fill = i%2 ? T : A;
      s+=`<path d="${wedgePath(cx,cy,R,i*per,(i+1)*per)}" fill="${fill}" opacity=".8" stroke="#fff" stroke-width="1"/>`;
    }
    s+=`<text x="${cx}" y="${cy+R+24}" font-family="Roboto Mono" font-size="12" fill="${MUT}" text-anchor="middle">radius ${r2(r)}</text>`;
    s+=`<text x="${cx}" y="${cy+R+42}" font-family="Roboto Mono" font-size="12" fill="${MUT}" text-anchor="middle">${n} wedges</text>`;

    /* right: the same wedges fanned into a near-parallelogram */
    const BX=270, BY=150, halfW=190, wW=(halfW*2)/(n/2);
    for(let i=0;i<n;i++){
      const up = i%2===0;
      const slot=Math.floor(i/2);
      const x = BX + slot*wW + (up?0:wW/2);
      const fill = up ? A : T;
      /* each wedge drawn as a thin triangle of height R, alternating direction */
      const y0 = up ? BY+R : BY-R;
      const apex = up ? BY-R : BY+R;
      s+=`<path class="bmseg" d="M${x} ${y0} L${x+wW} ${y0} L${x+wW/2} ${apex} Z" fill="${fill}" opacity=".8" stroke="#fff" stroke-width="1"/>`;
    }
    /* the bounding shape it is approaching */
    s+=`<rect x="${BX}" y="${BY-R}" width="${halfW*2}" height="${R*2}" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="6 4"/>`;
    s+=`<line x1="${BX-14}" y1="${BY-R}" x2="${BX-14}" y2="${BY+R}" stroke="${P}" stroke-width="2"/>`;
    s+=`<text x="${BX-22}" y="${BY}" font-family="Roboto Mono" font-size="12" fill="${P}" text-anchor="middle" transform="rotate(-90 ${BX-22} ${BY})">height = r</text>`;
    s+=`<line x1="${BX}" y1="${BY+R+22}" x2="${BX+halfW*2}" y2="${BY+R+22}" stroke="${P}" stroke-width="2"/>`;
    s+=`<text x="${BX+halfW}" y="${BY+R+40}" font-family="Roboto Mono" font-size="12" fill="${P}" text-anchor="middle">base = half the circumference = πr</text>`;
    svg.innerHTML=s;

    const area=Math.PI*r*r;
    const flatness = n>=20 ? "almost perfectly flat" : n>=12 ? "noticeably flatter" : "still visibly bumpy";
    svg.setAttribute("aria-label",
      `On the left, a circle of radius ${r2(r)} divided into ${n} equal wedges, alternately shaded. On the right, the same ${n} wedges fanned out in a row with points alternating up and down, forming a shape close to a rectangle. Its height is one radius and its base is half the circumference. With ${n} wedges the top and bottom edges are ${flatness}.`);

    out.innerHTML=`With <b>${n} wedges</b>, the top and bottom edges are ${flatness}.<br>
      The rearranged shape has height <b>r</b> and base <b>half the circumference</b>, which is <b>πr</b>.<br>
      So its area is <b>πr × r = πr²</b> = π × ${r2(r)}² = <b>${r2(area)} cm²</b>.<br>
      <span style="color:${MUT}">${n<12
        ? "Push the slider higher. The bumps along the top are the only thing standing between this and an exact rectangle."
        : n<24
          ? "Nearly there. Each extra cut makes the wedge points narrower and the edges straighter."
          : "At this many wedges the difference from a true rectangle is too small to draw. That is the argument: it never quite becomes a rectangle, but it gets as close as you like."}</span>`;
  }
  box.querySelectorAll("input").forEach(i=>i.addEventListener("input",draw));
  draw();
}

return {circleUnroll,circleWedges};
})());
window.__EXTRA_NAMES__=Object.assign(window.__EXTRA_NAMES__||{},{circleUnroll:"Unrolling a circle",circleWedges:"Rearranging a circle"});
