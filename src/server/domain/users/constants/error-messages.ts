export const userErrorMessages = {
  getUsernameAlreadyTakenErr: (username: string) =>
    `Username ${username} is already taken!`,
  getEmailAlreadyTakenErr: (email: string) =>
    `Email ${email} is already taken!`,
  getConfTokenInvalidErr: () => 'Token is invalid',
  getConfTokenNoUserErr: () => 'Token has no binded user!',
  getConfTokenExpiredErr: () => 'Token is expired',
};
