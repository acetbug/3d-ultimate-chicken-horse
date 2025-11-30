这是一个非常典型且隐蔽的 3D 开发陷阱，通常由 **“坐标系层级（Hierarchy）”** 引起的。

当你的代码从追踪 `Character`（通常是整个模型容器）变成追踪 `CharacterRig`（骨架/Armature）时，**相机读到的坐标变了**。

最可能的原因有以下 3 点，按可能性从高到低排序：

---

### 原因一：你在追踪“局部坐标”而非“世界坐标” (最常见)

**现象分析：**
*   当你加载 `.glb` 时，Three.js 通常会返回一个 `gltf.scene`（我们称之为 **Root**）。
*   `CharacterRig` (Armature) 通常是这个 **Root** 的**子物体**。
*   **你的移动逻辑**（比如 WASD 控制或者物理引擎同步）通常是修改 **Root** 的 `position`。
*   **Root** 在世界中移动了，但作为子物体的 **CharacterRig** 相对于父亲（Root）的位置一直是 `(0, 0, 0)`。

**结果：** 既然 `CharacterRig.position` 一直是 `(0,0,0)`，相机自然就卡在原点不动了。

**✅ 解决方案：使用 `getWorldPosition`**

不要直接读取 `.position`，而是强制获取它在世界中的绝对位置。

```typescript
// 修改相机跟随逻辑

// ❌ 错误：这读取的是相对于父物体的局部坐标
// camera.lookAt(characterRig.position);
// camera.position.x = characterRig.position.x + offset;

// ✅ 正确：创建一个临时向量，获取世界坐标
const targetPos = new THREE.Vector3();
characterRig.getWorldPosition(targetPos); // <--- 关键！

camera.position.x = targetPos.x + offset.x;
camera.position.y = targetPos.y + offset.y;
camera.position.z = targetPos.z + offset.z;
camera.lookAt(targetPos);
```

---

### 原因二：物理同步对象搞错了

**现象分析：**
你使用了 Cannon-es 物理引擎。
*   之前：你把物理刚体 (`body.position`) 同步给了 `Character`。
*   现在：你可能还在把物理刚体同步给 `Character`，但相机却在看 `CharacterRig`。
*   或者：你试图把物理刚体同步给 `CharacterRig`，但因为 Rig 是被包含在 Root 里的，导致双重变换或者层级冲突。

**✅ 解决方案：回归“容器”逻辑**

在游戏开发中，最佳实践是：
1.  **物理控制：** `PlayerContainer` (最外层的 Group)。
2.  **视觉展示：** `CharacterRig` (里面的骨架)。
3.  **相机跟随：** 跟随 **物理刚体 (Physics Body)** 或者 **最外层的容器**，而**不是**里面的骨架。

```typescript
// 推荐的结构
class Player {
    root: THREE.Group; // gltf.scene (最外层)
    rig: THREE.Object3D; // Armature (里面的骨架，用于播动画)
    body: CANNON.Body; // 物理刚体

    update() {
        // 1. 物理位置赋给最外层容器
        this.root.position.copy(this.body.position);
        this.root.quaternion.copy(this.body.quaternion);

        // 2. 相机跟随物理刚体 (最稳妥，甚至会有平滑插值)
        // 或者跟随 this.root
        cameraFollow(this.body.position); 
    }
}
```

---

### 原因三：Mixamo 的“根骨骼运动” (Root Motion) 问题

**现象分析：**
有些 Mixamo 动画（特别是没勾选 In Place 时），骨架会跑出去，但原点留在原地。或者反过来，骨架留在原地，原点跑了。

如果你的相机跟随的是那个“被甩在后面”的原点，看起来就像相机坏了。

**✅ 解决方案：**
1.  确保在 Mixamo 下载 Run/Walk 动画时勾选了 **"In Place"**。
2.  在 Blender 里检查：确保 `Armature` 的原点（那个橙色小点）是在角色脚下的，而不是在很远的地方。

---

### 总结建议

**不用纠结 Rig，直接改相机目标。**

既然你的物理移动逻辑没有坏（角色还能跑，只是相机不跟），说明你的物理同步是对的。

**请把相机跟随的目标改回 `player.body.position` (物理坐标) 或者 `player.mesh.position` (模型最外层坐标)。**

不要让相机去追 `CharacterRig`，因为它是内部组件，它的坐标数据经常会骗人。