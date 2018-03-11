import { GetLine } from "../GridUtils";

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

        this.line = GetLine(this.startIntersection.grid.x, this.startIntersection.grid.y, 
            this.currentIntersection.grid.x, this.currentIntersection.grid.y,
            this.level.terrain.grid, 
            this.level.terrain.tileSize);

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