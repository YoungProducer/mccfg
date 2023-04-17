import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'server/domain/users/entities/user.entity';

export const Roles = (...roles: UserRoles[]) => SetMetadata('roles', roles);
