import { WorkspaceModel as WorkspaceEntity } from '../../../../generated/prisma/models';
import { WorkspaceAggregate } from '../../domain/aggregates/workspace.aggregate';
import { WorkspaceModel } from '../../domain/models/workspace.model';

export class WorkspaceMapper {
  static toDomain(entity: WorkspaceEntity): WorkspaceAggregate {
    const model = WorkspaceModel.reconstitute({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      ownerId: entity.ownerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return WorkspaceAggregate.reconstitute(model);
  }

  static toEntity(aggregate: WorkspaceAggregate): WorkspaceEntity {
    return {
      id: aggregate.model.id,
      name: aggregate.model.name,
      description: aggregate.model.description ?? null,
      ownerId: aggregate.model.ownerId,
      createdAt: aggregate.model.createdAt,
      updatedAt: aggregate.model.updatedAt,
    };
  }
}
