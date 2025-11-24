import * as CANNON from 'cannon-es';

export class BodyFactory {
    static createBox(width: number, height: number, depth: number, mass: number, position: CANNON.Vec3): CANNON.Body {
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: mass,
            position: position,
            shape: shape
        });
        return body;
    }

    static createSphere(radius: number, mass: number, position: CANNON.Vec3): CANNON.Body {
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass: mass,
            position: position,
            shape: shape
        });
        return body;
    }
    
    static createGround(): CANNON.Body {
        const shape = new CANNON.Plane();
        const body = new CANNON.Body({
            mass: 0, // Static
        });
        body.addShape(shape);
        body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        return body;
    }
}
