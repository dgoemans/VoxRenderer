import * as THRE from 'three';
        
import SimplexNoise from 'simplex-noise';
import TreeGrid from '../Objects/TreeGrid';

export default class Terrain {
    constructor(level) {
        this.grid = [];

        const tilesWide = 100;
        const tilesHigh = 100;

        const tileSize = 10;

        const totalWidth = tileSize * tilesWide;
        const totalHeight = tileSize * tilesHigh;

        var simplex = new SimplexNoise(Math.random);
        const geometry = new THREE.Geometry();

        let index = 0;

        // for(let y=0; y<tilesHigh; y++) {
        //     this.grid[y] = [];
        //     for(let x=0; x<tilesWide; x++) {
        //         const height = 1 * simplex.noise2D(1 * x, 1 * y) +
        //             0.5 * simplex.noise2D(2 * x, 2 * y) +
        //             0.25 * simplex.noise2D(4 * x, 4 * y);

        //         const value = (simplex.noise2D(1 * x, 1 * y) + Math.random())/2;

        //         let decor = null;
        //         if(value > 0.7) {
        //             decor = new TreeGrid(level, new THREE.Vector3(-totalWidth/2 + x*tileSize, height, -totalHeight/2 + y*tileSize));
        //         }

        //         // TODO: these in pairs.
        //         geometry.vertices.push( new THREE.Vector3( -totalWidth/2 + x*tileSize, height, -totalHeight/2 + y*tileSize ) );
        //         geometry.vertices.push( new THREE.Vector3( -totalWidth/2 + (x+1)*tileSize, height, -totalHeight/2 + y*tileSize ) );
        //         geometry.vertices.push( new THREE.Vector3( -totalWidth/2 + (x+1)*tileSize, height, -totalHeight/2 + (y+1)*tileSize ) );
        //         geometry.vertices.push( new THREE.Vector3( -totalWidth/2 + x*tileSize, height, -totalHeight/2 + (y+1)*tileSize ) );
                
        //         const face1 = new THREE.Face3(index, index+1, index+2);
        //         geometry.faces.push(face1);
        //         const face2 = new THREE.Face3(index, index+3, index+1);
        //         geometry.faces.push(face2);

        //         index += 4;

        //         this.grid[y][x] = {
        //             decor: decor,
        //             height: height,
        //         };
        //     }
        // }

        // geometry.computeFaceNormals();
        // geometry.computeVertexNormals();

        const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        floorGeometry.vertices.forEach(vert => {

            const faceCenter = new THREE.Vector3();

            faceCenter.copy(vert);

            if(vert.x % 20 === 0) {
                faceCenter.x += 5;
            } else {
                faceCenter.x -= 5;
            }

            if(vert.y % 20 === 0) {
                faceCenter.y += 5;
            } else {
                faceCenter.y -= 5;
            }

            const exponent = 0.79;
            const scale = 100;
            const e = 1 * simplex.noise2D(1 * faceCenter.x/scale, 1 * faceCenter.y/scale) +
                0.5 * simplex.noise2D(2 * faceCenter.x/scale, 2 * faceCenter.y/scale) +
                0.25 * simplex.noise2D(4 * faceCenter.x/scale, 4 * faceCenter.y/scale);
            
            vert.z = e*7;

            const value = (simplex.noise2D(1 * faceCenter.x/scale, 1 * faceCenter.y/scale) + Math.random())/2;

            let decor = null;
            if(value > 0.7) {
                decor = new TreeGrid(level, new THREE.Vector3(vert.x, vert.z, -vert.y));
            }


            if(!this.grid[faceCenter.y]) this.grid[faceCenter.y] = [];
            if(!this.grid[faceCenter.y][faceCenter.x]) {
                this.grid[faceCenter.y][faceCenter.x] = {
                    decor: decor,
                    height: vert.z,
                };
            }
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

        this.floor = new THREE.Mesh(floorGeometry, [floorMaterial, floorHighlightMaterial]);
        this.floor.rotateX(-Math.PI/2);

        level.addToScene(this.floor, 0, 0.5);
    }
}