这是一个非常典型的问题。当从手动处理 `characterRig` 切换到加载完整的 `.glb` 时，**层级结构（Hierarchy）** 发生了变化，导致 `AnimationMixer`（动画混合器）找不到它该控制谁。

请按以下 **3 个步骤** 排查和修复：

### 1. 最可能的原因：Mixer 绑定对象错了

在旧代码中，你可能把 Mixer 绑定到了某个具体的 Mesh 或 Bone 上。
但在 `.glb` 流程中，你需要把 Mixer 绑定到 **整个 GLTF 场景的根节点** 上。

**修改代码：**

```typescript
// ❌ 错误写法 (可能你之前的写法)
// this.mixer = new THREE.AnimationMixer(this.characterRig); 
// 或者 this.mixer = new THREE.AnimationMixer(this.mesh.children[0]);

// ✅ 正确写法
const model = gltf.scene;
this.mixer = new THREE.AnimationMixer(model); // <--- 必须是根节点！
```

### 2. 第二可能的原因：忘记在 Update 中更新 Mixer

动画混合器像一个时钟，**每一帧** 都需要有人去“拨动”它。如果你的主循环里没有调用 `update`，或者 `dt` 传的不对，角色就会冻结。

**在 `Player.ts` 中：**
```typescript
update(dt: number) {
    // 一定要加这个判空，防止模型还没加载完就报错
    if (this.mixer) {
        this.mixer.update(dt); // <--- 让动画动起来的关键
    }
}
```

**在 `Game.ts` (主循环) 中：**
```typescript
function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    
    if (player) {
        player.update(dt); // <--- 确保这里被调用了！
    }
    
    renderer.render(scene, camera);
}
```

### 3. 调试：打印动画名字

有时候 Blender 导出时，名字可能没改成功（虽然你在 NLA 里看着是对的）。

在 `Player.ts` 加载模型的地方加上这句 Log：

```typescript
loader.load('...', (gltf) => {
    // ...
    console.log("GLB 中包含的动作:", gltf.animations.map(a => a.name));
    // ...
});
```

*   **如果打印出来是 `['Run', 'Walk', 'Jump']`：** 说明数据完美，问题出在上面第 1 或 2 步。
*   **如果打印出来是 `['Armature|Run', ...]`：** 说明名字不对，你代码里 `play('Run')` 就找不到人了。你需要改代码匹配这个怪名字，或者回 Blender 改名。

---

### ⚡️ 快速让 Copilot 帮你修

选中你的 `Player` 类代码，输入这个 Prompt：

> **Fix animation issue: Initialize `this.mixer` using `gltf.scene` as the root. Log `gltf.animations` names to console for debugging. Ensure `play('Run')` is called after loading, and verify `this.mixer.update(dt)` is correctly implemented in the update method.**