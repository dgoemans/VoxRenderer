import * as THREE from 'three';
import 'three/examples/js/loaders/OBJLoader.js';

export default class Tree {
    constructor(level) {
        const manager = new THREE.LoadingManager();
        manager.onProgress = (item, loaded, total) =>  {
            console.log( item, loaded, total );
        };
                
        const textureLoader = new THREE.TextureLoader( manager );
        const texture = textureLoader.load( '../models/tree.png' );
        const loader = new THREE.OBJLoader( manager );
        loader.load( '../models/tree.obj', (object) => {
            object.traverse( function ( child ) {
                if (child instanceof THREE.Mesh) {
                    child.material.map = texture;
                }
            } );
            //object.position.y = - 95;
            level.addToScene(object, 0, 0);
        });
    }
}