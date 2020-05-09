export const CLIENT_MESSAGE_TYPES = [
  // message types coming from the client
  'channel_connection',
] as const

export const SERVER_MESSAGE_TYPES = [
  // message types coming from the server
  ...CLIENT_MESSAGE_TYPES,
  'channel_connection_error',
  'user_joined_channel',
  'game_state',
] as const

export type ClientMessageType = typeof CLIENT_MESSAGE_TYPES[number]
export type ServerMessageType = typeof SERVER_MESSAGE_TYPES[number]

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
