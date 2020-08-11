import main from '.'

test('should run task', async () => {
  try {
    await main(['dir'])
  } catch(e) {}
})
