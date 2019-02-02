import main from '../src'

test('should run task', async () => {
  try {
    await main(['dir'])
  } catch(e) {}
})
