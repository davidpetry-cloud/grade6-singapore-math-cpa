/* balanceScale — Unit 5 (Algebra).
   An equation is a balance. The tool exists to make one thing visible: doing
   something to one side only breaks it, and the beam says so before the
   teacher does. Declare before curriculum-core.js. */
window.__EXTRA_TOOLS__=Object.assign(window.__EXTRA_TOOLS__||{},(function(){
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const T="#1F8A7D", A="#E4A03C", P="#6B7FB3", INK="#1B3A5C", MUT="#5B7189", ROSE="#C2536B";

function balanceScale(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Balance<span class="mins">tool</span></h3>
    <p class="sense">sight · equilibrium</p>
    <p class="how">Cups hide the unknown; discs are ones. The beam is level exactly while the sentence is true. Every move you make is offered twice — to both sides, and to one side — so you can watch which one keeps it true.</p>
    <div class="ctl">
      <label for="bsr">relation</label>
      <select id="bsr"><option value="=">equation ( = )</option><option value="&gt;">inequality ( &gt; )</option></select>
      <label for="bsc">cups on the left</label>
      <input id="bsc" type="number" value="1" min="1" max="6" aria-label="number of cups">
      <label for="bsa">plus</label>
      <input id="bsa" type="number" value="3" min="0" max="40" aria-label="units added on the left">
      <label for="bsb">right side</label>
      <input id="bsb" type="number" value="8" min="0" max="99" aria-label="units on the right">
      <button class="btn go" id="bsset">Set up</button>
    </div>
    <div class="ctl" id="bsops">
      <label for="bsk">by</label>
      <input id="bsk" type="number" value="3" min="1" max="40" aria-label="amount to operate by" style="width:74px">
      <button class="btn" data-op="sub-both">&minus; from both sides</button>
      <button class="btn amb" data-op="sub-one">&minus; from the left only</button>
      <button class="btn" data-op="div-both">&divide; both sides</button>
      <button class="btn sm" data-op="undo">Undo</button>
      <button class="btn sm" data-op="reset">Start over</button>
    </div>
    <div class="stage-area"><svg viewBox="0 0 700 300" role="img" style="width:100%;height:auto"></svg></div>
    <div class="out" id="bsout"></div>
    <p class="note">The amber button is not a trap. Press it on purpose, watch the beam drop, then undo. A rule you have seen fail is held differently from a rule you were told.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"), out=box.querySelector("#bsout"), $=s=>box.querySelector(s);

  let st=null, hist=[], msg="", broken=false;

  function setup(){
    const c=Math.max(1,+$("#bsc").value||1), a=Math.max(0,+$("#bsa").value||0), b=Math.max(0,+$("#bsb").value||0);
    st={lc:c,lu:a,rc:0,ru:b,c0:c,a0:a,b0:b,rel:$("#bsr").value};
    hist=[];broken=false;msg="Set up. The beam is level, so the sentence is true — whatever the cups turn out to hold.";
    draw();
  }
  /* the value that makes the ORIGINAL sentence true */
  const trueX=()=>(st.b0-st.a0)/st.c0;
  const side=(cups,units)=>cups*trueX()+units;

  function op(kind){
    if(!st)return;
    const k=Math.max(1,+$("#bsk").value||1);
    if(kind==="reset"){setup();return;}
    if(kind==="undo"){
      if(!hist.length){msg="Nothing to undo yet.";draw();return;}
      st=hist.pop();broken=Math.abs(side(st.lc,st.lu)-side(st.rc,st.ru))>1e-9;
      msg="Undone.";draw();return;
    }
    hist.push(Object.assign({},st));
    if(kind==="sub-both"){
      if(st.lu<k||st.ru<k){hist.pop();msg=`You cannot take ${k} off a side that does not have ${k} loose discs. Take off what is there, or divide instead.`;draw();return;}
      st.lu-=k;st.ru-=k;
      msg=`Took ${k} off both sides. The beam did not move — you removed the same weight twice.`;
    }else if(kind==="sub-one"){
      if(st.lu<k){hist.pop();msg=`The left side does not have ${k} loose discs to remove.`;draw();return;}
      st.lu-=k;
      msg=`Took ${k} off the left only. The beam dropped on the right. The sentence is no longer true — nothing about the cups changed, but the statement did.`;
    }else if(kind==="div-both"){
      if(st.lc%k||st.lu%k||st.rc%k||st.ru%k){hist.pop();msg=`Dividing by ${k} would break something into pieces. Choose a number that goes into every group evenly.`;draw();return;}
      st.lc/=k;st.lu/=k;st.rc/=k;st.ru/=k;
      msg=`Split both sides into ${k} equal groups and kept one group from each. Still balanced.`;
    }
    broken=Math.abs(side(st.lc,st.lu)-side(st.rc,st.ru))>1e-9;
    draw();
  }

  function pan(cx,cy,cups,units,tone){
    let s=`<line x1="${cx}" y1="${cy-64}" x2="${cx-52}" y2="${cy-10}" stroke="${MUT}" stroke-width="1.5"/>
           <line x1="${cx}" y1="${cy-64}" x2="${cx+52}" y2="${cy-10}" stroke="${MUT}" stroke-width="1.5"/>
           <path d="M${cx-58} ${cy-10} L${cx+58} ${cy-10} L${cx+44} ${cy+12} L${cx-44} ${cy+12} Z" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    /* cups sit left, discs right, stacked in rows above the pan */
    let x=cx-46,y=cy-26;
    for(let i=0;i<cups;i++){
      s+=`<path d="M${x} ${y-18} L${x+20} ${y-18} L${x+16} ${y} L${x+4} ${y} Z" fill="${P}" stroke="#4A5C8C" stroke-width="1.5"/>
          <text x="${x+10}" y="${y-4}" font-family="Roboto Mono" font-size="11" fill="#fff" text-anchor="middle">x</text>`;
      x+=24; if(x>cx+34){x=cx-46;y-=24;}
    }
    let dx=cx-46, dy=y-(cups?26:0);
    for(let i=0;i<Math.min(units,60);i++){
      s+=`<circle cx="${dx+7}" cy="${dy-7}" r="6.5" fill="${tone}" stroke="${INK}" stroke-width="1"/>`;
      dx+=16; if(dx>cx+40){dx=cx-46;dy-=16;}
    }
    if(units>60)s+=`<text x="${cx}" y="${dy-22}" font-family="Roboto Mono" font-size="12" fill="${MUT}" text-anchor="middle">+${units-60} more</text>`;
    return s;
  }

  function expr(cups,units){
    if(!cups)return String(units);
    const c=cups===1?"":String(cups);
    return units?`${c}x + ${units}`:`${c}x`;
  }

  function draw(){
    if(!st){setup();return;}
    const L=side(st.lc,st.lu), R=side(st.rc,st.ru);
    const rel=st.rel;
    /* equations: level while true. inequalities: left is heavier by design. */
    let tilt;
    if(rel==="="){ tilt = L===R?0:(L>R?7:-7); }
    else { tilt = -7; }
    const cy=150, half=180, cx=350;
    const dy=Math.tan(tilt*Math.PI/180)*half;
    const noAnim=rm();
    let s=`<g${noAnim?"":' style="transition:transform .5s cubic-bezier(.3,1,.4,1)"'}>`;
    s+=`<line x1="${cx-half}" y1="${cy+dy}" x2="${cx+half}" y2="${cy-dy}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    s+=pan(cx-half,cy+dy+64,st.lc,st.lu,T);
    s+=pan(cx+half,cy-dy+64,st.rc,st.ru,A);
    s+=`</g>`;
    /* stand */
    s+=`<path d="M${cx} ${cy} L${cx-26} ${cy+120} L${cx+26} ${cy+120} Z" fill="${INK}"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="9" fill="${INK}"/>`;
    /* the sentence, above the beam */
    const relShown = rel==="=" ? (L===R?"=":(L>R?"&gt;":"&lt;")) : "&gt;";
    s+=`<text x="${cx}" y="34" font-family="Fraunces" font-size="26" fill="${broken&&rel==="="?ROSE:INK}" text-anchor="middle">${expr(st.lc,st.lu)} ${relShown} ${expr(st.rc,st.ru)}</text>`;
    if(rel==="="&&broken)s+=`<text x="${cx}" y="58" font-family="Roboto Mono" font-size="13" fill="${ROSE}" text-anchor="middle">no longer the sentence you started with</text>`;
    svg.innerHTML=s;

    const solved = rel==="=" && !broken && st.lc===1 && st.lu===0 && st.rc===0;
    svg.setAttribute("aria-label",
      `A balance. The left pan holds ${st.lc} cup${st.lc===1?"":"s"} labelled x and ${st.lu} disc${st.lu===1?"":"s"}. The right pan holds ${st.rc?st.rc+" cups and ":""}${st.ru} disc${st.ru===1?"":"s"}. The beam is ${tilt===0?"level":(tilt>0?"lower on the left":"lower on the right")}. The sentence reads ${expr(st.lc,st.lu)} ${rel==="="?(L===R?"equals":(L>R?"is greater than":"is less than")):"is greater than"} ${expr(st.rc,st.ru)}.`);

    let o=`<b>${expr(st.lc,st.lu)} ${relShown} ${expr(st.rc,st.ru)}</b><br>${msg}<br>`;
    if(rel==="="){
      o+=solved
        ? `<span style="color:${T}">One cup on its own against ${st.ru} disc${st.ru===1?"":"s"}. <b>x = ${st.ru}</b>. Nobody moved a cup or looked inside one — the cups were the same all along, and the moves only cleared away what was around them.</span>`
        : broken
          ? `<span style="color:${ROSE}">Broken. This sentence is not the one you were asked about, so anything you find from here answers a different question. Undo, and do it to both sides.</span>`
          : `<span style="color:${MUT}">Still true. Goal: one cup alone on one side. What is in the way?</span>`;
      if(!broken)o+=`<br><span style="color:${MUT}">Check any time: the cups hold ${trueX()%1?trueX().toFixed(2):trueX()} each, so both sides weigh ${L%1?L.toFixed(2):L}.</span>`;
    }else{
      const sol=st.lc?`x &gt; ${((st.ru-st.lu)/st.lc)}`:"no cups left to solve for";
      o+=`<span style="color:${MUT}">An inequality does not balance — it leans, and it must keep leaning the same way. The same moves are legal, and the lean is preserved by every one of them.</span><br>
          Solution so far: <b>${sol}</b>. Every value above that keeps the left pan heavier, so the answer is a stretch of the number line, not a single point.`;
    }
    out.innerHTML=o;
  }

  $("#bsset").addEventListener("click",setup);
  $("#bsr").addEventListener("change",setup);
  $("#bsops").addEventListener("click",e=>{const b=e.target.closest("button[data-op]");if(b)op(b.dataset.op);});
  setup();
}
return {balanceScale};
})());
window.__EXTRA_NAMES__=Object.assign(window.__EXTRA_NAMES__||{},{balanceScale:"Balance"});
