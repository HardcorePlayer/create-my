/**
 * match sub task with command name from task list
 */

import { TaskCondition, TaskSet } from './config'

export const NOTFOUND_ERROR: Error = new Error(`can't provide task`)

export function match(conditions: TaskCondition,
                      defaults: TaskSet | undefined,
                      cmds: Array<string | undefined>): TaskSet {

  const fst: string | undefined = cmds.shift()
  const defaultTask: TaskSet | undefined = conditions._ || defaults

  /**
   * cmds was empty
   */
  if(!fst) {
    if(!defaultTask) throw NOTFOUND_ERROR
    return defaultTask
  }

  let matched: TaskSet; if((matched = conditions[fst])) return matched

  /**
   * match fail, back matcher to cmd stack, and return default task
   */
  if(!defaultTask) throw NOTFOUND_ERROR

  cmds.unshift(fst)
  return defaultTask
}
