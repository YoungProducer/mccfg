import { UserEntity } from '../entities/user.entity';

export type CreateUserData = Pick<
  UserEntity,
  'email' | 'username' | 'salt' | 'hash'
>;
