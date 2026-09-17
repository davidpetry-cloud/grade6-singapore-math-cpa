/* curriculum-core.js — shared renderer + interactive manipulatives.
   Each unit file supplies window.UNIT and window.LESSONS, then loads this.
   To add a unit-specific tool, define window.__EXTRA_TOOLS__ and
   window.__EXTRA_NAMES__ BEFORE this script, then list its id in UNIT.tools. */

/* ===== manipulatives ===== */
(function(){
const PLACES=[["millions","1,000,000"],["hundred<br>thousands","100,000"],["ten<br>thousands","10,000"],["thousands","1,000"],["hundreds","100"],["tens","10"],["ones","1"]];
const PV=[1000000,100000,10000,1000,100,10,1];
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const words=n=>{
  if(n===0)return"zero";
  const o=["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const t=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  const u3=x=>{let s=[];if(x>=100){s.push(o[Math.floor(x/100)]+" hundred");x%=100;}
    if(x>=20){s.push(t[Math.floor(x/10)]+(x%10?"-"+o[x%10]:""));}else if(x>0){s.push(o[x]);}return s.join(" ");};
  const g=["","thousand","million","billion"];let p=[],i=0;
  while(n>0){const c=n%1000;if(c)p.unshift(u3(c)+(g[i]?" "+g[i]:""));n=Math.floor(n/1000);i++;}
  return p.join(", ");
};
const cm=n=>n.toLocaleString("en-US");

/* ---------- 1. PLACE VALUE BUILDER ---------- */
function placeValue(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Place-value builder<span class="mins">tool</span></h3>
    <p class="sense">touch · trading</p>
    <p class="how">Add discs to any column. When a column reaches ten, the discs trade automatically for one disc in the column to its left — the same move students make by hand. Nothing is ever "added as a zero".</p>
    <div class="ctl">
      <button class="btn go" data-a="ex1">Build 3,450,000</button>
      <button class="btn" data-a="ex2">Build 7,070,700</button>
      <button class="btn amb" data-a="x10">× 10 (shift left)</button>
      <button class="btn amb" data-a="d10">÷ 10 (shift right)</button>
      <button class="btn" data-a="clear">Clear</button>
    </div>
    <div class="stage-area"><div class="pv"></div></div>
    <div class="out"></div>
    <p class="note" id="pvmsg"></p>`;
  host.appendChild(box);
  const pv=box.querySelector(".pv"),out=box.querySelector(".out"),msg=box.querySelector("#pvmsg");
  let c=PV.map(()=>0);

  PLACES.forEach((p,i)=>{
    const col=el("div","pvcol");
    col.innerHTML=`<div class="lab">${p[0]}<br>${p[1]}</div><div class="bin"></div>
      <div class="cnt">0</div><div class="btns">
      <button class="btn sm" data-i="${i}" data-d="1" aria-label="Add one ${p[0].replace(/<br>/g," ")} disc">+</button>
      <button class="btn sm" data-i="${i}" data-d="-1" aria-label="Remove one ${p[0].replace(/<br>/g," ")} disc">−</button></div>`;
    pv.appendChild(col);
  });

  function draw(popIdx){
    [...pv.children].forEach((col,i)=>{
      const bin=col.querySelector(".bin");bin.innerHTML="";
      const n=Math.min(c[i],14);
      for(let k=0;k<n;k++){const d=el("div","disc"+(popIdx===i&&k===n-1&&!rm()?" pop":""));bin.appendChild(d);}
      if(c[i]>14)bin.appendChild(el("div","cnt","+"+(c[i]-14)));
      col.querySelector(".cnt").textContent=c[i];
      col.classList.toggle("hot",c[i]>=10);
    });
    const total=c.reduce((s,v,i)=>s+v*PV[i],0);
    const parts=c.map((v,i)=>v&&PV[i]?v*PV[i]:0).filter(Boolean);
    out.innerHTML=`Standard form &nbsp;<b>${cm(total)}</b><br>
      Expanded form &nbsp;${parts.length?parts.map(cm).join(" + "):"0"}<br>
      In words &nbsp;${words(total)}`;
  }
  function trade(){
    let did=false;
    for(let i=PV.length-1;i>0;i--){
      while(c[i]>=10){c[i]-=10;c[i-1]++;did=true;}
    }
    if(did)msg.textContent="Ten discs traded for one disc in the next column left. The count changed; the number did not.";
    return did;
  }
  pv.addEventListener("click",e=>{
    const b=e.target.closest("button[data-i]");if(!b)return;
    const i=+b.dataset.i,d=+b.dataset.d;
    c[i]=Math.max(0,c[i]+d);msg.textContent="";draw(d>0?i:null);
    if(c[i]>=10)setTimeout(()=>{if(trade())draw();},rm()?0:420);
  });
  box.querySelector(".ctl").addEventListener("click",e=>{
    const b=e.target.closest("button[data-a]");if(!b)return;
    const a=b.dataset.a;msg.textContent="";
    if(a==="clear")c=PV.map(()=>0);
    if(a==="ex1")c=[3,4,5,0,0,0,0];
    if(a==="ex2")c=[7,0,7,0,7,0,0];
    if(a==="x10"){
      if(c[0]>0){msg.textContent="No column left of millions on this chart. Clear some discs first.";}
      else{c=[...c.slice(1),0];msg.textContent="Every disc moved up one size. The ones column emptied, so a zero holds the place.";}
    }
    if(a==="d10"){
      const r=c[6];c=[0,...c.slice(0,6)];
      msg.textContent=r?`Every disc moved down one size. ${r} one-disc${r>1?"s":""} had nowhere smaller to go — that is your remainder of ${r}.`
        :"Every disc moved down one size. Nothing was left over.";
    }
    draw();
  });
  draw();
}

/* ---------- 2. ROUNDING NUMBER LINE ---------- */
function rounding(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Rounding number line<span class="mins">tool</span></h3>
    <p class="sense">sight · movement</p>
    <p class="how">The midpoint makes the whole decision. Set a number and a place, watch where it lands, then round.</p>
    <div class="ctl">
      <label for="rn">number</label><input id="rn" type="number" value="4908000" step="1">
      <label for="rp">round to</label>
      <select id="rp">
        <option value="1000">nearest thousand</option>
        <option value="10000">nearest ten thousand</option>
        <option value="100000" selected>nearest hundred thousand</option>
        <option value="1000000">nearest million</option>
        <option value="10000000">nearest ten million</option>
      </select>
      <button class="btn go" id="rgo">Round it</button>
      <button class="btn" id="rres">Reset marker</button>
    </div>
    <div class="stage-area"><svg class="nl" viewBox="0 0 700 120" role="img"></svg></div>
    <div class="out" id="rout"></div>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"),out=box.querySelector("#rout");
  const $n=box.querySelector("#rn"),$p=box.querySelector("#rp");

  function render(rounded){
    const n=Math.max(0,Math.floor(+$n.value||0)),p=+$p.value;
    const lo=Math.floor(n/p)*p,hi=lo+p,mid=lo+p/2;
    const X=x=>60+((x-lo)/p)*580;
    const target=n>=mid?hi:lo;
    const mx=rounded?X(target):X(n);
    svg.setAttribute("aria-label",`Number line from ${cm(lo)} to ${cm(hi)}, midpoint ${cm(mid)}. The number ${cm(n)} is marked ${n>=mid?"right":"left"} of the midpoint.`);
    svg.innerHTML=`
      <line x1="60" y1="60" x2="640" y2="60" stroke="#33557A" stroke-width="2"/>
      <line x1="60" y1="48" x2="60" y2="72" stroke="#33557A" stroke-width="2"/>
      <line x1="640" y1="48" x2="640" y2="72" stroke="#33557A" stroke-width="2"/>
      <line x1="350" y1="42" x2="350" y2="78" stroke="#E4A03C" stroke-width="2" stroke-dasharray="5 4"/>
      <text x="60" y="92" font-family="Inconsolata" font-size="13" fill="#5B7189" text-anchor="middle">${cm(lo)}</text>
      <text x="640" y="92" font-family="Inconsolata" font-size="13" fill="#5B7189" text-anchor="middle">${cm(hi)}</text>
      <text x="350" y="106" font-family="Inconsolata" font-size="12" fill="#B87C1C" text-anchor="middle">midpoint ${cm(mid)}</text>
      <g class="mk" style="transform:translateX(${mx-350}px)">
        <polygon points="350,50 344,34 356,34" fill="#1F8A7D"/>
        <rect x="290" y="10" width="120" height="22" rx="4" fill="#1F8A7D"/>
        <text x="350" y="26" font-family="Inconsolata" font-size="13" fill="#fff" text-anchor="middle">${cm(rounded?target:n)}</text>
      </g>`;
    out.innerHTML=rounded
      ? `${cm(n)} is ${n>=mid?"at or right of":"left of"} the midpoint, so it rounds to <b>${cm(target)}</b>.`
      : `${cm(n)} sits between ${cm(lo)} and ${cm(hi)}. Midpoint is ${cm(mid)}. Which end is it closer to?`;
  }
  box.querySelector("#rgo").addEventListener("click",()=>render(true));
  box.querySelector("#rres").addEventListener("click",()=>render(false));
  [$n,$p].forEach(x=>x.addEventListener("input",()=>render(false)));
  render(false);
}

/* ---------- 3. SHIFT MACHINE ---------- */
function shift(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Shift machine<span class="mins">tool</span></h3>
    <p class="sense">sight · motion</p>
    <p class="how">Watch the digits move. Multiplying shifts left, dividing shifts right, and the exponent counts the columns. Any digit pushed off the right edge is the remainder.</p>
    <div class="ctl">
      <label for="sn">number</label><input id="sn" type="number" value="34" step="1">
      <label for="so">operation</label>
      <select id="so"><option value="x">× multiply</option><option value="d">÷ divide</option></select>
      <label for="se">by 10 to the power</label>
      <select id="se"><option>1</option><option>2</option><option>3</option><option>4</option></select>
      <button class="btn go" id="sgo">Shift</button>
      <button class="btn" id="sr">Reset</button>
    </div>
    <div class="stage-area"><div class="sm-chart"></div></div>
    <div class="out" id="sout"></div>`;
  host.appendChild(box);
  const chart=box.querySelector(".sm-chart"),out=box.querySelector("#sout");
  const $n=box.querySelector("#sn"),$o=box.querySelector("#so"),$e=box.querySelector("#se");
  const COLS=[100000000,10000000,1000000,100000,10000,1000,100,10,1];
  const NAMES=["100M","10M","M","100Th","10Th","Th","H","T","O"];

  function paint(val,shifted,dir){
    const s=String(val).padStart(COLS.length," ");
    chart.innerHTML="";
    COLS.forEach((_,i)=>{
      const ch=s[s.length-COLS.length+i]||" ";
      const col=el("div","smcol"+(shifted&&ch.trim()?" moved":""));
      col.innerHTML=`<div class="lab">${NAMES[i]}</div><div class="cell">${ch.trim()||"·"}</div>`;
      chart.appendChild(col);
    });
  }
  function go(){
    const n=Math.max(0,Math.floor(+$n.value||0)),k=+$e.value,p=Math.pow(10,k);
    if($o.value==="x"){
      const r=n*p;
      paint(n,false);
      setTimeout(()=>{paint(r,true);
        out.innerHTML=`${cm(n)} × 10<sup>${k}</sup> = <b>${cm(r)}</b> — every digit shifted <b>${k}</b> column${k>1?"s":""} left. The ${k} zero${k>1?"s":""} on the right hold the emptied place${k>1?"s":""}.`;
      },rm()?0:260);
    }else{
      const q=Math.floor(n/p),rem=n%p;
      paint(n,false);
      setTimeout(()=>{paint(q,true);
        out.innerHTML=`${cm(n)} ÷ 10<sup>${k}</sup> = <b>${cm(q)}</b>${rem?` remainder <b>${cm(rem)}</b>`:""} — every digit shifted <b>${k}</b> column${k>1?"s":""} right.${rem?" The digits pushed off the right edge are the remainder — in Unit 2 they get a decimal place to land in.":""}`;
      },rm()?0:260);
    }
  }
  box.querySelector("#sgo").addEventListener("click",go);
  box.querySelector("#sr").addEventListener("click",()=>{paint(Math.max(0,Math.floor(+$n.value||0)),false);out.textContent="";});
  paint(34,false);
}

/* ---------- 4. EXPRESSION STEPPER ---------- */
function stepper(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Expression stepper<span class="mins">tool</span></h3>
    <p class="sense">symbol · one step at a time</p>
    <p class="how">One operation per line, exactly as students are asked to write it. The highlighted operation is the one about to happen, and the label says why it goes next.</p>
    <div class="ctl">
      <label for="ex">expression</label>
      <input id="ex" type="text" value="4 + 3 * 2">
      <button class="btn go" id="egoall">Solve step by step</button>
      <button class="btn amb" id="egoone">Next step</button>
    </div>
    <div class="ctl picker">
      <button class="btn sm" data-e="4 + 3 * 2">4 + 3 × 2</button>
      <button class="btn sm" data-e="(4 + 3) * 2">(4 + 3) × 2</button>
      <button class="btn sm" data-e="48 / (2 + 4) * 2">48 ÷ (2 + 4) × 2</button>
      <button class="btn sm" data-e="36 / 6 * 3">36 ÷ 6 × 3</button>
      <button class="btn sm" data-e="5 * 2 ^ 2">5 × 2²</button>
      <button class="btn sm" data-e="100 - (18 + 7) * 2">100 − (18 + 7) × 2</button>
      <button class="btn sm" data-e="2 * 5 ^ 2 - 30 / 6">2 × 5² − 30 ÷ 6</button>
    </div>
    <div class="stage-area"><div class="steps"></div></div>
    <p class="note">Type your own using + − * / ^ and brackets. Multiplication and division are equal partners — they resolve left to right, not multiplication first.</p>`;
  host.appendChild(box);
  const $e=box.querySelector("#ex"),view=box.querySelector(".steps");
  let toks=[],log=[],done=false;

  const pretty=t=>t.map(x=>x.t==="n"?cm(x.v):(x.v==="*"?"×":x.v==="/"?"÷":x.v==="-"?"−":x.v)).join(" ");
  function tokenize(s){
    const out=[];const re=/\d+(?:\.\d+)?|[+\-*/^()]/g;let m;
    while((m=re.exec(s.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/,/g,"")))){
      out.push(/\d/.test(m[0])?{t:"n",v:+m[0]}:{t:m[0]==="("||m[0]===")"?m[0]:"o",v:m[0]});
    }
    return out;
  }
  function reset(){
    toks=tokenize($e.value);log=[{h:-1,s:pretty(toks),l:""}];done=toks.length<3;render();
  }
  function step(){
    if(done)return false;
    let i=-1;
    for(let k=0;k<toks.length;k++)if(toks[k].t==="(")i=k;
    let j=i>=0?toks.findIndex((t,k)=>k>i&&t.t===")"):-1;
    const a=i>=0?i+1:0,b=i>=0?j-1:toks.length-1;
    const find=(set,fromRight)=>{
      const r=[];for(let k=a;k<=b;k++)if(toks[k].t==="o"&&set.includes(toks[k].v))r.push(k);
      return r.length?(fromRight?r[r.length-1]:r[0]):-1;
    };
    let k=find(["^"],true),why="exponent — a compressed multiplication, so it resolves first";
    if(k<0){k=find(["*","/"],false);why="× and ÷ are equal partners — leftmost first";}
    if(k<0){k=find(["+","-"],false);why="+ and − are equal partners — leftmost first";}
    if(k<0){
      if(i>=0){toks.splice(j,1);toks.splice(i,1);log.push({h:-1,s:pretty(toks),l:"brackets done — remove them"});render();return true;}
      done=true;render();return false;
    }
    const L=toks[k-1].v,R=toks[k+1].v,op=toks[k].v;
    const v=op==="+"?L+R:op==="-"?L-R:op==="*"?L*R:op==="/"?L/R:Math.pow(L,R);
    const hl=log[log.length-1];
    log[log.length-1]={...hl,h:k,l:(i>=0&&op!=="^"?"inside the brackets first — ":"")+why};
    toks.splice(k-1,3,{t:"n",v});
    log.push({h:-1,s:pretty(toks),l:""});
    if(toks.length===1)done=true;
    render();return true;
  }
  function render(){
    view.innerHTML=log.map((L,idx)=>{
      let s=L.s;
      if(L.h>=0){
        const parts=s.split(" ");
        if(parts[L.h-1]!==undefined)parts.splice(L.h-1,3,`<span class="hl">${parts[L.h-1]} ${parts[L.h]} ${parts[L.h+1]}</span>`);
        s=parts.join(" ");
      }
      const last=idx===log.length-1&&done;
      return `<div class="${last?"fin":""}">${last?"= ":idx?"= ":""}${s}${L.l?`<span class="lbl">${L.l}</span>`:""}</div>`;
    }).join("");
  }
  box.querySelector("#egoone").addEventListener("click",()=>{if(done&&log.length>1)reset();step();});
  box.querySelector("#egoall").addEventListener("click",()=>{reset();let g=0;while(step()&&g++<40);});
  $e.addEventListener("input",reset);
  box.querySelector(".picker").addEventListener("click",e=>{
    const b=e.target.closest("button[data-e]");if(!b)return;$e.value=b.dataset.e;reset();
  });
  reset();
}

/* ---------- 5. POWER BLOCKS ---------- */
function power(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Power blocks<span class="mins">tool</span></h3>
    <p class="sense">touch · three-dimensional</p>
    <p class="how">The words are describing the shape. A line, then a square, then a cube — built from the same unit block.</p>
    <div class="ctl">
      <label for="pn">base</label><input id="pn" type="number" value="3" min="1" max="6">
      <button class="btn go" id="pgo">Build</button>
    </div>
    <div class="stage-area"><div class="pow"></div></div>
    <div class="out" id="pout"></div>`;
  host.appendChild(box);
  const pow=box.querySelector(".pow"),out=box.querySelector("#pout"),$n=box.querySelector("#pn");
  function build(){
    const n=Math.min(6,Math.max(1,Math.floor(+$n.value||3)));
    const grid=(cols,rows)=>{
      let h=`<div class="grid" style="grid-template-columns:repeat(${cols},14px)">`;
      for(let i=0;i<cols*rows;i++)h+=`<div class="usq"></div>`;
      return h+"</div>";
    };
    const cube=()=>{
      let h=`<div class="layers" style="height:${n*16+ (n-1)*7}px;width:${n*16+(n-1)*7}px">`;
      for(let L=n-1;L>=0;L--){
        h+=`<div class="layer" style="left:${L*7}px;top:${(n-1-L)*7}px;grid-template-columns:repeat(${n},14px);opacity:${0.55+0.45*(L/(n-1||1))}">`;
        for(let i=0;i<n*n;i++)h+=`<div class="usq"></div>`;
        h+="</div>";
      }
      return h+"</div>";
    };
    pow.innerHTML=`
      <div class="powbox">${grid(n,1)}<div class="val">${n}</div><div class="cap">${n}<sup>1</sup> · a line</div></div>
      <div class="powbox">${grid(n,n)}<div class="val">${n*n}</div><div class="cap">${n}<sup>2</sup> · ${n} squared</div></div>
      <div class="powbox">${cube()}<div class="val">${n**3}</div><div class="cap">${n}<sup>3</sup> · ${n} cubed</div></div>`;
    out.innerHTML=`${n}<sup>3</sup> = ${Array(n).fill(n).join(" × ")} = <b>${n**3}</b>. The exponent counts the factors — it is not a multiplier. ${n}<sup>3</sup> is <b>${n**3}</b>, but ${n} × 3 is only <b>${n*3}</b>.`;
  }
  box.querySelector("#pgo").addEventListener("click",build);
  $n.addEventListener("input",build);
  build();
}

/* ---------- 6. BAR MODEL BUILDER ---------- */
function barModel(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Bar model builder<span class="mins">tool</span></h3>
    <p class="sense">sight · proportion</p>
    <p class="how">Bars are drawn to scale, so the picture tells you whether an answer is sensible before you calculate. Comparison bars always align at the left edge.</p>
    <div class="ctl">
      <label for="bmode">model</label>
      <select id="bmode"><option value="pw">part–whole</option><option value="cmp">comparison</option></select>
      <span id="pwc"><label for="bw">whole</label><input id="bw" type="number" value="840">
      <label for="bp">known part</label><input id="bp" type="number" value="360"></span>
      <span id="cmpc" hidden>
        <label for="ua">units A</label><input id="ua" type="number" value="1" min="1" max="10">
        <label for="ub">units B</label><input id="ub" type="number" value="3" min="1" max="10">
        <label for="giv">given</label><select id="giv"><option value="t">total</option><option value="d">difference</option></select>
        <input id="gv" type="number" value="480"></span>
      <button class="btn go" id="bgo">Draw</button>
    </div>
    <div class="stage-area"><svg class="bm" viewBox="0 0 700 190" role="img"></svg></div>
    <div class="out" id="bout"></div>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"),out=box.querySelector("#bout"),$m=box.querySelector("#bmode");
  const q=s=>box.querySelector(s);
  $m.addEventListener("change",()=>{q("#pwc").hidden=$m.value!=="pw";q("#cmpc").hidden=$m.value!=="cmp";draw();});

  function bar(x,y,w,h,fill,label){
    return `<rect class="bmseg" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" style="fill:${fill}" stroke="#fff" stroke-width="1.5"/>
      <text x="${x+w/2}" y="${y+h/2+5}" font-family="Inconsolata" font-size="14" fill="#fff" text-anchor="middle">${label}</text>`;
  }
  function draw(){
    svg.classList.remove("anim");void svg.offsetWidth;if(!rm())svg.classList.add("anim");
    const X0=70,W=580;
    if($m.value==="pw"){
      const w=Math.max(1,+q("#bw").value||0),p=Math.min(w,Math.max(0,+q("#bp").value||0)),r=w-p;
      const wa=W*(p/w);
      svg.setAttribute("aria-label",`Part-whole bar model. One bar with a whole of ${cm(w)}, split into a known part of ${cm(p)} and an unknown part.`);
      svg.innerHTML=`
        <text x="${X0+W/2}" y="26" font-family="Inconsolata" font-size="13" style="fill:var(--muted)" text-anchor="middle">whole = ${cm(w)}</text>
        <path d="M${X0} 44 L${X0} 36 L${X0+W} 36 L${X0+W} 44" fill="none" style="stroke:var(--muted)" stroke-width="1.5"/>
        ${bar(X0,56,wa,44,"var(--bar-2)",cm(p))}
        ${bar(X0+wa,56,W-wa,44,"var(--bar-4)","?")}
        <text x="${X0+W/2}" y="132" font-family="Inconsolata" font-size="15" style="fill:var(--ink-2)" text-anchor="middle">${cm(w)} − ${cm(p)} = ${cm(r)}</text>`;
      out.innerHTML=`The unknown part is <b>${cm(r)}</b>. Check the picture: is the coral section about the right size compared with the blue one?`;
    }else{
      const a=Math.max(1,+q("#ua").value||1),b=Math.max(1,+q("#ub").value||1);
      const gv=Math.max(0,+q("#gv").value||0),mode=q("#giv").value;
      const denom=mode==="t"?(a+b):Math.abs(b-a);
      if(denom===0){out.textContent="With equal bars there is no difference to divide. Change the unit counts.";return;}
      const u=gv/denom,mx=Math.max(a,b),uw=W/mx;
      svg.setAttribute("aria-label",`Comparison bar model, both bars aligned at the left. Bar A is ${a} units, bar B is ${b} units. One unit is ${cm(u)}.`);
      let s=`<text x="30" y="66" font-family="Libre Franklin" font-size="13" style="fill:var(--muted)">A</text>
             <text x="30" y="124" font-family="Libre Franklin" font-size="13" style="fill:var(--muted)">B</text>`;
      for(let i=0;i<a;i++)s+=bar(X0+i*uw,48,uw-2,36,"var(--bar-2)",u%1?u.toFixed(1):cm(u));
      for(let i=0;i<b;i++)s+=bar(X0+i*uw,106,uw-2,36,"var(--bar-3)",u%1?u.toFixed(1):cm(u));
      const diffX=X0+Math.min(a,b)*uw, diffW=Math.abs(b-a)*uw;
      if(diffW>0)s+=`<path d="M${diffX} 158 L${diffX} 166 L${diffX+diffW} 166 L${diffX+diffW} 158" fill="none" style="stroke:var(--amber-dk)" stroke-width="1.5"/>
        <text x="${diffX+diffW/2}" y="182" font-family="Inconsolata" font-size="13" style="fill:var(--amber-dk)" text-anchor="middle">difference ${cm(Math.abs(b-a)*u)}</text>`;
      svg.innerHTML=s;
      out.innerHTML=`${denom} unit${denom>1?"s":""} = ${cm(gv)}, so <b>1 unit = ${u%1?u.toFixed(2):cm(u)}</b>.<br>
        A = ${a}u = <b>${cm(a*u)}</b> &nbsp; B = ${b}u = <b>${cm(b*u)}</b> &nbsp; total = ${cm((a+b)*u)} &nbsp; difference = ${cm(Math.abs(b-a)*u)}<br>
        <span style="color:var(--muted)">Now re-read the question. Which of those numbers did it actually ask for?</span>`;
    }
  }
  box.querySelector("#bgo").addEventListener("click",draw);
  box.querySelectorAll("input,select").forEach(i=>i.addEventListener("input",draw));
  draw();
}

/* ---------- 7. FACTOR LAB ---------- */
function factors(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Factor lab<span class="mins">tool</span></h3>
    <p class="sense">touch · arrangement</p>
    <p class="how">Every rectangle you can build gives a factor pair. A number that makes only one rectangle is prime — that is the definition, not a rule to memorise.</p>
    <div class="ctl">
      <label for="fn">number</label><input id="fn" type="number" value="12" min="1" max="60">
      <button class="btn go" id="fgo">Build every rectangle</button>
    </div>
    <div class="stage-area"><div class="rects"></div></div>
    <div class="out" id="fout"></div>
    <hr style="border:0;border-top:1px solid var(--line);margin:22px 0">
    <div class="ctl">
      <label for="ga">GCF and LCM of</label><input id="ga" type="number" value="4" min="1" max="100">
      <label for="gb">and</label><input id="gb" type="number" value="6" min="1" max="100">
      <button class="btn amb" id="ggo">Show on the hundred chart</button>
    </div>
    <div class="stage-area"><div class="hundred"></div><div class="flists"></div></div>
    <div class="out" id="gout"></div>`;
  host.appendChild(box);
  const rects=box.querySelector(".rects"),fout=box.querySelector("#fout");
  const hun=box.querySelector(".hundred"),fl=box.querySelector(".flists"),gout=box.querySelector("#gout");
  const facs=n=>{const r=[];for(let i=1;i<=n;i++)if(n%i===0)r.push(i);return r;};

  function buildRects(){
    const n=Math.min(60,Math.max(1,Math.floor(+box.querySelector("#fn").value||12)));
    const pairs=[];for(let i=1;i*i<=n;i++)if(n%i===0)pairs.push([i,n/i]);
    rects.innerHTML=pairs.map(([r,c])=>{
      let g=`<div class="grid" style="grid-template-columns:repeat(${c},13px)">`;
      for(let i=0;i<n;i++)g+=`<div class="sq"></div>`;
      return `<div class="rect">${g}</div><div class="cap">${r} × ${c}</div></div>`;
    }).join("");
    const f=facs(n);
    fout.innerHTML=`${pairs.length} distinct rectangle${pairs.length>1?"s":""}. Factors of ${n}: <b>${f.join(", ")}</b>.<br>
      ${n===1?"1 is neither prime nor composite — it has only one factor.":f.length===2?`<b>${n} is prime</b> — only one rectangle is possible.`:`<b>${n} is composite</b> — more than one rectangle is possible.`}`;
  }
  function buildGcf(){
    const a=Math.min(100,Math.max(1,+box.querySelector("#ga").value||4));
    const b=Math.min(100,Math.max(1,+box.querySelector("#gb").value||6));
    hun.innerHTML="";
    for(let i=1;i<=100;i++){
      const A=i%a===0,B=i%b===0;
      hun.appendChild(el("div",A&&B?"both":A?"a":B?"b":"",String(i)));
    }
    const fa=facs(a),fb=facs(b),sh=fa.filter(x=>fb.includes(x));
    const gcf=Math.max(...sh);
    let lcm=a*b/gcf;
    fl.innerHTML=`
      <div>factors of ${a}<br>${fa.map(x=>sh.includes(x)?`<span class="sh">${x}</span>`:x).join(" ")}</div>
      <div>factors of ${b}<br>${fb.map(x=>sh.includes(x)?`<span class="sh">${x}</span>`:x).join(" ")}</div>`;
    gout.innerHTML=`Shared factors: ${sh.join(", ")} → <b>GCF = ${gcf}</b>.<br>
      First square shaded in both colours → <b>LCM = ${lcm}</b>.<br>
      <span style="color:#5B7189">Size check: the GCF is never larger than ${Math.min(a,b)}, and the LCM is never smaller than ${Math.max(a,b)}.</span>`;
  }
  box.querySelector("#fgo").addEventListener("click",buildRects);
  box.querySelector("#fn").addEventListener("input",buildRects);
  box.querySelector("#ggo").addEventListener("click",buildGcf);
  box.querySelectorAll("#ga,#gb").forEach(i=>i.addEventListener("input",buildGcf));
  buildRects();buildGcf();
}


/* ===== promoted from unit files (Unit 2 decimal grid, Unit 3 rate line) =====
   Kept in one IIFE so their helpers cannot collide with the core's. */
const __PROMOTED__=(function(){
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const lcm=(a,b)=>a*b/gcd(a,b);
const T="#1F8A7D", A="#E4A03C", P="#6B7FB3", INK="#1B3A5C", MUT="#5B7189", LINE="#D3DCE4";
/* mixed-number string from an improper fraction */
function mixed(n,d){
  const g=gcd(n,d)||1,N=n/g,D=d/g;
  if(D===1)return String(N);
  if(N<D)return `${N}/${D}`;
  const w=Math.floor(N/D),r=N%D;
  return r?`${w} ${r}/${D}`:String(w);
}
function simp(n,d){const g=gcd(n,d)||1;return[n/g,d/g];}

const fmt=n=>{
  if(!isFinite(n))return"—";
  const r=Math.round(n*1000)/1000;
  return Number.isInteger(r)?r.toLocaleString("en-US"):String(r);
};
/* label a quantity with its unit, unit before the number for currency */
const q=(n,u)=>u==="$"?"$"+fmt(n):fmt(n)+(u?" "+u:"");


/* ---------- 10. DECIMAL GRID ---------- */
function decimalGrid(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Decimal grid<span class="mins">tool</span></h3>
    <p class="sense">sight · area</p>
    <p class="how">One square is one whole. A column is a tenth, a small cell is a hundredth. Every decimal question below is answered by shading the same square.</p>
    <div class="ctl">
      <label for="dgm">what are we doing</label>
      <select id="dgm">
        <option value="show">showing a decimal</option>
        <option value="cmp">comparing two decimals</option>
        <option value="add">adding or subtracting</option>
        <option value="mul">multiplying</option>
      </select>
      <label for="dga">first</label><input id="dga" type="number" value="0.4" step="0.01" min="0" max="9">
      <span id="dgops" hidden><select id="dgop"><option value="+">+</option><option value="-">−</option></select></span>
      <span id="dgb2" hidden><label for="dgb">second</label><input id="dgb" type="number" value="0.25" step="0.01" min="0" max="9"></span>
      <button class="btn go" id="dggo">Shade it</button>
    </div>
    <div class="stage-area"><svg viewBox="0 0 700 250" role="img" style="width:100%;height:auto"></svg></div>
    <div class="out" id="dgout"></div>
    <p class="note">Line up the decimal points, never the last digits. On the grid the reason is visible: tenths sit above tenths because they are the same size of piece.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"),out=box.querySelector("#dgout"),q=s=>box.querySelector(s);
  const $m=q("#dgm");
  const r2=x=>Math.round(x*100)/100;

  function grid(x,y,S,val,fill,label,second,fill2){
    const c=S/10;let s=`<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
    const cells=Math.round(Math.min(1,val)*100);
    for(let i=0;i<cells;i++){
      const r=Math.floor(i/10),k=i%10;
      s+=`<rect class="bmseg" x="${x+k*c}" y="${y+r*c}" width="${c}" height="${c}" fill="${fill}" opacity=".9"/>`;
    }
    if(second!=null){
      const c2=Math.round(Math.min(1,second)*100);
      for(let i=0;i<c2;i++){
        const r=Math.floor((99-i)/10),k=(99-i)%10;
        s+=`<rect class="bmseg" x="${x+k*c}" y="${y+r*c}" width="${c}" height="${c}" fill="${fill2}" opacity=".9"/>`;
        for(let t=2;t<c;t+=5)s+=`<line x1="${x+k*c+t}" y1="${y+r*c}" x2="${x+k*c+t-c}" y2="${y+r*c+c}" stroke="#fff" stroke-width="1" opacity=".5"/>`;
      }
    }
    for(let i=1;i<10;i++){
      const w=i===5?1.4:.7;
      s+=`<line x1="${x+i*c}" y1="${y}" x2="${x+i*c}" y2="${y+S}" stroke="${INK}" stroke-width="${w}" opacity=".5"/>`;
      s+=`<line x1="${x}" y1="${y+i*c}" x2="${x+S}" y2="${y+i*c}" stroke="${INK}" stroke-width="${w}" opacity=".5"/>`;
    }
    if(label)s+=`<text x="${x+S/2}" y="${y+S+22}" font-family="Inconsolata" font-size="14" fill="${INK}" text-anchor="middle">${label}</text>`;
    return s;
  }
  function vis(){q("#dgb2").hidden=$m.value==="show";q("#dgops").hidden=$m.value!=="add";}

  function draw(){
    const a=Math.max(0,r2(+q("#dga").value||0)),b=Math.max(0,r2(+q("#dgb").value||0));
    svg.classList.remove("anim");void svg.offsetWidth;if(!rm())svg.classList.add("anim");
    const m=$m.value,S=180;

    if(m==="show"){
      const wholes=Math.floor(a),frac=r2(a-wholes);
      let s="",x=40;const n=Math.min(3,wholes)+(frac>0?1:0);
      for(let i=0;i<Math.min(3,wholes);i++){s+=grid(x,30,S*0.62,1,T,"1 whole");x+=S*0.62+22;}
      if(frac>0)s+=grid(x,30,S*0.62,frac,A,frac.toFixed(2).replace(/0+$/,"").replace(/\.$/,""));
      s+=`<text x="40" y="${30+S*0.62+52}" font-family="Inconsolata" font-size="13" fill="${MUT}">tenths = full columns · hundredths = single cells</text>`;
      svg.innerHTML=s;
      const t=Math.round(frac*10)/1,h=Math.round(frac*100);
      svg.setAttribute("aria-label",`${wholes} full unit squares shaded, plus a square with ${h} of its 100 cells shaded, representing ${a}.`);
      out.innerHTML=`<b>${a}</b> = ${wholes?wholes+" whole"+(wholes>1?"s":"")+" and ":""}${h} hundredths.<br>
        As a fraction: <b>${wholes?mixed(Math.round(a*100),100):""}${wholes?"":Math.round(a*100)+"/100 = "+mixed(Math.round(a*100),100)}</b>.<br>
        <span style="color:${MUT}">Say it as "${wholes?wholes+" and ":""}${h} hundredths", not "point ${String(a).split(".")[1]||"0"}". The place name is the whole idea.</span>`;
      return;
    }

    if(m==="mul"){
      const GX=60,GY=26,c=S/10;
      const ac=Math.round(Math.min(1,a)*10),bc=Math.round(Math.min(1,b)*10);
      let s=`<rect x="${GX}" y="${GY}" width="${S}" height="${S}" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
      s+=`<rect x="${GX}" y="${GY}" width="${S}" height="${ac*c}" fill="${T}" opacity=".28"/>`;
      s+=`<rect x="${GX}" y="${GY}" width="${bc*c}" height="${S}" fill="${A}" opacity=".28"/>`;
      s+=`<rect class="bmseg" x="${GX}" y="${GY}" width="${bc*c}" height="${ac*c}" fill="${INK}"/>`;
      for(let i=1;i<10;i++){
        s+=`<line x1="${GX+i*c}" y1="${GY}" x2="${GX+i*c}" y2="${GY+S}" stroke="${INK}" stroke-width=".7" opacity=".5"/>`;
        s+=`<line x1="${GX}" y1="${GY+i*c}" x2="${GX+S}" y2="${GY+i*c}" stroke="${INK}" stroke-width=".7" opacity=".5"/>`;
      }
      const cells=ac*bc,val=r2(ac*bc/100);
      s+=`<text x="${GX+S/2}" y="${GY+S+24}" font-family="Inconsolata" font-size="13" fill="${MUT}" text-anchor="middle">${(bc/10)} across</text>`;
      s+=`<text x="${GX-14}" y="${GY+S/2}" font-family="Inconsolata" font-size="13" fill="${MUT}" text-anchor="middle" transform="rotate(-90 ${GX-14} ${GY+S/2})">${(ac/10)} down</text>`;
      s+=`<text x="${GX+S+40}" y="${GY+70}" font-family="Inconsolata" font-size="14" fill="${INK}">overlap = ${cells} cells</text>`;
      s+=`<text x="${GX+S+40}" y="${GY+94}" font-family="Inconsolata" font-size="14" fill="${INK}">each cell = 0.01</text>`;
      s+=`<text x="${GX+S+40}" y="${GY+128}" font-family="Fraunces" font-size="22" fill="${T}">${val}</text>`;
      svg.innerHTML=s;
      svg.setAttribute("aria-label",`A unit square. ${ac} of ten rows shaded one way, ${bc} of ten columns the other. The ${cells} cells shaded both ways equal ${val}.`);
      out.innerHTML=`${ac/10} × ${bc/10} = <b>${val}</b>.<br>
        One digit after the point times one digit after the point gives ${cells} hundredths — two digits after the point. The count of decimal places is a count of how many times the cell was cut.<br>
        <span style="color:${MUT}">Size check: multiplying by a number below 1 makes it smaller. ${val<Math.max(ac,bc)/10?"It did.":"Check your inputs."} This mode uses tenths only; go past 0.9 and it clips.</span>`;
      return;
    }

    /* cmp and add */
    if(m==="cmp"){
      svg.innerHTML=grid(70,26,S,Math.min(1,a),T,String(a))+grid(330,26,S,Math.min(1,b),A,String(b))+
        `<text x="350" y="${26+S+52}" font-family="Inconsolata" font-size="13" fill="${MUT}" text-anchor="middle">shade both, then look — no digit-counting required</text>`;
      svg.setAttribute("aria-label",`Two unit squares side by side. The left has ${Math.round(a*100)} of 100 cells shaded for ${a}; the right has ${Math.round(b*100)} for ${b}. ${a===b?"They match.":a>b?"The left is larger.":"The right is larger."}`);
      const pad=(x)=>x.toFixed(2);
      out.innerHTML=`${a} ${a===b?"=":a>b?"&gt;":"&lt;"} ${b}.<br>
        Written to the same place: ${pad(a)} and ${pad(b)}. ${a===b?"Identical shading.":`${Math.round(Math.max(a,b)*100)} hundredths beats ${Math.round(Math.min(a,b)*100)} hundredths.`}<br>
        <span style="color:${MUT}">The trap: a longer decimal is not automatically bigger. 0.5 has fewer digits than 0.25 and is twice as large. Count hundredths, not digits.</span>`;
      return;
    }
    const op=q("#dgop").value,res=r2(op==="+"?a+b:a-b);
    svg.innerHTML=grid(70,26,S,Math.min(1,a),T,String(a),op==="+"?Math.min(1,b):null,A)+
      grid(360,26,S,Math.max(0,Math.min(1,res)),T,`= ${res}`)+
      `<text x="300" y="${26+S/2}" font-family="Fraunces" font-size="26" fill="${INK}" text-anchor="middle">${op==="+"?"+":"−"}</text>`;
    svg.setAttribute("aria-label",`Left square shows ${a}${op==="+"?` shaded from the top and ${b} shaded from the bottom`:""}. The right square shows the result, ${res}.`);
    out.innerHTML=`${a.toFixed(2)} ${op==="+"?"+":"−"} ${b.toFixed(2)} = <b>${res}</b>.<br>
      Hundredths were added to hundredths, tenths to tenths. That is all "line up the decimal point" means.<br>
      <span style="color:${MUT}">${res<0?"A negative result — the picture runs out of square. Unit 10 handles that.":op==="+"&&a+b>1?"The result passed one whole, so cells traded up into a full square — the same trade as the place-value discs in Unit 1.":"Both numbers stayed inside one whole."}</span>`;
  }
  $m.addEventListener("change",()=>{vis();draw();});
  box.querySelector("#dggo").addEventListener("click",draw);
  box.querySelectorAll("input,select").forEach(i=>i.addEventListener("input",draw));
  vis();draw();
}


const PRESETS=[
 {k:"3 kg for $12",      a:3,   ua:"kg",    b:12,  ub:"$"},
 {k:"5 pens for $4",     a:5,   ua:"pens",  b:4,   ub:"$"},
 {k:"150 km in 2 h",     a:2,   ua:"h",     b:150, ub:"km"},
 {k:"240 km in 3 h",     a:3,   ua:"h",     b:240, ub:"km"},
 {k:"2 flour : 3 water", a:2,   ua:"cups flour", b:3, ub:"cups water"},
 {k:"4 blue : 6 yellow", a:4,   ua:"blue",  b:6,   ub:"yellow"}
];

function rateLine(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Rate line<span class="mins">tool</span></h3>
    <p class="sense">sight · correspondence</p>
    <p class="how">Two scales that move together. Every tick on the bottom has a partner directly above it, and the pair never stops being the same ratio — that is what makes the jump to a unit rate a step along the line rather than a rule.</p>
    <div class="ctl">
      <label for="rlm">what are we doing</label>
      <select id="rlm">
        <option value="equiv">finding equivalent ratios</option>
        <option value="unit">finding the unit rate</option>
        <option value="cmp">comparing two rates</option>
      </select>
      <label for="rla">for every</label>
      <input id="rla" type="number" value="3" min="1" max="60" aria-label="first quantity">
      <input id="rlua" type="text" value="kg" size="6" aria-label="first unit" style="min-width:70px">
      <label for="rlb">you get</label>
      <input id="rlb" type="number" value="12" min="1" max="999" aria-label="second quantity">
      <input id="rlub" type="text" value="$" size="6" aria-label="second unit" style="min-width:70px">
    </div>
    <div class="ctl" id="rl2" hidden>
      <label for="rlc">compare with: for every</label>
      <input id="rlc" type="number" value="5" min="1" max="60" aria-label="third quantity">
      <label for="rld">you get</label>
      <input id="rld" type="number" value="18" min="1" max="999" aria-label="fourth quantity">
    </div>
    <div class="ctl picker" id="rlp"></div>
    <div class="stage-area"><svg class="bm" viewBox="0 0 700 200" role="img"></svg></div>
    <div id="rltab" style="margin-top:16px;overflow-x:auto"></div>
    <div class="out" id="rlout"></div>
    <p class="note">A ratio compares two amounts. A rate is a ratio with units attached, and a unit rate is the value of one — which is why the line always walks back to 1 before it does anything else.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"),out=box.querySelector("#rlout"),tab=box.querySelector("#rltab");
  const $=s=>box.querySelector(s), $m=$("#rlm");
  $("#rlp").innerHTML=PRESETS.map((p,i)=>`<button class="btn sm" data-i="${i}">${p.k}</button>`).join("");

  const X0=74,W=560;
  function scale(y,label,vals,unit,colour,dash){
    let s=`<line x1="${X0}" y1="${y}" x2="${X0+W}" y2="${y}" stroke="${INK}" stroke-width="2"/>`;
    s+=`<text x="${X0-10}" y="${y+4}" font-family="Inconsolata" font-size="12" fill="${MUT}" text-anchor="end">${label}</text>`;
    vals.forEach((v,i)=>{
      const x=X0+(i/(vals.length-1))*W;
      s+=`<line x1="${x}" y1="${y-7}" x2="${x}" y2="${y+7}" stroke="${INK}" stroke-width="2"/>`;
      s+=`<circle class="bmseg" cx="${x}" cy="${y}" r="4" fill="${colour}"/>`;
      s+=`<text x="${x}" y="${y+(dash?24:-15)}" font-family="Inconsolata" font-size="12" fill="${INK}" text-anchor="middle">${q(v,unit)}</text>`;
    });
    return s;
  }
  function connectors(yTop,yBot,n,hi){
    let s="";
    for(let i=0;i<n;i++){
      const x=X0+(i/(n-1))*W;
      const on=hi===i;
      s+=`<line x1="${x}" y1="${yTop+8}" x2="${x}" y2="${yBot-8}" stroke="${on?A:MUT}" stroke-width="${on?2:1}" stroke-dasharray="${on?"":"3 4"}" opacity="${on?1:.55}"/>`;
    }
    return s;
  }
  function table(rowsA,rowsB,ua,ub,hi){
    const th=`padding:6px 12px;font-family:var(--mono);font-size:.78rem;color:${MUT};font-weight:400;text-align:left;border-bottom:1px solid ${LINE}`;
    const td=i=>`padding:6px 12px;font-family:var(--mono);font-size:.9rem;color:${INK};border-bottom:1px solid ${LINE};${i===hi?`background:#FAEDD6;font-weight:600`:""}`;
    let h=`<table style="border-collapse:collapse;min-width:320px"><caption style="caption-side:top;text-align:left;font-family:var(--mono);font-size:.76rem;color:${MUT};padding-bottom:6px">equivalent ratios</caption><thead><tr>
      <th scope="col" style="${th}">${ua}</th><th scope="col" style="${th}">${ub}</th><th scope="col" style="${th}">${ub} per 1 ${ua}</th></tr></thead><tbody>`;
    rowsA.forEach((v,i)=>{
      h+=`<tr><td style="${td(i)}">${fmt(v)}</td><td style="${td(i)}">${fmt(rowsB[i])}</td><td style="${td(i)}">${v?fmt(rowsB[i]/v):"—"}</td></tr>`;
    });
    return h+"</tbody></table>";
  }

  function draw(){
    const a=Math.max(1,+$("#rla").value||1), b=Math.max(1,+$("#rlb").value||1);
    const ua=$("#rlua").value.trim()||"units", ub=$("#rlub").value.trim()||"units";
    const m=$m.value;
    $("#rl2").hidden=m!=="cmp";
    svg.classList.remove("anim");void svg.offsetWidth;if(!rm())svg.classList.add("anim");

    if(m==="cmp"){
      const c=Math.max(1,+$("#rlc").value||1), d=Math.max(1,+$("#rld").value||1);
      const r1=b/a, r2=d/c;
      const n=4;
      const unitsX=[0,1,2,3];
      svg.setAttribute("viewBox","0 0 700 210");
      let s=scale(46,"offer A",unitsX.map(u=>u*r1),ub,T,false);
      s+=scale(104,ua,unitsX,ua,INK,false);
      s+=scale(170,"offer B",unitsX.map(u=>u*r2),ub,P,true);
      s+=connectors(46,104,n,1)+connectors(104,170,n,1);
      svg.innerHTML=s;
      svg.setAttribute("aria-label",`Three aligned scales. The middle scale counts ${ua} from 0 to 3. Above it, offer A reaches ${q(r1,ub)} at one ${ua}. Below it, offer B reaches ${q(r2,ub)} at one ${ua}. ${r1===r2?"The two offers match.":`Offer ${r1<r2?"A":"B"} gives less per ${ua}.`}`);
      tab.innerHTML=table([1,2,3],[r1,r1*2,r1*3],ua,ub+" (A)",0)+
        `<div style="height:12px"></div>`+table([1,2,3],[r2,r2*2,r2*3],ua,ub+" (B)",0);
      const cheaper=r1===r2?null:(r1<r2?"A":"B");
      out.innerHTML=`Offer A: ${q(b,ub)} for ${q(a,ua)} → <b>${q(r1,ub)} per ${ua}</b>.<br>
        Offer B: ${q(d,ub)} for ${q(c,ua)} → <b>${q(r2,ub)} per ${ua}</b>.<br>
        ${cheaper===null?"The two rates are equal — the same ratio written two ways."
          :`Per single ${ua}, offer <b>${cheaper}</b> is the smaller amount of ${ub}.`}<br>
        <span style="color:${MUT}">You cannot compare ${q(b,ub)} with ${q(d,ub)} directly — they buy different amounts. Walking both back to one ${ua} is what makes them comparable, exactly like a common denominator.</span>`;
      return;
    }

    if(m==="unit"){
      const r=b/a, n=Math.min(6,Math.max(3,a+1));
      const bot=Array.from({length:n},(_,i)=>i);
      svg.setAttribute("viewBox","0 0 700 170");
      let s=scale(56,ub,bot.map(u=>u*r),ub,T,false);
      s+=scale(122,ua,bot,ua,INK,true);
      s+=connectors(56,122,n,1);
      svg.innerHTML=s;
      svg.setAttribute("aria-label",`Two aligned scales. The lower scale counts ${ua} from 0 to ${n-1}. The upper scale shows the matching amount of ${ub}, reaching ${q(r,ub)} directly above one ${ua}. The pair at one is marked.`);
      tab.innerHTML=table(bot.slice(1),bot.slice(1).map(u=>u*r),ua,ub,0);
      out.innerHTML=`${q(b,ub)} for ${q(a,ua)}. Step back along the line to <b>1 ${ua}</b>.<br>
        Unit rate: <b>${q(r,ub)} per ${ua}</b> &nbsp;(${fmt(b)} ÷ ${fmt(a)})<br>
        The other one: <b>${q(a/b,ua)} per ${ub}</b> &nbsp;(${fmt(a)} ÷ ${fmt(b)})<br>
        <span style="color:${MUT}">Both are unit rates for the same situation. Which one you want depends on the question — read it before you divide, because dividing the wrong way round gives a number that looks fine.</span>`;
      return;
    }

    /* equivalent ratios */
    const g=gcd(a,b), n=5;
    const ks=Array.from({length:n},(_,i)=>i);
    svg.setAttribute("viewBox","0 0 700 170");
    let s=scale(56,ub,ks.map(k=>k*b),ub,T,false);
    s+=scale(122,ua,ks.map(k=>k*a),ua,INK,true);
    s+=connectors(56,122,n,2);
    /* multiplier bracket between the first and the highlighted pair */
    const x1=X0, x2=X0+(2/(n-1))*W;
    s+=`<path d="M${X0+(1/(n-1))*W} 150 L${X0+(1/(n-1))*W} 158 L${x2} 158 L${x2} 150" fill="none" stroke="#B87C1C" stroke-width="1.5"/>`;
    svg.innerHTML=s;
    svg.setAttribute("aria-label",`Two aligned scales showing equivalent ratios. The lower scale counts ${ua} in steps of ${fmt(a)}, the upper counts ${ub} in steps of ${fmt(b)}. Each pair down the line — ${fmt(a)} to ${fmt(b)}, ${fmt(2*a)} to ${fmt(2*b)}, ${fmt(3*a)} to ${fmt(3*b)} — is the same ratio.`);
    tab.innerHTML=table(ks.slice(1).map(k=>k*a),ks.slice(1).map(k=>k*b),ua,ub,1);
    out.innerHTML=`${fmt(a)} : ${fmt(b)} = ${fmt(2*a)} : ${fmt(2*b)} = ${fmt(3*a)} : ${fmt(3*b)} = ${fmt(4*a)} : ${fmt(4*b)}.<br>
      Both scales were multiplied by the same number, so the pairing never changed. ${g>1?`In simplest form this ratio is <b>${fmt(a/g)} : ${fmt(b/g)}</b>.`:`This ratio is already in simplest form — ${fmt(a)} and ${fmt(b)} share no factor but 1.`}<br>
      <span style="color:${MUT}">Every row of the table sits on one straight walk down the line. That is what "equivalent" means here — same walk, further along.</span>`;
  }
  $m.addEventListener("change",draw);
  box.querySelectorAll("input,select").forEach(i=>i.addEventListener("input",draw));
  $("#rlp").addEventListener("click",e=>{
    const btn=e.target.closest("button[data-i]");if(!btn)return;
    const p=PRESETS[+btn.dataset.i];
    $("#rla").value=p.a;$("#rlua").value=p.ua;$("#rlb").value=p.b;$("#rlub").value=p.ub;draw();
  });
  draw();
}

return {decimalGrid,rateLine};
})();

const TOOLS=window.__EXTRA_TOOLS__||{};
Object.assign(TOOLS,__PROMOTED__,{placeValue,rounding,shift,stepper,power,barModel,factors});
const NAMES=Object.assign(window.__EXTRA_NAMES__||{},{placeValue:"Place-value builder",rounding:"Rounding line",shift:"Shift machine",stepper:"Expression stepper",power:"Power blocks",barModel:"Bar model builder",factors:"Factor lab",decimalGrid:"Decimal grid",rateLine:"Rate line"});

window.MathTools=window.MathTools||{};
Object.assign(window.MathTools,{
  mount(ids,host){
    if(!host)return;host.innerHTML="";
    /* "all" means the tools THIS unit taught with, not every tool in the
       registry — a review station must not offer a tool from a later unit. */
    if(ids==="all"){
      const map=(window.UNIT&&window.UNIT.tools)||{};
      const seen=[];
      Object.keys(map).forEach(d=>{const v=map[d];if(Array.isArray(v))v.forEach(id=>{if(TOOLS[id]&&seen.indexOf(id)<0)seen.push(id);});});
      ids=seen.length?seen:Object.keys(TOOLS);
    }else ids=ids||[];
    if(!ids.length)return;
    if(ids.length>3){
      const pick=el("div","tool");
      pick.innerHTML=`<h3>Station toolkit<span class="mins">all tools</span></h3>
        <p class="sense">review · retrieval</p>
        <p class="how">Every tool from the unit, in one place. Set one per station.</p><div class="picker"></div><div class="slot"></div>`;
      host.appendChild(pick);
      const p=pick.querySelector(".picker"),slot=pick.querySelector(".slot");
      ids.forEach((id,i)=>{
        const b=el("button","btn",NAMES[id]);b.setAttribute("aria-pressed",i===0?"true":"false");
        b.addEventListener("click",()=>{
          [...p.children].forEach(c=>c.setAttribute("aria-pressed","false"));
          b.setAttribute("aria-pressed","true");slot.innerHTML="";TOOLS[id](slot);
        });
        p.appendChild(b);
      });
      TOOLS[ids[0]](slot);
      return;
    }
    ids.forEach(id=>TOOLS[id](host));
  }
});
})();

/* ===== lesson renderer ===== */
(function(){
const nav=document.getElementById("daynav"),content=document.getElementById("content"),side=document.getElementById("side");
let cur=0;
const U=window.UNIT||{number:1,minutes:55,tools:{}};

LESSONS.forEach((L,i)=>{
  const b=document.createElement("button");
  b.innerHTML=`<span class="d">Day ${L.day}</span><span>${L.short}</span>`;
  b.addEventListener("click",()=>show(i));
  nav.appendChild(b);
});

function stageBlock(s){
  return `<div class="block ${s.k}">
    <h3>${s.label}<span class="mins">${s.mins} min</span></h3>
    <p class="sense">${s.sense}</p>
    <ul class="moves">${s.moves.map(m=>`<li>${m}</li>`).join("")}</ul>
    <div class="say">${s.say.map(([w,t])=>`<p><span class="who">${w}</span>${w==="Expected"?"":"“"}${t}${w==="Expected"?"":"”"}</p>`).join("")}</div>
    ${s.watch?`<div class="watch"><b>Watch for</b>${s.watch.join(" ")}</div>`:""}
    ${s.readaloud?`<div class="readaloud"><b>Say the picture aloud</b>${s.readaloud.join(" ")}</div>`:""}
  </div>`;
}

function show(i){
  cur=i; const L=LESSONS[i];
  [...nav.children].forEach((el,j)=>el.setAttribute("aria-current",j===i?"true":"false"));

  content.innerHTML=`
  <div class="hd">
    <p class="eyebrow">Unit ${U.number} · Day ${L.day} of ${LESSONS.length} · ${U.minutes} minutes</p>
    <h2>${L.title}</h2>
    <div class="obj"><p><b>Objective.</b> ${L.objective}</p></div>
  </div>

  <div class="block">
    <h3>Warm-up<span class="mins">${L.warmup.mins} min</span></h3>
    <p style="margin:0;font-size:.97rem">${L.warmup.text}</p>
  </div>

  ${L.stages.map(stageBlock).join("")}

  <div id="toolmount"></div>

  <div class="block">
    <h3>Guided practice<span class="mins">${U.guidedMins||8} min</span></h3>
    <p class="sense">whole class · whiteboards</p>
    <ol class="probs">${L.guided.map(([q,a])=>`<li>${q}<span class="ans">→ ${a}</span></li>`).join("")}</ol>
  </div>

  <div class="block w">
    <h3>Independent worksheet<span class="mins">12 min + homework</span></h3>
    <p class="sense">print or project · answers in teacher copy</p>
    ${L.worksheet.map(s=>`<div class="ws-sec"><h4>${s.t}</h4><p class="dir">${s.d}</p>
      <ol class="ws-items ${s.wide?"wide":""}">${s.items.map(x=>`<li>${x}</li>`).join("")}</ol></div>`).join("")}
  </div>

  <div class="block exit">
    <h3>Exit ticket<span class="mins">4 min</span></h3>
    <p class="sense">collect at the door</p>
    <ol>${L.exit.map(x=>`<li>${x}</li>`).join("")}</ol>
    <p class="crit">${L.crit}</p>
  </div>`;

  side.innerHTML=`
  <div class="card"><h4>standards</h4><div class="std">${L.standards.map(s=>`<span>${s}</span>`).join("")}</div></div>
  <div class="card"><h4>vocabulary</h4><ul class="vocab">${L.vocab.map(([t,d])=>`<li><b>${t}</b> — ${d}</li>`).join("")}</ul></div>
  <div class="card"><h4>materials</h4><ul>${L.materials.map(m=>`<li>${m}</li>`).join("")}</ul></div>
  <div class="card diff"><h4>if they're stuck</h4><ul>${L.support.map(m=>`<li>${m}</li>`).join("")}</ul></div>
  <div class="card diff ext"><h4>if they're ready for more</h4><ul>${L.extend.map(m=>`<li>${m}</li>`).join("")}</ul></div>
  <div class="card diff acc"><h4>access &amp; inclusion</h4><ul>${L.access.map(m=>`<li>${m}</li>`).join("")}</ul></div>
  <button class="printbtn" onclick="window.print()">Print this lesson</button>`;

  if(window.MathTools)window.MathTools.mount((U.tools||{})[L.day],document.getElementById("toolmount"));

  document.getElementById("prev").disabled=i===0;
  document.getElementById("next").disabled=i===LESSONS.length-1;
  window.scrollTo({top:0,behavior:(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)?"auto":"smooth"});
}
document.getElementById("prev").addEventListener("click",()=>show(cur-1));
document.getElementById("next").addEventListener("click",()=>show(cur+1));
show(0);
})();
