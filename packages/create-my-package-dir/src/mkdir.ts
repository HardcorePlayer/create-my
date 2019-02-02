/**
 * create dir
 */

import * as path from 'path'
import * as fs from 'fs'
import { Task, TaskResult, TaskContext, TaskOptions } from 'create-my-core'

interface Options extends TaskOptions<[Options['dirpath']]>{
  readonly _?: [ Options['dirpath'] ]
  readonly dirpath?: string
}

class MakeDir extends Task<Options> {
  protected target: NonNullable<Options['dirpath']>
  protected flag: string = '<mkdir>'
  protected id: string
  protected title: string
  protected dependencies: any

  private exists: boolean = false
  private created: boolean = false

  /**
   * initial and validate options
   */
  constructor(public context: TaskContext, public options: Options) {
    super(context)

    const { root } = context
    const { _: defaults = [], dirpath: _dirpath } = options

    const dirpath = defaults[0] || _dirpath

    if(!dirpath) throw new Error(`
      ${this.flag} options.dirpath was required`
    )

    /**
     * make sure path was absoulte
     */
    this.target = path.resolve(dirpath)
    const relative: string = path.relative(root, this.target)

    /**
     * the task id should provide and unique
     */
    this.id = `mkdir(${this.target})`
    this.title = `create dir @/${root === this.target ? '' : formatToPosixPath(relative) + '/'}`
  }

  /**
   * validate parent dir exists, if not, create a sub task to make it
   */
  validate() {
    this.exists = isDirExists(this.target)
    if(this.exists) return

    const parent: string = getParentPath(this.target)
    if(isDirExists(parent)) return
    this.dependencies.add(new MakeDir(this.context, { dirpath: parent }))
  }

  run() {
    if(this.exists) return TaskResult.Skip
    fs.mkdirSync(this.target)
    this.created = true
    return
  }

  rollback() {
    if(!this.created) return TaskResult.Skip
    fs.rmdirSync(this.target)
    return
  }
}

function isDirExists(target: string): boolean {
  try {
    const stats: fs.Stats = fs.statSync(target)
    if(stats.isDirectory()) return true
    return false
  } catch(e) {
    return false
  }
}

function getParentPath(target: string): string {
  const p: Array<string> = path.resolve(target).split(path.sep)
  p.pop()
  return p.join(path.sep)
}

function formatToPosixPath(target: string): string {
  return target.split(path.sep).join(path.posix.sep)
}

export { Options }
export default MakeDir
