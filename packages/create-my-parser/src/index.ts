/**
 * task config file parser
 */

import { loadPackage } from './packager'
import { transformFile, Options } from './transformer'

interface ParserOptions {
  positional: Array<string>
  options: { [key: string]: string }
}

export default async function parse(name: string, options: ParserOptions, root: string): ReturnType<typeof transformFile> {
  const pkgroot: string = await loadPackage(name)
  const opts: Options = {
    ...options,
    context: {
      root,
      cmdroot: pkgroot
    }
  }
  return await transformFile(opts)
}
