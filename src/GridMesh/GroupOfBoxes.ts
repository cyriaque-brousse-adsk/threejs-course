import { BoxGeometry, FrontSide, Group, LineBasicMaterial, LineSegments, Mesh, MeshLambertMaterial } from "three";
import Grid from "../Grid";
import { IGridMesh } from "./GridMesh";
import { CELL_SIZE, GRID_CELL_COUNT } from "../constants";

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
     *
     * When done, go back to main.ts and continue on the tasks there
     * */

    const box = new BoxGeometry(CELL_SIZE.x, CELL_SIZE.y, floors * CELL_SIZE.z);

    // Place the box in the correct grid position
    box.translate(gridIndexX * CELL_SIZE.x, gridIndexY * CELL_SIZE.y, 0);

    // Offset to put the origin in the lower left corner
    box.translate(box.parameters.width / 2, box.parameters.height / 2, box.parameters.depth / 2);

    const mesh = new Mesh(box, BOX_MATERIAL);

    this.add(mesh);
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
