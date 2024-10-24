import { User } from '../types/entities/User';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { comparePassword, encryptPassword } from '../utils/password';
import { formatUserData } from '../utils/formatData';
import { generateToken } from '../utils/jwt';
import { Timestamp } from 'firebase/firestore';
import { RedisClientType } from 'redis';

export class UserService {
    private db: FirestoreCollections;
    private redisClient: RedisClientType;

    constructor(db: FirestoreCollections, redisClient: RedisClientType) {
        this.db = db;
        this.redisClient = redisClient;
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

    async updateUser(userId: string, updatedUser: Partial<User>): Promise<IResBody> {
        const userRef = this.db.users.doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return {
                status: 404,
                message: 'User not found'
            }
        }

        await userRef.update({
            ...updatedUser,
            updatedAt: firestoreTimestamp.now()
        })

        return {
            status: 200,
            message: 'User updated'
        }
    }

    async deleteUser(userId: string): Promise<IResBody> {
        const userRef = this.db.users.doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return {
                status: 404,
                message: 'User not found'
            }
        }

        await userRef.delete();

        return {
            status: 200,
            message: 'User deleted successfully'
        }
    }

    async getUserById(userId: string): Promise<IResBody> {
        const userQuerySnapshot = await this.db.users.doc(userId).get();

        if (!userQuerySnapshot.exists) {
            return {
                status: 404,
                message: 'User not found'
            }
        }

        const formatdatauser = formatUserData(userQuerySnapshot.data());

        return {
            status: 200,
            message: 'User retrieved successfully',
            data: {
                id: userId,
                ...formatdatauser,
                createdAt: (userQuerySnapshot.data()?.createdAt as Timestamp)?.toDate(),
                updatedAt: (userQuerySnapshot.data()?.updatedAt as Timestamp)?.toDate(),
            }
        }
    }


    async getUsers(): Promise<IResBody> {
        const cachKey = 'users';
        let users: User[] = [];

        const cachedUsers = await this.redisClient.get(cachKey);

        if (cachedUsers) {
            users = JSON.parse(cachedUsers);
        } else {
            const userQuerySnapshot = await this.db.users.get();

            for (const doc of userQuerySnapshot.docs) {
                const formatdatauser = formatUserData(doc.data())

                users.push({
                    id: doc.id,
                    ...formatdatauser
                });
            }

            await this.redisClient.set(cachKey, JSON.stringify(users), {
                EX: 60
            });
        }
        console.log(users.length);
        return {
            status: 200,
            message: 'Users retrieved successfully',
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
                        token: generateToken(userQuerySnapshot.docs[0].id, formatDataUser.role)
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