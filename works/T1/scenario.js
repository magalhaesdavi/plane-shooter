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
		this.plane = createGroundPlaneWired(height, width);
		this.second_plane = createGroundPlaneWired(height, width);
		this.second_plane.position.set(0, 0, 2*width);
	}

	update(cameraHolder) {
		if (this.clock) {
			if (cameraHolder.position.z - this.threshold <= (this.plane.position.z)) {
				this.second_plane.position.set(0, 0, this.plane.position.z - (this.width / 2));
				this.clock = 0;
			}
		}
		else {
			if (cameraHolder.position.z - this.threshold <= (this.second_plane.position.z)) {
				this.plane.position.set(0, 0, this.second_plane.position.z - (this.width / 2));
				this.clock = 1;
			}			
		}
		return;
	}

	reset() {
		this.plane.position.set(0.0, 0.0, -0.02);
		this.second_plane.position.set(0.0, 0.0, -0.02);
		return;
	}
}
