import * as THREE from  'three';

export class Plane {
    constructor() {
        this.geometry = new THREE.ConeGeometry( 5, 20, 32 );
        this.material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.cone = new THREE.Mesh( this.geometry, this.material );
    }
}