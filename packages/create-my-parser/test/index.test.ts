import parse from '../src'

beforeAll(() => {
  (global as any).__non_webpack_require__ = require
})

test(`should parse tasks`, async () => {
  try {
    const result = await parse('dir', {
      positional: [],
      options: {}
    }, process.cwd())
    console.log(result)
  } catch(e) {
    throw new Error(e)
  }
})
