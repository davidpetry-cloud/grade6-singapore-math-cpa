/* angleChase — Unit 6 (Angles & Geometric Figures).
   Modelled on Unit 1's stepper: reveal one reasoning step at a time, and name
   the rule that licenses each step, not just the number it produces.
   Declare before curriculum-core.js. */
window.__EXTRA_TOOLS__=Object.assign(window.__EXTRA_TOOLS__||{},(function(){
const rm=()=>(!!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const T="#1F8A7D", A="#E4A03C", P="#6B7FB3", INK="#1B3A5C", MUT="#5B7189";

/* Each scenario: an SVG-drawing function(known, unknown) and a chain of
   {rule, work, result} steps that lead from 'known' to 'unknown'. Angles are
   always whole numbers so the arithmetic is checkable at a glance. */
const SCENARIOS={
 line:{
  label:"angles on a straight line",
  rule:"Angles on a straight line sum to 180°.",
  build(k){ const b=180-k; return {vals:[k,b], steps:[
    {rule:"Angles on a straight line sum to 180°.", work:`180 − ${k}`, result:b}
  ]};},
  draw(k,b){
    return `<line x1="60" y1="150" x2="640" y2="150" stroke="${INK}" stroke-width="2"/>
      <line x1="340" y1="150" x2="470" y2="40" stroke="${INK}" stroke-width="2"/>
      <path d="M310 150 A30 30 0 0 1 ${340+30*Math.cos(Math.PI*(1-k/180))} ${150-30*Math.sin(Math.PI*(1-k/180))}" fill="none" stroke="${T}" stroke-width="2"/>
      <text x="290" y="135" font-family="Inconsolata" font-size="16" fill="${T}">${k}°</text>
      <path d="M${340+30*Math.cos(Math.PI*(1-k/180))} ${150-30*Math.sin(Math.PI*(1-k/180))} A30 30 0 0 1 370 150" fill="none" stroke="${b!=null?T:A}" stroke-width="2"/>
      <text x="385" y="135" font-family="Inconsolata" font-size="16" fill="${b!=null?T:A}">${b!=null?b+"°":"?"}</text>`;
  }
 },
 point:{
  label:"angles at a point (two crossing lines)",
  rule:"Angles all the way around a point sum to 360°. Vertically opposite angles are equal.",
  build(k){ const opp=k, adj=180-k, adj2=180-k; return {vals:[k,opp,adj,adj2], steps:[
    {rule:"Vertically opposite angles are equal.", work:`the angle opposite ${k}° is also`, result:opp},
    {rule:"Angles on a straight line sum to 180°.", work:`180 − ${k}`, result:adj},
    {rule:"Vertically opposite angles are equal.", work:`the angle opposite ${adj}° is also`, result:adj2}
  ]};},
  /* two crossing lines through the centre; four sectors k, adj, opp(=k), adj2(=adj) going round */
  draw(k,opp,adj,adj2){
    const rad=a=>Math.PI*a/180, cx=350,cy=150,r1=110,r2=45;
    const P=a=>[cx+r1*Math.cos(rad(a)), cy-r1*Math.sin(rad(a))];
    const L=(a,rr)=>[cx+rr*Math.cos(rad(a)), cy-rr*Math.sin(rad(a))];
    const a0=25,a1=a0+k,a2=a1+(180-k),a3=a2+k; // a3+ (180-k) back to a0+360
    const pts=[a0,a1,a2,a3];
    let s=`<line x1="${P(a0)[0]}" y1="${P(a0)[1]}" x2="${P(a2)[0]}" y2="${P(a2)[1]}" stroke="${INK}" stroke-width="2"/>
      <line x1="${P(a1)[0]}" y1="${P(a1)[1]}" x2="${P(a3)[0]}" y2="${P(a3)[1]}" stroke="${INK}" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/>`;
    const labels=[[k,T,(a0+a1)/2],[adj!=null?adj:null,adj!=null?T:A,(a1+a2)/2],[opp!=null?opp:null,opp!=null?T:A,(a2+a3)/2],[adj2!=null?adj2:null,adj2!=null?T:A,(a3+a0+360)/2%360]];
    labels.forEach(([v,c,ang])=>{
      const [lx,ly]=L(ang,r2);
      s+=`<text x="${lx}" y="${ly}" font-family="Inconsolata" font-size="15" fill="${c}" text-anchor="middle">${v!=null?v+"°":"?"}</text>`;
    });
    return s;
  }
 },
 triangle:{
  label:"angle sum of a triangle",
  rule:"The angles in any triangle sum to 180°.",
  build(a,b){ const c=180-a-b; return {vals:[a,b,c], steps:[
    {rule:"The angles in a triangle sum to 180°.", work:`180 − ${a} − ${b}`, result:c}
  ]};},
  draw(a,b,c){
    return `<polygon points="120,190 560,190 380,40" fill="none" stroke="${INK}" stroke-width="2"/>
      <text x="155" y="175" font-family="Inconsolata" font-size="15" fill="${T}">${a}°</text>
      <text x="500" y="175" font-family="Inconsolata" font-size="15" fill="${T}">${b}°</text>
      <text x="370" y="65" font-family="Inconsolata" font-size="15" fill="${c!=null?T:A}">${c!=null?c+"°":"?"}</text>`;
  }
 },
 quad:{
  label:"angle sum of a quadrilateral",
  rule:"The angles in any quadrilateral sum to 360° — a diagonal splits it into two triangles, 180° + 180°.",
  build(a,b,c){ const d=360-a-b-c; return {vals:[a,b,c,d], steps:[
    {rule:"A diagonal splits the quadrilateral into two triangles (180° + 180° = 360°), so the four angles sum to 360°.", work:`360 − ${a} − ${b} − ${c}`, result:d}
  ]};},
  draw(a,b,c,d){
    return `<polygon points="120,190 520,150 460,40 160,60" fill="none" stroke="${INK}" stroke-width="2"/>
      <line x1="120" y1="190" x2="460" y2="40" stroke="${MUT}" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="145" y="175" font-family="Inconsolata" font-size="14" fill="${T}">${a}°</text>
      <text x="475" y="140" font-family="Inconsolata" font-size="14" fill="${T}">${b}°</text>
      <text x="430" y="55" font-family="Inconsolata" font-size="14" fill="${T}">${c}°</text>
      <text x="175" y="70" font-family="Inconsolata" font-size="14" fill="${d!=null?T:A}">${d!=null?d+"°":"?"}</text>`;
  }
 }
};

function angleChase(host){
  const box=el("div","tool");
  box.innerHTML=`<h3>Angle chase<span class="mins">tool</span></h3>
    <p class="sense">sight · justified reasoning</p>
    <p class="how">Every missing angle here comes with a reason, revealed one at a time. The number is never the point on its own — the rule that licenses it is.</p>
    <div class="ctl">
      <label for="acm">scenario</label>
      <select id="acm">
        <option value="line">angles on a line</option>
        <option value="point">angles at a point</option>
        <option value="triangle">triangle angle sum</option>
        <option value="quad">quadrilateral angle sum</option>
      </select>
      <label for="aca">known angle A</label>
      <input id="aca" type="number" value="65" min="1" max="179" aria-label="first known angle">
      <span id="acb2"><label for="acb">known angle B</label>
        <input id="acb" type="number" value="70" min="1" max="179" aria-label="second known angle"></span>
      <span id="acc2" hidden><label for="acc">known angle C</label>
        <input id="acc" type="number" value="95" min="1" max="179" aria-label="third known angle"></span>
      <button class="btn go" id="acgo">Set up</button>
    </div>
    <div class="stage-area"><svg viewBox="0 0 700 220" role="img" style="width:100%;height:auto"></svg></div>
    <div class="ctl"><button class="btn amb" id="acstep">Reveal next step</button><button class="btn sm" id="acreset">Start over</button></div>
    <div class="steps" id="acsteps"></div>
    <p class="note">Try changing the known angle after a full chase — the rule stays the same, only the arithmetic changes. That is what makes it a rule and not a fact about one picture.</p>`;
  host.appendChild(box);
  const svg=box.querySelector("svg"), stepsEl=box.querySelector("#acsteps"), $=s=>box.querySelector(s), $m=$("#acm");
  let chain=[], shown=0, vals=[], scen=null;

  function vis(){
    $("#acc2").hidden = $m.value!=="quad";
    $("#acb2").style.display = $m.value==="line" ? "none" : "";
  }

  function setup(){
    scen=SCENARIOS[$m.value];
    const a=Math.max(1,Math.min(179,+$("#aca").value||1));
    if($m.value==="line"){ const r=scen.build(a); vals=r.vals; chain=r.steps; }
    else if($m.value==="point"){ const r=scen.build(a); vals=r.vals; chain=r.steps; }
    else{
      const b=Math.max(1,Math.min(179,+$("#acb").value||1));
      if($m.value==="triangle"){
        if(a+b>=180){ stepsEl.innerHTML=`<div class="lbl" style="color:${A}">Those two angles already total ${a+b}°, which leaves nothing for the third. Try two smaller angles.</div>`; svg.innerHTML=""; return; }
        const r=scen.build(a,b); vals=r.vals; chain=r.steps;
      }else{
        const c=Math.max(1,Math.min(179,+$("#acc").value||1));
        if(a+b+c>=360){ stepsEl.innerHTML=`<div class="lbl" style="color:${A}">Those three angles already total ${a+b+c}°, which leaves nothing for the fourth. Try smaller angles.</div>`; svg.innerHTML=""; return; }
        const r=scen.build(a,b,c); vals=r.vals; chain=r.steps;
      }
    }
    shown=0;
    drawKnownOnly();
    renderSteps();
  }

  function ariaFor(shownCount){
    const label=scen.label;
    const known=vals.slice(0, ($m.value==="quad"?3:($m.value==="triangle"?2:1))).map(v=>v+"°").join(", ");
    if(!shownCount)return `A diagram for ${label}. Known angle${known.includes(",")?"s":""}: ${known}. The remaining angle${$m.value==="point"?"s are":" is"} marked with a question mark.`;
    const found=chain.slice(0,shownCount).map(s=>s.result+"°").join(", ");
    return shownCount<chain.length
      ? `A diagram for ${label}. Known angles: ${known}. Found so far: ${found}. One angle still marked with a question mark.`
      : `A diagram for ${label}. Known angles: ${known}. All angles now found: ${found}. Every angle is labelled with its value.`;
  }
  function drawKnownOnly(){
    svg.innerHTML = scen.draw(...vals.slice(0, $m.value==="quad"?3:($m.value==="triangle"?2:1)));
    svg.setAttribute("aria-label", ariaFor(0));
  }

  function renderSteps(){
    let h="";
    for(let i=0;i<shown;i++){
      const s=chain[i];
      h+=`<div><span class="lbl">${s.rule}</span><br>${s.work} = <span class="fin">${s.result}°</span></div>`;
    }
    if(shown<chain.length){
      h+=`<div style="color:${MUT}">${chain.length-shown} step${chain.length-shown===1?"":"s"} left. Press "Reveal next step".</div>`;
    }else{
      h+=`<div style="color:${T}">Chase complete. Every unknown angle now has a rule attached to it, not just a number.</div>`;
    }
    stepsEl.innerHTML=h;
  }

  function step(){
    if(!chain.length||shown>=chain.length)return;
    shown++;
    /* redraw with all angles found so far revealed */
    const shownVals = vals.slice(0, ($m.value==="quad"?3:($m.value==="triangle"?2:1)) + shown);
    svg.innerHTML = scen.draw(...shownVals);
    svg.setAttribute("aria-label", ariaFor(shown));
    renderSteps();
  }

  $m.addEventListener("change",()=>{vis();setup();});
  $("#acgo").addEventListener("click",setup);
  $("#acstep").addEventListener("click",step);
  $("#acreset").addEventListener("click",setup);
  vis();setup();
}
return {angleChase};
})());
window.__EXTRA_NAMES__=Object.assign(window.__EXTRA_NAMES__||{},{angleChase:"Angle chase"});
