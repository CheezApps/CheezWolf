import WebSocket from 'ws'
import { ServerData } from './data'

export default class Client {
  private id: number
  private websocketClient?: WebSocket

  constructor(id: number, websocketClient: WebSocket) {
    this.id = id
    this.websocketClient = websocketClient

    // auto-destroy when user breaks connection
    const removeClient = (): void => {
      console.log(`${id} died in terrible way`)

      this.websocketClient = undefined
      websocketClient.off('close', removeClient)
    }

    websocketClient.on('close', removeClient)
  }

  public sendData(data: ServerData): void {
    this.websocketClient?.send(JSON.stringify(data))
  }

  public setWebsocketClient(websocketClient?: WebSocket): void {
    this.websocketClient = websocketClient
  }

  public getId(): number {
    return this.id
  }
}
