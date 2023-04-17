export const refreshErrorMessages = {
  getUserNotFoundErr: (userId: number) => `User with id: ${userId} not found!`,
  getInvalidTokenErr: () => 'Invalid refresh token!',
};
