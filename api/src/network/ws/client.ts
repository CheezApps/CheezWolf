import WebSocket from 'ws'
import { ClientMessageType, ClientData, ServerData } from 'shared/data'
import { parseClientData } from './data'
import server from './server'
import Channel from './channel'

export type ClientListener = (data: ClientData, client: Client) => void
export type ClientListeners = Record<number, ClientListener>

type ListenerTypeIdLinks = Partial<Record<ClientMessageType, Set<number>>>

export default class Client {
  private id: number
  private websocketClient?: WebSocket
  private channel: Channel
  private nextListenerId = 0
  private listenerTypeIdLinks: ListenerTypeIdLinks = {}
  private listeners: ClientListeners = {}

  constructor(id: number, channel: Channel, websocketClient: WebSocket) {
    this.id = id
    this.channel = channel
    this.websocketClient = websocketClient
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

      this.websocketClient?.off('close', removeClient)
      this.websocketClient?.off('message', sendToListeners)
      this.websocketClient = undefined
    }

    this.websocketClient?.on('close', removeClient)
    this.websocketClient?.on('message', sendToListeners)
  }

  private triggerListeners(data: ClientData): void {
    const messageType = data.type

    // get listener ids with the message type
    // if none exist, give empty array
    const listenerIds = this.listenerTypeIdLinks[messageType]

    // send the data to the listeners
    listenerIds?.forEach((listenerId) => {
      this.listeners[listenerId](data, this)
    })
  }

  /**
   * Sends data to client
   * @param data ServerData to be sent to the client
   */
  public sendData(data: ServerData): void {
    this.websocketClient?.send(JSON.stringify(data))
  }

  /**
   * Adds a new listener to the client messages
   * @param messageType the type of message to listen to
   * @param listener callback with the message
   * @returns listener id for removal
   */
  public addListener(messageType: ClientMessageType, listener: ClientListener): number {
    const listenerId = this.nextListenerId++

    // create a new set if the message type is not present
    if (!this.listenerTypeIdLinks[messageType]) {
      this.listenerTypeIdLinks[messageType] = new Set()
    }

    // assign a new link between messageType and listenerId
    this.listenerTypeIdLinks[messageType]?.add(listenerId)

    // add listener to the record
    this.listeners[listenerId] = listener

    return listenerId
  }

  /**
   * Remove a websocket data listener
   * @param listenerId The id of the listener to remove
   */
  public removeListener(listenerId: number): void {
    // remove listener
    delete this.listeners[listenerId]

    // remove link from record
    Object.keys(this.listenerTypeIdLinks).some((messageType) => {
      return this.listenerTypeIdLinks[messageType as ClientMessageType]?.delete(listenerId)
    })
  }

  public setWebsocketClient(websocketClient?: WebSocket): void {
    this.websocketClient = websocketClient
  }

  // GETTERS

  public getId(): number {
    return this.id
  }

  public getChannel(): Channel {
    return this.channel
  }
}
