import * as THREE from 'three';
import 'three/examples/js/libs/ammo';

export default class Physics {
    constructor() {

        const gravity = -9.8;
        const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        const broadphase = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        const softBodySolver = new Ammo.btDefaultSoftBodySolver();
        
        this.physicsWorld = new Ammo.btSoftRigidDynamicsWorld( 
            dispatcher, 
            broadphase, 
            solver, 
            collisionConfiguration, 
            softBodySolver
        );
        this.physicsWorld.setGravity( new Ammo.btVector3( 0, gravity, 0 ) );
        this.physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravity, 0 ) );
        this.registeredObjects = [];
    }

    createRigidBody( threeObject, mass, restitution) {
        const pos = threeObject.position;
        const quat = threeObject.quaternion;

        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        
        var motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        
        const physicsShape = threeObject.userData.physicsShape;
        physicsShape.calculateLocalInertia( mass, localInertia );
        
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
        var body = new Ammo.btRigidBody( rbInfo );

        body.setRestitution(restitution);

        threeObject.userData.physicsBody = body;
        
        if (mass > 0) {
            this.registeredObjects.push(threeObject);

            body.setActivationState(4);
        }

        this.physicsWorld.addRigidBody( body );
    }

    update( deltaTime ) {
        let transformAux1 = new Ammo.btTransform();

        this.physicsWorld.stepSimulation( deltaTime, 10 );

        // Update rigid bodies
        const count = this.registeredObjects.length;

        for ( var i = 0; i < count; i++ ) {
            const objThree = this.registeredObjects[i];
            const objPhys = objThree.userData.physicsBody;
            const state = objPhys.getMotionState();
            if ( state ) {
                state.getWorldTransform(transformAux1);
                const pos = transformAux1.getOrigin();
                const quat = transformAux1.getRotation();
                objThree.position.set(pos.x(), pos.y(), pos.z());
                objThree.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
            }
        }
    }
}