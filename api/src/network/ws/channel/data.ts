import WebSocket from 'ws'

export interface ClientData {
  /**
   * The message id
   */
  id: number
  type: string
  value: any
}

export interface ServerData {
  /**
   * Return id in response to a message received from ClientData
   * Example: If the user sends message with id 1, the server answers with id 1
   */
  id?: number
  type: string
  value: any
}

const parseClientData = (data: WebSocket.Data): ClientData | false => {
  try {
    const parsedData: ClientData = JSON.parse(data.toString())

    // check validity of the parsed data
    if (typeof parsedData.id !== 'number' || typeof parsedData.type !== 'string') {
      return false
    }

    return parsedData
  } catch {
    return false
  }
}

export { parseClientData }
