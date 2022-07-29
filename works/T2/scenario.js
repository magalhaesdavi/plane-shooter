import * as THREE from 'three';
import { createGroundPlaneWired, createGroundPlane } from "../../libs/util/util.js";
import { Water } from "../../build/jsm/objects/Water2.js";
import { GLTFLoader } from '../../build/jsm/loaders/GLTFLoader.js';

const textureLoader = new THREE.TextureLoader();

const waterNormal1 = textureLoader.load("./assets/Water_1_M_Normal.jpg");
const waterNormal2 = textureLoader.load("./assets/Water_2_M_Normal.jpg");

{/*
	Classe referente a geração do ambiente do jogo e
	armazenamento das informações do mesmo.
*/}
export class Scenario {
	constructor(height, width) {
		this.clock = 1;
		this.threshold = width/2;
		this.height = height;
		this.width = width;

		this.ground_plane =  createGroundPlaneWired(height, width, 30, 30, 0x9c7f2f);
		this.ground_plane.receiveShadow = true;
		this.ground_plane.position.set(0, -20, 0);
		this.ground_plane.rotation.x = Math.PI * (-0.5);
		
		this.second_ground_plane = createGroundPlaneWired(height, width, 30, 30,0x9c7f2f);
		this.second_ground_plane.receiveShadow = true;
		this.second_ground_plane.position.set(0, -20, 2*width);
		this.second_ground_plane.rotation.x = Math.PI * (-0.5);

		this.waterGeometry = new THREE.PlaneGeometry(160, height);

		this.water = new Water(
			this.waterGeometry,
			{
				color: 0x8888ee,
				scale: 1,
				flowDirection: new THREE.Vector2(1, 1),
				textureWidth: 512,
				textureHeight: 512,
				normalMap0: waterNormal1,
				normalMap1: waterNormal2
			}
		);

		this.water.position.y = 10;
		this.water.rotation.x = Math.PI * (-0.5);
	}

	update(cameraHolder) {
		if (this.clock) {
			if (cameraHolder.position.z - this.threshold <= (this.ground_plane.position.z)) {
				this.second_ground_plane.position.set(0, 0, this.ground_plane.position.z - (this.width / 2));
				this.clock = 0;
			}
		}
		else {
			if (cameraHolder.position.z - this.threshold <= (this.second_ground_plane.position.z)) {
				this.ground_plane.position.set(0, 0, this.second_ground_plane.position.z - (this.width / 2));
				this.clock = 1;
			}			
		}
		this.water.position.z -= 1;
		return;
	}

	reset() {
		this.ground_plane.position.set(0.0, 0.0, -0.02);
		this.second_ground_plane.position.set(0.0, 0.0, -0.02);
		this.water.position.z = 0;
		return;
	}
}
