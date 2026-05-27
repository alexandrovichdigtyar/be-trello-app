import { WorkspaceModel as WorkspaceEntity } from '../../../../generated/prisma/models';
import { Workspace } from '../../domain/workspace';

export class WorkspaceMapper {
  static toDomain(entity: WorkspaceEntity): Workspace {
    return Workspace.reconstitute({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      ownerId: entity.ownerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(workspace: Workspace): WorkspaceEntity {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description ?? null,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
