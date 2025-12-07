import { CharacterAppearance } from "./CharacterAppearance";

// Simple in-memory registry; can be expanded to support skins
const CHARACTER_DEFINITIONS: CharacterAppearance[] = [
  {
    id: "chicken",
    modelKey: "chicken",
    baseColor: 0xffffff,
    beakColor: 0xffa500,
    accentColor: 0xffcc66,
  },
  {
    id: "horse",
    modelKey: "horse",
    baseColor: 0x8b4513,
    beakColor: 0x000000,
    accentColor: 0xd2691e,
  },
  {
    id: "raccoon",
    modelKey: "raccoon",
    baseColor: 0x808080,
    beakColor: 0x000000,
    accentColor: 0x404040,
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

// TODO:
// - Extend CHARACTER_DEFINITIONS with more skins / variants per id
// - Potentially add a lookup by skinId if lobby needs skin selection
