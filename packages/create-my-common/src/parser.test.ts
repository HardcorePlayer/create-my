import { parse, Tokenizer } from './parser'

describe('Tokenizer', () => {

})

describe('Parser', () => {
  test('foo', () => {
    const args = ['foo']
    const tt = new Tokenizer(args)
    const expected = parse(tt)
    expect(expected).toBe('foo')
    expect(tt.is_eof())
  })

  test('foo bar', () => {
    const args = ['foo', 'bar']
    const tt = new Tokenizer(args)
    const expected = parse(tt)
    expect(expected).toBe('foo-bar')
    expect(tt.is_eof())
  })

  test('foo,', () => {
    const args = ['foo,']
    const tt = new Tokenizer(args)
    const expected = parse(tt)
    expect(expected).toBe('foo')
    expect(!tt.is_eof())
  })

  test('foo, bar', () => {
    const args = ['foo,', 'bar']
    const tt = new Tokenizer(args)
    const expected = parse(tt)
    expect(expected).toBe('foo')
    expect(!tt.is_eof())
  })

  test('foo , bar', () => {
    const args = ['foo', ',', 'bar']
    const tt = new Tokenizer(args)
    const expected = parse(tt)
    expect(expected).toBe('foo')
    expect(!tt.is_eof())
  })

  test('foo that bar', () => {
    const args = ['foo', ',', 'bar']
    const tt = new Tokenizer(args)
    const expected = parse(tt)
    expect(expected).toBe('foo')
    expect(!tt.is_eof())
  })
})
