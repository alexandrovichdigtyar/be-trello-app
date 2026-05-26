import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma.service';
import { IWorkspaceRepository } from '../../domain/repositories/workspace.repository.interface';
import { WorkspaceAggregate } from '../../domain/aggregates/workspace.aggregate';
import { WorkspaceMapper } from '../mappers/workspace.mapper';

@Injectable()
export class WorkspacePrismaRepository implements IWorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(workspace: WorkspaceAggregate): Promise<void> {
    const entity = WorkspaceMapper.toEntity(workspace);

    await this.prisma.workspace.upsert({
      where: { id: entity.id },
      create: entity,
      update: entity,
    });
  }

  async findById(id: string): Promise<WorkspaceAggregate | null> {
    const entity = await this.prisma.workspace.findUnique({ where: { id } });

    if (!entity) return null;
    
    return WorkspaceMapper.toDomain(entity);
  }

  async findByOwnerId(ownerId: string): Promise<WorkspaceAggregate[]> {
    const entities = await this.prisma.workspace.findMany({ where: { ownerId } });
    return entities.map((e) => WorkspaceMapper.toDomain(e));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workspace.delete({ where: { id } });
  }
}
