import { User } from '../types/entities/User';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { comparePassword, encryptPassword } from '../utils/password';
import { formatUserData } from '../utils/formatData';
import { generateToken } from '../utils/jwt';

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

    async login(userData: { email: string, password: string }): Promise<IResBody> {
        const { email, password } = userData;

        const userQuerySnapshot = await this.db.users.where('email', '==', email).get();

        if (userQuerySnapshot.empty) {
            return {
                status: 401,
                message: 'Unauthorized'
            }
        } else {
            const isPasswordValid = comparePassword(password, userQuerySnapshot.docs[0].data().password as string);

            if (isPasswordValid) {
                const formatDataUser = formatUserData(userQuerySnapshot.docs[0].data())

                return {
                    status: 200,
                    message: 'User login successfully!',
                    data: {
                        user: {
                            ...formatDataUser
                        },
                        token: generateToken(userQuerySnapshot.docs[0].id)
                    }
                }
            } else {
                return {
                    status: 401,
                    message: 'Unauthorized'
                }
            }
        }
    }
}