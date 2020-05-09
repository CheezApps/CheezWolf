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
  private clients: Set<Client>
  private listeners: Map<ChannelEvent, Set<Function>>

  constructor(id: string) {
    this.id = id
    this.clients = new Set()
    this.listeners = new Map()
  }

  private addListener(event: ChannelEvent, listener: Function): void {
    const eventListeners = this.listeners.get(event)

    if (!eventListeners) {
      this.listeners.set(event, new Set())
    }

    // add listener
    this.listeners.get(event)?.add(listener)
  }

  /**
   * Adds a new client to the channel
   */
  public addClient(client: Client, messageId: number): void {
    // trigger listeners
    this.listeners.get('client_added')?.forEach((listener) => {
      listener(client)
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
    this.listeners.get('client_removed')?.forEach((listener) => {
      listener(client)
    })

    // if there are no more clients, delete the channel
    if (this.clients.size === 0) {
      server.deleteChannel(this.id)
    }
  }

  public onClientAdded(listener: AddClientListener): void {
    this.addListener('client_added', listener)
  }

  public onClientRemoved(listener: RemoveClientListener): void {
    this.addListener('client_removed', listener)
  }

  public onChannelDeletion(listener: () => void): void {
    this.addListener('channel_deleted', listener)
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

  public getClients(): Set<Client> {
    return this.clients
  }
}
