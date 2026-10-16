/* netFold3D — the 3D fold preview for Unit 8's netFold tool.
   Source file: bundled by esbuild into ../net-fold-3d.js (npm run build:3d).
   Follows docs/3d-tools.md:
   - every square is placed from NetFoldGeometry's matrices; no maths here;
   - labels are flat HTML over the canvas, never text on a 3D surface;
   - the student drives it: a fold slider, buttons, arrow keys, or dragging;
     one animation runs only when a button is pressed, and it jumps instead
     when the device asks for reduced motion;
   - it draws only when something changes. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Object3D, Group, Mesh, PlaneGeometry,
  MeshStandardMaterial, LineSegments, EdgesGeometry, LineBasicMaterial,
  HemisphereLight, DirectionalLight, Vector3, CanvasTexture, DoubleSide,
  RepeatWrapping, SRGBColorSpace
} from "three";

const TEAL = 0x1F8A7D, INK = 0x1B3A5C, CLASH = 0xAA4429;
const reduced = () => !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const views = new Set();
let uid = 0;

function supported() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

/* Clashing squares are hatched as well as coloured, so the cue isn't colour alone */
function hatch() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  g.fillStyle = "#AA4429"; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 6;
  for (let i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 64); g.lineTo(i + 64, 0); g.stroke(); }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace; t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(2, 2);
  return t;
}

function mount(host, cells) {
  for (const v of [...views]) if (!v.host.isConnected) v.destroy();
  const G = window.NetFoldGeometry;
  const tree = G && G.foldTree(cells);
  if (!tree) return null;
  const result = G.closeUp(cells);
  const clashing = new Set(result.clashes.flatMap(c => c.squares));
  const id = "nf3-" + (++uid);

  host.innerHTML = `
    <div class="nf3-stage" style="position:relative;touch-action:pan-y">
      <canvas id="${id}-c" tabindex="0" role="img" aria-describedby="${id}-keys"
        style="display:block;width:100%;border-radius:8px;cursor:grab"></canvas>
      <div class="nf3-labels" aria-hidden="true" style="position:absolute;inset:0;pointer-events:none"></div>
    </div>
    <p class="note" id="${id}-keys" style="margin-top:6px">Drag the picture, or click it and use the arrow keys, to turn it.</p>
    <div class="ctl" style="margin-top:12px">
      <label for="${id}-r">Fold</label>
      <input type="range" id="${id}-r" min="0" max="100" step="1" value="0" style="flex:1 1 160px;min-height:44px;accent-color:#1F8A7D">
      <output for="${id}-r" id="${id}-o" style="font-family:var(--mono);min-width:4ch">0%</output>
      <button type="button" class="btn go" data-a="up">Fold up</button>
      <button type="button" class="btn" data-a="flat">Lay flat</button>
    </div>
    <div class="ctl">
      <button type="button" class="btn sm" data-a="left">Turn left</button>
      <button type="button" class="btn sm" data-a="right">Turn right</button>
      <button type="button" class="btn sm" data-a="tiltUp">Tilt up</button>
      <button type="button" class="btn sm" data-a="tiltDown">Tilt down</button>
      <button type="button" class="btn sm" data-a="reset">Reset view</button>
    </div>
    <p class="out" id="${id}-s" role="status" style="margin-top:4px"></p>`;
  const canvas = host.querySelector("canvas"), labelLayer = host.querySelector(".nf3-labels");
  const range = host.querySelector(`#${id}-r`), output = host.querySelector(`#${id}-o`);
  const status = host.querySelector(`#${id}-s`), stage = host.querySelector(".nf3-stage");

  /* scene */
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new Scene();
  scene.add(new HemisphereLight(0xffffff, 0x8a96a8, 1.7));
  const sun = new DirectionalLight(0xffffff, 1.9);
  sun.position.set(3, 5, 6);
  scene.add(sun);
  const camera = new PerspectiveCamera(32, 1.6, 0.1, 100);
  const model = new Group();
  scene.add(model);

  const faceGeo = new PlaneGeometry(0.97, 0.97), edgeGeo = new EdgesGeometry(new PlaneGeometry(1, 1));
  const edgeMat = new LineBasicMaterial({ color: INK });
  const plain = new MeshStandardMaterial({ color: TEAL, roughness: .65, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const hatched = new MeshStandardMaterial({ color: 0xffffff, map: hatch(), roughness: .65, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const holders = tree.map(node => {
    const h = new Object3D();
    h.matrixAutoUpdate = false;
    h.add(new Mesh(faceGeo, clashing.has(node.num) ? hatched : plain));
    h.add(new LineSegments(edgeGeo, edgeMat));
    model.add(h);
    return h;
  });
  const labels = tree.map(node => {
    const s = document.createElement("span");
    const face = result.closes ? result.squares.find(q => q.num === node.num).face : "";
    s.innerHTML = `<b>${node.num}</b>${face ? " " + face : clashing.has(node.num) ? " clash" : ""}`;
    s.style.cssText = "position:absolute;transform:translate(-50%,-50%);padding:1px 7px;border-radius:999px;" +
      "font:600 .78rem/1.5 var(--sans);white-space:nowrap;color:#fff;background:" +
      (clashing.has(node.num) ? "#8E3A22" : "#1B3A5C") + ";box-shadow:0 1px 3px rgba(0,0,0,.25)";
    labelLayer.appendChild(s);
    return s;
  });

  /* view: the camera circles the shape; the distance fits the flat net, the widest it gets */
  const flatPoses = G.pose(tree, 0), flatCentre = G.centre(flatPoses);
  const reach = Math.max(...flatPoses.map(q => Math.hypot(q.p[0] - flatCentre[0], q.p[1] - flatCentre[1]))) + .8;
  const HOME = { yaw: -28, pitch: 24 };
  let yaw = HOME.yaw, pitch = HOME.pitch, fold = 0, frame = 0, anim = 0;

  function size() {
    const w = stage.clientWidth || 600, h = Math.round(Math.min(420, Math.max(240, w * .6)));
    renderer.setSize(w, h, false);
    canvas.style.height = h + "px";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    draw();
  }

  const tmp = new Vector3();
  function render() {
    frame = 0;
    if (!host.isConnected) { destroy(); return; }
    const poses = G.pose(tree, fold), c = G.centre(poses);
    poses.forEach((q, i) => {
      const R = q.R;
      /* the only render-side nudge: clashing squares sit a hair apart so they don't flicker */
      const k = clashing.has(tree[i].num) ? .004 * tree[i].num : 0;
      holders[i].matrix.set(R[0], R[1], R[2], q.p[0] - c[0] + q.n[0] * k,
                            R[3], R[4], R[5], q.p[1] - c[1] + q.n[1] * k,
                            R[6], R[7], R[8], q.p[2] - c[2] + q.n[2] * k,
                            0, 0, 0, 1);
      holders[i].matrixWorldNeedsUpdate = true;
    });
    const dist = reach / Math.sin((camera.fov / 2) * Math.PI / 180) * 1.05;
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180;
    camera.position.set(dist * Math.sin(y) * Math.cos(p), dist * Math.sin(p), dist * Math.cos(y) * Math.cos(p));
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    /* flat labels follow each square's centre; hidden when the square faces away */
    const w = canvas.clientWidth, h = canvas.clientHeight;
    poses.forEach((q, i) => {
      const pos = [q.p[0] - c[0] + q.n[0] * .02, q.p[1] - c[1] + q.n[1] * .02, q.p[2] - c[2] + q.n[2] * .02];
      const toCam = [camera.position.x - pos[0], camera.position.y - pos[1], camera.position.z - pos[2]];
      const facing = q.n[0] * toCam[0] + q.n[1] * toCam[1] + q.n[2] * toCam[2] > 0;
      tmp.set(pos[0], pos[1], pos[2]).project(camera);
      const s = labels[i];
      s.style.left = ((tmp.x + 1) / 2 * w) + "px";
      s.style.top = ((1 - tmp.y) / 2 * h) + "px";
      s.style.visibility = facing ? "visible" : "hidden";
    });
    describe();
  }
  function draw() { if (!frame) frame = requestAnimationFrame(render); }

  function describe() {
    const pct = Math.round(fold * 100);
    output.textContent = pct + "%";
    if (+range.value !== pct) range.value = pct;
    const closed = pct === 100 ? " " + G.describe(result) : " Squares are numbered 1 to 6 in reading order, as on the grid.";
    canvas.setAttribute("aria-label", `3D view of your net, folded ${pct} percent.` + closed);
  }
  function say(text) { if (status.textContent !== text) status.textContent = text; }

  function setFold(t) { fold = Math.max(0, Math.min(1, t)); draw(); }
  function animateTo(target) {
    cancelAnimationFrame(anim);
    const done = () => say(target === 1 ? "Fully folded. " + G.describe(result) : "Laid flat again.");
    if (reduced()) { setFold(target); done(); return; }
    const from = fold, span = Math.abs(target - from), ms = 1700 * span;
    if (!span) { done(); return; }
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setFold(from + (target - from) * e);
      if (k < 1) anim = requestAnimationFrame(step); else done();
    };
    anim = requestAnimationFrame(step);
  }
  function turn(dy, dp) { yaw += dy; pitch = Math.max(-80, Math.min(80, pitch + dp)); draw(); }

  range.addEventListener("input", () => {
    cancelAnimationFrame(anim);
    setFold(range.value / 100);
    say(+range.value === 100 ? "Fully folded. " + G.describe(result) : "");
  });
  host.addEventListener("click", e => {
    const b = e.target.closest("button[data-a]"); if (!b) return;
    ({ up: () => animateTo(1), flat: () => animateTo(0),
       left: () => turn(-20, 0), right: () => turn(20, 0),
       tiltUp: () => turn(0, 15), tiltDown: () => turn(0, -15),
       reset: () => { yaw = HOME.yaw; pitch = HOME.pitch; draw(); } })[b.dataset.a]();
  });
  canvas.addEventListener("keydown", e => {
    const m = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] }[e.key];
    if (!m) return;
    e.preventDefault(); turn(m[0], m[1]);
  });
  let drag = null;
  canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", e => {
    if (!drag) return;
    turn((e.clientX - drag.x) * .5, e.pointerType === "touch" ? 0 : (e.clientY - drag.y) * .5);
    drag = { x: e.clientX, y: e.clientY };
  });
  const endDrag = () => { drag = null; canvas.style.cursor = "grab"; };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  const ro = window.ResizeObserver ? new ResizeObserver(size) : null;
  if (ro) ro.observe(stage);

  function destroy() {
    cancelAnimationFrame(anim); cancelAnimationFrame(frame);
    if (ro) ro.disconnect();
    faceGeo.dispose(); edgeGeo.dispose(); edgeMat.dispose(); plain.dispose();
    if (hatched.map) hatched.map.dispose();
    hatched.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    views.delete(view);
  }
  const view = { host, destroy, setFold, animateTo, result };
  views.add(view);
  size();
  return view;
}

window.NetFold3D = { supported, mount };
