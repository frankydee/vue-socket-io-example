var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
})

app.get('/clients', (req, res) => {
  res.send(Object.keys(io.sockets.clients().connected))
})

io.on('connection', socket => {
  console.log(`A user connected with socket id ${socket.id}`)

  //FD: emits event to everyone expect the sender
  socket.broadcast.emit('user-connected', socket.id)


  //FD: emits event to everyone including sender
  //FD: ** I added the line below
  //socket.emit('user-connected', socket.id)


  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id)
  })

  //FD: Send data only to the right socket 
  socket.on('nudge-client', data => {
    socket.broadcast.to(data.to).emit('client-nudged', data)
  })
})

http.listen(3000, () => {
  console.log('Listening on *:3000')
})
