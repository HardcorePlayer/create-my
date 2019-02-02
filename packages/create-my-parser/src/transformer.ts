import path from 'path'
import { promises as fs, readFileSync } from 'fs'
import { safeLoad as yaml } from 'js-yaml'
import { TaskContext, TaskEntry } from 'create-my-core'
import { Config, TaskSet } from './config'
import { match as matchTask, NOTFOUND_ERROR } from './matcher'
import { parseTasks } from './parser'


/**
 * task parser options
 */
export interface Options {
  /**
   * context options, used for instantiate a task
   */
  context: TaskContext
  /**
   * parsed argv options
   */
  options: { [k:string]: string | undefined }
  /**
   * parsed argv defaults
   */
  positional: Array<string | undefined>
}

interface TransformOptions {
  name: Config['name'],
  description?: Config['description']
  usage?: Config['usage']
  positional?: Config['positional']
  options?: Config['options']
  tasks?: Set<TaskEntry>
}

/**
 * parse task config content json
 */
export function transform(config: Config, options: Options): TransformOptions {
  const { positional: definedPositional = [],
          options: definedOptions = {},
          var: definedVars = {},
          match,
          tasks: defaultTasks,
          ...rest } = config

  const { positional: argsPositional,
          options: argsOptions } = options

  if(argsOptions.help || argsOptions.h) {
    return {
      positional: definedPositional,
      options: definedOptions,
      ...rest
    }
  }

  const tasks: TaskSet | undefined = match
    ? matchTask(match, defaultTasks, argsPositional)
    : defaultTasks

  if(!tasks) throw NOTFOUND_ERROR

  const vars: Map<string, string | undefined> = new Map()

  for (let index = 0; index < definedPositional.length; index++) {
    const element = argsPositional[index]
    vars.set(index.toString(), element)
    const defined = definedPositional[index]
    if('string' !== typeof defined) {
      const name = Object.keys(defined)[0]
      vars.set(name, element)
    }
  }

  for (const key in definedOptions) {
    if (definedOptions.hasOwnProperty(key)) {
      const definedOption = definedOptions[key]
      const defaultOptionValue = 'string' === typeof definedOption
        ? undefined
        : definedOption.default
      const value = argsOptions[key] || defaultOptionValue
      vars.set(key, value)
    }
  }

  for (const key in options.context) {
    if (options.context.hasOwnProperty(key)) {
      const element = options.context[key as keyof Options['context']]
      vars.set(key, element)
    }
  }

  for (const key in definedVars) {
    if (definedVars.hasOwnProperty(key)) {
      const element = definedVars[key]
      vars.set(key, element)
    }
  }

  console.log('//// vars ////')
  console.log(vars)

  return {
    tasks: parseTasks(tasks, options, vars),
    positional: definedPositional,
    options: definedOptions,
    ...rest
  }
}


/**
 * parse task config from file
 */
export async function transformFile(options: Options): Promise<ReturnType<typeof transform>> {
  return transform(yaml(await fs.readFile(path.resolve(options.context.cmdroot, 'tasks.yaml'), 'utf8')), options)
}

export function transformFileSync(options: Options): ReturnType<typeof transform> {
  return transform(yaml(readFileSync(path.resolve(options.context.cmdroot, 'tasks.yaml'), 'utf8')), options)
}
