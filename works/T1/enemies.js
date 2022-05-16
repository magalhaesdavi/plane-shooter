import * as THREE from  'three';

//TODO: Implementar funcionalidades e lógica dos inimigos

{/**
    Classe referente ao objeto que controla as
    funcionalidades de um inimigo'.
*/}
export class Enemy {
    constructor(speed) {
        this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
        this.material = new THREE.MeshBasicMaterial();
        this.cube = new THREE.Mesh( this.geometry, this.material );
        this.speed = speed
        return;
    }

    //Define posicao do cubo
    setPosition(x, y, z) {
        this.cube.position.set(x, y, z)
        return;
    }

    //Movimenta com base em sua velocidade
    update() {
        this.cube.translateZ(this.speed);
    }
}

{/**
    Classe referente ao objeto que controla as
    funcionalidades dos adversarios que aparecem ao longo do jogo'.
*/}
export class Enemies {
    constructor () {
        return;
    }
}