import Server from './server'
import dotenv from 'dotenv'
import WebSocket from 'ws'

dotenv.config()

const server = new Server()

const envPort = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : false
const port = envPort || 5000

// start server
server.start(port)

const wss = new WebSocket.Server({
  host: '0.0.0.0',
  port: 8080,
})

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`received: ${message}`)
  })

  ws.send('something')
})
