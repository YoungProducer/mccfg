export const authErrorMessages = {
  getUserNameNotExistErr: (username: string) =>
    `User with username: ${username} does not exist!`,
  getAccountNotVerifiedErr: () =>
    'Account is not verified. Please check your inbox!',
  getInvalidPassErr: () => 'Invalid password',
};
