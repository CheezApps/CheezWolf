import Client from 'network/ws/client'
import { ServerData, LobbyChatDataValue } from 'shared/data'

interface GroupConfig {
  active_chat: boolean
}

const DEFAULT_GROUP_CONFIG: GroupConfig = {
  active_chat: true,
}

export default class Lobby {
  private groups: Map<string, GroupConfig>
  private clientGroups: Map<Client, Set<string>>

  constructor() {
    this.groups = new Map()
    this.clientGroups = new Map()
  }

  private setClientListeners(client: Client): void {
    client.addListener<LobbyChatDataValue>('chat_message', (data) => {
      if (!this.groups.get(data.value.to)?.active_chat) {
        client.sendData({
          id: data.id,
          type: 'chat_message_error',
          value: {
            message: 'The group does not allow messaging',
          },
        })

        return
      }

      const sentData: ServerData = {
        type: 'chat_message',
        value: {
          ...data.value,
          from: client.getId(),
        },
      }

      const success = this.broadcastTo(data.value.to, sentData, [client])

      if (success) {
        client.sendData({
          id: data.id,
          type: 'chat_message_success',
          value: undefined, // todo: maybe change that?
        })
      } else {
        client.sendData({
          id: data.id,
          type: 'chat_message_error',
          value: {
            message: 'The group does not exist',
          },
        })
      }
    })
  }

  public assignGroup(client: Client, group: string): void {
    // add group to record if it does not exist
    if (!this.groups.has(group)) {
      this.groups.set(group, DEFAULT_GROUP_CONFIG)
    }

    // if it is a new client to the chat
    if (!this.clientGroups.has(client)) {
      // instantiate a new set
      this.clientGroups.set(client, new Set())

      // add listeners to the client
      this.setClientListeners(client)
    }

    // assign group to the client
    this.clientGroups.get(client)?.add(group)
  }

  public clearGroup(group: string): void {
    this.groups.delete(group)

    this.clientGroups.forEach((groups) => {
      groups.delete(group)
    })
  }

  public broadcastTo(group: string, data: ServerData, exceptions: Client[] = []): boolean {
    if (!this.groups.has(group)) {
      return false
    }

    const exceptionsSet = new Set(exceptions)

    this.clientGroups.forEach((groups, client) => {
      // if group is assigned to the client broadcast the data
      if (groups.has(group) && !exceptionsSet.delete(client)) {
        client.sendData(data)
      }
    })

    return true
  }

  public setGroupConfig(group: string, config: GroupConfig): void {
    this.groups.set(group, config)
  }

  // GETTERS

  public getGroups(): Map<string, GroupConfig> {
    return this.groups
  }

  public getGroupConfig(group: string): GroupConfig | undefined {
    return this.groups.get(group)
  }
}
