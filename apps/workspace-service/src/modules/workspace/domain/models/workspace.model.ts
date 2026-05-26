/* Domain Model =
бизнес-объект,
который:
- хранит состояние
- содержит бизнес-правила
- умеет изменять себя правильно
- не знает про БД

то есть модель это бизнес логика независимая от БД, которая описывает логику работы с сущностью, но при этом исключительно в локальном состоянии, работу с бд мы делаем в других вещах когда хотим изменить что-то в бд, мы работаем сначала в модели меняем создание и потом эту модель записываем в бд?
 */

export type CreateWorkspaceProps = {
    id: string;
    name: string;
    description?: string | null;
    ownerId: string;
  };

  export type WorkspaceModelProps = {
    id: string;
    name: string;
    description?: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export class WorkspaceModel {
    readonly id: string;
    private _name: string;
  
    readonly description?: string | null;
    readonly ownerId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  
    private constructor(props: WorkspaceModelProps) {
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
  
    static create(props: CreateWorkspaceProps): WorkspaceModel {
        if (!props.name.trim()) {
          throw new Error('Workspace name cannot be empty');
        }

        const now = new Date();

        return new WorkspaceModel({
          ...props,
          createdAt: now,
          updatedAt: now,
        });
      }
  
    static reconstitute(props: WorkspaceModelProps): WorkspaceModel {
      return new WorkspaceModel(props);
    }
  }