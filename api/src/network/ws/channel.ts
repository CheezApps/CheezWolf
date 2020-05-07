import Client from './client'
import { ServerData } from './data'
import server from './server'

export default class Channel {
  /**
   * The channel id
   */
  private id: string
  private ready = false
  private clientIds: Set<number>

  constructor(id: string) {
    this.id = id
    this.clientIds = new Set()
  }

  /**
   * Mark the channel as ready
   */
  public up(): void {
    this.ready = true
  }

  /**
   * Adds a new client to the channel
   */
  public addClient(client: Client, messageId: number): void {
    // generate new id for client
    const clientId = client.getId()

    // broadcast channel the addition of a new client
    this.broadcast({
      type: 'user_joined_channel',
      value: 'THE NEW CLIENT INFO', // todo: send client info
    })

    // add the new clientId to the record
    this.clientIds.add(clientId)

    // send message to client that he is connected
    client.sendData({
      id: messageId,
      type: 'channel_connection',
      value: 'connected to the channel with success',
    })
  }

  /**
   * Removes a client from the channel
   * and auto-destroys the channel if there is no more clients
   * @param clientId The id of the client to remove from the channel
   */
  public removeClient(clientId: number): void {
    this.clientIds.delete(clientId)

    // if there are no more clients, delete the channel
    if (this.clientIds.entries.length === 0) {
      server.deleteChannel(this.id)
    }
  }

  /**
   * Sends data to every single clients in the channel
   * @param data Data to be sent to all channel's clients
   */
  public broadcast(data: ServerData): void {
    // get the channel's clients from the server
    const clients = Array.from(this.clientIds).map((clientId) => {
      return server.getClient(clientId)
    })

    // broadcast data
    clients.forEach((client) => {
      client.sendData(data)
    })
  }

  // GETTERS

  public getId(): string | null {
    return this.id
  }

  public isReady(): boolean {
    return this.ready
  }

  public getClientIds(): Set<number> {
    return this.clientIds
  }
}
