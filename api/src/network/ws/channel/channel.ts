import Client from './client'
import WebSocket from 'ws'

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
  public addClient(websocketClient: WebSocket): void {
    // generate new id for client
    const clientId = ++this.nextClientId

    const newClient = new Client(clientId, websocketClient)

    // add the new client to the record
    this.clients[clientId] = newClient
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
}
