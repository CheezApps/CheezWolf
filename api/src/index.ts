import Server from './server'
import dotenv from 'dotenv'
import network from 'channel/network'

dotenv.config()

const server = new Server()

const envPort = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : false
const port = envPort || 5000

// start server
server.start(port)

// start the websocket server
network.start('0.0.0.0', 8080)
