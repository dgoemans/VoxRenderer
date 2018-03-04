import * as THREE from 'three';
import 'three/examples/js/controls/PointerLockControls';
import 'three/examples/js/libs/ammo';

export default class Input {
    constructor(camera, level) {

        this.level = level;

        this.controls = new THREE.PointerLockControls(camera);
        this.controls.enabled = false;

        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        }

        this.canJump = true;

        this.raycaster = new THREE.Raycaster();
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


    update(delta) {
        if (this.controls.enabled) {

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

            console.log(this.collisionObject.userData.physicsBody.getCollisionFlags());
        }
    }
}