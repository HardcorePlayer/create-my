import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { Tokenizer } from 'create-my-common'

export default async function main(tt: Tokenizer) {
  const result = parse(tt)
  const ctx = { ...result }

  if(!ctx.name) {
    ctx.name = await ask(`what's the file name?`)
  }

  ctx.path = ctx.path === null
    ? process.cwd()
    : !path.isAbsolute(ctx.path)
    ? path.resolve(process.cwd(), ctx.path)
    : ctx.path

  fs.mkdirSync(ctx.path, { recursive: true })

  while(fs.existsSync(path.resolve(ctx.path, ctx.name))) {
    ctx.name = await ask(`file already exists, use another one?`)
  }

  fs.writeFileSync(path.resolve(ctx.path, ctx.name), '', 'utf-8')

  console.log('\n  ❤')
  return
}

async function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => {
    rl.question(`> ${question} `, res => {
      resolve(res.trim())
      rl.close()
    })
  })
}

const enum Token {
  Named = 'named',
  Call = 'call',
  Called = 'called',
  By = 'by',
  It = 'it',
  On = 'on',
  At = 'at'
}


function parse(tt: Tokenizer) {
  let name = null, path = null

  while(tt.curr) {
    if(!path && tt.match_str_or(Token.At, Token.On)) {
      tt.eat()
      if(tt.is_eof()) break
      tt.eat()
      path = tt.curr
    }

    else if(!name && tt.match_str(Token.Named)) {
      tt.eat()

      if(tt.match_str(Token.By)) {
        tt.eat()
        if(tt.is_eof()) {
          name = Token.By
          break
        }
      }

      tt.eat()
      name = tt.curr
    }

    else if(!name && tt.match_str(Token.Called)) {
      tt.eat()
      if(tt.is_eof()) break
      tt.eat()
      name = tt.curr
    }

    else if(!name && tt.match_str(Token.Call)) {
      tt.eat()

      if(tt.match_str(Token.It)) {
        tt.eat()

        if(tt.is_eof()) {
          name = Token.It
          break
        }

        tt.eat()
        name = tt.curr
      }
    }

    else {
      tt.eat()
      if(tt.is_eof()) break
    }
  }

  return {
    name,
    path
  }
}
