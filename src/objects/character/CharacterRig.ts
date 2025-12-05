import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Resources } from "../../core/Resources";
import { CharacterAnimState, CharacterAppearance } from "./CharacterAppearance";

type AnimActionMap = Partial<Record<CharacterAnimState, THREE.AnimationAction>>;

export class CharacterRig {
  public readonly root: THREE.Group;

  private readonly mixer: THREE.AnimationMixer | null;
  private readonly actions: AnimActionMap;
  private activeAction: THREE.AnimationAction | null = null;
  private time: number = 0;

  private constructor(
    root: THREE.Group,
    mixer: THREE.AnimationMixer | null,
    actions: AnimActionMap
  ) {
    this.root = root;
    this.mixer = mixer;
    this.actions = actions;
  }

  public static createFromAppearance(
    resources: Resources,
    appearance: CharacterAppearance
  ): CharacterRig {
    const baseModel = resources.models.get(appearance.modelKey)?.clone();

    const root = new THREE.Group();
    let mixer: THREE.AnimationMixer | null = null;
    const actions: AnimActionMap = {};

    if (baseModel) {
      root.add(baseModel);

      const clips = resources.modelAnimations.get(appearance.modelKey) ?? [];
      if (clips.length > 0) {
        mixer = new THREE.AnimationMixer(baseModel);

        const stateNameMap: Partial<Record<CharacterAnimState, string[]>> = {
          idle: ["Idle", "idle", "IDLE"],
          run: ["Run", "run", "RUN", "Walk", "walk"],
          jump: ["Jump", "jump", "JUMP"],
          fall: ["Fall", "fall", "FALL"],
          dead: ["Die", "die", "Dead", "dead"],
          win: ["Win", "win", "Victory", "victory"],
        };

        clips.forEach((clip) => {
          const action = mixer!.clipAction(clip);
          (Object.keys(stateNameMap) as CharacterAnimState[]).forEach(
            (state) => {
              const names = stateNameMap[state];
              if (!names) return;
              if (names.some((n) => clip.name.includes(n))) {
                actions[state] = action;
              }
            }
          );
        });

        // 如果没按名称匹配到 idle，但模型里确实有动画，兜底把第一个 clip 当成 idle 播放
        if (!actions.idle) {
          const fallback = clips[0];
          actions.idle = mixer.clipAction(fallback);
        }

        // 简单调试输出，方便在控制台确认动画名与映射结果
        console.log(
          `[CharacterRig] appearance=${appearance.id}, modelKey=${appearance.modelKey}, clips=` +
            clips.map((c) => c.name).join(", ") +
            "; mapped states=" +
            (Object.keys(actions) as CharacterAnimState[]).join(", ")
        );
      }
    }

    return new CharacterRig(root, mixer, actions);
  }

  public updateFromBody(body: CANNON.Body) {
    this.root.position.copy(body.position as any);
    this.root.position.y += 0.5; // Slight lift so feet are above ground
    this.root.quaternion.copy(body.quaternion as any);
  }

  public updateAnimation(delta: number, state: CharacterAnimState) {
    this.time += delta;

    if (this.mixer) {
      this.mixer.update(delta);
    }

    if (!this.mixer) {
      return;
    }

    const target = this.actions[state];
    if (!target) {
      return;
    }

    if (this.activeAction === target) {
      return;
    }

    const prev = this.activeAction;
    this.activeAction = target;

    const fadeDuration = 0.15;

    if (prev) {
      prev.fadeOut(fadeDuration);
    }

    target.reset();
    target.setEffectiveTimeScale(1);
    target.setEffectiveWeight(1);
    target.fadeIn(fadeDuration).play();
  }
}
