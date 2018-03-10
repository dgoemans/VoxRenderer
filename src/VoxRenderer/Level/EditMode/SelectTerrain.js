
export default class SelectTerrain {
    constructor() {
        this.startIntersection = null;
        this.currentIntersection = null;
        this.line = [];
    }
    
    activate(intersection, level, pos) {
        if(!this.startIntersection) {
            this.level = level;
            this.startIntersection = intersection;
        }

        this.currentIntersection = intersection;

        this.colorLine(0);

        let tile = this.startIntersection.grid;
        this.line = [tile];
        const tileSize = this.level.terrain.tileSize;

        while(tile.x !== this.currentIntersection.grid.x || tile.y !== this.currentIntersection.grid.y)  {
            const deltaX = Math.sign(this.currentIntersection.grid.x - tile.x)*tileSize;
            const deltaY = Math.sign(this.currentIntersection.grid.y - tile.y)*tileSize;

            if(!!deltaX && !!deltaY) {
                const totalX = Math.abs(this.currentIntersection.grid.x - this.startIntersection.grid.x);
                const totalY = Math.abs(this.currentIntersection.grid.y - this.startIntersection.grid.y);

                const extraTile = (totalX > totalY) ? this.level.terrain.grid[tile.y][tile.x + deltaX] : this.level.terrain.grid[tile.y + deltaY][tile.x];
                this.line.push(extraTile);    
            }

            tile = this.level.terrain.grid[tile.y + deltaY][tile.x + deltaX];
            this.line.push(tile);
        }

        this.colorLine(1);
    }

    colorLine(materialIndex) {
        const geometry = this.currentIntersection.geometry;
        this.line.forEach(tile => {
            tile.faces.forEach(face => geometry.faces[face].materialIndex = materialIndex);
        });
        geometry.groupsNeedUpdate = true;
    }

    deactivate(intersection, level, pos) {
        this.level.tilesSelected(this.line);
        this.colorLine(0);
        this.level = null;
        this.line = [];
        this.startIntersection = null;
        this.currentIntersection = null;
    }

    isActive() {
        return !!this.startIntersection;
    }

    update(delta) {

    }
}