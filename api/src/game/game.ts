import Channel from 'network/ws/channel'
import server from 'network/ws/server'

export default class Game {
  private channel: Channel

  constructor() {
    this.channel = server.createChannel()
  }

  public start(): void {
    //
  }

  public getChannel(): Channel {
    return this.channel
  }
}
