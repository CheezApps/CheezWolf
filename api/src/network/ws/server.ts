import WebSocket from 'ws'
import Channel from './channel'
import { parseClientData, ServerData } from './data'
import Client from './client'

type ServerChannels = Record<string, Channel>
type ServerClients = Record<number, Client>

class Server {
  private channels: ServerChannels = {}
  private clients: ServerClients = {}
  private nextChannelId = 'a' // todo: TEMPORARY, PLEASE CHANGE IT
  private nextClientId = 0

  // websocket server
  private wss: WebSocket.Server | null = null

  /**
   * Generates a channel id with no collision
   */
  private generateChannelId(): string {
    // todo: make better id generator
    const channelId = this.nextChannelId

    this.nextChannelId = channelId + 'x'

    return channelId
  }

  /**
   * Generates a client id with no collision
   */
  private generateClientId(): number {
    return this.nextClientId++
  }

  /**
   * Creates a new channel
   */
  public createChannel(): Channel {
    const channelId = this.generateChannelId()

    const newChannel = new Channel(channelId)

    // add the new channel to the server record
    this.channels[channelId] = newChannel

    return newChannel
  }

  /**
   * Removes a channel from the server
   * @param channelId The id of the channel to be deleted
   */
  public deleteChannel(channelId: string): void {
    delete this.channels[channelId]
  }

  /**
   * Deletes a client from the server
   * @param clientId The id of the client to be deleted
   */
  public deleteClient(clientId: number): void {
    delete this.clients[clientId]
  }

  /**
   * Starts the websocket server
   * @param host Host for the server
   * @param port Port for the server
   */
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
        const parsedData = parseClientData(data)

        if (!parsedData || parsedData.type !== 'channel_connection' || !parsedData.value) {
          return
        }

        const targetChannelId = parsedData.value
        const targetChannel = this.channels[targetChannelId]

        // check if target channel exists
        if (!targetChannel) {
          // todo: send legit json object message
          const connectionErrorData: ServerData = {
            id: parsedData.id,
            type: 'channel_connection_error',
            value: {
              message: 'The channel does not exist',
            },
          }

          websocketClient.send(JSON.stringify(connectionErrorData))
          return
        }

        // remove current listener (so we stop creating clients)
        websocketClient.off('message', listener)

        // create new client
        const newClientId = this.generateClientId()
        const newClient = new Client(newClientId, targetChannelId, websocketClient)

        // add new client to the target channel
        targetChannel.addClient(newClient, parsedData.id)

        // add client to server record
        this.clients[newClientId] = newClient
      }

      websocketClient.on('message', listener)
    })
  }

  // GETTERS

  /**
   * Retrieves a client with its id
   * @param clientId The id of the client
   */
  public getClient(clientId: number): Client {
    return this.clients[clientId]
  }

  /**
   * Retrieves a channel with its id
   * @param channelId The id of the channel
   */
  public getChannel(channelId: string): Channel {
    return this.channels[channelId]
  }
}

const server = new Server()

// make it non modifiable
// Object.freeze(server)

export default server
