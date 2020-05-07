import WebSocket from 'ws'
import { ClientData, ServerData, ClientMessageType, parseClientData } from './data'
import server from './server'

export type ClientListener = (data: ClientData) => void
export type ClientListeners = Record<number, ClientListener>

type ListenerTypeIdLinks = Partial<Record<ClientMessageType, number[]>>

export default class Client {
  private id: number
  private websocketClient?: WebSocket
  private channelId: string
  private nextListenerId = 0
  private listenerTypeIdLinks: ListenerTypeIdLinks = {}
  private listeners: ClientListeners = {}

  constructor(id: number, channelId: string, websocketClient: WebSocket) {
    this.id = id
    this.channelId = channelId
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
      const channel = server.getChannel(this.channelId)
      channel.removeClient(this.id)

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
    const listenerIds = this.listenerTypeIdLinks[messageType] || []

    // send the data to the listeners
    listenerIds.forEach((listenerId) => {
      this.listeners[listenerId](data)
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

    const messageTypeListeners = this.listenerTypeIdLinks[messageType]

    // assign a new link between messageType and listenerId
    // if messageType exists already, push new listenerId else create new array
    this.listenerTypeIdLinks[messageType] = messageTypeListeners ? [...messageTypeListeners, listenerId] : [listenerId]

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
      const listenerIdIndex = this.listenerTypeIdLinks[messageType as ClientMessageType]?.indexOf(listenerId) || -1

      // if the id was not found, go to next messageType
      if (listenerIdIndex === -1) {
        return false
      }

      // remove the listener id from the record
      this.listenerTypeIdLinks[messageType as ClientMessageType]?.splice(listenerIdIndex, 1)

      // end the loop
      return true
    })
  }

  public setWebsocketClient(websocketClient?: WebSocket): void {
    this.websocketClient = websocketClient
  }

  // GETTERS

  public getId(): number {
    return this.id
  }

  public getChannelId(): string {
    return this.channelId
  }
}
