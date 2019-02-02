import path from 'path'
import { transformFile, Options } from '../src/transformer'

const context: string = path.resolve(require.resolve('.cache/create-my/package.json'), '..')
const options: Options = {
  positional: [],
  options: {},
  context: {
    root: process.cwd(),
    cmdroot: path.resolve(context, `node_modules`, `create-my-package-dir`)
  }
}

beforeAll(() => {
  (global as any).__non_webpack_require__ = require
})

test('should transform file', async () => {
  try {
    const result = await transformFile(options)
    console.log(result)
  } catch(e) {
    throw new Error(e)
  }
})
