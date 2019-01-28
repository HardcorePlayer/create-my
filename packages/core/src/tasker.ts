/**
 * task
 */

/**
 * Task interface, `O` was task options
 */
export interface TaskInterface<O> extends TaskAction {
  /**
   * task id
   */
  id: string
  title: string  
  /**
   * task options
   */
  readonly options: O
  /**
   * task dependencies, can set dynamic dependencies at validate hooks
   */
  dependencies: Set<TaskInterface<any>>
  /**
   * means this task as dependency for other task, and set by configure
   * step
   */
  state: TaskState
  result?: TaskResult
  description?: string
}

export interface TaskConstructor<O extends TaskOptions<any>> {
  new(context: TaskContext, options: O): Task<O>
}

type TaskActionReturnType = void | TaskResult | string | [TaskResult, string]

interface TaskAction {
  validate(): void | string | Promise<void | string>
  run(): TaskActionReturnType | Promise<TaskActionReturnType>
  rollback(): TaskActionReturnType | Promise<TaskActionReturnType>
}

interface TaskContext {
  root: string,
  cmdroot: string
}

interface TaskOptions<T> {
  readonly _?: { [K in keyof T]: T[K] }
}

export const enum TaskState { Init, Validate, Run, Rollback }
export const enum TaskResult { Fail, Done, Skip, Force }

export abstract class Task<O> implements TaskInterface<O> {
  id!: string
  title!: string
  description!: string
  abstract readonly options: O
  dependencies: Set<TaskInterface<any>> = new Set()
  state: TaskState = TaskState.Init
  result?: TaskResult
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

export { TaskOptions, 
         TaskContext, 
         TaskActionReturnType,
         TaskAction }
