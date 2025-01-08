const DATABASE_VERSION = 2;
const POST_OBJECT_STORE = "posts";
const POST_SYNC_STORE = "sync-posts";

const validObjectStore = [POST_OBJECT_STORE, POST_SYNC_STORE];

const dbPromise = idb.open(POST_OBJECT_STORE, DATABASE_VERSION, (db) => {
  for (const objectStore of validObjectStore) {
    if (!db.objectStoreNames.contains(objectStore)) {
      db.createObjectStore(objectStore, { keyPath: "id" });
    }
  }
});

const writeData = (objectStore, data) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(objectStore, "readwrite");
    const store = tx.objectStore(objectStore);
    store.put(data);
    return tx.complete;
  });
};

const readAllData = (objectStore) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(objectStore, "readonly");
    const store = tx.objectStore(objectStore);
    return store.getAll();
  });
};

const clearAllData = (objectStore) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(objectStore, "readwrite");
    const store = tx.objectStore(objectStore);
    store.clear();
    return tx.complete;
  });
};

const deleteItemFromData = (objectStore, id) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(objectStore, "readwrite");
    const store = tx.objectStore(objectStore);
    store.delete(id);
    return tx.complete;
  });
};
