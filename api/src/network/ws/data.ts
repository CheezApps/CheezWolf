import WebSocket from 'ws'

const clientListOfMessageType = [
  // message types coming from the client
  'channel_connection',
] as const

const serverListOfMessageType = [
  // message types coming from the server
  ...clientListOfMessageType,
  'channel_connection_error',
  'user_joined_channel',
] as const

export type ClientMessageType = typeof clientListOfMessageType[number]
export type ServerMessageType = typeof serverListOfMessageType[number]

export interface ClientData<T = any> {
  /**
   * The message id
   */
  id: number
  type: ClientMessageType
  value: T
}

export interface ServerData<T = any> {
  /**
   * Return id in response to a message received from ClientData
   * Example: If the user sends message with id 1, the server answers with id 1
   */
  id?: number
  type: ServerMessageType
  value: T
}

/**
 * Parses the incoming websocket data as ClientData,
 * returns false if data is invalid
 * @param data Websocket data to be parsed
 */
const parseClientData = (data: WebSocket.Data): ClientData | false => {
  try {
    const parsedData: ClientData = JSON.parse(data.toString())

    // check validity of the parsed data
    if (typeof parsedData.id !== 'number' || typeof parsedData.type !== 'string') {
      return false
    }

    // check validity of the message type
    const messageTypeValid = clientListOfMessageType.some((validType) => {
      return validType === parsedData.type
    })

    if (!messageTypeValid) {
      return false
    }

    return parsedData
  } catch {
    return false
  }
}

export { parseClientData }
