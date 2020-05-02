import httpServer from 'network/http/server'
import wsServer from 'network/ws/server'
import dotenv from 'dotenv'

dotenv.config()

const envHttpPort = process.env.API_HTTP_PORT ? parseInt(process.env.API_HTTP_PORT, 10) : false
const httpPort = envHttpPort || 5000

const envWsPort = process.env.API_WS_PORT ? parseInt(process.env.API_WS_PORT, 10) : false
const wsPort = envWsPort || 8080

// start server
httpServer.start(httpPort)

// start the websocket server
wsServer.start('0.0.0.0', wsPort)
