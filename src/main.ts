import "./style.css";
import * as THREE from "three";
import { Raycaster, Vector2 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Grid, {
  CELL_HEIGHT,
  CELL_WIDTH_DEPTH,
  GRID_DEPTH,
  GRID_WIDTH,
} from "./Grid";
import Ground from "./Ground";
import GroupOfBoxes from "./GroupOfBoxes";
import { getAmbientLight, getDirLight } from "./Lights";
import { getAnalysisScore } from "./analysis";

const NUMERIC_OFFSET = 1e-3;

export const center = new Vector2(
  (GRID_WIDTH * CELL_WIDTH_DEPTH) / 2,
  (GRID_DEPTH * CELL_WIDTH_DEPTH) / 2
);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.up.set(0, 0, 1);
camera.position.set(center.x, center.y - 30, 30);

const canvas = document.getElementById("app")!;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xaaaaff, 1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(center.x, center.y, 0);
controls.update();

const ground = new Ground();
scene.add(ground);

const dirlight = getDirLight();
scene.add(dirlight);
scene.add(dirlight.target);
dirlight.position.set(0, 0, 100);
dirlight.target.position.set(center.x, center.y, 0);

scene.add(getAmbientLight());

const grid = new Grid();
const gridMesh = new GroupOfBoxes(grid);
scene.add(gridMesh);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const encoded = localStorage.getItem("encoded");
if (encoded) {
  console.log(encoded);
  grid.decode(encoded);
  gridMesh.update();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

const mouse = new Vector2();
const raycaster = new Raycaster();

let mousedownEvent: MouseEvent | undefined;
function movedWhileClicking(
  down: MouseEvent | undefined,
  up: MouseEvent
): boolean {
  if (!down) return false;
  const distSq =
    (down.offsetX - up.offsetX) ** 2 + (down.offsetY - up.offsetY) ** 2;
  console.log(distSq);
  return distSq > 4 ** 2;
}

function onmouseup(event: MouseEvent) {
  if (movedWhileClicking(mousedownEvent, event)) {
    return;
  }

  let x = (event.offsetX / canvas.clientWidth) * 2 - 1;
  let y = -(event.offsetY / canvas.clientHeight) * 2 + 1;
  mouse.set(x, y);

  raycaster.setFromCamera(mouse, camera);
  const intersections = raycaster.intersectObject(scene, true);
  if (intersections.length >= 1) {
    const closest = intersections[0];

    // We only allow clicking on top faces
    if (closest.face!.normal.z < 0.99) return;

    const x = Math.floor((closest.point.x + NUMERIC_OFFSET) / CELL_WIDTH_DEPTH);
    const y = Math.floor((closest.point.y + NUMERIC_OFFSET) / CELL_WIDTH_DEPTH);
    const z = Math.floor((closest.point.z + NUMERIC_OFFSET) / CELL_HEIGHT);

    const newVal = !event.shiftKey;

    const affectedZ = event.shiftKey ? z - 1 : z;

    grid.setCellValue(x, y, affectedZ, newVal);
    const encoded = grid.encode();
    localStorage.setItem("encoded", encoded);
    gridMesh.update();

    getAnalysisScore(grid);
  }
}

function onmousedown(event: MouseEvent) {
  mousedownEvent = event;
}

window.addEventListener("mouseup", onmouseup);
window.addEventListener("mousedown", onmousedown);
