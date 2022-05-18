import * as THREE from  'three';

//TODO: Implementar funcionalidades e lógica dos inimigos

{/**
    Classe referente ao objeto que controla as
    funcionalidades de um inimigo'.
*/}
export class Enemy {
    constructor(speed) {
        this.geometry = new THREE.BoxGeometry( 4, 4, 4 );
        this.material = new THREE.MeshBasicMaterial();
        this.cube = new THREE.Mesh( this.geometry, this.material );
        this.speed = speed;
        this.boundingBox = new THREE.Box3().setFromObject(this.cube);
        // this.cube.geometry.computeBoundingBox();
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
        this.boundingBox.copy(this.cube.geometry.boundingBox).applyMatrix4(this.cube.matrixWorld);
    }

    checkMissileCollision(missiles) {
        for(var i = 0; i < missiles.length; i++) {
            if(this.boundingBox.intersectsBox(missiles[i].boundingBox)) {
                // console.log("hit");
                // this.cube.translateZ(-15);
                return i;
            }
        }
        return -1;
    }

    checkPlaneCollision(plane) {
        if(this.boundingBox.intersectsBox(plane.boundingBox)) {
            return true;
        }
        else {
            return false;
        }
    }
}

{/**
    Classe referente ao objeto que controla as
    funcionalidades dos adversarios que aparecem ao longo do jogo'.
*/}
export class Enemies extends Array {
    constructor (items = null) {
        super();
        items && this.addItems(items);
    }

    serialize(items) {
        this.splice(0, this.length);
        this.addItems(items);
    }

    addItems(items) {
        if (typeof items == 'Array') {
            items.forEach(item => {
                this.push(item);
            });
        }
    }

    enemies_update(game) {
        if (Math.random() > 0.98) {
			let new_enemy = new Enemy(Math.random() * 2);
			new_enemy.setPosition(
                Math.ceil(Math.random() * 70) * (Math.round(Math.random()) ? 1 : -1),
                5,
                game.cameraHolder.position.z - 300
            );
			this.push(new_enemy)
		}
        for(var i = 0; i < this.length; i++) {
            game.scene.add(this[i].cube)
        }       
    }

    update(bullets=null) {
        //Movimento dos inimigos
        this.forEach(enemy => {
            enemy.update();
        });
    }

    reset(game) {
        this.forEach(enemy => {
            game.scene.remove(enemy.cube);
        });
        this.splice(0, this.length-1);
    }
}
