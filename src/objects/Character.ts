import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Character {
    public mesh: THREE.Group;
    public body: CANNON.Body;

    constructor(mesh: THREE.Group, body: CANNON.Body) {
        this.mesh = mesh;
        this.body = body;
    }

    public update() {
        this.mesh.position.copy(this.body.position as any);
        this.mesh.quaternion.copy(this.body.quaternion as any);
    }
}
