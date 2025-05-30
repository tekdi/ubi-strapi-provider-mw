import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class StrapiAdminLoginDto {
 
  @ApiProperty({description: 'Email address of the admin user',})
  @IsEmail()
  email: string;

  @ApiProperty({description: 'Password for the admin user',})
  @IsString()
  password: string;
}