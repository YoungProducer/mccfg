import { UserEntity } from '../entities/user.entity';

export interface CreateUserData
  extends Pick<UserEntity, 'email' | 'username' | 'salt' | 'hash'> {
  role?: UserEntity['role'];
}
