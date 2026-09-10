const {JSDOM}=require("jsdom");const fs=require("fs");
const dom=new JSDOM(`<!doctype html><body></body>`,{runScripts:"outside-only"});
const w=dom.window;w.matchMedia=()=>({matches:false});
Object.defineProperty(w.SVGElement.prototype,"offsetWidth",{get(){return 100}});
w.eval(fs.readFileSync("balance-scale.js","utf8"));
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};
const h=w.document.createElement("div");w.document.body.appendChild(h);
w.__EXTRA_TOOLS__.balanceScale(h);
const q=s=>h.querySelector(s), txt=()=>q("#bsout").textContent.replace(/\s+/g," ");
const aria=()=>h.querySelector("svg").getAttribute("aria-label");
const press=o=>h.querySelector(`button[data-op="${o}"]`).dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const setup=(c,a,b,rel)=>{q("#bsc").value=c;q("#bsa").value=a;q("#bsb").value=b;if(rel){q("#bsr").value=rel;}q("#bsset").click();};
const K=v=>{q("#bsk").value=v;};

console.log("\nsolving x + 3 = 8");
setup(1,3,8);
ok(/x \+ 3 = 8/.test(txt()),"sets up x + 3 = 8");
K(3);press("sub-both");
ok(/x = 5/.test(txt()),"minus 3 both sides solves to x = 5");
ok(/Nobody moved a cup/.test(txt()),"solved message explains cups were never altered");
ok(aria().includes("level"),"aria-label reports a level beam");

console.log("\nthe one-sided move");
setup(1,3,8);K(3);press("sub-one");
ok(/Broken/.test(txt()),"one-sided subtraction is flagged as broken");
ok(/lower on the right/.test(aria()),"aria-label reports the beam tipping right");
ok(/different question/.test(txt()),"explains why a broken sentence cannot be trusted");
press("undo");
ok(!/Broken/.test(txt()),"undo restores the true sentence");
K(3);press("sub-both");
ok(/x = 5/.test(txt()),"can still solve correctly after undoing the error");

console.log("\ntwo-step: 3x + 6 = 21");
setup(3,6,21);
K(6);press("sub-both");
ok(/3x = 15/.test(txt()),"minus 6 both sides gives 3x = 15");
K(3);press("div-both");
ok(/x = 5/.test(txt()),"divide both by 3 gives x = 5");

console.log("\nguards");
setup(1,3,8);K(9);press("sub-both");
ok(/cannot take 9/.test(txt()),"refuses to subtract more than a side holds");
setup(3,6,21);K(4);press("div-both");
ok(/break something into pieces/.test(txt()),"refuses a division that would split a cup");
setup(2,4,14);K(4);press("sub-both");K(2);press("div-both");
ok(/x = 5/.test(txt()),"2x + 4 = 14 solves to x = 5");

console.log("\ninequality mode");
setup(1,2,9,">");
ok(/x \+ 2 &gt; 9|x \+ 2 > 9/.test(q("#bsout").innerHTML),"sets up an inequality");
K(2);press("sub-both");
ok(/x &gt; 7|x > 7/.test(q("#bsout").innerHTML),"solves to x > 7");
ok(/stretch of the number line/.test(txt()),"explains the solution is a range, not a point");
ok(/lower on the right/.test(aria())||/lower on the left/.test(aria()),"inequality beam is tipped, not level");

console.log("\naccessibility");
setup(2,5,17);
ok(aria().length>120,"aria-label describes both pans and the beam");
ok(aria().includes("2 cups"),"aria-label counts the cups");
let unl=0;h.querySelectorAll(".ctl input,.ctl select").forEach(i=>{if(!i.getAttribute("aria-label")&&!h.querySelector(`label[for=${i.id}]`))unl++;});
ok(unl===0,"every control is labelled");
console.log(fail?`\n${fail} FAILURES`:"\nall passed");
