export type ResourceCache<Key, Value> = {
  load: (key: Key) => Promise<Value>;
  has: (key: Key) => boolean;
  clear: () => void;
};

export function createResourceCache<Key, Value>(loader: (key: Key) => Promise<Value>): ResourceCache<Key, Value> {
  const entries = new Map<Key, Promise<Value>>();

  return {
    load(key) {
      const cached = entries.get(key);
      if (cached) return cached;

      const pending = loader(key).catch((error) => {
        entries.delete(key);
        throw error;
      });
      entries.set(key, pending);
      return pending;
    },
    has(key) {
      return entries.has(key);
    },
    clear() {
      entries.clear();
    }
  };
}
