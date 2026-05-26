import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  ownerId!: string;
}
