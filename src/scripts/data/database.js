import { openDB } from 'idb';

const DATABASE_NAME = 'sstory-like-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'liked-stories';
 
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
  },
});

const LikeDB = {
  async getAll() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async get(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async put(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async delete(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default LikeDB;