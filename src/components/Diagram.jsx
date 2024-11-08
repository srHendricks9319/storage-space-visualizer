import { useEffect, useRef, useState } from "react";
import {
  BoxGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default function Diagram({ items, boxSize }) {
  const mountRef = useRef(null);
  const [prioritizeStacking, setPrioritizeStacking] = useState(false);
  const width = window.innerWidth * 0.75;
  const height = window.innerHeight;

  function createItem(item, position) {
    const geometry = new BoxGeometry(item.width, item.height, item.depth);
    geometry.applyMatrix4(
      new Matrix4().makeTranslation(
        item.width / 2,
        item.height / 2,
        item.depth / 2
      )
    );
    const material = new MeshBasicMaterial({
      color: item.color,
    });
    const cube = new Mesh(geometry, material);
    cube.position.set(position.x, position.y, position.z);
    return cube;
  }

  function itemPositioning() {
    const grid = Array(boxSize.height)
      .fill(null)
      .map(() =>
        Array(boxSize.depth)
          .fill(null)
          .map(() => Array(boxSize.width).fill(null))
      );

    function canPlace(item, position) {
      const { depth, width, height } = item;
      const { x, y, z } = position;

      for (let i = 0; i < width + 2; i++) {
        for (let j = 0; j < height; j++) {
          for (let k = 0; k < depth + 2; k++) {
            const position = {
              x: x + i,
              y: y + j,
              z: z + k,
            };
            if (
              position.y > grid.length - 1 ||
              position.x > grid[0].length - 1 ||
              position.z > grid[0][0].length - 1 ||
              grid[position.y][position.x][position.z]
            )
              return false;
          }
        }
      }
      console.log(
        `Item: ${item.name} can be placed at: ${JSON.stringify(position)}`
      );
      return true;
    }

    function placeItem(item, position) {
      const { depth, width, height } = item;
      const { x, y, z } = position;
      for (let i = 0; i < width + 2; i++) {
        for (let j = 0; j < height; j++) {
          for (let k = 0; k < depth + 2; k++) {
            const position = {
              x: x + i,
              y: y + j,
              z: z + k,
            };
            if (
              position.y > grid.length ||
              position.x > grid[0].length ||
              position.z > grid[0][0].length
            ) {
              console.error(
                `Item: ${item.name} at position out of bounds: ${JSON.stringify(
                  position
                )}`
              );
            }
            if (grid[position.y][position.x][position.z]) {
              console.error(
                `Item: ${
                  item.name
                } at position already occupied: ${JSON.stringify(position)}`
              );
            }
            grid[position.y][position.x][position.z] = item.id;
          }
        }
      }
    }

    function isStackedSupported(checkPosition, item) {
      if (checkPosition.y === 0) return true;
      const { width, depth } = item;
      for (let i = 0; i < width; i++) {
        for (let k = 0; k < depth; k++) {
          const position = {
            x: checkPosition.x + i,
            z: checkPosition.z + k,
          };
          if (!grid[checkPosition.y - 1][position.x][position.z]) {
            return false;
          }
        }
      }
      return true;
    }

    function findNextPosition(item, startPosition = { x: 0, y: 0, z: 0 }) {
      const position = { ...startPosition };
      if (prioritizeStacking) {
        let supportChecked = false;
        for (let j = 0; j < grid[0].length; j++) {
          position.z = j;
          supportChecked = false;
          for (let k = 0; k < grid[0][0].length; k++) {
            position.x = k;
            supportChecked = false;
            if (!supportChecked) {
              for (let i = 0; i < grid.length; i++) {
                position.y = i;
                if (!isStackedSupported(position, item)) {
                  supportChecked = true;
                  break;
                }
                if (canPlace(item, position)) return position;
              }
            } else {
              if (canPlace(item, position)) return position;
            }
          }
        }
      }
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
          for (let k = 0; k < grid[0][0].length; k++) {
            const position = {
              x: k,
              y: i,
              z: j,
            };
            if (canPlace(item, position)) return position;
          }
        }
      }
      return null;
    }

    let currentPosition = { x: 0, y: 0, z: 0 };
    const finalPositions = items
      .sort((a, b) => b.depth * b.width - a.depth * a.width)
      .map((item) => {
        const position = findNextPosition(item, currentPosition);
        if (position) {
          placeItem(item, position);
          currentPosition = position;
          return { ...item, position };
        } else {
          console.error(`Could not place ${item.name}`);
        }
      })
      .filter((item) => item);
    return finalPositions;
  }

  useEffect(() => {
    const camera = new PerspectiveCamera(70, width / height, 1, 5000);

    const maxDimension = Math.max(boxSize.width, boxSize.height);
    camera.position.set(maxDimension * 2, maxDimension * 2, maxDimension * 2);
    const scene = new Scene();

    const geometry = new BoxGeometry(
      boxSize.width,
      boxSize.height,
      boxSize.depth
    );
    geometry.applyMatrix4(
      new Matrix4().makeTranslation(
        boxSize.width / 2,
        boxSize.height / 2,
        boxSize.depth / 2
      )
    );
    const material = new MeshBasicMaterial({ wireframe: true });
    const cube = new Mesh(geometry, material);
    scene.add(cube);

    const renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    const animate = (time) => {
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);
    const controls = new OrbitControls(camera, renderer.domElement);

    itemPositioning().forEach((item) => {
      scene.add(createItem(item, item.position));
    });

    mountRef.current.appendChild(renderer.domElement);

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [boxSize, items, prioritizeStacking]);

  return (
    <div ref={mountRef}>
      <button
        onClick={() => setPrioritizeStacking(!prioritizeStacking)}
        className="absolute bottom-0 left-0 text-blue-500 hover:text-blue-700 m-2 p-2"
      >
        Toggle Stacking
      </button>
    </div>
  );
}
