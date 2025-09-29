import { IsNotEmpty, IsString } from "class-validator";

export class UserDtoCreate {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string
}