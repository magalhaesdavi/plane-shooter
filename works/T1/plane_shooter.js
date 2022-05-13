import * as THREE from  'three';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
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
    
    this.scene.add(main_scenario.plane);
    
    this.scene.add(airplane.cone);
    airplane.cone.position.set(0, 5, 50);
    airplane.cone.rotateX(degreesToRadians(-90));    
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

// create the ground plane
let main_scenario = new Scenario(400, 400);

// Create plane
let airplane = new Airplane();

game.init(airplane, main_scenario);


let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

render();
function render()
{
  requestAnimationFrame(render);
  game.renderer.render(game.scene, game.camera) // Render scene
}
