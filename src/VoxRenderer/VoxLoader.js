import * as parseMagicaVoxel from 'parse-magica-voxel';


export default class VoxLoader {

    async load(path) {
        const result = await fetch(path);
        const buffer = await result.arrayBuffer();
        return parseMagicaVoxel(buffer);
    }
}