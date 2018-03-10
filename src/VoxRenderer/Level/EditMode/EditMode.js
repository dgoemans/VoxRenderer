import ModifyTerrain from "./ModifyTerrain";


export default {
    RaiseTerrain: new ModifyTerrain('raise'),
    SmoothTerrain: new ModifyTerrain('smooth'),
    LowerTerrain: new ModifyTerrain('lower'),
    SelectPath: 3,
    SelectSingle: 4
};