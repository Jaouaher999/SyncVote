import { firestore } from 'firebase-admin';
import CollectionReference = firestore.CollectionReference;
import DocumentData = firestore.DocumentData;

import { User } from './entities/User';

export interface FirestoreCollections {
    users: CollectionReference<User, DocumentData>;
}