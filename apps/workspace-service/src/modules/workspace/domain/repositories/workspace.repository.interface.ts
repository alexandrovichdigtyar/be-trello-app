import { WorkspaceAggregate } from "../aggregates/workspace.aggregate";

export const WORKSPACE_REPOSITORY = Symbol('WORKSPACE_REPOSITORY');

export interface IWorkspaceRepository {
  save(workspace: WorkspaceAggregate): Promise<void>;
  findById(id: string): Promise<WorkspaceAggregate | null>;
  findByOwnerId(ownerId: string): Promise<WorkspaceAggregate[]>;
  delete(id: string): Promise<void>;
}
