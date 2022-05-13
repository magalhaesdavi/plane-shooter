import { createGroundPlaneWired } from "../../libs/util/util.js";

{/*
	Classe referente a geração do ambiente do jogo e
	armazenamento das informações do mesmo.
*/}
export class Scenario {
	constructor(height, width) {
		this.height = height;
		this.width = width;
		this.plane = createGroundPlaneWired(height, width);
	}
}
