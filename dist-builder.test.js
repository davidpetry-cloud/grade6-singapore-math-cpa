const {JSDOM}=require("jsdom");const fs=require("fs");
const dom=new JSDOM(`<!doctype html><body></body>`,{runScripts:"outside-only"});
const w=dom.window;w.matchMedia=()=>({matches:false});
Object.defineProperty(w.SVGElement.prototype,"offsetWidth",{get(){return 100}});
w.SVGElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:700,height:380});
w.eval(fs.readFileSync("dist-builder.js","utf8"));
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("  FAIL "+m);}else console.log("  ok   "+m);};
const h=w.document.createElement("div");w.document.body.appendChild(h);
w.__EXTRA_TOOLS__.distBuilder(h);
const q=s=>h.querySelector(s), txt=()=>q("#dbout").textContent.replace(/\s+/g," ");
const aria=()=>h.querySelector("svg").getAttribute("aria-label");
const preset=i=>h.querySelectorAll("#dbp button")[i].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const bin=v=>{q("#dbbin").value=v;q("#dbbin").dispatchEvent(new w.Event("input"));};

console.log("\nsummary statistics");
preset(0);  // even spread, 16 values
ok(/16 values/.test(txt()),"counts the values");
ok(/mean 5/.test(txt()),"mean of the even-spread set is 5");
ok(/median 5/.test(txt()),"median is 5");
ok(/mode 5/.test(txt()),"mode is 5");
ok(/range 6/.test(txt()),"range is 6 (2 to 8)");
ok(/close/.test(txt()),"mean and median close together is reported as such");

console.log("\nthe outlier case — the lesson this tool exists for");
preset(1);  // one outlier: 20
ok(/15 values/.test(txt()),"loads 15 values");
ok(/pulling it/.test(txt()),"flags that something is pulling the mean");
ok(/median barely notices/.test(txt()),"explains median resists the outlier, mean does not");
const m=txt().match(/mean ([\d.]+)/), md=txt().match(/median ([\d.]+)/);
ok(m&&md&&parseFloat(m[1])>parseFloat(md[1]),"mean is pulled above the median by the high outlier");
ok(aria().includes("tail stretching to the right"),"aria-label names the skew direction");

console.log("\nno-mode and all-same cases");
preset(4);  // all the same
ok(/range 0/.test(txt()),"all-identical data has range 0");
ok(/mean 6/.test(txt())&&/median 6/.test(txt()),"mean and median both 6");
ok(/mad|distance from the mean: 0/.test(txt()),"average distance from mean is 0");
q("#dbclear").click();
ok(/Click the line/.test(txt()),"empty state prompts for input");
ok(/empty number line/.test(aria()),"empty state has its own aria-label");

console.log("\nbin width changes the histogram, not the data");
preset(1);
const beforeStats=txt();
bin(1); const a1=aria();
bin(8); const a8=aria();
ok(a1!==a8,"aria-label reflects the bin width change");
ok(/bins of width 8/.test(a8),"aria-label states the current bin width");
ok(txt()===txt(),"stable read");
bin(2);
ok(txt().match(/mean ([\d.]+)/)[1]===beforeStats.match(/mean ([\d.]+)/)[1],"changing bin width does not change the statistics");

console.log("\nadding and removing values");
q("#dbclear").click();
const svg=h.querySelector("svg");
const clickAt=(x,y)=>svg.dispatchEvent(new w.MouseEvent("click",{bubbles:true,clientX:x,clientY:y}));
clickAt(200,150);clickAt(300,150);clickAt(400,150);
ok(/3 values/.test(q("#dbn").textContent),"clicking the line adds values (got "+q("#dbn").textContent+")");
const dot=h.querySelector("circle[data-v]");
dot.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
ok(/2 values/.test(q("#dbn").textContent),"clicking a dot removes it");

console.log("\npresets and labelling");
ok(h.querySelectorAll("#dbp button").length===6,"six preset datasets");
preset(2);
ok(/13 values/.test(txt()),"two-clumps preset loads");
preset(5);
ok(/142/.test(aria())&&/165/.test(aria()),"class-heights preset works on a non-zero-based scale");
let unl=0;h.querySelectorAll(".ctl input").forEach(i=>{if(!i.getAttribute("aria-label")&&!h.querySelector(`label[for=${i.id}]`))unl++;});
ok(unl===0,"every control is labelled");
console.log(fail?`\n${fail} FAILURES`:"\nall passed");
