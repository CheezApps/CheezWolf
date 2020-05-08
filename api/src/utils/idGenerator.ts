const CHARS = '23456789abdegjkmnpqrvwxyz'

export default class IdGenerator {
  private idLength: number
  private usedIds: Set<string>
  private nextId: string

  /**
   * Generator for small readable id
   * @param idLength The length of the id to be generated
   */
  constructor(idLength = 8) {
    this.idLength = idLength
    this.usedIds = new Set()
    this.nextId = this.generateId()
  }

  /**
   * Generate a new id without collision
   */
  private generateId(): string {
    let id = ''

    for (let i = 0; i < this.idLength; i++) {
      const randomIndex = Math.floor(Math.random() * CHARS.length)
      id += CHARS.charAt(randomIndex)
    }

    // check for collision
    if (this.usedIds.has(id)) {
      return this.generateId()
    } else {
      return id
    }
  }

  /**
   * Assign asynchronously the next id
   */
  private async generateNextId(): Promise<void> {
    this.nextId = this.generateId()
  }

  /**
   * Returns a new unique id
   */
  public generate(): string {
    const id = this.nextId

    // add to used id
    this.usedIds.add(id)

    // prepare next id (does not block thread)
    this.generateNextId()

    return id
  }

  /**
   * Removes an id from the used stack, allowing it to be reused later
   * @param id The id to liberate
   */
  public liberate(id: string): void {
    this.usedIds.delete(id)
  }
}
