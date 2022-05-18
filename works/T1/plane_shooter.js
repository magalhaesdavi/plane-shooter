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
var enemies = [];
let bullets = [];

const resetBullets = () => {
  bullets.forEach(element => {
    game.scene.remove(element.sphere);
  });
  bullets = [];
};

class Game {
  constructor() {
    this.running = false;
    this.scene = new THREE.Scene();    // Create main scene
    this.renderer = initRenderer();    // Init a basic renderer
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); // Init camera in this position
    this.light = initDefaultBasicLight(this.scene); // Create a basic light to illuminate the scene
    //this.orbit = new OrbitControls( this.camera, this.renderer.domElement ); // Enable mouse rotation, pan, zoom etc.  

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
    if (Math.random() > 0.98) {
			let new_enemy = new Enemy(Math.random() * 2);
			new_enemy.setPosition(
        Math.ceil(Math.random() * 70) * (Math.round(Math.random()) ? 1 : -1),
        5,
        game.cameraHolder.position.z - 300
      );
			enemies.push(new_enemy)
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
let axesHelper = new THREE.AxesHelper( 12 );
game.scene.add( axesHelper );

// To use the keyboard
let keyboard = new KeyboardState();

// Create the ground plane
let main_scenario = new Scenario(600, 600);
// Create plane
let airplane = new Airplane();

// Initializing the game
game.init(airplane, main_scenario);
//game.start()

let controls = new InfoBox();
  controls.add("Plane Shooter");
  controls.addParagraph();
  controls.add("Use keyboard to interact:");
  controls.add("* Press P to start/pause");
  controls.add("* R to reset the game");
  controls.add("* Use Arrows do move the airplane");
  controls.show();

render();

function keyboardUpdate() {

  keyboard.update();

  if ( keyboard.down("P") ) {
    game.running = !game.running;
  }
  if ( keyboard.pressed("R") ) {
    main_scenario.reset();
    game.reset(airplane, main_scenario);
    resetBullets();
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
  if ((keyboard.down("space") || keyboard.down("ctrl")) && game.running ) {
    let bullet = airplane.shoot(SPEED, airplane, game);
    bullets.push(bullet);
  }

}

function render()
{
  keyboardUpdate();
  if (game.running) {
    airplane.move(SPEED);
    game.cameraHolder.position.z -= SPEED;
    main_scenario.update(game.cameraHolder);
    game.update();

    //Movimento dos inimigos
    for(var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }

    //Bullets movement
    bullets.forEach(element => {
      element.update();
    });
  }
  requestAnimationFrame(render);
  game.renderer.render(game.scene, game.camera) // Render scene
}
