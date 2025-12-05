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

            try {
              const originalMat = mesh.material as any;

              // 兼容数组材质和非标准材质
              const firstMat = Array.isArray(originalMat)
                ? originalMat[0]
                : originalMat;

              const baseColor =
                firstMat && firstMat.color
                  ? firstMat.color
                  : new THREE.Color(0xffffff);
              const baseMap = firstMat ? firstMat.map : undefined;

              const newMat = new THREE.MeshToonMaterial({
                color: baseColor,
                map: baseMap,
                gradientMap: toonGradientMap,
              });

              // 如果是 SkinnedMesh，一定要开启 skinning，否则骨骼动画不会驱动网格
              if ((mesh as any).isSkinnedMesh) {
                (newMat as any).skinning = true;
                newMat.needsUpdate = true;
              }

              mesh.material = newMat;

              // 开启阴影
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            } catch (err) {
              console.error(
                "[ToonUtils] Failed to convert mesh to toon material",
                err,
                mesh
              );
            }
        }
    });
}
