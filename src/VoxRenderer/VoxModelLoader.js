import * as THREE from 'three';
import VoxLoader from './VoxLoader';

import monotone from './MeshOptimizers/monotone';
import stupid from './MeshOptimizers/stupid';
import greedy from './MeshOptimizers/greedy';

class VoxModelLoader {

    parseVoxels(voxels, volumes, sizes, current) {
        const size = Array.isArray(sizes) ? sizes[current] : sizes;
        const volume = volumes[current];
        voxels.forEach(voxel => {
            if(Array.isArray(voxel)) {
                volumes[++  current] = [];
                this.parseVoxels(voxel, volumes, sizes, current)
            } else if(voxel.c !== 0) {
                const index = voxel.x + (voxel.z + voxel.y*size.z)*size.x;
                volume[index] = voxel.c;
            } 
        });
    }

    async load(path, position, rotation) {

        const meshes = [];

        position = position || new THREE.Vector3(0,0,0);
        rotation = rotation || new THREE.Euler();

        const model = await new VoxLoader().load(path);

        console.log('Loaded model',model);

        const palette = model.RGBA;
        const voxels = model.XYZI;
        const sizes = model.SIZE;

        const volumes = [[]];
        let index = 0;
        
        this.parseVoxels(voxels, volumes, sizes, 0);

        const materials = [];

        palette.forEach((color, index) => {
            const diffuseColor = new THREE.Color(`rgb(${color.r}, ${color.g}, ${color.b})`);
            const material = new THREE.MeshStandardMaterial({
                color: diffuseColor, 
                opacity: color.a, 
                metalness: 0, 
                flatShading: false,
                roughness: 1.0,
            });

            materials.push(material);
        });

        console.log(volumes);

        const geometry = new THREE.Geometry();

        volumes.forEach((volume, index) => {
            const size = Array.isArray(sizes) ? sizes[index] : sizes;
            const nextGeo = this.createSimplifiedGeometry(volume, materials, size, monotone);
            geometry.merge(nextGeo);
        });

        const bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

        const mesh = new THREE.Mesh( geometry );
        mesh.material = materials;

        mesh.receiveShadow = true;
        mesh.castShadow = true;

        mesh.position.copy(position);
        mesh.rotation.copy(rotation);

        return mesh;
    }

    createSimplifiedGeometry(volume, materials, size, simplifyFunc) {
        const result = simplifyFunc(volume, [size.x, size.z, size.y]);

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
            face3.materialIndex = (face[4] || face[3])-1;
            face3.vertexColors = [face3.color,face3.color,face3.color];
            geometry.faces.push(face3);
        }

        geometry.computeFaceNormals();
      
        geometry.verticesNeedUpdate = true;
        geometry.elementsNeedUpdate = true;
        geometry.normalsNeedUpdate = true;
        
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        return geometry;
    }
}

export default VoxModelLoader;