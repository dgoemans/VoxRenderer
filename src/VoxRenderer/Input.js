import * as THREE from 'three';
import 'three/examples/js/controls/PointerLockControls';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/libs/ammo';

export default class Input {
    constructor(level) {
        this.level = level;

        document.addEventListener( 'mousedown', this.onMouseDown, false );
        document.addEventListener( 'mouseup', this.onMouseUp, false );
        document.addEventListener( 'keydown', this.onKeyDown, false );
        document.addEventListener( 'keyup', this.onKeyUp, false );
        document.addEventListener( 'mousemove', this.onMousMove, false );
        document.addEventListener( 'wheel', this.onMouseWheel, false );
    }

    onMouseWheel = (event) => {
        this.level.onWheel(event.deltaY, event.shiftKey, event.ctrlKey);
    }

    onKeyDown = (event) => {
        this.level.onKeyDown(event.keyCode, event.shiftKey, event.ctrlKey);
    }
    
    onKeyUp = (event) => {
        this.level.onKeyUp(event.keyCode, event.shiftKey, event.ctrlKey);
    }

    convertMouseToViewport(event) {
        const viewport = new THREE.Vector2();
        viewport.x = (event.clientX / window.innerWidth) * 2 - 1;
        viewport.y = -(event.clientY / window.innerHeight) * 2 + 1;
        return viewport;
    }

    onMouseDown = (event) => {
        event.preventDefault();
        const viewport = this.convertMouseToViewport(event);
        this.level.onMouseDown(viewport, event.shiftKey, event.ctrlKey);
    }

    onMouseUp = (event) => {
        event.preventDefault();
        const viewport = this.convertMouseToViewport(event);
        this.level.onMouseUp(viewport, event.shiftKey, event.ctrlKey);
    }

    onMousMove = (event) => {
        event.preventDefault();
        const viewport = this.convertMouseToViewport(event);
        this.level.onMouseMove(viewport, event.shiftKey, event.ctrlKey);
    }

    update(delta) {
    }
}