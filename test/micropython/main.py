from reflected import window

Promise = window.Promise
document = window.document

body = document.body

body.append('Hello World');

body.onclick = lambda event: print('direct', event.type)

body.addEventListener('click', lambda event: print('handler', event.type))

print(await Promise.resolve(42))
