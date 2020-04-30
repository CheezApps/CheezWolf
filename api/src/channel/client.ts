import WebSocket from 'ws'

export default class Client {
  private id: number
  private ws: WebSocket

  constructor(id: number, ws: WebSocket) {
    this.id = id
    this.ws = ws
  }
}
