import * as THRE from 'three';
        
import SimplexNoise from 'simplex-noise';
import TreeGrid from '../Objects/TreeGrid';

export default class Terrain {
    constructor(level) {
        this.grid = [];

        const tilesWide = 100;
        const tilesHigh = 100;

        this.tileSize = 10;

        const totalWidth = this.tileSize * tilesWide;
        const totalHeight = this.tileSize * tilesHigh;

        var simplex = new SimplexNoise(Math.random);

        let index = 0;

        const floorGeometry = new THREE.PlaneGeometry(totalWidth, totalHeight, tilesWide, tilesHigh);
        floorGeometry.faces.forEach((face, index) => {

            const faceCenter = new THREE.Vector3(0,0,0).add(floorGeometry.vertices[face.a])
                .add(floorGeometry.vertices[face.b])
                .add(floorGeometry.vertices[face.c])
                .divideScalar(3);

            faceCenter.divideScalar(this.tileSize);
            faceCenter.x = Math.floor(faceCenter.x);
            faceCenter.y = -Math.floor(faceCenter.y) - 1;
            faceCenter.multiplyScalar(this.tileSize);

            const exponent = 0.79;
            const scale = 100;
            const e = 1 * simplex.noise2D(1 * faceCenter.x/scale, 1 * faceCenter.y/scale) +
                0.5 * simplex.noise2D(2 * faceCenter.x/scale, 2 * faceCenter.y/scale) +
                0.25 * simplex.noise2D(4 * faceCenter.x/scale, 4 * faceCenter.y/scale);
            
            const height = e*7;
            floorGeometry.vertices[face.a].z = height;
            floorGeometry.vertices[face.b].z = height;
            floorGeometry.vertices[face.c].z = height;

            const value = (simplex.noise2D(1 * faceCenter.x/scale, 1 * faceCenter.y/scale) + Math.random())/2;

            let decor = null;
            if(value > 0.7) {
                decor = new TreeGrid(level, new THREE.Vector3(faceCenter.x, faceCenter.z, faceCenter.y));
            }

            if(!this.grid[faceCenter.y]) this.grid[faceCenter.y] = [];
            if(!this.grid[faceCenter.y][faceCenter.x]) {
                this.grid[faceCenter.y][faceCenter.x] = {
                    decor: decor,
                    height: height,
                    faces: [],
                    vertices: [],
                    x: faceCenter.x,
                    y: faceCenter.y,
                };
            }

            this.grid[faceCenter.y][faceCenter.x].faces.push(index);
            this.grid[faceCenter.y][faceCenter.x].vertices.push(face.a, face.b, face.c);

            this.grid[faceCenter.y][faceCenter.x].vertices = this.grid[faceCenter.y][faceCenter.x].vertices.filter(
                (element, index, arr) => arr.indexOf(element) === index
            );
        });

        const floorMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x33dd33, 
            flatShading: true,
            roughness: 1.0,
            metalness: 0.0,
            clearCoat: 0.0,
            clearCoatRoughness: 1.0,
            reflectivity: 0.0
        });

        const floorHighlightMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x55ff55, 
            flatShading: true,
            roughness: 1.0,
            metalness: 0.0,
            clearCoat: 0.0,
            clearCoatRoughness: 1.0,
            reflectivity: 0.0
        });

        this.mesh = new THREE.Mesh(floorGeometry, [floorMaterial, floorHighlightMaterial]);
        this.mesh.rotateX(-Math.PI/2);

        level.addToScene(this.mesh, 0, 0.5);
    }

    getGrid(x,y) {

        x /= this.tileSize;
        x = Math.floor(x);
        x *= this.tileSize;

        y /= this.tileSize;
        y = Math.floor(y);
        y *= this.tileSize;

        return this.grid[y][x];
    }
}