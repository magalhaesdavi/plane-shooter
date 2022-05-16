import * as THREE from  'three';
import { degreesToRadians } from '../../libs/util/util.js';

{/**
    Classe referente ao objeto que controla as
    funcionalidades do avião.
*/}
export class Airplane {
    constructor() {
        this.geometry = new THREE.ConeGeometry( 2, 3, 32 );
        this.material = new THREE.MeshBasicMaterial();
        this.cone = new THREE.Mesh( this.geometry, this.material );
    }

    move(speed) {
        this.cone.translateY(speed);
    }

    setInitialOrResetPosition(initial = true) {
        this.cone.position.set(0, 5, 50);
        if (initial) {
            this.cone.rotateX(degreesToRadians(-90));
        }
    }

    atirar() {
        
    }
}

{/**
    Classe referente ao objeto que controla as
    funcionalidades dos projetes que o avião atira'.
*/}
export class Bullet {
    constructor() {
        //TODO: Implementar criação de projétil
        return;
    }
    create() {
        //TODO: Implementar geração de projétil no jogo
        return;
    }
}