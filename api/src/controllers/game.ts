import { Request, Response } from 'express'
import { Controller, Post } from '@overnightjs/core'
import { OK } from 'http-status-codes'

@Controller('api/game')
export default class GameController {
  @Post()
  async createGame(_req: Request, res: Response): Promise<Response> {
    return res.sendStatus(OK)
  }
}
