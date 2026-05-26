import { Inject, Injectable } from '@nestjs/common';
import { IWorkspaceRepository, WORKSPACE_REPOSITORY } from '../../domain/repositories/workspace.repository.interface';
import { CreateWorkspaceRequestDto } from '../dto/requests/create-workspace.request.dto';
import { WorkspaceResponseDto } from '../dto/responses/workspace.response.dto';
import { WorkspaceAggregate } from '../../domain/aggregates/workspace.aggregate';

@Injectable()
export class WorkspacesService {
    constructor(
        @Inject(WORKSPACE_REPOSITORY)
        private readonly workspaceRepository: IWorkspaceRepository) { }

    async createWorkspace(dto: CreateWorkspaceRequestDto): Promise<WorkspaceResponseDto> {
        const aggregate = WorkspaceAggregate.create({
            id: crypto.randomUUID(),
            name: dto.name,
            description: dto.description,
            ownerId: dto.ownerId,
        });
        await this.workspaceRepository.save(aggregate);

        return {
            id: aggregate.model.id,
            name: aggregate.model.name,
            description: aggregate.model.description,
            ownerId: aggregate.model.ownerId,
            createdAt: aggregate.model.createdAt,
            updatedAt: aggregate.model.updatedAt,
        };
    }

    async findWorkspaceById(id: string): Promise<WorkspaceResponseDto | null> {
        const aggregate = await this.workspaceRepository.findById(id);
        if (!aggregate) return null;
        return {
            id: aggregate.model.id,
            name: aggregate.model.name,
            description: aggregate.model.description,
            ownerId: aggregate.model.ownerId,
            createdAt: aggregate.model.createdAt,
            updatedAt: aggregate.model.updatedAt,
        };
    }
}
