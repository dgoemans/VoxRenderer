import * as THREE from 'three';
import { GetLine } from './GridUtils';

export default class TownGenerator {
    constructor(level) {
        this.level = level;

        for(let i=0; i<30; i++) {
            const size = Math.round(4 + Math.random() * 12);
            const maxWidth = 2000 - (size+2) * level.terrain.tileSize;

            let x = Math.random() * maxWidth - maxWidth/2;
            x = Math.round(x/level.terrain.tileSize)*level.terrain.tileSize;

            let y = Math.random() * maxWidth - maxWidth/2;
            y = Math.round(y/level.terrain.tileSize)*level.terrain.tileSize;

            this.generateTown(size, x, y);
        }
    }

    generateTown(size, x, y) {
        console.log(size,x,y);
        const tileSize = this.level.terrain.tileSize;

        const direction = (Math.random() > 0.5) ? 'vertical' : 'horizontal';

        let startX = x - (direction === 'vertical' ? 0 : size/2 * tileSize);
        let startY = y - (direction === 'horizontal' ? 0 : size/2 * tileSize);

        startX = Math.round(startX/tileSize)*tileSize;
        startY = Math.round(startY/tileSize)*tileSize;

        this.generateRoad(direction, startX, startY, size);

        for(let i=1; i<4; i++) {
            const pos = Math.round(size/4) * i * tileSize;
            const smallSize = Math.round(size/3 + Math.random() * size/3);
            const dirSign = (Math.random() > 0.5) ? -1 : 1;

            if(direction === 'vertical') {    
                this.generateRoad('horizontal', startX, startY + pos, dirSign * smallSize);
            } else {
                this.generateRoad('vertical', startX + pos, startY, dirSign * smallSize);
            }
            
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
}