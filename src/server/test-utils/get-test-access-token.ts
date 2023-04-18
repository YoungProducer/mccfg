import { sign } from 'server/domain/tokens/jwt/helpers/jwt-async.helper';
import { UserDto } from 'server/domain/users/dto/user.dto';

export const getTestAccessToken = async (user: UserDto, expiresIn: string) =>
  await sign(user, 'secret', {
    expiresIn,
  });
