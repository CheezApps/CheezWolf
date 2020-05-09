import Channel from 'network/ws/channel'
import server from 'network/ws/server'
import Lobby from './lobby'

export default class Game {
  private channel: Channel
  private lobby: Lobby

  constructor() {
    this.lobby = new Lobby()

    // create a websocket channel for the game
    const channel = server.createChannel()

    // add listeners to channel and clients
    channel.onClientAdded((client) => {
      // add client to the general group
      this.lobby.assignGroup(client, 'general')

      // todo: send current game state
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
