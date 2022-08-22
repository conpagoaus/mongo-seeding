import { Db, ObjectId } from 'mongodb';

export async function listExistingCollections(db: Db): Promise<string[]> {
  const collections = await db.listCollections().toArray();
  return collections.map((collection) => collection.name);
}

export async function createCollection(db: Db, collectionName: string) {
  await db.createCollection(collectionName);
}

export function removeUnderscoreIdProperty(obj: { _id: ObjectId }) {
  const newObj = { ...obj };
  // @ts-ignore
  delete newObj._id;
  return newObj;
}
