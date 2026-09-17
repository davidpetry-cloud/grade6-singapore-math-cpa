/* distBuilder — Unit 9 (Data & Statistics).
   One dataset, three views that move together: dot plot, histogram, and the
   summary measures. Two things here cannot be done with a printed chart —
   changing the bin width and watching the histogram's story change, and
   dragging one outlier and watching the mean follow while the median sits
   still. Declare before curriculum-core.js. */
window.__EXTRA_TOOLS__=Object.assign(window.__EXTRA_TOOLS__||{},(function(){
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const T="#1F8A7D", A="#E4A03C", P="#6B7FB3", INK="#1B3A5C", MUT="#5B7189", ROSE="#C2536B";
const r2=x=>Math.round(x*100)/100;

const PRESETS=[
 {k:"even spread",   d:[2,3,3,4,4,4,5,5,5,5,6,6,6,7,7,8]},
 {k:"one outlier",   d:[3,3,4,4,4,5,5,5,5,6,6,6,7,7,20]},
 {k:"two clumps",    d:[2,2,3,3,3,4,   8,9,9,10,10,10,11]},
 {k:"skewed right",  d:[1,1,1,2,2,2,2,3,3,3,4,4,5,6,8,11]},
 {k:"all the same",  d:[6,6,6,6,6,6,6,6,6,6]},
 {k:"class heights", d:[142,145,145,148,150,150,150,152,153,155,155,158,160,162,165]}
];

function stats(d){
  if(!d.length)return null;
  const s=[...d].sort((a,b)=>a-b), n=s.length;
  const mean=s.reduce((a,b)=>a+b,0)/n;
  const median = n%2 ? s[(n-1)/2] : (s[n/2-1]+s[n/2])/2;
  const counts=new Map();
  s.forEach(v=>counts.set(v,(counts.get(v)||0)+1));
  let best=0; counts.forEach(c=>{if(c>best)best=c;});
  const modes=best>1 ? [...counts.entries()].filter(([,c])=>c===best).map(([v])=>v) : [];
  const mad = s.reduce((a,b)=>a+Math.abs(b-mean),0)/n;
  return {s,n,mean,median,modes,min:s[0],max:s[n-1],range:s[n-1]-s[0],mad};
}

function distBuilder(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Building a distribution<span class="mins">tool</span></h3>
    <p class="sense">sight · spread and shape</p>
    <p class="how">Click the line to add a value; click a dot to take it away. The dot plot, the histogram and the summary measures all describe the same data — change it once and watch all three move.</p>
    <div class="ctl picker" id="dbp"></div>
    <div class="ctl">
      <label for="dbbin">bin width</label>
      <input id="dbbin" type="range" min="1" max="10" value="2" aria-label="histogram bin width" style="width:150px">
      <span id="dbbv" style="font-family:var(--mono);font-size:.9rem;color:var(--ink-2)">2</span>
      <button class="btn sm" id="dbclear">Clear</button>
      <span id="dbn" style="font-family:var(--mono);font-size:.85rem;color:var(--muted)">0 values</span>
    </div>
    <div class="stage-area"><svg viewBox="0 0 700 380" role="img" style="width:100%;height:auto"></svg></div>
    <div class="out" id="dbout"></div>
    <p class="note">Load "one outlier", then drag the bin width slider. The same fifteen numbers can look like one clump or like two, depending only on how you chose to group them — which is why the bin width is a decision, not a setting.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"), out=box.querySelector("#dbout"), $=s=>box.querySelector(s);
  $("#dbp").innerHTML=PRESETS.map((p,i)=>`<button class="btn sm" data-i="${i}">${p.k}</button>`).join("");

  let data=[], lo=0, hi=20;

  function rescale(){
    if(!data.length){lo=0;hi=20;return;}
    const mn=Math.min(...data), mx=Math.max(...data);
    const pad=Math.max(1,Math.round((mx-mn)*0.15));
    lo=Math.max(0,Math.floor(mn-pad)); hi=Math.ceil(mx+pad);
    if(hi-lo<5)hi=lo+5;
  }
  const X0=56, W=600;
  const px=v=>X0+((v-lo)/(hi-lo))*W;
  const nearestVal=x=>Math.round(lo+((x-X0)/W)*(hi-lo));

  function draw(){
    const st=stats(data), bin=+$("#dbbin").value;
    $("#dbbv").textContent=bin;
    $("#dbn").textContent=`${data.length} value${data.length===1?"":"s"}`;
    rescale();
    let s="";

    /* ---- dot plot ---- */
    const DY=150;
    s+=`<text x="${X0}" y="26" font-family="Atkinson Hyperlegible Mono" font-size="12" fill="${MUT}">dot plot — one dot per value</text>`;
    s+=`<line x1="${X0}" y1="${DY}" x2="${X0+W}" y2="${DY}" stroke="${INK}" stroke-width="1.5"/>`;
    const step=Math.max(1,Math.ceil((hi-lo)/12));
    for(let v=lo;v<=hi;v+=step){
      s+=`<line x1="${px(v)}" y1="${DY-5}" x2="${px(v)}" y2="${DY+5}" stroke="${MUT}" stroke-width="1"/>`;
      s+=`<text x="${px(v)}" y="${DY+20}" font-family="Atkinson Hyperlegible Mono" font-size="11" fill="${MUT}" text-anchor="middle">${v}</text>`;
    }
    const stack=new Map();
    [...data].sort((a,b)=>a-b).forEach(v=>{
      const k=stack.get(v)||0; stack.set(v,k+1);
      s+=`<circle class="dbdot" data-v="${v}" cx="${px(v)}" cy="${DY-10-k*13}" r="5.5" fill="${T}" stroke="#fff" stroke-width="1" style="cursor:pointer"/>`;
    });
    /* mean as a balance point, median as a line */
    if(st){
      s+=`<polygon points="${px(st.mean)},${DY+8} ${px(st.mean)-7},${DY+22} ${px(st.mean)+7},${DY+22}" fill="${A}"/>`;
      s+=`<text x="${px(st.mean)}" y="${DY+36}" font-family="Atkinson Hyperlegible Mono" font-size="11" fill="#B87C1C" text-anchor="middle">mean</text>`;
      s+=`<line x1="${px(st.median)}" y1="${DY-95}" x2="${px(st.median)}" y2="${DY-6}" stroke="${P}" stroke-width="2" stroke-dasharray="4 3"/>`;
      s+=`<text x="${px(st.median)}" y="${DY-100}" font-family="Atkinson Hyperlegible Mono" font-size="11" fill="${P}" text-anchor="middle">median</text>`;
    }

    /* ---- histogram ---- */
    const HY=340, HH=110;
    s+=`<text x="${X0}" y="${HY-HH-16}" font-family="Atkinson Hyperlegible Mono" font-size="12" fill="${MUT}">histogram — values grouped into bins of ${bin}</text>`;
    if(st){
      const start=Math.floor(lo/bin)*bin;
      const bins=[];
      for(let b=start;b<=hi;b+=bin){
        bins.push({from:b,to:b+bin,c:data.filter(v=>v>=b&&v<b+bin).length});
      }
      const maxC=Math.max(1,...bins.map(b=>b.c));
      const bw=W/bins.length;
      bins.forEach((b,i)=>{
        const h=(b.c/maxC)*HH;
        s+=`<rect class="bmseg" x="${X0+i*bw+1}" y="${HY-h}" width="${bw-2}" height="${h}" fill="${P}" opacity=".85"/>`;
        if(b.c)s+=`<text x="${X0+i*bw+bw/2}" y="${HY-h-5}" font-family="Atkinson Hyperlegible Mono" font-size="10" fill="${INK}" text-anchor="middle">${b.c}</text>`;
        if(bins.length<=14)s+=`<text x="${X0+i*bw+bw/2}" y="${HY+15}" font-family="Atkinson Hyperlegible Mono" font-size="9" fill="${MUT}" text-anchor="middle">${b.from}</text>`;
      });
      s+=`<line x1="${X0}" y1="${HY}" x2="${X0+W}" y2="${HY}" stroke="${INK}" stroke-width="1.5"/>`;
    }
    svg.innerHTML=s;

    if(!st){
      svg.setAttribute("aria-label","An empty number line, ready for data values to be added by clicking.");
      out.innerHTML=`<span style="color:${MUT}">Click the line to add values, or load one of the sets above.</span>`;
      return;
    }
    /* Scale the skew test against average distance from the mean, not the
       range: an outlier inflates the range, which would raise the threshold
       and hide the very thing we are trying to detect. */
    const scale = st.mad*0.25;
    const shape = (st.mean-st.median>scale) ? "a tail stretching to the right"
      : (st.median-st.mean>scale) ? "a tail stretching to the left"
      : st.modes.length>1 ? "more than one peak"
      : "roughly balanced";
    svg.setAttribute("aria-label",
      `A dot plot of ${st.n} values ranging from ${st.min} to ${st.max}, with the mean marked at ${r2(st.mean)} and the median at ${r2(st.median)}. Below it, a histogram of the same data grouped into bins of width ${bin}. The distribution is ${shape}.`);

    const gap=Math.abs(st.mean-st.median);
    out.innerHTML=`<b>${st.n} values</b>, from ${st.min} to ${st.max} &nbsp; range <b>${st.range}</b><br>
      mean <b>${r2(st.mean)}</b> &nbsp;·&nbsp; median <b>${r2(st.median)}</b> &nbsp;·&nbsp; ${st.modes.length?`mode <b>${st.modes.join(", ")}</b>`:`<span style="color:${MUT}">no mode — no value repeats</span>`}<br>
      <span style="color:${MUT}">average distance from the mean: ${r2(st.mad)}</span><br>
      <span style="color:${gap>scale?ROSE:T}">${gap>scale
        ? `The mean sits ${r2(gap)} away from the median. Something is pulling it — look for values far out on one side. The median barely notices them; the mean cannot ignore them.`
        : `Mean and median are close, so no single value is dragging the average around.`}</span>`;
  }

  svg.addEventListener("click",e=>{
    const dot=e.target.closest("circle[data-v]");
    if(dot){const v=+dot.dataset.v; const i=data.indexOf(v); if(i>-1)data.splice(i,1); draw(); return;}
    const r=svg.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width)*700;
    const y=((e.clientY-r.top)/r.height)*380;
    if(y>60&&y<200){const v=nearestVal(x); if(v>=lo&&v<=hi&&data.length<60){data.push(v);draw();}}
  });
  $("#dbclear").addEventListener("click",()=>{data=[];draw();});
  $("#dbbin").addEventListener("input",draw);
  $("#dbp").addEventListener("click",e=>{
    const b=e.target.closest("button[data-i]");if(!b)return;
    data=[...PRESETS[+b.dataset.i].d];draw();
  });
  draw();
}
return {distBuilder};
})());
window.__EXTRA_NAMES__=Object.assign(window.__EXTRA_NAMES__||{},{distBuilder:"Building a distribution"});
