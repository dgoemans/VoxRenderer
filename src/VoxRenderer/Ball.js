import * as THREE from 'three';
import VoxModelLoader from './VoxModelLoader';
import PhysicsHelper from './PhysicsHelper';

export default class Ball {

    constructor(parent, position, rotation) {
        this.loadModel(parent, position, rotation);
    }

    async loadModel(parent, position, rotation) {
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load('../models/ball.vox', position, rotation);

        parent.addToScene(mesh, 0.5, 1);
    }
}