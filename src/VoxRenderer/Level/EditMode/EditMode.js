import ModifyTerrain from "./ModifyTerrain";
import SelectTerrain from "./SelectTerrain";


export default {
    RaiseTerrain: new ModifyTerrain('raise'),
    SmoothTerrain: new ModifyTerrain('smooth'),
    LowerTerrain: new ModifyTerrain('lower'),
    SelectPath: new SelectTerrain(),
    SelectSingle: 4
};