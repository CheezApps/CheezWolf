import { Request, Response } from 'express'
import { Controller, Post } from '@overnightjs/core'
import { OK } from 'http-status-codes'
import Game from 'game/index'

@Controller('api/game')
export default class GameController {
  /**
   * Creates a new game and returns channel id for establishing websocket connections
   */
  @Post()
  async createGame(_req: Request, res: Response): Promise<Response> {
    const game = new Game()

    const channelId = game.getChannel().getId()

    return res.status(OK).json({
      channelId,
    })
  }
}
