import { IsNotEmpty, IsString } from "class-validator";

export class SignIn {

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignUp {

  @IsString()
  @IsNotEmpty()
  email: string;  

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}