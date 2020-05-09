import { ServerData } from 'shared/data'
import Client from './client'
import server from './server'

const CHANNEL_EVENTS = [
  // list of all channel events
  'client_added',
  'client_removed',
  'channel_deleted',
] as const
type ChannelEvent = typeof CHANNEL_EVENTS[number]

type AddClientListener = (client: Client) => void
type RemoveClientListener = (client: Client) => void

export default class Channel {
  /**
   * The channel id
   */
  private id: string
  private ready = false
  private clients: Set<Client>
  private nextListenerId = 0
  private listenerEventIds: Partial<Record<ChannelEvent, Set<number>>> = {}
  private listeners: Record<number, Function> = {}

  constructor(id: string) {
    this.id = id
    this.clients = new Set()
  }

  private addListener(event: ChannelEvent, listener: Function): number {
    const listenerId = this.nextListenerId++

    this.listeners[listenerId] = listener
    if (!this.listenerEventIds[event]) {
      this.listenerEventIds[event] = new Set()
    }

    this.listenerEventIds[event]?.add(listenerId)

    return listenerId
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
    // trigger listeners
    this.listenerEventIds['client_added']?.forEach((listenerId) => {
      this.listeners[listenerId](client)
    })

    // broadcast channel the addition of a new client
    this.broadcast({
      type: 'user_joined_channel',
      value: 'THE NEW CLIENT INFO', // todo: send client info
    })

    // add the new client to the record
    this.clients.add(client)

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
   * @param client The client to remove from the channel
   */
  public removeClient(client: Client): void {
    this.clients.delete(client)

    // trigger listeners
    this.listenerEventIds['client_removed']?.forEach((listenerId) => {
      this.listeners[listenerId](client)
    })

    // if there are no more clients, delete the channel
    if (this.clients.size === 0) {
      server.deleteChannel(this.id)
    }
  }

  public onClientAdded(listener: AddClientListener): number {
    return this.addListener('client_added', listener)
  }

  public onClientRemoved(listener: RemoveClientListener): number {
    return this.addListener('client_removed', listener)
  }

  public onChannelDeletion(listener: () => void): number {
    return this.addListener('channel_deleted', listener)
  }

  /**
   * Sends data to every single clients in the channel
   * @param data Data to be sent to all channel's clients
   */
  public broadcast(data: ServerData): void {
    // broadcast data
    this.clients.forEach((client) => {
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

  public getClients(): Set<Client> {
    return this.clients
  }
}
