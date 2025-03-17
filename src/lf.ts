import "./style.css";
import "./featureFlag";
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import Grid from "./Grid";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GroupOfBoxes from "./GridMesh/GroupOfBoxes-lf";
import { CELL_SIZE, GRID_CENTER, GRID_SIZE } from "./constants";
import { viewScores } from "./viewScores";
import { listenForButtonClicks } from "./eventListeners";
import { viewConstraints } from "./viewConstraints";
import { constraintGrid } from "./constraint";

const cameraUpAxis = new Vector3(0, 0, 1);
const cameraInitialPosition = new Vector3(-5, -5, 1);
const cameraPointToLookAt = new Vector3(0, 0, 0);

/**
 * We have defined a <canvas> element in index.html.
 * This is the element we want three.js to draw on. Here we fetch it from the HTML file:
 * */
const canvas: HTMLCanvasElement = document.getElementById("app")! as HTMLCanvasElement;

/**
 * ====== TASK 1 ======
 *
 * The Scene contain all object you want to be rendered. This is where you place objects, lights and cameras.
 * Let's set up one up!
 *
 * Task:
 * - Create a new scene and assign it to a variable
 * - Create a new PerspectiveCamera and assign it to a variable
 * - Uncomment the lines where we initialize the camera to a position and an angle
 *
 * Hints:
 * - All the parameters for setting up the camera are defined as variables above. You can play around with these
 * later!
 *
 * Docs:
 * https://threejs.org/docs/#api/en/scenes/Scene
 * https://threejs.org/docs/?q=perspec#api/en/cameras/PerspectiveCamera
 *
 * */

// Use these values when creating the camera
const fov = 75;
const aspectRatio = window.innerWidth / window.innerHeight;
const frustumNearPlane = 0.1;
const frustumFarPlane = 1000;

const scene = new Scene();
const camera = new PerspectiveCamera(fov, aspectRatio, frustumNearPlane, frustumFarPlane);

camera.up = cameraUpAxis;
camera.position.copy(cameraInitialPosition);
camera.lookAt(cameraPointToLookAt);

/**
 * ====== TASK 2 ======
 * Your still seeing a red canvas. That is because we have not told Three.js to draw anything to the screen yet. Lets
 * fix that!
 *
 * The WebGLRenderer is responsible for drawing the scene on the canvas, viewed from the cameras position
 *
 * Docs: https://threejs.org/docs/?q=web#api/en/renderers/WebGLRenderer
 *
 * Task:
 * - Initialize the WebGLRenderer with the canvas as a parameter
 * - Call the render() function on the renderer with the required parameters
 *
 * */

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.render(scene, camera);

/**
 * ====== TASK 3 ======
 * YAY! Three.js has taken over the drawing of the canvas – which you can see because the screen has turned black
 * instead of red.
 *
 * But a black screen isn't *that* much more interesting than a red one... Let's add something to look at!
 *
 * Task:
 * - Use the example code from these docs to add a box to the scene
 *   https://threejs.org/docs/index.html#api/en/geometries/BoxGeometry
 * - Make sure to call the render() method on the renderer again to tell three.js to render what we have given it
 * */

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshLambertMaterial({ color: 0x00ff00 });
const cube = new Mesh(geometry, material);
scene.add(cube);
renderer.render(scene, camera);

/**
 * ====== TASK 4 ======
 * Nice, we now have a cube, but it is so blurry!! We need to tell three.js what resolution we want things in.
 *
 * Task:
 * - Use the setSize() method on the renderer to set the renderer size to match the canvas
 * - (Did you remember to call render() again after changing the resolution?)
 *
 * Tip: The canvas size can be found as the properties canvas.clientWidth and canvas.clientHeight
 *
 * */

renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.render(scene, camera);

/**
 * ====== TASK 4b ======
 * Nice! Now we actually see that we have a cube
 *
 * You can also set the background color to something less depressing using render.setClearColor
 * What about a nice "SkyBlue"?
 * */

renderer.setClearColor("SkyBlue");

/**
 * ====== TASK 5 ======
 * Animation loop
 * You probably think it is annoying to have to write renderer.render every time you add something to the scene
 * We can ask your browser to call this function 60 times per second automatically
 *
 * Task:
 * - Add the renderer.render function call into the animate function.
 * - Remove the manual renderer.render function calls you have already written, and see that this works
 * - Play around with setting the position of the cube and see how it automatically updates
 *
 * Note:
 * This will draw the scene all the time. In production environments you most likely want to be smart about
 * when you actually call render(), to avoid rendering when there are no updates to the scene, to
 * save computation time for other important tasks.
 * */

function animate() {
  renderer.render(scene, camera); // Remove
  requestAnimationFrame(animate);
}
animate();

// Play around with position here!
cube.position.set(2, 1, 0);

/**
 * ====== TASK 6 ======
 * It would be nice to be able to move the camera around. This is a bit complicated, but luckily Three.js has an
 * example we can use out of the box which works well enough for this course. It can be added by creating a
 * "new OrbitControls()"
 *
 * OrbitControls work by taking in the camera and the canvas and listening to mouse events on the canvas to calculate
 * how far to move or rotate the camera – which it does by mutating properties on the passed-in camera.
 *
 * Task:
 * - Create new OrbitControls and assign it to a variable `controls` so we can reference it later.
 * */

const controls = new OrbitControls(camera, renderer.domElement);

/**
 * ====== TASK 7 ======
 * Sweet, we can now move the camera around with the mouse!
 *
 * However, the cube is very green! Why don't we make it look slightly less jarring?
 *
 * Task:
 * - Set the `color` on the cubes material to "white".
 *
 * Docs: https://threejs.org/docs/index.html?q=meshb#api/en/materials/MeshBasicMaterial.color
 * */

material.color.set(0xffffff);

/**
 * ====== TASK 8 ======
 * The shape of the box is just one big blob – that's because the box's material is not affected by lights and that
 * we have no lights!
 *
 *
 * Task:
 * - Change the material of the cube from MeshBasicMaterial to MeshLambertMaterial
 * - Create a DirectionalLight https://threejs.org/docs/index.html?q=direct#api/en/lights/DirectionalLight
 * - Add the light to the scene
 * - Position the light at position (-2, -5, 10)
 *
 * We suggest using an intensity of 0.7
 * Tip: If you want to view where the light is placed, you can add a new DirectionalLightHelper to the scene!
 */

const directionalLight = new DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(-100, -20, 60);
scene.add(directionalLight);
scene.add(new DirectionalLightHelper(directionalLight));

/**
 * ====== TASK 9 ======
 * The side of the cube that is in the shadow is completely black, making it hard to see anything.
 * That can be fixed by having some ambient light!
 *
 *
 * Task:
 * - Add a new AmbientLight to the scene
 *
 * We suggest using an intensity of 0.4
 *
 * */

const ambientLight = new AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

/**
 * ====== TASK 10 ======
 * Let's start building Forma light version!
 *
 * Imagine we have a grid that has n x m cells, where each cell represents a spot where a building can be placed:
 *
 * +---+---+---+---+
 * | o | o | o | o |
 * +---+---+---+---+
 * | o | o | o | o |
 * +---+---+---+---+
 * | o | o | o | o |
 * +---+---+---+---+
 * | o | o | o | o |
 * +---+---+---+---+
 *
 * This is our site!
 * Let's start by adding the ground on the site that the buildings can stand on top of.
 * It needs to be as large as the size of the grid. The size of the grid can be found in the GRID_SIZE variable in
 * the constants.ts file!
 *
 * Task:
 * - Create a PlaneGeometry equal to the size of the grid.
 * - Create a MeshLambertMaterial and give it a color if you'd like!
 * - Create a Mesh from the geometry and the material
 * - Add the Mesh to the Scene
 *
 * Docs:
 * https://threejs.org/docs/index.html?q=Plane#api/en/geometries/PlaneGeometry
 * https://threejs.org/docs/index.html?q=mesh#api/en/objects/Mesh
 */

const groundGeometry = new PlaneGeometry(GRID_SIZE.x, GRID_SIZE.y);
const groundMaterial = new MeshLambertMaterial({ color: 0xaaaaaa });
const groundMesh = new Mesh(groundGeometry, groundMaterial);
scene.add(groundMesh);

/**
 * ====== TASK 10b ======
 *
 * For our Forma light application, we want everything to be positioned in the positive quadrant of the coordinate
 * system.
 *
 * The default position of the plane is in the center of the plane. We therefor need to translate the plane 50% of the
 * plane size in the x and y direction.
 *
 * Task:
 * - Set the position of the plane so it is in the positive quadrant of the grid
 *
 * Hint:
 * - Uncomment the line with the AxisHelper to see where the origo of the Scene is
 *
 * */
groundMesh.position.set(GRID_SIZE.x / 2, GRID_SIZE.y / 2, 0);

scene.add(new AxesHelper(10));

/**
 * ====== TASK 11 ======
 * It would be nice to have the camera looking towards the middle of our site from the get-go.
 * To position the camera, you can use "camera.position.set()". To make the camera angled towards something, you can
 * use "controls.target.set()". Finally you must do a "controls.update()".
 * Task:
 * - Make the camera look at the center of the site
 *
 * Tip: The center of the grid is defined in the GRID_CENTER constant
 */

const sensibleCameraPosition = new Vector3(GRID_CENTER.x, GRID_CENTER.y - 70, 80);

camera.position.copy(sensibleCameraPosition);
controls.target.set(GRID_CENTER.x, GRID_CENTER.y, 0);
controls.update();

/**
 * ====== TASK 12 ======
 * We now have the ground on our site, but we would also like to add buildings!
 * For our buildings, we will use the simple 2d grid described above, with the cell value representing the number of
 * floors for that cell.
 *
 * This is our domain model, a pure Javascript/Typescript object which does not have anything with Three.js to do.
 * Separating our domain model and the visual rendering is important when the application grows.
 *
 * Task:
 * - Create a grid using our provided Grid class and assign it to a variable `grid`
 * - Use the functions Grid.setCellValue() and Grid.getCellValue() in it to set the number of floors for a position
 *   of your choice.
 * - Check that it worked by console.log()ing the result.
 */

const grid = new Grid();
grid.setCellValue(5, 5, 5);
grid.setCellValue(5, 7, 4);

/**
 * ====== TASK 13 ======
 * Now it would be nice to draw the buildings in the Scene.
 *
 * We have created a class which takes in a grid and will create boxes for representing the buildings. However, the
 * implementation is not complete.
 *
 * Task:
 * - Uncomment the two lines below
 * - Go into the GroupOfBoxes class and complete the implementation of the method "addBoxAtGridIndex"
 * - Play around with setting different values in the Grid. Remember to call .update(grid) on the GroupOfBoxes class
 *   after you edit the grid
 */

const gridMesh = new GroupOfBoxes(grid);
scene.add(gridMesh);

/**
 * ====== TASK 14 ======
 * Interacting with the scene
 *
 * Until now, we have only programmatically added things to the scene. To make a real tool, we need to allow the user
 * to draw the buildings where they want.
 *
 * We want to add or remove a floor when the user clicks somewhere on the map.
 *
 * Docs: https://threejs.org/docs/#api/en/core/Raycaster
 *
 * Task:
 * - Create a Raycaster
 * - Set the Raycaster position using the Raycaster.setFromCamera() function
 * - Use the function Raycaster.intersectObjects() to intersect with the PlaneMesh and the GroupOfBoxes. This function
 *   returns a list of intersections (things ray hit), sorted from closest to the camera to furthest away from the camera
 * - Check if we got any intersections, if yes, get the first one
 * - Use the function worldCoordinatesToGridIndex(intersection.point) to transform this coordinate to the grid index
 * - Get the current number of floors for the given grid cell
 * - Set the number of floors for the given cell to one more than before
 * - Update the GroupOfBoxes to see the result
 *
 * You should now be able to draw new boxes!!!
 *
 * Task: Let the user remove them as well
 * - Check if the shiftKey is pressed while clicking (this can be found on event.shiftKey)
 * - If shift is pressed, subtract one from the current value
 *
 *
 * Hint:
 * - We have already implemented the functions "findPositionInCanvas" and "worldCoordinatesToGridIndex" below
 * - Throughout this task, it can be really useful to console.log the variables and test your code in the browser
 *
 * */

canvas.addEventListener("mouseup", onmouseup);

function onmouseup(event: MouseEvent) {
  const positionInCanvas = findPositionInCanvas(event, canvas);

  // We check if the mouse moved between the mousedown and mouse up events.
  // We don't want to add apartments if the user only wanted to move the camera
  if (movedWhileClicking(mouseDownPositionInCanvas, positionInCanvas)) {
    return;
  }

  const raycaster = new Raycaster();
  raycaster.setFromCamera(positionInCanvas, camera);

  const intersections = raycaster.intersectObjects([groundMesh, gridMesh]);
  if (intersections.length === 0) {
    // We didn't hit anything in the scene
    return;
  }

  const closest = intersections[0];

  const { x, y } = worldCoordinatesToGridIndex(closest.point);

  const currentValue = grid.getCellValue(x, y);
  grid.setCellValue(x, y, Math.max(currentValue + (event.shiftKey ? -1 : 1), 0));
  gridMesh.update(grid);

  viewScores(grid);
}

/**
 * Normalized device coordinate or NDC space is a screen independent display coordinate system;
 * it encompasses a square where the x and y components range from 0 to 1.
 *
 *  |⎻⎻⎻⎻1
 *  |    |
 *  |    |
 *  0____|
 *
 */

export function findPositionInCanvas(event: MouseEvent, canvas: HTMLCanvasElement): Vector2 {
  let x = (event.offsetX / canvas.clientWidth) * 2 - 1;
  let y = -(event.offsetY / canvas.clientHeight) * 2 + 1;
  return new Vector2(x, y);
}

function worldCoordinatesToGridIndex(screenCoordinates: Vector3) {
  const x = Math.floor(screenCoordinates.x / CELL_SIZE.x);
  const y = Math.floor(screenCoordinates.y / CELL_SIZE.y);
  return { x, y };
}

/**
 * ====== TASK 14b ======
 *
 * Now that we can draw buildings, it would be nice to save and load them as well.
 *
 * Task:
 * - Uncomment the line below and make sure the parameter names match yours.
 * */

listenForButtonClicks(gridMesh, renderer, scene, camera, grid);

/**
 * ====== TASK 15 ======
 * It is a bit annoying that we add a box when we simply want to move the camera.
 *
 * Task:
 * - Add a check to the onmouseup function which quits the function if the camera has moved while the mouse was down
 *
 * Hint:
 * - We already record the canvas position in the variable "mouseDownPositionInCanvas" when mouse is clicked down
 * - The function "movedWhileClicking" can be used to check the distance the mouse has moved between the mouse down event
 *   and the mouse up event
 * */

let mouseDownPositionInCanvas: Vector2;
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  mouseDownPositionInCanvas = findPositionInCanvas(event, canvas);
});

function movedWhileClicking(down: Vector2, up: Vector2): boolean {
  return Math.sqrt((down.x - up.x) ** 2 + (down.y - up.y) ** 2) > 0.01;
}

/**
 * ====== TASK 16 ======
 *
 * It would be nice to see where we are allowed to draw on the canvas, based on Oslo regulations
 *
 * The public folder contains a file called "constraints.png"
 *
 * Task:
 * - Use a TextureLoader to load the constraints.png image
 * - Add the texture to the material of the ground mesh.
 *
 * Hint:
 * - You can assign the texture to the Material.map property
 *
 * Docs:
 * - https://threejs.org/docs/#api/en/loaders/TextureLoader
 * - https://threejs.org/docs/?q=material#api/en/materials/MeshLambertMaterial.map
 *
 * */
const texture = new TextureLoader().load("constraints.png");
groundMesh.material.map = texture;

/**
 * Extra tasks for the fast ones!
 *
 * 1. Drawing many meshes is not good for performance! Our class GroupOfBoxes have one mesh per cell in the grid.
 *    In a production environment, we typically create the geometry manually instead of using helpers like
 *    BoxGeometry. This enables us to create whatever mesh we want, as well as merge lots of shapes into the same
 *    mesh.
 *
 *    Task: Switch out the usage of GroupOfBoxes with GridMesh. Their interface is identical. As you can see, we forgot
 *    to add the left face of the boxes. Fill in the missing code to draw the left face of the boxes
 *
 * */

// const loader = new GLTFLoader();
// const fox = await loader.loadAsync("Fox.glb");
//
// scene.add(fox.scene);

listenForButtonClicks(gridMesh, renderer, scene, camera, grid);

document.getElementById("viewConstraints")?.addEventListener("click", () => {
  viewConstraints(constraintGrid);
});
