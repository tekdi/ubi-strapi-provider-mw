import { IsNotEmpty, IsString, IsEmail, IsArray, ArrayNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StrapiAdminUserDto {
  @ApiProperty({ 
    description: 'First name of the user', 
    example: 'Jon' 
  })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ 
    description: 'Last name of the user', 
    example: 'Doe' 
  })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ 
    description: 'Email address of the user', 
    example: 'johnrao@yopmail.com' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Array of role IDs to assign to the user', 
    example: ['5'],
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[];

  @ApiProperty({ 
    description: 'Password for the user (min 8 characters, must contain at least one uppercase letter and one digit)', 
    example: 'Password123' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'The value is too short (min: 8).' })
  @Matches(/[A-Z]/, { message: 'password must match the following: "/[A-Z]/"' })
  @Matches(/\d/, { message: 'password must match the following: "/\\d/"' })
  password: string;
}