export class StorageService {
  /**
   * Get an item from storage with type safety
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get item from storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set an item in storage
   */
  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item in storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove an item from storage
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item from storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Get a timestamp from storage
   */
  static getTimestamp(key: string): Date | null {
    const value = this.get<string>(key);
    return value ? new Date(Number(value)) : null;
  }

  /**
   * Set a timestamp in storage
   */
  static setTimestamp(key: string, date: Date = new Date()): boolean {
    return this.set(key, String(date.getTime()));
  }
}
