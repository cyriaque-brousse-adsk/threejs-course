import { BoxGeometry, FrontSide, Group, LineBasicMaterial, LineSegments, Mesh, MeshLambertMaterial, Vector3 } from "three";
import Grid from "../Grid";
import { IGridMesh } from "./GridMesh";
import { CELL_SIZE, GRID_CELL_COUNT } from "../constants";
import * as THREE from "three";

export const BOX_MATERIAL = new MeshLambertMaterial({
  side: FrontSide,
  shadowSide: FrontSide,
  polygonOffset: true,
  polygonOffsetFactor: 1,
});

export const EDGES_MATERIAL = new LineBasicMaterial({ color: 0x444444 });

export default class GroupOfBoxes extends Group implements IGridMesh {
  constructor(grid: Grid) {
    super();
    this.update(grid);
  }

  update(grid: Grid) {
    this.cleanup();

    for (let x = 0; x < GRID_CELL_COUNT.x; x++) {
      for (let y = 0; y < GRID_CELL_COUNT.y; y++) {
        const floors = grid.getCellValue(x, y);
        if (floors > 0) {
          this.addBoxAtGridIndex(x, y, floors);
        }
      }
    }
  }

  addBoxAtGridIndex(gridIndexX: number, gridIndexY: number, floors: number) {
    /**
     * Use your knowledge about how to create a box to draw all the buildings.
     *
     * Tasks:
     * - Create a box like we did earlier, and add it with "this.add(boxMesh)"
     * - Set the size of the box. This is defined by the constant CELL_SIZE. Hint: The height is #floors * CELL_SIZE.z
     * - Like with the plane, the box has origo in the middle of the box. You need to add an offset to the position of
     *   the box to compensate for this.
     * - Position the box according to where in the grid it should be. Use the "gridIndexX", "gridIndexY" and the
     *   CELL_SIZE to calculate this position
     *
     * Hint:
     * - It is easier to visualize if you have it correct if you add multiple buildings to the Grid class in the previous task
     *
     * When done, go back to main.ts and continue on the tasks there
     * */

    const height = floors * CELL_SIZE.z;

    const geometry = new THREE.BoxGeometry(CELL_SIZE.x, CELL_SIZE.y, height);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(gridIndexX * CELL_SIZE.x + CELL_SIZE.x / 2, gridIndexY * CELL_SIZE.y + CELL_SIZE.y / 2, height / 2);

    this.add(cube);
    //Your code here
  }

  cleanup() {
    const children = [...this.children];
    for (let child of children) {
      this.remove(child);
      if (child instanceof Mesh || child instanceof LineSegments) {
        child.geometry.dispose();
      }
    }
  }
}
