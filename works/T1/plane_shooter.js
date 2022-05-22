import * as THREE from 'three';
import KeyboardState from '../../libs/util/KeyboardState.js';  
import {
	initRenderer, 
	initCamera,
	initDefaultBasicLight,
	initBasicMaterial,
	InfoBox,
	onWindowResize,
    degreesToRadians,
	createGroundPlaneWired
} from "../../libs/util/util.js";

import { Scenario } from './scenario.js';
import { Airplane } from './plane.js';
import { Enemy } from './enemies.js';

const SPEED = 1;
let bullets = [];
var enemies = [];

const reset_bullets = () => {
    bullets.forEach(bullet => {
        game.scene.remove(bullet.sphere);
    });
    bullets = [];
};

const reset_enemies = () => {
    enemies.forEach(enemy => {
        game.scene.remove(enemy.cube);
    });
    enemies = [];
};

class Game {
    constructor() {
        this.running = false;
        this.scene = new THREE.Scene();    // Create main scene
        this.renderer = initRenderer();    // Init a basic renderer
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); // Init camera in this position
        this.light = initDefaultBasicLight(this.scene); // Create a basic light to illuminate the scene

        // Creating a holder for the camera
        this.cameraHolder = new THREE.Object3D();
        this.cameraHolder.add(this.camera);
        this.scene.add(this.cameraHolder);
    }

    init(airplane, scenario) {
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set( 0, 1, 0 );
        this.cameraHolder.position.set(0, 70, 91);
        this.cameraHolder.rotateX(degreesToRadians(-40));
        
        this.scene.add(scenario.ground_plane);
        this.scene.add(scenario.second_ground_plane);
        
        this.scene.add(airplane.cone);
        airplane.setInitialOrResetPosition();
    }

    reset(airplane, scenario) {
        this.cameraHolder.position.set(0, 70, 91);
        
        this.scene.add(airplane.cone);
        airplane.setInitialOrResetPosition(false);
    }

    start() {
        this.running = true;
    }

    addOnScene(object) {
        this.scene.add(object);
    }

    //Adiciona novos inimigos em tempo de jogo com posicao e velocidade aleatórias
    update() {
        if (Math.random() > 0.85) {
			var temp = new Enemy(Math.random() * 2);
			temp.setPosition(Math.ceil(Math.random() * 70) * (Math.round(Math.random()) ? 1 : -1), 5,
                this.cameraHolder.position.z - 300);
			enemies.push(temp)
		}
        for(var i = 0; i < enemies.length; i++) {
            this.scene.add(enemies[i].cube)
        }
    }
}

let game = new Game();

// Listen window size changes
window.addEventListener(
    'resize',
    function(){ onWindowResize(game.camera, game.renderer) },
    false 
);

// Show axes (parameter is size of each axis)
//let axesHelper = new THREE.AxesHelper( 12 );
//game.scene.add( axesHelper );

// To use the keyboard
let keyboard = new KeyboardState();

// Create the ground plane
let main_scenario = new Scenario(600, 600);

// Create plane
let airplane = new Airplane();

// Initializing the game
game.init(airplane, main_scenario);

let controls = new InfoBox();
controls.add("Plane Shooter");
controls.addParagraph();
controls.add("Use keyboard to interact:");
controls.add("* Press P to start/pause");
controls.add("* R to reset the game");
controls.add("* Use arrows to move the airplane");
controls.show();

render();

function fullReset() {
    main_scenario.reset();
    game.reset(airplane, main_scenario);
    reset_bullets();
    reset_enemies();
    airplane.cone.scale.set(1, 1, 1)
}

function keyboardUpdate() {
    keyboard.update();

    if ( keyboard.down("P") ) {
        game.running = !game.running;
    }
    if ( keyboard.pressed("R") ) {
        fullReset();
    }

    // Airplane controls
    if ( keyboard.pressed("left") && game.running) {
        if ((airplane.cone.position.x - game.cameraHolder.position.x) > -70 )
            airplane.cone.translateX(-1);
    }
    if ( keyboard.pressed("right") && game.running ) {
        if ((airplane.cone.position.x - game.cameraHolder.position.x) < 70 )
            airplane.cone.translateX(1);
    }
    if ( keyboard.pressed("up") && game.running ) {
        if ((airplane.cone.position.z - game.cameraHolder.position.z) > -200 )
            airplane.cone.translateY(1);
    }
    if ( keyboard.pressed("down") && game.running ) {
        if ((airplane.cone.position.z - game.cameraHolder.position.z) < -40 )
            airplane.cone.translateY(-1);
    }
    if ((keyboard.pressed("space") || keyboard.down("ctrl")) && game.running ) {
        let bullet = airplane.shoot(SPEED, airplane, game);
        if(bullet != null) {
            bullets.push(bullet);
        }
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

//Checa se os objetos saíram da tela ou colidiram
async function checkBoundariesAndCollisions() {

    for(var i = 0; i < enemies.length; i++) {
        enemies[i].update();
        
        //Removendo inimigos que saíram da tela
        if(enemies[i].cube.position.z > game.cameraHolder.position.z) {
            game.scene.remove(enemies[i].cube);
            enemies.splice(i, 1);
            i--;
            if(i >= enemies.length || i < 0) {
                break;
            }
        }
        
        //Removendo inimigos e mísseis que colidiram
        var shot = enemies[i].checkMissileCollision(bullets);
        if(shot > -1){
            game.scene.remove(bullets[shot].sphere);
            bullets.splice(shot, 1);
            
            let temp_cube = enemies[i].cube
            enemies.splice(i, 1);

            //Animação de colisão
            gsap.to(temp_cube.rotation, {y: 3.15, duration: 0.25});
            gsap.to(temp_cube.position, {z: temp_cube.position.z - 20, duration: 0.25});
            await sleep(500);
            game.scene.remove(temp_cube);
            i--;
        }
        
        //Verificar se ainda há inimigos em jogo antes de verificar colisão com avião
        if(i >= enemies.length || i < 0) {
            break;
        }

        //Removendo inimigos e avião que colidiram
        var crash = enemies[i].checkPlaneCollision(airplane)
        if(crash) {
            //Animação de colisão
            gsap.to(airplane.cone.scale, {x:0, y: 0, z: 0, duration: 0.25});
            await sleep(500);
            fullReset();
        }
    }

    //Removendo mísseis que saíram da tela
    for(var i = 0; i < bullets.length; i++) {
        if(bullets[i].sphere.position.z < game.cameraHolder.position.z - 200) {
            game.scene.remove(bullets[i].sphere);
            bullets.splice(i, 1);
        }
    }

}

function render()
{
    keyboardUpdate();
    if (game.running) {
        //Movimento dos mísseis
        bullets.forEach(bullet => {
        bullet.update();
        });
        
        //Movimento do avião
        airplane.update(SPEED);

        main_scenario.update(game.cameraHolder);
        game.update();
        game.cameraHolder.position.z -= SPEED;

        //Movimento dos inimigos
        checkBoundariesAndCollisions();

    }
    requestAnimationFrame(render);
    game.renderer.render(game.scene, game.camera) // Render scene
}
