import { TaskEntry, TaskConstructor, Group } from 'create-my-core'
import { TaskSet, TaskCompose } from "./config"
import { Options } from "./transformer"
import { loadTaskScript, loadTaskPackage } from './packager'

type VarTable = Map<string, string | undefined>

export function parseTasks(tasks: TaskSet, options: Options, vars: VarTable): Set<TaskEntry> {
  const acc: Set<TaskEntry> = new Set()

  function recur(task: TaskCompose, dep: Array<string>): void {
    if(`string` === typeof task) {
      const parsed = parseTask(task, options, vars, {}, dep)
      pushToAcc(parsed)
      return
    }

    const name = Object.keys(task)[0]
    const val = task[name]

    /**
     * @todo parse taskOpts
     */
    if(Array.isArray(val)) {
      const parsed = parseTask(name, options, vars, {}, dep)
      const ids = pushToAcc(parsed)
      val.forEach(sub => recur(sub, ids))
      return
    }

    const { tasks = undefined,
            options: taskOpts = {},
            deps: taskDeps = [] } = task[name] || {}
    const ensureDeps = taskDeps ? (Array.isArray(taskDeps) ? taskDeps : [ taskDeps ]) : []
    const combineDeps = dep ? ensureDeps.concat(dep) : ensureDeps
    const parsed = parseTask(name, options, vars, { ...options.options, ...taskOpts }, combineDeps)
    const parsedIds = pushToAcc(parsed)

    if(!tasks) return
    mapTasks(tasks, parsedIds)
  }

  function mapTasks(tasks: TaskSet, dep: Array<string>): void {
    const ensureTasks = Array.isArray(tasks) ? tasks : [tasks]
    ensureTasks.forEach(task => recur(task, dep))
  }

  function pushToAcc(results: ReturnType<typeof parseTask>): Array<string> {
    const deps: Array<string> = []
    results.forEach(result => {
      acc.add(result)
      deps.push(result.task.id)
    })
    return deps
  }

  mapTasks(tasks, [])
  return acc
}

function parseTask(raw: string,
                   options: Options,
                   vars: VarTable,
                   opts: { [key: string]: string | undefined },
                   deps: Array<string>): Set<TaskEntry> {
  const words: Array<string> = raw.split(' ').filter(Boolean).map(s => s.trim())
  const name: string | undefined = words.shift()

  if(undefined === name) throw new Error(`task name was required`)

  const taskPositional: Options['positional'] = []
  const taskOptions: Options['options'] = {}

  /** task alias */
  let alias: string | undefined
  /** task script file path */
  let from: string | undefined
  /** task dependency */
  let dep: string | undefined

  let c: string | undefined; while((c = words.shift())) {
    switch(c) {
      case 'as': {
        alias = eat(words, `as require a name, "${name}"`, vars)
        break
      }

      case 'after': {
        dep = eat(words, `after require a name, "${name}"`, vars)
        break
      }

      case 'from': {
        from = eat(words, `from require a name, "${name}"`, vars)
        break
      }

      default: {
        taskPositional.push(applyVar(c, vars))
        break
      }
    }
  }

  for (const key in opts) {
    if (opts.hasOwnProperty(key)) {
      const _key = applyVar(key, vars)
      const _val = applyVar(opts[key], vars)
      // console.log(key, opts[key], applyVar(opts[key], vars))
      if(_key) taskOptions[_key] = _val
    }
  }

  const combineTaskOptions = { _: taskPositional, ...taskOptions }
  const combineDeps = dep ? (deps ? deps.concat(dep) : [dep]) : deps

  let Ctor: TaskConstructor<any> | undefined
  if((Ctor = loadTaskScript(name, from, options))) {
    const task = new Ctor(options.context, combineTaskOptions)
    return new Set([{ task, alias, deps: combineDeps }])
  } else {
    const { tasks } = loadTaskPackage(name, {
      ...options,
      positional: taskPositional,
      options: taskOptions
    })

    if(undefined === tasks) {
      throw new Error(`Can't find any tasks ${name}`)
    }

    const group = new Group(options.context, { name: raw })
    const ids: Array<string> = []

    tasks.forEach(task => {
      if(task.alias) task.alias = `${name}.${task.alias}`
      ids.push(task.task.id)
    })

    tasks.add({ task: group, alias, deps: combineDeps ? combineDeps.concat(ids) : ids })
    return tasks
  }
}



/**
 * read next word and apply var, throw error when next was `undefined`
 *
 * @param words set of string
 * @param message throw error message
 * @param vars variable table
 */
export function eat(words: Array<string>, message: string, vars: VarTable): string | undefined {
  let next: string | undefined; if(!(next = words.shift())) throw new Error(message)
  return applyVar(next, vars)
}

/**
 * replace $var from variable table
 *
 * @param str target string
 * @param vars variable table
 */
export function applyVar(str: string | undefined, vars: VarTable): string | undefined {
  if('string' !== typeof str) return str

  const regexp: RegExp = /\$([\w-]+)/
  let matched: RegExpMatchArray | null; if(!(matched = str.match(regexp))) return str

  const val = vars.get(matched[1])
  if(undefined === val) return str

  /**
   * @todo should supports $foo-$bar
   */
  return str.replace(regexp, val)
}
