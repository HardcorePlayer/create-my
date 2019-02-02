type TaskRecord = {
  options?: { [k: string]: any }
  tasks: TaskSet
  deps: Array<string>
}
export type TaskCompose = string | { [k: string]: TaskRecord }
type TaskArray = Array<TaskCompose>
export type TaskSet = TaskCompose | TaskArray
export type TaskCondition = { [key: string]: TaskSet }


/**
 * task config
 */
export interface Config {
  name: string
  description?: string
  usage?: string
  positional?: Array<string | { [k: string]: string }>
  options?: {
    [k:string]: string | {
      type?: string,
      description: string,
      default?: string
    }
  }
  var?: { [key: string]: string }
  match?: TaskCondition
  tasks?: TaskSet
}
