import { Ok, Err, Result } from "ts-results";

export class RefID<itemType> {
  private lifetime: number;
  private storage: Map<string, itemType> = new Map();

  /**
   * A small caching utility
   * @param lifetime Default lifetime of cached items
   */
  constructor(lifetime: number = 10000) {
    this.lifetime = lifetime;
  }

  /**
   * Adds an item to cache
   * @param item The item to cache
   * @param lifetime Lifetime of this cache, defaults to constructor when not specified
   * @returns A unique id to retrieve the cached item
   */
  cache(item: itemType, lifetime = this.lifetime) {
    let id = crypto.randomUUID();
    this.storage.set(id, item);
    setTimeout(() => {
      this.storage.delete(id);
    }, lifetime);
    return id;
  }

  /**
   * Retrieve a cached item
   * @param id Unique ID of the cached item
   * @param callback A optional callback function
   * @returns The cached item
   */
  get(id: string): Result<itemType, "ItemNotFound"> {
    let item = this.storage.get(id);
    if (!item) return Err("ItemNotFound");
    return Ok(item);
  }
}
