import { Server } from '@overnightjs/core'
import logger from 'morgan'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import cors from 'cors'
import controllers from './controllers'
import http from 'http'

class HttpServer extends Server {
  constructor() {
    super(process.env.NODE_ENV === 'development')

    this.setupMiddleware()
    this.addControllers(controllers)
  }

  /**
   * add express middleware
   */
  private setupMiddleware(): void {
    // remove useless http flag
    this.app.disable('x-powered-by')

    this.app.set('trust proxy', 1)

    // logs http requests in the console
    this.app.use(logger('dev'))

    // adds secure http flags
    this.app.use(helmet())

    // add restrictions to the body parser
    this.app.use(
      bodyParser.json({
        limit: '50mb',
      }),
    )
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: '50mb',
      }),
    )

    // enable CORS
    this.app.use(cors())
  }

  public async start(port: number): Promise<http.Server> {
    try {
      return this.app.listen(port, () => {
        console.log('Serving http server at port', port)
      })
    } catch (error) {
      console.error('Could not start the api server', error)

      throw new Error()
    }
  }
}

const httpServer = new HttpServer()

export default httpServer
