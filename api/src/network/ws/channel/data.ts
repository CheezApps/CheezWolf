import WebSocket from 'ws'

const clientListOfMessageType = [
  // message types coming from the client
  'channel_connection',
] as const

const serverListOfMessageType = [
  // message types coming from the server
  ...clientListOfMessageType,
  'user_joined_channel',
] as const

export type ClientMessageType = typeof clientListOfMessageType[number]
export type ServerMessageType = typeof serverListOfMessageType[number]

export interface ClientData {
  /**
   * The message id
   */
  id: number
  type: ClientMessageType
  value: any
}

export interface ServerData {
  /**
   * Return id in response to a message received from ClientData
   * Example: If the user sends message with id 1, the server answers with id 1
   */
  id?: number
  type: ServerMessageType
  value: any
}

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
