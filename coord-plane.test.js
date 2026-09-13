const {JSDOM}=require("jsdom");const fs=require("fs");
const dom=new JSDOM(`<!doctype html><body></body>`,{runScripts:"outside-only"});
const w=dom.window;w.matchMedia=()=>({matches:false});
Object.defineProperty(w.SVGElement.prototype,"offsetWidth",{get(){return 100}});
w.eval(fs.readFileSync("coord-plane.js","utf8"));
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};
const h=w.document.createElement("div");w.document.body.appendChild(h);
w.__EXTRA_TOOLS__.coordPlane(h);
const q=s=>h.querySelector(s), txt=()=>q("#cpout").textContent.replace(/\s+/g," ");
const aria=()=>h.querySelector("svg").getAttribute("aria-label");
const mode=m=>{q("#cpm").value=m;q("#cpm").dispatchEvent(new w.Event("change"));};
const click=(x,y)=>{const c=h.querySelector(`circle.cpgrid[data-x="${x}"][data-y="${y}"]`);c.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));};

console.log("\nplotting and quadrants");
mode("plot");
click(3,4);
ok(/A \(3, 4\)/.test(txt()),"plots A at (3,4)");
ok(/Quadrant I/.test(txt()),"identifies Quadrant I");
click(-3,4); ok(/Quadrant II/.test(txt()),"identifies Quadrant II");
click(-3,-4); ok(/Quadrant III/.test(txt()),"identifies Quadrant III");
click(3,-4); ok(/Quadrant IV/.test(txt()),"identifies Quadrant IV");
click(0,5); ok(/on the y-axis/.test(txt()),"a point with x=0 is on the y-axis");
click(5,0); ok(/on the x-axis/.test(txt()),"a point with y=0 is on the x-axis");
click(0,0); ok(/the origin/.test(txt()),"(0,0) is named the origin");
ok(aria().includes("Quadrant I"),"aria-label names quadrants too");
click(3,4); // toggle off
ok(!/A \(3, 4\)/.test(txt()),"clicking a plotted point removes it");

console.log("\nreflecting across an axis");
mode("reflect");
click(4,2);
ok(/P is at \(4, 2\)/.test(txt()),"places point P");
q('#cprefl button[data-op="x"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
ok(/P' \(4, -2\)/.test(txt())||/P&#39; \(4, -2\)/.test(txt()),"reflects across x-axis: (4,2) -> (4,-2)");
ok(/y-coordinate flips sign/.test(txt()),"explains the x-axis reflection rule");
click(4,2);
q('#cprefl button[data-op="y"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
ok(/\(-4, 2\)/.test(txt()),"reflects across y-axis: (4,2) -> (-4,2)");
ok(/x-coordinate flips sign/.test(txt()),"explains the y-axis reflection rule");
click(-5,-5);
q('#cprefl button[data-op="x"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
ok(/\(-5, 5\)/.test(txt()),"reflects a negative point correctly across x-axis");

console.log("\npolygon: valid rectangle");
mode("polygon");
click(0,0);click(4,0);click(4,3);click(0,3);
q('#cppoly button[data-op="close"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
ok(/Perimeter: 14 units/.test(txt()),"4x3 rectangle perimeter is 14");
ok(/Area: 12 square units/.test(txt()),"4x3 rectangle area is 12");
ok(aria().includes("closed"),"aria-label reports the shape as closed");

console.log("\npolygon: guards");
q("#cpclear").click();
click(0,0);click(3,0);click(3,2);
q('#cppoly button[data-op="close"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
ok(/last vertex doesn't align/.test(q("#cpmsg").textContent),"refuses to close when last vertex doesn't align with first");
q("#cpclear").click();
click(0,0);click(3,3);
ok(/side isn't straight/.test(q("#cpmsg").textContent),"refuses a diagonal second vertex");
q("#cpclear").click();
click(0,0);click(2,0);
q('#cppoly button[data-op="close"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
ok(/at least 3 vertices/.test(q("#cpmsg").textContent),"refuses to close with only 2 vertices");

console.log("\npolygon: L-shape (non-rectangular, tests shoelace generally)");
q("#cpclear").click();
/* L-shape: (0,0)-(4,0)-(4,2)-(2,2)-(2,4)-(0,4) back to (0,0) */
[[0,0],[4,0],[4,2],[2,2],[2,4],[0,4]].forEach(([x,y])=>click(x,y));
q('#cppoly button[data-op="close"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
/* area = 4x4 square (16) minus the missing 2x2 corner (4) = 12 */
ok(/Area: 12 square units/.test(txt()),"L-shape area correctly computed via shoelace (got: "+txt().match(/Area: [\d.]+ square units/)+")");
ok(/Perimeter: 16 units/.test(txt()),"L-shape perimeter is 16");

console.log("\naccessibility");
mode("plot");
let unl=0;h.querySelectorAll(".ctl select").forEach(i=>{if(!i.getAttribute("aria-label")&&!h.querySelector(`label[for=${i.id}]`))unl++;});
ok(unl===0,"the mode selector is labelled");
console.log(fail?`\n${fail} FAILURES`:"\nall passed");
