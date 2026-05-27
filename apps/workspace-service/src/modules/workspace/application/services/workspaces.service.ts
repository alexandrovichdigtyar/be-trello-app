import { Inject, Injectable } from '@nestjs/common';
import { IWorkspaceRepository, WORKSPACE_REPOSITORY } from '../../domain/repositories/workspace.repository.interface';
import { Workspace } from '../../domain/workspace';
import { CreateWorkspaceDto } from '../../presentation/http/dto/create-workspace.dto';
import { WorkspaceResponseDto } from '../../presentation/http/dto/workspace.response.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  async createWorkspace(dto: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    const workspace = Workspace.create({
      name: dto.name,
      description: dto.description,
      ownerId: dto.ownerId,
    });

    await this.workspaceRepository.save(workspace);

    return this.toDto(workspace);
  }

  async findWorkspaceById(id: string): Promise<WorkspaceResponseDto | null> {
    const workspace = await this.workspaceRepository.findById(id);
    
    if (!workspace) return null;
    return this.toDto(workspace);
  }

  private toDto(workspace: Workspace): WorkspaceResponseDto {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
