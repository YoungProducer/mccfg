export const configServiceErrorMessages = {
  userNotFoundErr: (id: number) => `Invalid user id: ${id}!`,
  primaryModNotFoundErr: (id: number) => `Invalid mod id: ${id}!`,
  dependenciesNotFoundErr: (list: string) =>
    `Invalid dependencies ids: [${list}]!`,
};
