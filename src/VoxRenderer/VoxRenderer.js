import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import VoxLoader from './VoxLoader';

export default class VoxRenderer {
    constructor() {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 2048 );
        

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor(0x5588ff, 1);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.controls = new THREE.OrbitControls( this.camera );
        
        this.camera.position.set(0, 90, 90);
        this.camera.lookAt(new THREE.Vector3(0,0,0))

        this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambient);
        
        const shadowWidth = 512;
        this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
        this.sun.position.set(128,256,256);
        this.sun.target.position.set(0,0,0);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.left = -shadowWidth;
        this.sun.shadow.camera.bottom = -shadowWidth;
        this.sun.shadow.camera.right = shadowWidth;
        this.sun.shadow.camera.top = shadowWidth;
        this.sun.shadow.camera.near = 0.5;
        this.sun.shadow.camera.far = 2048;
        this.sun.shadow.radius = 3.0;
        this.sun.shadow.bias = 0.00005;
        this.scene.add(this.sun);

        // const shadowCameraHelper = new THREE.CameraHelper(this.sun.shadow.camera);
        // this.scene.add(shadowCameraHelper)

        const floorGeometry = new THREE.PlaneBufferGeometry(1024, 1024, 128, 128);
        floorGeometry.rotateX(-Math.PI/2);
        const floorMaterial = new THREE.MeshStandardMaterial({color: 0xffff00, metalness: 0, flatShading: true });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow = true;
        this.scene.add(floor);

        document.body.appendChild( this.renderer.domElement );

        this.voxels = [];
        this.materials = [];

        
        this.constructThreeScene('../models/castle.vox');
    }

    async constructThreeScene(path) {

        const model = await new VoxLoader().load(path);

        const palette = model.RGBA;
        const voxels = model.XYZI;

        const materialGeometryDictionary = {};

        const materials = [];

        palette.forEach((color, index) => {
            const diffuseColor = new THREE.Color(`rgb(${color.r}, ${color.g}, ${color.b})`);
            const material = new THREE.MeshStandardMaterial({color: diffuseColor, opacity: color.a, metalness: 0, flatShading: true});
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

                geometry.mergeVertices();

                const mesh = new THREE.Mesh(geometry, matchingMaterial);
                mesh.receiveShadow = true;
                mesh.castShadow = true;

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