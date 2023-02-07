/**
 * Efficient implementation of the boxes mesh
 * */
import { BufferAttribute, BufferGeometry, Group, LineSegments, Mesh } from "three";
import Grid, { CELL_HEIGHT, CELL_WIDTH_DEPTH, GRID_DEPTH, GRID_WIDTH } from "../Grid";
import { BOX_MATERIAL, EDGES_MATERIAL } from "./GroupOfBoxes";

export default class GridMesh extends Group {
  mesh: Mesh;
  lineSegments: LineSegments;

  constructor() {
    super();
    this.mesh = new Mesh(new BufferGeometry(), BOX_MATERIAL);
    this.lineSegments = new LineSegments(new BufferGeometry(), EDGES_MATERIAL);
    this.add(this.mesh, this.lineSegments);
  }

  update(grid: Grid) {
    const meshPositions: [number, number, number][] = [];
    const lineSegmentsPositions: [number, number, number][] = [];

    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_DEPTH; y++) {
        const floors = grid.getCellValue(x, y);
        if (floors === 0) continue;

        const height = floors * CELL_HEIGHT;

        const x0 = x * CELL_WIDTH_DEPTH;
        const x1 = x * CELL_WIDTH_DEPTH + CELL_WIDTH_DEPTH;
        const y0 = y * CELL_WIDTH_DEPTH;
        const y1 = y * CELL_WIDTH_DEPTH + CELL_WIDTH_DEPTH;

        meshPositions.push(...getBoxGeometry(x0, y0, y1, x1, height));
        lineSegmentsPositions.push(...getLineSegments(x0, y0, y1, x1, height));
      }
    }

    console.log(meshPositions.length, meshPositions.length / 3);

    this.mesh.geometry.setAttribute("position", new BufferAttribute(new Float32Array(meshPositions.flat()), 3));
    this.mesh.geometry.attributes.position.needsUpdate = true;

    this.mesh.geometry.deleteAttribute("normal");
    this.mesh.geometry.computeVertexNormals();

    this.lineSegments.geometry.setAttribute("position", new BufferAttribute(new Float32Array(lineSegmentsPositions.flat()), 3));
    this.lineSegments.geometry.attributes.position.needsUpdate = true;
  }
}

/**
 * Seen from top The geometry we construct look like this.
 * Each face consist of two triangles making up that face.
 *
 *  x0y1.........x1y1
 *  .           .   .
 *  .        .      .
 *  .     .         .
 *  .  .            .
 *  x0y0.........x1y0
 *
 * */
function getBoxGeometry(x0: number, y0: number, y1: number, x1: number, height: number) {
  const positions: [number, number, number][] = [];
  // Bottom face
  positions.push(
    [x0, y0, 0],
    [x0, y1, 0],
    [x1, y1, 0],

    [x0, y0, 0],
    [x1, y1, 0],
    [x1, y0, 0]
  );

  // Top face
  positions.push(
    [x0, y0, height],
    [x1, y1, height],
    [x0, y1, height],

    [x0, y0, height],
    [x1, y0, height],
    [x1, y1, height]
  );

  // Front face
  positions.push(
    [x0, y0, 0],
    [x1, y0, 0],
    [x1, y0, height],

    [x0, y0, 0],
    [x1, y0, height],
    [x0, y0, height]
  );

  // Left face
  // TODO: Fill in the left face
  positions.push(
    [x0, y1, 0],
    [x0, y0, 0],
    [x0, y1, height],

    [x0, y0, 0],
    [x0, y0, height],
    [x0, y1, height]
  );

  // Right face
  positions.push(
    [x1, y1, 0],
    [x1, y1, height],
    [x1, y0, 0],

    [x1, y0, 0],
    [x1, y1, height],
    [x1, y0, height]
  );

  // Back face
  positions.push(
    [x0, y1, 0],
    [x1, y1, height],
    [x1, y1, 0],

    [x0, y1, 0],
    [x0, y1, height],
    [x1, y1, height]
  );

  return positions;
}

function getLineSegments(x0: number, y0: number, y1: number, x1: number, height: number) {
  const positions: [number, number, number][] = [];

  for (let z = 0; z <= height; z += CELL_HEIGHT) {
    // Front
    positions.push([x0, y0, z], [x1, y0, z]);
    // Right
    positions.push([x0, y0, z], [x0, y1, z]);
    // Left
    positions.push([x1, y0, z], [x1, y1, z]);
    // Back
    positions.push([x0, y1, z], [x1, y1, z]);
  }
  return positions;
}
