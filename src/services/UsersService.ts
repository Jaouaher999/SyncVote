import { User } from '../types/entities/User';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';

export class UserService {
    private db: FirestoreCollections;

    constructor(db: FirestoreCollections) {
        this.db = db;
    }

    async createUser(userData: User): Promise<IResBody> {
        const userQuerySnapshot = await this.db.users.where('email', '==', userData.email).get();

        if (userQuerySnapshot.empty) {
            const userRef = this.db.users.doc();
            await userRef.set({
                ...userData,
                createdAt: firestoreTimestamp.now(),
                updatedAt: firestoreTimestamp.now()

            });
            return {
                status: 201,
                message: 'User created successfully'
            }
        } else {
            return {
                status: 409,
                message: 'User already exist.'
            }
        }
    }
}