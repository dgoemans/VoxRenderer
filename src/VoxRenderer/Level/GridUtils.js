import * as THREE from 'three';

export function GetLine(x1, y1, x2, y2, grid, tileSize) {

    let tile = grid[y1][x1];
    const line = [tile];

    while(tile.x !== x2 || tile.y !== y2)  {
        const deltaX = Math.sign(x2 - tile.x)*tileSize;
        const deltaY = Math.sign(y2 - tile.y)*tileSize;

        if(!!deltaX && !!deltaY) {
            const totalX = Math.abs(x2 - x1);
            const totalY = Math.abs(y2 - y1);

            const extraTile = (totalX > totalY) ? grid[tile.y][tile.x + deltaX] : grid[tile.y + deltaY][tile.x];
            line.push(extraTile);    
        }

        tile = grid[tile.y + deltaY][tile.x + deltaX];
        line.push(tile);
    }

    return line;
}