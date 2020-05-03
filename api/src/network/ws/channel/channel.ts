import Client from './client'
import WebSocket from 'ws'
import { ServerData } from './data'

type ChannelClients = Record<number, Client>

export default class Channel {
  /**
   * The channel id
   */
  private id: string
  private ready = false
  private nextClientId = 0
  private clients: ChannelClients = {}

  constructor(id: string) {
    this.id = id
  }

  /**
   * Mark the channel as ready
   */
  public up(): void {
    this.ready = true
  }

  /**
   * Creates a new client and adds it to the channel
   */
  public addClient(websocketClient: WebSocket, messageId: number): void {
    // generate new id for client
    const clientId = this.nextClientId++

    const newClient = new Client(clientId, websocketClient)

    // broadcast channel the addition of a new client
    this.broadcast({
      type: 'user_joined_channel',
      value: 'THE NEW CLIENT INFO', // todo: send client info
    })

    // add the new client to the record
    this.clients[clientId] = newClient

    // send message to client that he is connected
    newClient.sendData({
      id: messageId,
      type: 'channel_connection',
      value: 'connected to the channel with success',
    })
  }

  // GETTERS

  public getId(): string | null {
    return this.id
  }

  public isReady(): boolean {
    return this.ready
  }

  public getClients(): ChannelClients {
    return this.clients
  }

  public broadcast(data: ServerData): void {
    Object.values(this.clients).forEach((client) => {
      client.sendData(data)
    })
  }
}
