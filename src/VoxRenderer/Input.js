import * as THREE from 'three';
import 'three/examples/js/controls/PointerLockControls';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/libs/ammo';

export default class Input {
    constructor(camera, level) {

        this.level = level;
        this.camera = camera;

        this.riseTime = 0.2;
        this.riseTimer = this.riseTime;
        
        this.controls = new THREE.OrbitControls(camera);
        
        this.raycaster = new THREE.Raycaster();
    
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        this.mouseDown = false;

        camera.position.set(0,100,100);
        camera.lookAt(0,0,0);

        document.addEventListener( 'mousedown', this.onMouseDown, false );
        document.addEventListener( 'mouseup', this.onMouseUp, false );
        document.addEventListener( 'keydown', this.onKeyDown, false );
        document.addEventListener( 'keyup', this.onKeyUp, false );
        document.addEventListener( 'mousemove', this.onMousMove, false );

        this.currentIntersection = null;
    }

    onKeyDown = (event) => {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                this.movement.forward = true;
                break;
            case 37: // left
            case 65: // a
                this.movement.left = true; 
                break;
            case 40: // down
            case 83: // s
                this.movement.backward = true;
                break;
            case 39: // right
            case 68: // d
                this.movement.right = true;
                break;
            case 32: // space
                break;
        }
    }
    
    onKeyUp = (event) => {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                this.movement.forward = false;
                break;
            case 37: // left
            case 65: // a
                this.movement.left = false;
                break;
            case 40: // down
            case 83: // s
                this.movement.backward = false;
                break;
            case 39: // right
            case 68: // d
                this.movement.right = false;
                break;
        }
    }

    onMouseDown = (event) => {
        this.mouseDown = true;
        this.riseTimer = this.riseTime;
    }

    onMouseUp = (event) => {
        this.mouseDown = false;
    }

    onMousMove = (event) => {
        event.preventDefault();

        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const intersects = this.getIntersects(mouse, this.level.terrain.mesh);
        if (intersects.length > 0) {

            const mesh = intersects[0].object;
            const geometry = mesh.geometry;

            if(this.currentIntersection) {
                this.currentIntersection.grid.faces.forEach(face => geometry.faces[face].materialIndex = 0);
                this.currentIntersection.geometry.groupsNeedUpdate = true;
            }

            const grid = this.level.terrain.getGrid(intersects[0].point.x, intersects[0].point.z);

            grid.faces.forEach(face => geometry.faces[face].materialIndex = 1);

            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.groupsNeedUpdate = true;

            this.currentIntersection = {
                geometry: geometry,
                grid:  grid
            }
        }
    }

    getIntersects(mouse, object) {
        this.raycaster.setFromCamera(mouse, this.camera);
        return this.raycaster.intersectObject(object);
    }

    update(delta) {
        this.controls.update();

        if(this.mouseDown) {
            this.riseTimer -= delta;
        }
        

        if(this.currentIntersection && this.riseTimer < 0) {
            this.currentIntersection.grid.vertices.forEach(vertex => {
                this.currentIntersection.geometry.vertices[vertex].z += 0.3;
            });
            this.currentIntersection.geometry.verticesNeedUpdate = true;

            this.riseTimer = this.riseTime;
        }
    }
}