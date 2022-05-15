import { createGroundPlaneWired } from "../../libs/util/util.js";

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
		this.ground_plane = createGroundPlaneWired(height, width);
		this.second_ground_plane = createGroundPlaneWired(height, width);
		this.second_ground_plane.position.set(0, 0, 2*width);
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
		return;
	}

	reset() {
		this.ground_plane.position.set(0.0, 0.0, -0.02);
		this.second_ground_plane.position.set(0.0, 0.0, -0.02);
		return;
	}
}
