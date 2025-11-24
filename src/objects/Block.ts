import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Block {
    public mesh: THREE.Mesh;
    public body: CANNON.Body;

    constructor(mesh: THREE.Mesh, body: CANNON.Body) {
        this.mesh = mesh;
        this.body = body;
    }
}
