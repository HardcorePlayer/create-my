import path from 'path'
import { loadPackage } from '../src/packager'

const context: string = path.resolve(`node_modules`, `.cache`, `create-my`)

test('should load a package', async () => {
  try {
    const content = await loadPackage('dir')
    expect(content).toBe(path.resolve(context, `node_modules`, `create-my-package-dir`))
  } catch(e) {
    throw new Error(e)
  }
}, 1e4)
