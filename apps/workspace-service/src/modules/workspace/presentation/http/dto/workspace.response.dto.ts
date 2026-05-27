export class WorkspaceResponseDto {
  id!: string;
  name!: string;
  description?: string | null;
  ownerId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
