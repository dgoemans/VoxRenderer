import * as THREE from 'three';

export const Directions = {
    Left: 'Left',
    Right: 'Right',
    Forward: 'Forward',
    Backward: 'Backward',
};

export default class Controls {
    constructor(camera) {
        this.camera = camera;
        this.lookatOffset = new THREE.Vector3(0,-100,-100);
        this.camera.position.set(0,100,100);

        this.updateLookat();

        this.movements = {
            Left: false,
            Right: false,
            Forward: false,
            Backward: false,
        }
    }

    updateLookat() {
        const lookAt = this.camera.position.clone();
        lookAt.add(this.lookatOffset);
        this.camera.lookAt(lookAt);
    }

    move(direction) {
        this.movements[direction] = true;
    }

    stop(direction) {
        this.movements[direction] = false;
    }

    zoom(delta) {
        const forward = new THREE.Vector3(0,0,1);
        forward.applyEuler(this.camera.rotation);
        forward.multiplyScalar(delta);
        this.camera.position.add(forward);
        this.updateLookat();
    }

    update(delta) {
        const MovementSpeed = 15;

        if(this.movements.Left) {
            this.camera.position.x -= MovementSpeed*delta;
        } 
        if(this.movements.Right) {
            this.camera.position.x += MovementSpeed*delta;
        }
        if(this.movements.Backward) {
            this.camera.position.z += MovementSpeed*delta;
        }
        if(this.movements.Forward) {
            this.camera.position.z -= MovementSpeed*delta;
        }

        this.updateLookat();
    }
}