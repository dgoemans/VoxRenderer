import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import VoxLoader from './VoxLoader';

export default class VoxRenderer {
    constructor() {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
        

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        
        this.controls = new THREE.OrbitControls( this.camera );
        
        this.camera.position.set(0, 50, -50);
        this.camera.lookAt(new THREE.Vector3(0,0,0))

        const floorGeometry = new THREE.PlaneBufferGeometry( 1024, 1024, 32 );
        floorGeometry.rotateX(-Math.PI/2);
        const floorMaterial = new THREE.MeshStandardMaterial( {color: 0xffff00} );
        this.scene.add(new THREE.Mesh(floorGeometry, floorMaterial));

        
        this.sun = new THREE.DirectionalLight( 0xffffff );
        this.sun.position.set(50,50, 0);
        this.sun.castShadow = true;
        this.scene.add( this.sun );

        document.body.appendChild( this.renderer.domElement );

        this.voxels = [];
        this.materials = [];

        
        this.constructThreeScene('../models/teapot.vox');
    }

    async constructThreeScene(path) {

        const model = await new VoxLoader().load(path);

        const palette = model.RGBA;
        const voxels = model.XYZI;

        const materialGeometryDictionary = {};

        const materials = [];

        palette.forEach((color, index) => {
            const diffuseColor = new THREE.Color(`rgb(${color.r}, ${color.g}, ${color.b})`);
            const material = new THREE.MeshStandardMaterial({color: diffuseColor, opacity: color.a});
            materials.push(material);
            materialGeometryDictionary[index] = [];
        });

        voxels.forEach(voxel => {
            const newVoxel = new THREE.BoxGeometry();
            newVoxel.translate(voxel.x, voxel.z, voxel.y);
            materialGeometryDictionary[voxel.c].push(newVoxel);
        });

        for(let matIndex in materialGeometryDictionary) {
            if(materialGeometryDictionary[matIndex].length) {
                
                const geometry = new THREE.Geometry();
                const matchingMaterial = materials[Number.parseInt(matIndex)];
                
                materialGeometryDictionary[matIndex].forEach(geom => {
                    geometry.merge(geom);
                });

                const mesh = new THREE.Mesh(geometry, matchingMaterial);

                this.voxels.push(mesh);
            }            
            
        }

        this.voxels.forEach(mesh => {
            this.scene.add( mesh );
        })
        

        console.log('Loaded',model);
        
    }

    update() {
        this.controls.update();
    }

    render() {
        this.renderer.render( this.scene, this.camera );
    }
}