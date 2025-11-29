import * as THREE from "three";

export class UIManager {
  private uiLayer: HTMLElement;

  // 3D UI
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  private raycaster: THREE.Raycaster | null = null;
  private uiRoot3D: THREE.Group | null = null;
  private pointerNDC: THREE.Vector2 = new THREE.Vector2();
  private currentHoverButton: THREE.Mesh | null = null;

  constructor() {
    this.uiLayer = document.getElementById("ui-layer") as HTMLElement;
  }

  /**
   * 初始化 3D UI 所需的场景引用和射线工具
   */
  public attachScene(
    scene: THREE.Scene,
    camera: THREE.Camera,
    raycaster: THREE.Raycaster
  ) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = raycaster;

    if (!this.uiRoot3D) {
      this.uiRoot3D = new THREE.Group();
      this.uiRoot3D.name = "UIRoot3D";
      this.scene.add(this.uiRoot3D);
    }
  }

  public showMessage(message: string) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "ui-message";
    msgDiv.innerText = message;
    this.uiLayer.appendChild(msgDiv);
    setTimeout(() => {
      this.uiLayer.removeChild(msgDiv);
    }, 3000);
  }

  /**
   * 将一个按钮区域注册为 3D UI 按钮
   */
  private createButtonPlane(
    width: number,
    height: number,
    label: string,
    onClick: () => void
  ): THREE.Mesh {
    const geom = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffcc66,
      transparent: true,
      opacity: 0.95,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.userData.type = "button";
    mesh.userData.onClick = onClick;
    mesh.userData.label = label;
    return mesh;
  }

  /**
   * 创建一个简单的卡通纸板面板
   */
  private createPanel(width: number, height: number): THREE.Mesh {
    const geom = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf0e6d2 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.userData.type = "panel";
    return mesh;
  }

  /**
   * 注册鼠标坐标（归一化设备坐标）用于 3D UI raycast
   */
  public updatePointerFromMouse(
    clientX: number,
    clientY: number,
    width: number,
    height: number
  ) {
    this.pointerNDC.x = (clientX / width) * 2 - 1;
    this.pointerNDC.y = -(clientY / height) * 2 + 1;
  }

  /**
   * 处理一次鼠标点击事件，返回是否被 3D UI 消费
   */
  public handleClick(): boolean {
    if (!this.scene || !this.camera || !this.raycaster || !this.uiRoot3D)
      return false;

    this.raycaster.setFromCamera(this.pointerNDC, this.camera as THREE.Camera);
    const intersects = this.raycaster.intersectObjects(
      this.uiRoot3D.children,
      true
    );
    if (intersects.length === 0) return false;

    const obj = intersects[0].object as any;
    let target: any = obj;
    while (target && !target.userData?.type) {
      target = target.parent;
    }
    if (
      target &&
      target.userData.type === "button" &&
      typeof target.userData.onClick === "function"
    ) {
      target.userData.onClick();
      return true;
    }
    return false;
  }

  /**
   * 创建 3D 风格的标题（登录）界面
   */
  public showTitleScreen(
    onHost: (nickname: string) => void,
    onJoin: (nickname: string, hostId: string) => void
  ) {
    this.uiLayer.innerHTML = "";

    if (!this.scene || !this.camera || !this.uiRoot3D) {
      // 回退到原来的 DOM 版（防止场景未初始化时崩溃）
      const nickname = "Player" + Math.floor(Math.random() * 1000);
      const hostId =
        window.prompt("Enter Host ID to join (leave empty to host):", "") || "";
      if (hostId) {
        onJoin(nickname, hostId);
      } else {
        onHost(nickname);
      }
      return;
    }

    // 清理旧的 3D UI
    this.uiRoot3D.clear();

    const panel = this.createPanel(6, 3.5);
    panel.position.set(0, 1.5, -5);
    this.uiRoot3D.add(panel);

    // 标题使用简单的 Sprite 文本（先用 DOM 文本代替）
    const titleDiv = document.createElement("div");
    titleDiv.className = "ui-title-overlay";
    titleDiv.innerText = "Ultimate Chicken Horse 3D";
    this.uiLayer.appendChild(titleDiv);

    const nickname = "Player" + Math.floor(Math.random() * 1000);

    // Host 按钮
    const hostBtn = this.createButtonPlane(2.2, 0.7, "HOST", () => {
      onHost(nickname);
    });
    hostBtn.position.set(-1.5, 1.5, -4.9);
    this.uiRoot3D.add(hostBtn);

    // Join 按钮（点击后用简单 prompt 输入 HostId）
    const joinBtn = this.createButtonPlane(2.2, 0.7, "JOIN", () => {
      const hostId = window.prompt("Enter Host ID:", "") || "";
      if (!hostId) return;
      onJoin(nickname, hostId);
    });
    joinBtn.position.set(1.5, 1.5, -4.9);
    this.uiRoot3D.add(joinBtn);
  }

  public showLobbyScreen(
    myId: string,
    players: any[],
    isHost: boolean,
    onCharacterSelect: (charId: string) => void,
    onStart: () => void
  ) {
    this.uiLayer.innerHTML = "";

    if (!this.scene || !this.camera || !this.uiRoot3D) {
      // 回退：简单 DOM 版本
      const fallback = document.createElement("div");
      fallback.className = "ui-fallback";
      fallback.innerText = "Lobby (fallback)";
      this.uiLayer.appendChild(fallback);
      return;
    }

    this.uiRoot3D.clear();

    const panel = this.createPanel(7, 4);
    panel.position.set(0, 1.8, -5);
    this.uiRoot3D.add(panel);

    // Host ID 区域：仍然使用 DOM 显示，方便复制
    if (isHost) {
      const hostInfo = document.createElement("div");
      hostInfo.className = "ui-host-info";
      hostInfo.innerText = myId ? `Host ID: ${myId}` : "Connecting...";
      const copyBtn = document.createElement("button");
      copyBtn.innerText = "Copy ID";
      copyBtn.onclick = () => {
        if (!myId) return;
        navigator.clipboard.writeText(myId);
      };
      hostInfo.appendChild(copyBtn);
      this.uiLayer.appendChild(hostInfo);
    }

    // 角色选择：简单 3D 按钮条
    const chars = ["chicken", "penguin", "robot"];
    const spacing = 2.2;
    chars.forEach((charId, index) => {
      const btn = this.createButtonPlane(1.8, 0.7, charId.toUpperCase(), () => {
        onCharacterSelect(charId);
      });
      btn.position.set(-spacing + index * spacing, 1.6, -4.9);
      this.uiRoot3D.add(btn);
    });

    // Start / Waiting 区域
    if (isHost) {
      const startBtn = this.createButtonPlane(2.5, 0.8, "START", () => {
        onStart();
      });
      startBtn.position.set(0, 0.7, -4.9);
      this.uiRoot3D.add(startBtn);
    } else {
      const waitDiv = document.createElement("div");
      waitDiv.className = "ui-wait-msg";
      waitDiv.innerText = "Waiting for host to start...";
      this.uiLayer.appendChild(waitDiv);
    }
  }

  public updateScore(scores: { [id: string]: number }) {
    // Update score board
    console.log(scores);
  }

  public createItemPicker(onSelect: (itemId: string) => void) {
    const container = document.createElement("div");
    container.id = "item-picker";
    container.style.position = "absolute";
    container.style.bottom = "20px";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.display = "flex";
    container.style.gap = "10px";
    container.style.pointerEvents = "auto";

    const items = [
      { id: "box_wood", label: "Wood Box" },
      { id: "spikes", label: "Spikes" },
    ];

    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.innerText = item.label;
      btn.style.padding = "10px 20px";
      btn.style.fontSize = "16px";
      btn.style.cursor = "pointer";
      btn.onclick = () => {
        onSelect(item.id);
        container.style.display = "none";
      };
      container.appendChild(btn);
    });

    this.uiLayer.appendChild(container);
  }

  public showItemPicker(show: boolean) {
    const picker = document.getElementById("item-picker");
    if (picker) {
      picker.style.display = show ? "flex" : "none";
    }
  }

  public clearUI() {
    this.uiLayer.innerHTML = "";
  }

  public showScoreScreen(
    scores: { nickname: string; current: number; added: number }[],
    goalScore: number,
    onComplete: () => void
  ) {
    this.uiLayer.innerHTML = "";

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
    container.style.backgroundColor = "#f0e6d2"; // Paper-like background
    container.style.padding = "40px";
    container.style.borderRadius = "5px";
    container.style.color = "#333";
    container.style.width = "80%";
    container.style.maxWidth = "800px";
    container.style.fontFamily = '"Comic Sans MS", "Chalkboard SE", sans-serif'; // Hand-drawn feel
    container.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    container.style.border = "2px solid #333";

    const title = document.createElement("h2");
    title.innerText = "Round Results";
    title.style.textAlign = "center";
    title.style.marginBottom = "30px";
    container.appendChild(title);

    const chartContainer = document.createElement("div");
    chartContainer.style.position = "relative";
    chartContainer.style.marginTop = "20px";
    chartContainer.style.paddingRight = "50px"; // Space for goal
    container.appendChild(chartContainer);

    // Goal Line
    // const goalScore = 50; // Passed as argument now
    const goalLine = document.createElement("div");
    goalLine.style.position = "absolute";
    goalLine.style.left = "100%"; // Assuming 100% width is goal? No, let's scale.
    // Let's say width 100% = goalScore * 1.2 (buffer)
    const maxScale = goalScore * 1.2;
    const goalPercent = (goalScore / maxScale) * 100;

    goalLine.style.left = `${goalPercent}%`;
    goalLine.style.top = "0";
    goalLine.style.bottom = "0";
    goalLine.style.width = "2px";
    goalLine.style.backgroundColor = "red";
    goalLine.style.zIndex = "10";

    const goalLabel = document.createElement("div");
    goalLabel.innerText = "GOAL";
    goalLabel.style.position = "absolute";
    goalLabel.style.top = "-25px";
    goalLabel.style.left = "50%";
    goalLabel.style.transform = "translateX(-50%)";
    goalLabel.style.color = "red";
    goalLabel.style.fontWeight = "bold";
    goalLine.appendChild(goalLabel);

    chartContainer.appendChild(goalLine);

    // Animate rows
    scores.forEach((s, i) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.marginBottom = "15px";
      row.style.height = "40px";

      // Name
      const name = document.createElement("div");
      name.innerText = s.nickname;
      name.style.width = "100px";
      name.style.fontWeight = "bold";
      name.style.textAlign = "right";
      name.style.paddingRight = "10px";
      row.appendChild(name);

      // Bar Track
      const barTrack = document.createElement("div");
      barTrack.style.flexGrow = "1";
      barTrack.style.height = "100%";
      barTrack.style.position = "relative";
      barTrack.style.backgroundColor = "rgba(0,0,0,0.05)";
      barTrack.style.borderLeft = "2px solid #333";
      row.appendChild(barTrack);

      // Base Score Bar (Hatched pattern)
      const baseBar = document.createElement("div");
      const basePercent = ((s.current - s.added) / maxScale) * 100;
      baseBar.style.width = `${basePercent}%`;
      baseBar.style.height = "100%";
      baseBar.style.position = "absolute";
      baseBar.style.left = "0";
      baseBar.style.backgroundColor = "#444";
      baseBar.style.backgroundImage =
        "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)";
      baseBar.style.border = "2px solid #333";
      baseBar.style.boxSizing = "border-box";
      barTrack.appendChild(baseBar);

      // Added Score Bar (Solid color)
      const addedBar = document.createElement("div");
      const addedPercent = (s.added / maxScale) * 100;
      addedBar.style.width = "0%"; // Start at 0 for animation
      addedBar.style.height = "100%";
      addedBar.style.position = "absolute";
      addedBar.style.left = `${basePercent}%`;
      addedBar.style.backgroundColor = "#ffcc00"; // Yellow/Orange
      addedBar.style.border = "2px solid #333";
      addedBar.style.borderLeft = "none";
      addedBar.style.boxSizing = "border-box";
      addedBar.style.transition = "width 1s ease-out";
      barTrack.appendChild(addedBar);

      chartContainer.appendChild(row);

      // Animation Sequence
      setTimeout(() => {
        addedBar.style.width = `${addedPercent}%`;
      }, i * 1000 + 500);
    });

    this.uiLayer.appendChild(container);

    // Complete after all animations
    setTimeout(() => {
      onComplete();
    }, scores.length * 1000 + 3000);
  }

  public showWinScreen(winnerName: string, onBackToLobby: () => void) {
    this.uiLayer.innerHTML = "";

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
    container.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    container.style.padding = "60px";
    container.style.borderRadius = "15px";
    container.style.color = "white";
    container.style.textAlign = "center";
    container.style.border = "4px solid gold";
    container.style.pointerEvents = "auto"; // Enable interaction

    const title = document.createElement("h1");
    title.innerText = "WINNER!";
    title.style.fontSize = "48px";
    title.style.color = "gold";
    title.style.marginBottom = "20px";
    container.appendChild(title);

    const name = document.createElement("h2");
    name.innerText = winnerName;
    name.style.fontSize = "36px";
    name.style.marginBottom = "40px";
    container.appendChild(name);

    const btn = document.createElement("button");
    btn.innerText = "BACK TO LOBBY";
    btn.style.padding = "15px 30px";
    btn.style.fontSize = "20px";
    btn.style.cursor = "pointer";
    btn.style.backgroundColor = "#4CAF50";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.onclick = onBackToLobby;
    container.appendChild(btn);

    this.uiLayer.appendChild(container);
  }
}
