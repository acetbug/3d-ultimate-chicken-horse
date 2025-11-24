import * as THREE from 'three';

// 生成一张多阶的黑白图
// 这决定了光照打上去是渐变的(写实)，还是分层的(卡通)
function createGradientTexture() {
    // 大幅增加阶梯数量，例如 16 阶，使光影层次更丰富
    const steps = 16;
    const colors = new Uint8Array(steps);
    for (let i = 0; i < steps; i++) {
        colors[i] = Math.round((i / (steps - 1)) * 255);
    }

    const texture = new THREE.DataTexture(colors, steps, 1, THREE.RedFormat);
    texture.minFilter = THREE.NearestFilter; // 关键：最近邻采样，产生硬边
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
}

export const toonGradientMap = createGradientTexture();

export function convertToToon(object: THREE.Object3D) {
    object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            // Check if the material is a StandardMaterial before casting
            // If it's an array of materials, we might need to handle that, but for now assume single material or handle simple case
            // The example code assumes MeshStandardMaterial.
            
            const oldMat = mesh.material as THREE.MeshStandardMaterial;

            // 创建新的卡通材质
            const newMat = new THREE.MeshToonMaterial({
                color: oldMat.color,      // 继承 Blender 里的颜色
                map: oldMat.map,          // 继承 Blender 里的贴图(那个调色板)
                gradientMap: toonGradientMap, // 应用光影阶梯
            });

            mesh.material = newMat;
            
            // 开启阴影
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }
    });
}
