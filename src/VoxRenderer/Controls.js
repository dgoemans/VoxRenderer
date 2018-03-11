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
        this.lookat = new THREE.Vector3(0,0,0);
        this.lookatOffset = new THREE.Vector3();
        this.angle = Math.PI/2;

        this.rotate(0);
        
        this.updateCamera();

        this.movements = {
            Left: false,
            Right: false,
            Forward: false,
            Backward: false,
        };

        this.fast = false;
    }

    move(direction, fast) {
        this.movements[direction] = true;
        this.fast = fast;
    }

    stop(direction, fast) {
        this.movements[direction] = false;
        this.fast = fast;
    }

    zoom(delta) {
        const forward = new THREE.Vector3(0,0,1);
        forward.applyEuler(this.camera.rotation);
        forward.multiplyScalar(delta);
        this.lookat.add(forward);
        this.updateCamera();
    }

    rotate(direction) {

        this.angle -= Math.PI/2 * direction;

        if(this.angle > Math.PI*2) {
            this.angle -= Math.PI*2;
        } else if(this.angle < 0) {
            this.angle += Math.PI*2;
        }

        const x = Math.cos(this.angle) * 100;
        const z = Math.sin(this.angle) * 100;
        this.lookatOffset.set(x, 100, z);

        this.updateCamera();
    }

    updateCamera() {
        const position = this.lookat.clone();
        position.add(this.lookatOffset);
        this.camera.position.copy(position);
        this.camera.lookAt(this.lookat);
    }

    update(delta) {

        if(!this.movements.Left && !this.movements.Right && !this.movements.Forward && !this.movements.Backward) {
            return;
        }

        const MovementSpeed = this.fast ? 200 : 50;

        const rotation = new THREE.Euler(0,Math.PI - this.angle,0);

        const forward = new THREE.Vector3(1,0,0);
        forward.applyEuler(rotation);
        forward.multiplyScalar(MovementSpeed*delta);

        const right = new THREE.Vector3(0,0,1);
        right.applyEuler(rotation);
        right.multiplyScalar(MovementSpeed*delta);

        if(this.movements.Left) {
            this.lookat.sub(right);
        } 
        if(this.movements.Right) {
            this.lookat.add(right);
        }
        if(this.movements.Backward) {
            this.lookat.sub(forward);
        }
        if(this.movements.Forward) {
            this.lookat.add(forward);
        }

        this.updateCamera();
    }
}