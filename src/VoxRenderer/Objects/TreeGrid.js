import * as THREE from 'three';
import VoxModelLoader from '../VoxModel/VoxModelLoader';

export default class TreeGrid {

    constructor(parent, position, rotation) {
        this.loadModel(parent, position, rotation);
    }

    async loadModel(parent, position, rotation) {
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load('../models/tree_grid_1.vox', position, rotation);

        parent.addToScene(mesh, 0, 0.7);
    }
}