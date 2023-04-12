import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserDto } from 'server/domain/users/dto/user.dto';

@Exclude()
export class SignUpResponseDto {
  @Expose()
  @Type(() => UserDto)
  @ApiProperty({
    type: UserDto,
  })
  user: UserDto;
}
