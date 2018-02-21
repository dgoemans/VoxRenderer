import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/modifiers/SimplifyModifier';
import monotone from './MeshOptimizers/monotone';
import stupid from './MeshOptimizers/stupid';
import VoxLoader from './VoxLoader';

import 'three/examples/js/shaders/DepthLimitedBlurShader.js'
import 'three/examples/js/shaders/UnpackDepthRGBAShader.js'

import 'three/examples/js/shaders/SAOShader.js'
import 'three/examples/js/shaders/SSAOShader.js'
import 'three/examples/js/shaders/CopyShader.js'
import 'three/examples/js/shaders/BokehShader.js'

import 'three/examples/js/postprocessing/EffectComposer.js'
import 'three/examples/js/postprocessing/RenderPass.js'
import 'three/examples/js/postprocessing/ShaderPass.js'
import 'three/examples/js/postprocessing/MaskPass.js'
import 'three/examples/js/postprocessing/SSAOPass.js'
import 'three/examples/js/postprocessing/SAOPass.js'
import 'three/examples/js/postprocessing/BokehPass.js'

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

        this.ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambient);
        
        const shadowWidth = 128;
        const shadowMapSize = 2048;
        this.sun = new THREE.DirectionalLight(0xffffff, 0.4);
        this.sun.position.set(128,256,256);
        this.sun.target.position.set(0,0,0);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = shadowMapSize;
        this.sun.shadow.mapSize.height = shadowMapSize;
        this.sun.shadow.camera.left = -shadowWidth;
        this.sun.shadow.camera.bottom = -shadowWidth;
        this.sun.shadow.camera.right = shadowWidth;
        this.sun.shadow.camera.top = shadowWidth;
        this.sun.shadow.camera.near = 0.5;
        this.sun.shadow.camera.far = 2048;
        //this.sun.shadow.radius = 3;
        //this.sun.shadow.bias = -0.001;
        this.scene.add(this.sun);


        const floorGeometry = new THREE.PlaneBufferGeometry(1024, 1024, 128, 128);
        floorGeometry.rotateX(-Math.PI/2);
        const floorMaterial = new THREE.MeshStandardMaterial({color: 0xffff00, metalness: 0, flatShading: true });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow = true;
        this.scene.add(floor);

        document.body.appendChild( this.renderer.domElement );

        this.initPostprocessing();

        this.addVoxelModel('../models/ephtracy.vox', new THREE.Vector3(0,0,0));
        this.addVoxelModel('../models/bowl_bone2.vox', new THREE.Vector3(40,0,0));
        this.addVoxelModel('../models/castle.vox', new THREE.Vector3(-40,0,0));
        //this.addVoxelModel('../models/monu6.vox', new THREE.Vector3(-180,0,0));
        this.addVoxelModel('../models/teapot.vox', new THREE.Vector3(80,0,0));
        //this.addVoxelModel('../models/ground.vox', new THREE.Vector3(180,0,0));
    }

    async addVoxelModel(path, position) {

        const model = await new VoxLoader().load(path);

        console.log('Loaded model',model);

        const palette = model.RGBA;
        const voxels = model.XYZI;

        const volume = [];
        let index = 0;
        
        voxels.forEach(voxel => {
            if(voxel.c === 0) {
                return;
            }
            const index = voxel.x + (voxel.z + voxel.y*model.SIZE.z)*model.SIZE.x;
            volume[index] = voxel.c;
        });

        const materials = [];

        palette.forEach((color, index) => {
            const diffuseColor = new THREE.Color(`rgb(${color.r}, ${color.g}, ${color.b})`);
            const material = new THREE.MeshStandardMaterial({color: diffuseColor, opacity: color.a, metalness: 0, flatShading: true});
            materials.push(material);
        });

        console.log(volume);

        const mesh = this.generateSimplifiedMesh(volume, materials, model.SIZE, stupid);
        // const mesh = this.generateSimplifiedMesh(volume, materials, model.SIZE, monotone);
        // const mesh = this.generateBoxMesh(voxels, materials);

        mesh.receiveShadow = true;
        mesh.castShadow = true;

        this.scene.add(mesh);

        console.log('Mesh ready');

        mesh.position.copy(position);
    }

    generateBoxMesh(voxels, materials) {
        const geometry = new THREE.Geometry();

        voxels.forEach(voxel => {
            if(voxel.c === 0) {
                return;
            }
            const nextVoxel = new THREE.BoxGeometry(1,1,1,1);
            nextVoxel.translate(voxel.x, voxel.z, voxel.y);
            geometry.merge(nextVoxel, undefined, voxel.c);
        });

        geometry.mergeVertices();
        geometry.computeFaceNormals();
      
        geometry.verticesNeedUpdate = true;
        geometry.elementsNeedUpdate = true;
        geometry.normalsNeedUpdate = true;
        
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        const bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

        const surfacemesh = new THREE.Mesh( bufferGeometry );
        surfacemesh.material = materials;

        return surfacemesh;
    }

    generateSimplifiedMesh(volume, materials, size, simplifyFunc) {
        const result = simplifyFunc(volume, [size.y, size.z, size.x]);

        console.log(result);

        const geometry = new THREE.Geometry();
        geometry.vertices.length = 0;
        geometry.faces.length = 0;
        for(let i=0; i<result.vertices.length; ++i) {
            const vert = result.vertices[i];
            geometry.vertices.push(new THREE.Vector3(vert[0], vert[1], vert[2]));
        }

        for(let i=0; i<result.faces.length; ++i) {
            const face = result.faces[i];
            const face3 = new THREE.Face3(face[0], face[1], face[2]);
            face3.materialIndex = face[4] || face[3];
            face3.vertexColors = [face3.color,face3.color,face3.color];
            geometry.faces.push(face3);
        }

        geometry.computeFaceNormals();
      
        geometry.verticesNeedUpdate = true;
        geometry.elementsNeedUpdate = true;
        geometry.normalsNeedUpdate = true;
        
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        const surfacemesh = new THREE.Mesh( geometry );
        surfacemesh.material = materials;
        surfacemesh.doubleSided = true;

        return surfacemesh;
    }

    initPostprocessing() {
        const { width, height } = this.renderer.getSize();
        
        this.effectComposer = new THREE.EffectComposer( this.renderer );

        const renderPass = new THREE.RenderPass( this.scene, this.camera );
        this.effectComposer.addPass( renderPass );

        const ssaoConfig = { enabled: true, onlyAO: false, radius: 3, aoClamp: 0.15, lumInfluence: 0.7 };
        const ssaoPass = new THREE.SSAOPass( this.scene, this.camera );
        ssaoPass.onlyAO = ssaoConfig.onlyAO;
        ssaoPass.enabled = ssaoConfig.enabled;
        ssaoPass.radius = ssaoConfig.radius;
        ssaoPass.aoClamp = ssaoConfig.aoClamp;
        ssaoPass.lumInfluence = ssaoConfig.lumInfluence;
        ssaoPass.setSize( width, height );
        ssaoPass.renderToScreen = true;
        this.effectComposer.addPass( ssaoPass );

        const bokehPass = new THREE.BokehPass( this.scene, this.camera, {
            focus: 		3000.0,
            aperture:	5.0,
            maxblur:	0.00,
            width: width,
            height: height
        } );
        bokehPass.renderToScreen = true;
        //this.effectComposer.addPass( bokehPass );

        const saoPass = new THREE.SAOPass( this.scene, this.camera, false, true );
        saoPass.renderToScreen = true;
        //this.effectComposer.addPass(saoPass);
        
        var pixelRatio = this.renderer.getPixelRatio();
        var newWidth  = Math.floor( width / pixelRatio ) || 1;
        var newHeight = Math.floor( height / pixelRatio ) || 1;
        this.effectComposer.setSize( newWidth, newHeight );
    }

    update() {
        this.controls.update();
    }

    render() {
        this.effectComposer.render();
        //this.renderer.render( this.scene, this.camera );
    }
}