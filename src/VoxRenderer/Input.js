import * as THREE from 'three';
import 'three/examples/js/controls/PointerLockControls';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/libs/ammo';

export default class Input {
    constructor(camera, level) {

        this.level = level;
        this.type = 'OrbitControls';
        this.camera = camera;

        this.controls = new THREE[this.type](camera);
        
        this.raycaster = new THREE.Raycaster();
    
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        }

        if(this.type === 'PointerLockControls') {
            this.controls.enabled = false;
    
            this.canJump = true;
    
            this.velocity = new THREE.Vector3();
            this.direction = new THREE.Vector3();
            
            document.addEventListener( 'keydown', this.onKeyDown, false );
            document.addEventListener( 'keyup', this.onKeyUp, false );                
            
            document.addEventListener( 'pointerlockchange', this.pointerLockChange, false );
            document.addEventListener( 'mozpointerlockchange', this.pointerLockChange, false );
            document.addEventListener( 'webkitpointerlockchange', this.pointerLockChange, false );
            document.addEventListener( 'click', this.acquirePointerLock, false );
    
            this.level.scene.add(this.controls.getObject());
            const center = new THREE.Vector3(0,6,0);
            const lookat = new THREE.Vector3(0,6,-1);
    
            camera.position.copy(center);
            camera.lookAt(lookat);
    
            const shape = new Ammo.btCapsuleShape(6, 20);
            this.collisionObject = new THREE.Object3D();
    
            this.collisionObject.userData.physicsShape = shape;
            this.collisionObject.userData.physicsCenter = center;
            level.addToScene(this.collisionObject, 100, 0.5);
        } else {
            camera.position.set(0,100,100);
            camera.lookAt(0,0,0);

            document.addEventListener( 'keydown', this.onKeyDown, false );
            document.addEventListener( 'keyup', this.onKeyUp, false );
            document.addEventListener( 'mousemove', this.onMousMove, false );

            this.currentIntersection = null;
        }
    }

    acquirePointerLock = (event) => {
        if(this.controls.enabled) {

            const pitchObject = this.controls.getObject().children[0];
            const gunPos = new THREE.Vector3(2,6,-7);
            gunPos.applyQuaternion(pitchObject.getWorldQuaternion());
            gunPos.add(this.controls.getObject().position);

            this.level.addBall(gunPos).onLoad = (ball) => {
                
                const rotatedImpulse = new THREE.Vector3(0,0,-50);
                rotatedImpulse.applyQuaternion(pitchObject.getWorldQuaternion());

                const impulse = new Ammo.btVector3(rotatedImpulse.x, rotatedImpulse.y, rotatedImpulse.z);
                const pos = new Ammo.btVector3(0, 0, 0);
                ball.userData.physicsBody.applyImpulse(impulse, pos);
            }
        } else {
            const element = document.body;
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();    
        }
    }

    pointerLockChange = (event) => {
        const element = document.body;
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            this.controls.enabled = true;
        } else {
            this.controls.enabled = false;
        }
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
                if (this.canJump) this.velocity.y += 350;
                this.canJump = false;
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

    onMousMove = (event) => {
        event.preventDefault();
        const array = this.getMousePosition(document.body, event.clientX, event.clientY);
        const onClickPosition = new THREE.Vector2();
        onClickPosition.fromArray( array );
        const intersects = this.getIntersects(onClickPosition, this.level.floor);
        if (intersects.length > 0) {

            if(this.currentIntersection) {
                this.currentIntersection.face.materialIndex = 0;
                this.currentIntersection.geometry.groupsNeedUpdate = true;
                this.currentIntersection.geometry.verticesNeedUpdate = true;
            }

            const mesh = intersects[0].object;
            const geometry = mesh.geometry;
            const face = geometry.faces[intersects[0].faceIndex];
           
            face.materialIndex = 1;

            
            if(this.movement.forward) {
                geometry.vertices[face.a].z += 0.1;
                geometry.vertices[face.b].z += 0.1;
                geometry.vertices[face.c].z += 0.1;
            }

            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.groupsNeedUpdate = true;


            this.currentIntersection = {
                geometry: geometry,
                face:  face
            }
        }
    }

    getMousePosition(dom, x, y) {
        var rect = dom.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
    }

    getIntersects(point, object) {
        const mouse = new THREE.Vector2((point.x * 2) - 1, -(point.y * 2) + 1);
        this.raycaster.setFromCamera(mouse, this.camera);
        return this.raycaster.intersectObject(object);
    }

    update(delta) {
        if (this.type === 'PointerLockControls' && this.controls.enabled) {

            const object = this.controls.getObject();
            this.raycaster.ray.origin.copy( this.controls.getObject().position );
            this.raycaster.ray.origin.y -= 10;
            const intersections = this.raycaster.intersectObjects( this.level.scene.children );
            const onObject = intersections.length > 0;
            
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
            
            this.direction.z = Number( this.movement.forward ) - Number( this.movement.backward );
            this.direction.x = Number( this.movement.left ) - Number( this.movement.right );
            
            this.direction.normalize(); // this ensures consistent movements in all directions
            if ( this.movement.forward || this.movement.backward ) this.velocity.z -= this.direction.z * 400.0 * delta;
            if ( this.movement.left || this.movement.right ) this.velocity.x -= this.direction.x * 400.0 * delta;

            if ( onObject === true ) {
                this.velocity.y = Math.max( 0, this.velocity.y );
                this.canJump = true;
            }
            object.translateX( this.velocity.x * delta );
            object.translateY( this.velocity.y * delta );
            object.translateZ( this.velocity.z * delta );
            if ( object.position.y < 10 ) {
                this.velocity.y = 0;
                object.position.y = 10;
                this.canJump = true;
            }

            var transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin( new Ammo.btVector3( object.position.x, object.position.y, object.position.z ) );
            transform.setRotation( new Ammo.btQuaternion( object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w ) );

            this.collisionObject.userData.physicsBody.setCenterOfMassTransform(transform);
            this.collisionObject.userData.physicsBody.setLinearVelocity(new Ammo.btVector3(this.velocity.x, this.velocity.y, this.velocity.z));
        } else {
            this.controls.update();

            if(this.movement.forward && this.currentIntersection) {
                this.currentIntersection.geometry.vertices[this.currentIntersection.face.a].z += 0.1;
                this.currentIntersection.geometry.vertices[this.currentIntersection.face.b].z += 0.1;
                this.currentIntersection.geometry.vertices[this.currentIntersection.face.c].z += 0.1;

                this.currentIntersection.geometry.verticesNeedUpdate = true;
                this.currentIntersection.geometry.groupsNeedUpdate = true;
            }

            
        }
    }
}