import * as THREE from 'three';
import { GetLine } from './GridUtils';

const Direction = {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
};

export default class TownGenerator {
    constructor(level) {
        this.level = level;

        this.texture = new THREE.TextureLoader().load('./textures/roads.png');

        this.loader = new THREE.OBJLoader();

        this.buildingMeshes = [];

        this.towns = [];

        Promise.all([
           this.loadObj('./models/building_1.obj'),
           this.loadObj('./models/building_2.obj'), 
        ]).then(() => {
            this.generateTowns();
        });
    }

    loadObj(path) {
        return new Promise((resolve) => {
            this.loader.load(path, (object) => {
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material.map = this.texture;
                    }
                });
    
                this.buildingMeshes.push(object);
                resolve();
            });    
        });
    }

    generateTowns() {
        for(let i=0; i<30; i++) {
            const size = Math.round(4 + Math.random() * 12);
            const maxWidth = 3000 - (size*2) * this.level.terrain.tileSize;

            let x = Math.random() * maxWidth - maxWidth/2;
            x = Math.round(x/this.level.terrain.tileSize)*this.level.terrain.tileSize;

            let y = Math.random() * maxWidth - maxWidth/2;
            y = Math.round(y/this.level.terrain.tileSize)*this.level.terrain.tileSize;

            this.generateTown(size, x, y);

            this.towns.push({
                x: x,
                y: y,
                size: size,
            });
        }
    }

    generateTown(size, x, y) {
        const tileSize = this.level.terrain.tileSize;

        const direction = (Math.random() > 0.5) ? Direction.Vertical : Direction.Horizontal;

        let startX = x - (direction === Direction.Vertical ? 0 : size/2 * tileSize);
        let startY = y - (direction === Direction.Horizontal ? 0 : size/2 * tileSize);

        startX = Math.round(startX/tileSize)*tileSize;
        startY = Math.round(startY/tileSize)*tileSize;

        this.buildingMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x5599ff,
            flatShading: true,
            roughness: 0.5,
            metalness: 0.7,
            clearCoat: 0.5,
            clearCoatRoughness: 1.0,
            reflectivity: 0.5,
        });

        this.generateRoad(direction, startX, startY, size);

        this.generateRoadSubSystems(direction, startX, startY, size);

        this.generateBuildings(size, x, y);
    }

    hasRoadAdjacent(x,y) {
        const tileSize = this.level.terrain.tileSize;

        const up = this.level.terrain.grid[y+tileSize][x];
        const down = this.level.terrain.grid[y-tileSize][x];
        const left = this.level.terrain.grid[y][x-tileSize];
        const right = this.level.terrain.grid[y][x+tileSize];

        return up.road || down.road || left.road || right.road;
    }

    generateBuildings(size, centerX, centerY) {
        const tileSize = this.level.terrain.tileSize;
        const halfSize = Math.floor(size/2);
        for(let y = -halfSize; y<halfSize; y++) {
            for(let x = -halfSize; x<halfSize; x++) {
                const tile = this.level.terrain.grid[centerY+y*tileSize][centerX+x*tileSize];
                const roadAdjacent = this.hasRoadAdjacent(centerX+x*tileSize, centerY+y*tileSize);
                if(!tile.road && !tile.building && roadAdjacent && Math.random() < 0.9) {
                    const buildingIndex = Math.floor(Math.random() * this.buildingMeshes.length);
                    tile.building = this.buildingMeshes[buildingIndex].clone();
                    const vertices = this.level.terrain.mesh.geometry.vertices;

                    const height = tile.vertices.reduce((value, vertex) => Math.min(value, vertices[vertex].z));

                    tile.building.position.set(x*tileSize + centerX + tileSize/2, height, y*tileSize + centerY + tileSize/2);
                    this.level.addToScene(tile.building);
                }
            }
        }
    }

    generateRoadSubSystems(direction, startX, startY, size) {
        
        const tileSize = this.level.terrain.tileSize;
        const gap = 3;

        if(size < gap*2) {
            return;
        }

        for(let i=Math.round(gap/2); i<size; i+=gap) {
            
            const smallSize = Math.round(size/3 + Math.random() * size/3);
            const dirSign = (Math.random() > 0.5) ? -1 : 1;

            const newDirection = (direction === Direction.Vertical) ? Direction.Horizontal : Direction.Vertical;
            const posX = newDirection === Direction.Vertical ? i * tileSize : 0;
            const posY = newDirection === Direction.Horizontal ? i * tileSize : 0;

            this.generateRoad(newDirection, startX + posX, startY + posY, dirSign * smallSize);
            this.generateRoadSubSystems(newDirection, startX + posX, startY + posY, smallSize);
        }
    }

    generateRoad(direction, x, y, length) {
        const tileSize = this.level.terrain.tileSize;

        let endX = (direction === 'vertical' ? x :  (x + length * tileSize));
        let endY = (direction === 'horizontal' ? y :  (y + length * tileSize));

        endX = Math.round(endX/tileSize)*tileSize;
        endY = Math.round(endY/tileSize)*tileSize;

        const line = GetLine(x, y, endX, endY, this.level.terrain.grid, this.level.terrain.tileSize);
        
        this.level.road.addTiles(line);
    }

    fillGaps() {
        this.towns.forEach(town => {
            const halfSize = Math.floor(town.size/2);
            for(let y = -halfSize; y<halfSize; y++) {
                for(let x = -halfSize; x<halfSize; x++) {
                    const tileSize = this.level.terrain.tileSize;
                    const tile = this.level.terrain.grid[town.y+y*tileSize][town.x+x*tileSize];
                    //console.log(tile);
                }
            }    
        });
    }
}