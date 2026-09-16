/* theme-toggle.js — shared light/dark toggle for all Grade 6 CPA pages.
   Loaded in <head> right after curriculum.css so the saved theme applies
   before first paint (no flash of the wrong theme). */
(function(){
  var KEY="cpa-theme";
  var root=document.documentElement;
  var saved=null;
  try{ saved=localStorage.getItem(KEY); }catch(e){}
  root.setAttribute("data-theme", saved==="dark" ? "dark" : "light");

  function sync(btn){
    var dark=root.getAttribute("data-theme")==="dark";
    btn.setAttribute("aria-pressed", String(dark));
    btn.textContent = dark ? "☀ Light" : "🌙 Dark";
  }

  document.addEventListener("DOMContentLoaded", function(){
    var btns=document.querySelectorAll("[data-theme-toggle]");
    for(var i=0;i<btns.length;i++){
      var btn=btns[i];
      sync(btn);
      btn.addEventListener("click", function(){
        var next = root.getAttribute("data-theme")==="dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try{ localStorage.setItem(KEY, next); }catch(e){}
        var all=document.querySelectorAll("[data-theme-toggle]");
        for(var j=0;j<all.length;j++) sync(all[j]);
      });
    }
  });
})();
