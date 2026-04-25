import { birthdayTableScene } from "./birthday-table";
import type { Scene } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SCENES: Scene<any>[] = [birthdayTableScene];

export { birthdayTableScene };
export type { Scene, SceneParams, PhotoSlot, ParamField, SceneValidation } from "./types";
