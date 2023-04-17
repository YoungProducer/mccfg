export const modErrorMessages = {
  getModNameExistErr: (name: string) => `Mod with name: ${name} already exist!`,
  getModVersionExistErr: (version: string) =>
    `Mod with version: ${version} already exist!`,
  getMCVersionNotExistErr: (version: string) =>
    `Minecraft version: ${version} does not exist!`,
  getMultipleMCVersionsNotExistErr: (versions: string) =>
    `Following versions of minecraft: ${versions} do not exist`,
  getModIdNotExistErr: (id: number) => `Mod with id: ${id} does not exist!`,
};
