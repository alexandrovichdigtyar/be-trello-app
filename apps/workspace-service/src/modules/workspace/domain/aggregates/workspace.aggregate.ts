import { CreateWorkspaceProps, WorkspaceModel } from '../models/workspace.model';

type WorkspaceDomainEvent = {
  type: string;
  data: Record<string, unknown>;
};

const WORKSPACE_CREATED_EVENT = 'workspace_created';

export class WorkspaceAggregate {
  private readonly _model: WorkspaceModel;
  private readonly _domainEvents: WorkspaceDomainEvent[];

  private constructor(model: WorkspaceModel, domainEvents: WorkspaceDomainEvent[]) {
    this._model = model;
    this._domainEvents = domainEvents;
  }

  static create(props: CreateWorkspaceProps): WorkspaceAggregate {
    const model = WorkspaceModel.create(props);
    return new WorkspaceAggregate(model, [{
      type: WORKSPACE_CREATED_EVENT,
      data: { id: model.id },
    }]);
  }

  static reconstitute(model: WorkspaceModel): WorkspaceAggregate {
    return new WorkspaceAggregate(model, []);
  }

  get id() { return this._model.id; }
  get model() { return this._model; }
  get domainEvents() { return [...this._domainEvents]; }
}
