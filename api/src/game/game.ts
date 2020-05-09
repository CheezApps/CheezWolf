import Channel from 'network/ws/channel'
import server from 'network/ws/server'

export default class Game {
  private channel: Channel

  constructor() {
    const channel = server.createChannel()

    // add listeners to channel and clients
    channel.onClientAdded((client) => {
      // broadcast message
      channel.broadcast({
        type: 'user_joined_channel',
        value: {
          test: 'hello',
        },
      })

      client.sendData({
        type: 'game_state',
        value: {
          insert: 'game_state here!',
        },
      })
    })

    this.channel = channel
  }

  public start(): void {
    // todo: create new game state
  }

  public getChannel(): Channel {
    return this.channel
  }
}
