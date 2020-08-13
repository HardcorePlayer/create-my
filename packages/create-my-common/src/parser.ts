const enum Token {
  That = 'that',
  Named = 'named',
  Call = 'call',
  Called = 'called',
  By = 'by',
  It = 'it',
  Comma = ','
}

export class Tokenizer {
  index: number = 0
  constructor(private tokens: string[]) {}

  get curr() {
    return this.tokens[this.index]
  }

  back() {
    this.index = this.index - 1
    return this
  }
  next() {
    this.index = this.index + 1
    return this
  }

  private take() {
    this.next()
    const curr = this.curr
    this.back()
    return curr
  }

  match(fn: (str: string) => boolean) {
    return fn(this.take())
  }

  match_str(str: string) {
    return this.match(curr => str === curr)
  }
  match_str_or(...strs: string[]) {
    const curr = this.take()
    // this.next()
    for(let i = 0; i < strs.length; i++) {
      if(curr === strs[i]) {
        return true
      }
    }

    return false
  }

  is_eof() {

    return this.index === this.tokens.length - 1
  }

  eat() {
    // console.log(this.tokens, this.index)
    this.tokens.shift()
    this.index = 0
    return this
  }
}

export function parse(tt: Tokenizer) {
  const arr = []
  let curr

  while(( curr = tt.curr )) {
    if(/,$/.test(curr)) {
      arr.push(curr.replace(/,$/, ''))
      tt.eat()
      break
    }

    else if(tt.match_str_or(Token.That, Token.Comma)) {
      arr.push(curr)
      tt.eat()
      break
    }

    else {
      arr.push(curr)
      tt.eat()
    }
  }

  const value = arr.join('-')
  return value.length ? value : null
}
