/**
 * task
 */

export interface TaskConstructor<O extends TaskOptions<any>> {
  new(context: TaskContext, options: O): Task<O>
}

export type TaskActionReturnType = void | TaskResult | string | [TaskResult, string]

export interface TaskAction {
  validate(): void | string | Promise<void | string>
  run(): TaskActionReturnType | Promise<TaskActionReturnType>
  rollback(): TaskActionReturnType | Promise<TaskActionReturnType>
}

export interface TaskContext {
  root: string,
  cmdroot: string
}

export interface TaskOptions<T> {
  readonly _?: { [K in keyof T]: T[K] }
}

export const enum TaskState { Init, Validate, Run, Rollback }
export const enum TaskResult { Fail, Done, Skip, Force }

export abstract class Task<O> implements TaskAction {
  protected id!: string
  protected title!: string
  public description!: string
  protected abstract readonly options: O
  public dependencies: Set<Task<any>> = new Set()
  public state: TaskState = TaskState.Init
  public result?: TaskResult
  constructor(public readonly context: TaskContext) {}
  validate() {}
  run() {}
  rollback() {}
}

interface GroupOptions extends TaskOptions<[GroupOptions['name']]> {
  readonly _?: [ GroupOptions['name'] ]
  readonly name?: string
}

export class Group extends Task<GroupOptions> {
  protected name: NonNullable<GroupOptions['name']>
  protected flag: string = '<group>'

  constructor(public context: TaskContext, public options: GroupOptions) {
    super(context)

    const { _: defaults = [], name: _name } = this.options
    const [ _name_ ] = defaults
    const name = _name || _name_

    if(!name) throw new Error(
      `${this.flag} group name was required`
    )

    this.name = name
    this.id = `group(${this.name})`
    this.title = `group ${this.name}`
  }

  run() { return TaskResult.Skip }
}
