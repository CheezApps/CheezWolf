import WebSocket from 'ws'
import { ClientMessageType, ClientData, ServerData } from 'shared/data'
import { parseClientData } from './data'
import server from './server'
import Channel from './channel'

export type ClientListener = (data: ClientData, client: Client) => void
export type ClientListeners = Map<ClientMessageType, Set<ClientListener>>

export default class Client {
  private id: number
  private websocketClient: WebSocket
  private channel: Channel
  private listeners: ClientListeners

  constructor(id: number, channel: Channel, websocketClient: WebSocket) {
    this.id = id
    this.channel = channel
    this.websocketClient = websocketClient
    this.listeners = new Map()
    this.setupListeners()
  }

  private setupListeners(): void {
    // trigger message listeners
    const sendToListeners = (data: WebSocket.Data): void => {
      const parsedData = parseClientData(data)

      if (parsedData) {
        this.triggerListeners(parsedData)
      }
    }

    // auto-destroy when user breaks connection
    const removeClient = (): void => {
      console.log(`${this.id} died in terrible way`)

      // delete from channel
      this.channel.removeClient(this)

      // delete from server
      server.deleteClient(this.id)

      this.websocketClient.off('close', removeClient)
      this.websocketClient.off('message', sendToListeners)
    }

    this.websocketClient.on('close', removeClient)
    this.websocketClient.on('message', sendToListeners)
  }

  private triggerListeners(data: ClientData): void {
    // send the data to the listeners
    this.listeners.get(data.type)?.forEach((listener) => {
      listener(data, this)
    })
  }

  /**
   * Sends data to client
   * @param data ServerData to be sent to the client
   */
  public sendData(data: ServerData): void {
    this.websocketClient.send(JSON.stringify(data))
  }

  /**
   * Adds a new listener to the client messages
   * @param messageType the type of message to listen to
   * @param listener callback with the message
   */
  public addListener(messageType: ClientMessageType, listener: ClientListener): void {
    // retrieve listeners associated with the message type
    const messageTypeListeners = this.listeners.get(messageType)

    // create a new set if there is no listeners
    if (!messageTypeListeners) {
      this.listeners.set(messageType, new Set())
    }

    // add the listener
    this.listeners.get(messageType)?.add(listener)
  }

  /**
   * Remove a websocket data listener
   * @param listenerId The id of the listener to remove
   */
  public removeListener(messageType: ClientMessageType, listener: ClientListener): void {
    this.listeners.get(messageType)?.delete(listener)
  }

  // GETTERS

  public getId(): number {
    return this.id
  }

  public getChannel(): Channel {
    return this.channel
  }
}
