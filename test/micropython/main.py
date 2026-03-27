from reflected import window

Promise = window.Promise
document = window.document

body = document.body

body.append('Hello World');

body.onclick = lambda event: print('direct', event.type)

async def handler(event):
    print('handler', event.type)

body.addEventListener('click', handler)

print(await Promise.resolve(42))
