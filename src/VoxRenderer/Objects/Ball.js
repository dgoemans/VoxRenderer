import * as THREE from 'three';
import VoxModelLoader from '../VoxModel/VoxModelLoader';
import PhysicsHelper from '../Physics/PhysicsHelper';

export default class Ball {

    constructor(parent, position, rotation) {
        this.onLoad = null;
        this.loadModel(parent, position, rotation);
    }

    async loadModel(parent, position, rotation) {
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load('../models/ball.vox', position, rotation);

        const {shape, center} = PhysicsHelper.createSphere(mesh.geometry);

        mesh.userData.physicsShape = shape;
        mesh.userData.physicsCenter = center;

        parent.addToScene(mesh, 0.5, 1);

        this.onLoad && this.onLoad(mesh);
    }
}