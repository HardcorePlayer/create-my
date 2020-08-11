/**
 * create-my cli frontend
 */
import { createTaskManager } from 'create-my-core'
import parse from 'create-my-parser'
import yargs from 'yargs-parser'


export default async function main(args: string[]): Promise<void> {
  const { _: positional, ...options } = yargs(args)
  const name = positional.shift()

  if(!name) {
    console.log('❤')
    process.exit(0)
    return
  }

  const { tasks } = await parse(name, { positional, options }, process.cwd())
  if(undefined === tasks) throw new Error(`no tasks found`)
  const manager = createTaskManager([...tasks])
  manager.start(() => {})
}
