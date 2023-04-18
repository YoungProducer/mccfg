export const rolesGuardErrorMessages = {
  getUserUnathorizedErr: () => 'User is not authorized. Missing user data!',
  getUserHasNoGrantsErr: () => 'User does not have enough grants to proceed!',
};

export const jwtGuardErrorMessages = {
  getMissingTokenErr: () => 'Missing access token!',
  getInvalidTokenErr: () => 'Invalid token type!',
  getTokenIsNotJwtErr: () => 'Token is not a type of JWT!',
};
