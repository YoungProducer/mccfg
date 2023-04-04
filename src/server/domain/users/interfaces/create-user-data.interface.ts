import { UserEntity } from '../entities/user.entity';

export type CreateUserData = Pick<
  UserEntity,
  'email' | 'username' | 'password' | 'salt'
>;
