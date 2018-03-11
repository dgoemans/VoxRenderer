import * as THREE from 'three';

export default class Road {

    constructor(level) {
        const geometry = new THREE.Geometry();
        const texture = new THREE.TextureLoader().load('./textures/roads.png');
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            flatShading: true,
            roughness: 1.0,
            metalness: 0.0,
            clearCoat: 0.0,
            clearCoatRoughness: 1.0,
            reflectivity: 0.0,
            transparent: true,
            opacity: 1.0,
            map: texture,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        level.addToScene(this.mesh);

        this.level = level;
    }

    addToGrid (tiles) {
        const grid = this.level.terrain.grid;

        tiles.forEach(tile => {
            grid[tile.y][tile.x].road = true;
        });
    }

    addTiles(tiles) {
        const geometry = this.mesh.geometry;
        const terrainMesh = this.level.terrain.mesh;
        const grid = this.level.terrain.grid;

        this.addToGrid(tiles);

        let index = 0;

        geometry.vertices = [];
        geometry.faces = [];
        geometry.faceVertexUvs[0] = [];

        for(const y in grid) {
            if(!grid.hasOwnProperty(y)) {
                continue;
            }
            for(const x in grid[y]) {
                if(!grid[y].hasOwnProperty(x)) {
                    continue;
                }
                const tile = grid[y][x];
                if(tile && tile.road) {

                    if(tile.building) {
                        this.level.scene.remove(tile.building);
                    } else if(tile.decor) {
                        this.level.scene.remove(tile.decor);
                    }

                    tile.vertices.forEach(vertex => {
                        const newVertex = terrainMesh.geometry.vertices[vertex].clone();
                        newVertex.applyEuler(terrainMesh.rotation);
                        newVertex.y += 0.01;
                        geometry.vertices.push(newVertex);
                    });
    
                    const uvs = this.getUvs(tile, grid, this.level.terrain.tileSize);
                    uvs.forEach(uv => geometry.faceVertexUvs[0].push(uv));
    
                    geometry.faces.push( new THREE.Face3(index, index+1, index+2));
                    geometry.faces.push( new THREE.Face3(index+2, index+1, index+3));
    
                    index += 4;    
                }
            }
        }

        geometry.elementsNeedUpdate = true;
        geometry.verticesNeedUpdate = true;
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
    }

    getUvs(tile, grid, tileSize) {
        const up = grid[tile.y-tileSize] ? grid[tile.y-tileSize][tile.x].road : false;
        const down = grid[tile.y+tileSize] ? grid[tile.y+tileSize][tile.x].road : false;
        const left = grid[tile.y][tile.x-tileSize] ? grid[tile.y][tile.x-tileSize].road : false;
        const right = grid[tile.y][tile.x+tileSize] ? grid[tile.y][tile.x+tileSize].road : false;
        const uvSize = 0.5;
        const uvs = [];

        // 0,1,2
        // 2,1,3

        if(up && down && left && right) {
            uvs.push([new THREE.Vector2(uvSize,uvSize),
                new THREE.Vector2(1,uvSize),
                new THREE.Vector2(uvSize,0)]);
    
            uvs.push([new THREE.Vector2(uvSize,0),
                    new THREE.Vector2(1,uvSize),
                    new THREE.Vector2(1,0)]);
        } else if(up && right && left) {
            uvs.push([new THREE.Vector2(0,0),
                new THREE.Vector2(0,uvSize),
                new THREE.Vector2(uvSize,0)]);
    
            uvs.push([new THREE.Vector2(uvSize,0),
                    new THREE.Vector2(0,uvSize),
                    new THREE.Vector2(uvSize,uvSize)]);
        } else if(down && right && left) {
            uvs.push([new THREE.Vector2(0,uvSize),
                new THREE.Vector2(0,0),
                new THREE.Vector2(uvSize,uvSize)]);
    
            uvs.push([new THREE.Vector2(uvSize,uvSize),
                    new THREE.Vector2(0,0),
                    new THREE.Vector2(uvSize,0)]);
        } else if(down && up && left) {
            uvs.push([new THREE.Vector2(uvSize,0),
                new THREE.Vector2(0, 0),
                new THREE.Vector2(uvSize,uvSize)]);
    
            uvs.push([new THREE.Vector2(uvSize,uvSize),
                    new THREE.Vector2(0, 0),
                    new THREE.Vector2(0,uvSize)]);
        } else if(down && up && right) {
            uvs.push([new THREE.Vector2(0,uvSize),
                new THREE.Vector2(uvSize, uvSize),
                new THREE.Vector2(0,0)]);
    
            uvs.push([new THREE.Vector2(0,0),
                    new THREE.Vector2(uvSize, uvSize),
                    new THREE.Vector2(uvSize,0)]);
        } else if(up && down) {
            uvs.push([new THREE.Vector2(0,1),
                new THREE.Vector2(0,uvSize),
                new THREE.Vector2(uvSize,1)]);
    
            uvs.push([new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(0,uvSize),
                    new THREE.Vector2(uvSize,uvSize)]);
        } else if(left && right) {
            uvs.push([new THREE.Vector2(0,1),
                new THREE.Vector2(uvSize,1),
                new THREE.Vector2(0,uvSize)]);
    
            uvs.push([new THREE.Vector2(0,uvSize),
                    new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(uvSize,uvSize)]);
        } else if(up && left) {
            uvs.push([new THREE.Vector2(1,uvSize),
                new THREE.Vector2(1,1),
                new THREE.Vector2(uvSize,uvSize)]);
    
            uvs.push([new THREE.Vector2(uvSize,uvSize),
                    new THREE.Vector2(1,1),
                    new THREE.Vector2(uvSize,1)]);
        } else if(up && right) {
            uvs.push([new THREE.Vector2(1,1),
                new THREE.Vector2(uvSize,1),
                new THREE.Vector2(1,uvSize)]);
    
            uvs.push([new THREE.Vector2(1,uvSize),
                    new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(uvSize,uvSize)]);
        } else if(down && left) {
            uvs.push([new THREE.Vector2(1,1),
                new THREE.Vector2(1,uvSize),
                new THREE.Vector2(uvSize,1)]);
    
            uvs.push([new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(1,uvSize),
                    new THREE.Vector2(uvSize,uvSize)]);
        } else if(down && right) {
            uvs.push([new THREE.Vector2(uvSize,1),
                new THREE.Vector2(1,1),
                new THREE.Vector2(uvSize,uvSize)]);
    
            uvs.push([new THREE.Vector2(uvSize,uvSize),
                    new THREE.Vector2(1,1),
                    new THREE.Vector2(1,uvSize)]);
        } else if(up || down) {
            uvs.push([new THREE.Vector2(0,1),
                new THREE.Vector2(0,uvSize),
                new THREE.Vector2(uvSize,1)]);
    
            uvs.push([new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(0,uvSize),
                    new THREE.Vector2(uvSize,uvSize)]);
        } else if(left || right) {
            uvs.push([new THREE.Vector2(0,1),
                new THREE.Vector2(uvSize,1),
                new THREE.Vector2(0,uvSize)]);
    
            uvs.push([new THREE.Vector2(0,uvSize),
                    new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(uvSize,uvSize)]);
        } else {
            uvs.push([new THREE.Vector2(0,1),
                new THREE.Vector2(uvSize,1),
                new THREE.Vector2(0,uvSize)]);
    
            uvs.push([new THREE.Vector2(0,uvSize),
                    new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(uvSize,uvSize)]);
        }

        return uvs;
    }

    oldUvs(tiles, index) {
        const tile = tiles[index];
        const prev = (index > 0) ? tiles[index-1] : tile;;
        const next = (index+1 < tiles.length) ? tiles[index+1] : tile;

        const uvs = [];

        const uvSize = 0.5;

        if(prev.y === tile.y && tile.y === next.y) {
            uvs.push([new THREE.Vector2(0,1),
                new THREE.Vector2(uvSize,1),
                new THREE.Vector2(0,1-uvSize)]);
    
            uvs.push([new THREE.Vector2(0,1-uvSize),
                    new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(uvSize,1-uvSize)]);    
        } else if(prev.x === tile.x && tile.x === next.x) {
            uvs.push([new THREE.Vector2(0,1),
                new THREE.Vector2(0,1-uvSize),
                new THREE.Vector2(uvSize,1)]);
    
            uvs.push([new THREE.Vector2(uvSize,1),
                    new THREE.Vector2(0,1-uvSize),
                    new THREE.Vector2(uvSize,1-uvSize)]);
        }

        return uvs;
    }
}