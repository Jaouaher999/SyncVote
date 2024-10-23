import { User } from '../types/entities/User';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { encryptPassword } from '../utils/password';
import { Timestamp } from 'firebase/firestore'
import { formatUserData } from '../utils/formatData';

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
                password: encryptPassword(userData.password as string),
                role: 'member',
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

    async getUsers(): Promise<IResBody> {
        const users: User[] = [];
        const userQuerySnapshot = await this.db.users.get();

        for (const doc of userQuerySnapshot.docs) {
            const formatdatauser = formatUserData(doc.data())

            users.push({
                id: doc.id,
                ...formatdatauser
            });
        }
        return {
            status: 200,
            message: 'User retrieved successfully',
            data: users
        }

    }

    /*async getAllUsers(): Promise<IResBody> {
        const usersSnapshot = await this.db.users.get();
        const usersList: User[] = [];

        if (!usersSnapshot.empty) {
            usersSnapshot.forEach((user) => {
                usersList.push({
                    id: user.id,
                    ...user.data()
                });
            });
            return {
                status: 200,
                message: 'Users retrieved successfully',
                data: usersList
            };
        } else {
            return {
                status: 500,
                message: 'Error retrieving users'
            }
        }

    }*/


}