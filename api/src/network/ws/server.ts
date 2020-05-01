import Channel from './channel'
import WebSocket from 'ws'

type ServerChannels = Record<string, Channel>

class Server {
  private channels: ServerChannels = {}
  private nextChannelId = 'a' // 'TEMPORARY, PLEASE CHANGE IT'

  // websocket server
  private wss: WebSocket.Server | null = null

  /**
   * Generates a channel id with no collision
   */
  private generateChannelId(): string {
    const channelId = this.nextChannelId

    this.nextChannelId = channelId + 'x'

    return channelId
  }

  /**
   *
   */
  public createChannel(): Channel {
    const channelId = this.generateChannelId()

    const newChannel = new Channel(channelId)

    // add the new channel to the server record
    this.channels[channelId] = newChannel

    return newChannel
  }

  public start(host: string, port: number): void {
    if (this.wss) {
      throw new Error('A server has already been started')
    }

    this.wss = new WebSocket.Server({
      host,
      port,
    })

    console.info('Serving websocket server at port', port)

    // whenever a websocket client connects
    this.wss.on('connection', (websocketClient) => {
      // add a listener to assign it to a channel
      const listener = (data: WebSocket.Data): void => {
        // todo: modify so the data is an interface and not random object
        let parsedData = undefined
        try {
          parsedData = JSON.parse(data.toString())
        } catch {
          return
        }

        if (!parsedData.x) {
          return
        }

        const targetChannel = this.channels[parsedData.x]

        // check if target channel exists
        if (!targetChannel) {
          // todo: send legit json object message
          websocketClient.send('Target channel does not exist')
          return
        }

        // remove current listener (so we stop creating clients)
        websocketClient.off('message', listener)

        // add new client to the target channel
        targetChannel.addClient(websocketClient)
      }

      websocketClient.on('message', listener)
    })
  }
}

const server = new Server()

// make it non modifiable
// Object.freeze(server)

export default server
