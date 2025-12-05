import { CharacterAppearance } from "./CharacterAppearance";

// id 将用于网络/选择，modelKey 必须与 Resources.loadDefaultPlaceholders 中的模型 key 对齐
const CHARACTER_DEFINITIONS: CharacterAppearance[] = [
  {
    id: "chicken",
    modelKey: "chicken",
  },
  {
    id: "horse",
    modelKey: "horse",
  },
  {
    id: "lizard",
    modelKey: "lizard",
  },
  {
    id: "monkey",
    modelKey: "monkey",
  },
  {
    id: "rabbit",
    modelKey: "rabbit",
  },
  {
    id: "raccoon",
    modelKey: "raccoon",
  },
  {
    id: "sheep",
    modelKey: "sheep",
  },
];

export function getCharacterAppearance(
  id: string | undefined | null
): CharacterAppearance {
  const found = CHARACTER_DEFINITIONS.find((c) => c.id === id);
  return found ?? CHARACTER_DEFINITIONS[0];
}

export function listCharacterAppearances(): CharacterAppearance[] {
  return CHARACTER_DEFINITIONS.slice();
}
