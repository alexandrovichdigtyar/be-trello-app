import { Aggregate } from './aggregate.base';

export type CreateWorkspaceProps = {
  name: string;
  description?: string | null;
  ownerId: string;
};

export type ReconstitueWorkspaceProps = {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Workspace extends Aggregate {
  readonly id: string;
  private _name: string;
  readonly description?: string | null;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: ReconstitueWorkspaceProps) {
    super();
    this.id = props.id;
    this._name = props.name;
    this.description = props.description;
    this.ownerId = props.ownerId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get name(): string {
    return this._name;
  }

  rename(name: string): void {
    if (!name.trim()) {
      throw new Error('Workspace name cannot be empty');
    }
    this._name = name;
  }

  static create(props: CreateWorkspaceProps): Workspace {
    if (!props.name.trim()) {
      throw new Error('Workspace name cannot be empty');
    }

    const now = new Date();
    const workspace = new Workspace({
      id: crypto.randomUUID(),
      name: props.name,
      description: props.description,
      ownerId: props.ownerId,
      createdAt: now,
      updatedAt: now,
    });

    workspace.addEvent({
      type: 'workspace_created',
      data: { id: workspace.id, name: workspace.name },
    });

    return workspace;
  }

  static reconstitute(props: ReconstitueWorkspaceProps): Workspace {
    return new Workspace(props);
  }
}
