const DATABASE_VERSION = 2;
const POST_OBJECT_STORE = "posts";

const dbPromise = idb.open(POST_OBJECT_STORE, DATABASE_VERSION, (db) => {
  if (!db.objectStoreNames.contains(POST_OBJECT_STORE)) {
    db.createObjectStore(POST_OBJECT_STORE, { keyPath: "id" });
  }
});

const writeData = (data) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(POST_OBJECT_STORE, "readwrite");
    const store = tx.objectStore(POST_OBJECT_STORE);
    store.put(data);
    return tx.complete;
  });
};
