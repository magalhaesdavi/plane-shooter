import * as THREE from  'three';

{/**
    Classe referente ao objeto que controla as
    funcionalidades do avião.
*/}
export class Plane {
    constructor() {
        this.geometry = new THREE.ConeGeometry( 2, 3, 32 );
        this.material = new THREE.MeshBasicMaterial();
        this.cone = new THREE.Mesh( this.geometry, this.material );
    }
}