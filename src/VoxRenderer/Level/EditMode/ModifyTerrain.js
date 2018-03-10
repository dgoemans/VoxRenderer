

const ModifyTime = 0.1;

export default class ModifyTerrain {
    constructor(type) {
        this.type = type;
        this.modifyTimer = ModifyTime;
        this.currentIntersection = null;
    }

    activate(intersection, level, pos) {
        this.currentIntersection = intersection;
    }

    deactivate() {
        this.currentIntersection = null;
        this.modifyTimer = ModifyTime;
    }

    update(delta) {
        if(this.currentIntersection) {

            this.modifyTimer -= delta;

            if(this.modifyTimer < 0) {
                this.modify();	
                this.modifyTimer = ModifyTime;
            }
        }
    }

    isActive() {
        return !!this.currentIntersection;
    }

    modify() {
        const modifyAmount = 0.3;

        switch(this.type) {
            case 'raise':
                this.currentIntersection.grid.vertices.forEach(vertex => {	
                    this.currentIntersection.geometry.vertices[vertex].z += modifyAmount;	
                });	
                break;
            case 'lower':
                this.currentIntersection.grid.vertices.forEach(vertex => {	
                    this.currentIntersection.geometry.vertices[vertex].z -= modifyAmount;	
                });	
                break;
            case 'smooth':
                let zCount = 0;
                let avgZ = 0;
                this.currentIntersection.grid.vertices.forEach(vertex => {	
                    avgZ += this.currentIntersection.geometry.vertices[vertex].z;	
                    zCount++;
                });	
                avgZ /= zCount;
                this.currentIntersection.grid.vertices.forEach(vertex => {	
                    this.currentIntersection.geometry.vertices[vertex].z = avgZ;	
                });	
                break;
        }

        this.currentIntersection.geometry.verticesNeedUpdate = true;
    }
}