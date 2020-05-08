import WebSocket from 'ws'
import { ClientData, CLIENT_MESSAGE_TYPES } from 'shared/data'

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
    const messageTypeValid = CLIENT_MESSAGE_TYPES.some((validType) => {
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
