/**
 * re-export task and manager
 */

export { Task,
         Task as default,
         Group,
         TaskOptions,
         TaskConstructor,
         TaskResult,
         TaskState,
         TaskContext } from './tasker'

export { createTaskManager,
         TaskEntry } from './manager'
