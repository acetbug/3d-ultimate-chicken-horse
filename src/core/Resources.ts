/// <reference types="vite/client" />
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PlaceholderGenerator } from "../utils/PlaceholderGenerator";
import { convertToToon } from "../utils/ToonUtils";

export class Resources {
  private manager: THREE.LoadingManager;
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private audioLoader: THREE.AudioLoader;

  public models: Map<string, THREE.Group> = new Map();
  public modelAnimations: Map<string, THREE.AnimationClip[]> = new Map();
  public textures: Map<string, THREE.Texture> = new Map();
  public sounds: Map<string, AudioBuffer> = new Map();

  // 确保无论回调注册早晚，都能在资源加载完成后触发
  private readyCallbacks: Array<() => void> = [];
  private isReady: boolean = false;

  constructor() {
    this.manager = new THREE.LoadingManager();
    this.gltfLoader = new GLTFLoader(this.manager);
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.audioLoader = new THREE.AudioLoader(this.manager);

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log(
        `Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`
      );
    };

    this.manager.onLoad = () => {
      this.isReady = true;
      // 依次执行所有待触发的回调
      this.readyCallbacks.forEach((cb) => {
        try {
          cb();
        } catch (err) {
          console.error("[Resources] onReady callback error", err);
        }
      });
      this.readyCallbacks = [];
    };
  }

  // 加载所有默认的占位符资源
  public loadDefaultPlaceholders() {
    // Models
    // Blocks / traps
    this.loadModel(
      "wood_block_321",
      import.meta.env.BASE_URL + "models/blocks/wood_block_321.glb"
    );
    this.loadModel(
      "spikes",
      import.meta.env.BASE_URL + "models/traps/spikes.glb"
    );
    this.loadModel(
      "crossbow",
      import.meta.env.BASE_URL + "models/traps/bow.glb",
      (scene) => {
        // Rotate 90 degrees around Y to face +Z (assuming original faces -X)
        scene.rotation.y = Math.PI / 2;
      }
    );
    this.loadModel(
      "arrow",
      import.meta.env.BASE_URL + "models/traps/arrrow.glb",
      (scene) => {
        // Rotate 90 degrees around Y to face +Z (assuming original faces -X)
        scene.rotation.y = Math.PI / 2;
      }
    );

    // Characters (rigged GLB with embedded animations)
    this.loadModel(
      "chicken",
      import.meta.env.BASE_URL + "models/characters/chicken.glb"
    );
    this.loadModel(
      "horse",
      import.meta.env.BASE_URL + "models/characters/horse.glb"
    );
    this.loadModel(
      "lizard",
      import.meta.env.BASE_URL + "models/characters/lizard.glb"
    );
    this.loadModel(
      "monkey",
      import.meta.env.BASE_URL + "models/characters/monkey.glb"
    );
    this.loadModel(
      "rabbit",
      import.meta.env.BASE_URL + "models/characters/rabbit.glb"
    );
    this.loadModel(
      "raccoon",
      import.meta.env.BASE_URL + "models/characters/raccoon.glb"
    );
    this.loadModel(
      "sheep",
      import.meta.env.BASE_URL + "models/characters/sheep.glb"
    );

    // Textures
    this.textures.set(
      "default_grid",
      PlaceholderGenerator.createCheckerTexture("#cccccc", "#ffffff")
    );

    // Sounds (Empty buffers)
    const emptyBuffer = new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.set("jump", emptyBuffer);
    this.sounds.set("death", emptyBuffer);
  }

  public loadModel(
    name: string,
    path: string,
    onLoaded?: (scene: THREE.Group, animations: THREE.AnimationClip[]) => void
  ): void {
    this.gltfLoader.load(path, (gltf) => {
      console.log(
        `[Resources] Loaded model '${name}' from '${path}', animations=` +
          (gltf.animations?.map((c) => c.name).join(", ") || "<none>")
      );

      convertToToon(gltf.scene);
      this.models.set(name, gltf.scene);

      if (gltf.animations && gltf.animations.length > 0) {
        this.modelAnimations.set(name, gltf.animations);
      }

      if (onLoaded) {
        onLoaded(gltf.scene, gltf.animations ?? []);
      }
    });
  }

  public loadTexture(name: string, path: string): void {
    this.textureLoader.load(path, (texture) => {
      this.textures.set(name, texture);
    });
  }

  public loadSound(name: string, path: string): void {
    this.audioLoader.load(path, (buffer) => {
      this.sounds.set(name, buffer);
    });
  }

  public onReady(callback: () => void): void {
    if (this.isReady) {
      // 资源已经加载完成，直接调用
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }
}
