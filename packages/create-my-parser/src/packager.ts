/**
 * create-my package manager
 */

import path from 'path'
import { promises as fs, Stats } from 'fs'
import findCacheDir from 'find-cache-dir'
import npm from 'npm'
import { Options, transformFileSync } from './transformer'
import { TaskConstructor } from 'create-my-core'

export async function loadPackage(name: string): Promise<string> {
  const cacheDir: string = await ensureWorkspace()
  const context: string = path.resolve(cacheDir, `node_modules`, `create-my-package-${name}`)

  let pkg: any
  try {
    pkg = __non_webpack_require__.context(path.resolve(context, 'package.json'))
  } catch(e) {}

  if(undefined === pkg) {
    try {
      await installPackage(name, cacheDir)
    } catch(e) {
      throw new Error(e)
    }
  }

  return context
}

export async function ensureWorkspace(): Promise<string> {
  const cacheDir: string | null = findCacheDir({ name: 'create-my' })
  if(null === cacheDir) throw new Error(`can't find cache dir`)

  let useable: boolean = true
  try {
    const stat: Stats = await fs.stat(cacheDir)
    if(!stat.isDirectory()) useable = false
  } catch(e) {
    useable = false
  }

  if(false === useable) {
    try {
      await fs.mkdir(cacheDir, { recursive: true })
      await createPackageConfig(cacheDir)
    } catch(e) {
      throw new Error(e)
    }
  }

  return cacheDir
}

export async function ensureNpmLoaded(directory: string): Promise<typeof npm> {
  if(npm.config.loaded) return npm
  return new Promise(function(resolve) {
    npm.load({
      'prefix': directory,
      'ignore-scripts': true,
      'always-auth': false,
      'bin-links': false,
      'shrinkwrap': false,
      'loglevel': 'silent'
    }, () => resolve(npm))
  })
}

export async function createPackageConfig(directory: string): Promise<void> {
  const pkgpath = path.resolve(directory, 'package.json')
  const tpl = {
    name: 'create-my',
    version: '0.0.0',
    description: 'create-my package cache',
    license: 'MIT'
  }
  await fs.writeFile(pkgpath, JSON.stringify(tpl, null, 4))
}

export async function installPackage(name: string, directory: string): Promise<void> {
  const cmder: typeof npm = await ensureNpmLoaded(directory)
  return new Promise(function(resolve, reject) {
    cmder.commands.install([`create-my-package-${name}`], (err) => {
      if(err) return reject(err)
      resolve()
    })
  })
}

export function loadTaskScript<T>(name: string, from: string | undefined, options: Options): TaskConstructor<T> | undefined {
  const modpath: string = path.resolve(options.context.cmdroot, from || name)

  let mod
  try {
    mod = __non_webpack_require__.resolve(modpath)
  } catch(e) {}

  if(undefined === mod) return undefined

  return __non_webpack_require__(modpath).default
}

export function loadTaskPackage(name: string, options: Options): ReturnType<typeof transformFileSync> {
  const context: string = path.resolve(options.context.cmdroot, '..', name)
  return transformFileSync({
    ...options,
    context: {
      ...options.context,
      cmdroot: context
    }
  })
}
