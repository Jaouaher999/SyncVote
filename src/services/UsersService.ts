import { User } from '../types/entities/User';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { comparePassword, encryptPassword } from '../utils/password';
import { formatUserData } from '../utils/formatData';
import { generateToken } from '../utils/jwt';
import { Timestamp } from 'firebase/firestore';
import { RedisClientType } from 'redis';
import { PostsService } from './PostService';
import { CommentService } from './CommentService';

export class UserService {
    private db: FirestoreCollections;
    private redisClient: RedisClientType;
    private postService: PostsService;
    private commentService: CommentService;

    constructor(db: FirestoreCollections, redisClient: RedisClientType, postService: PostsService, commentService: CommentService) {
        this.db = db;
        this.redisClient = redisClient;
        this.postService = postService;
        this.commentService = commentService;
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

    async updateConnectedUser(userId: string, updatedUser: Partial<User>): Promise<IResBody> {
        const userRef = this.db.users.doc(userId);
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

    async getUserByUsername(username: string): Promise<IResBody> {
        const userQuerySnapshot = await this.db.users.where('username', '==', username).get();

        if (userQuerySnapshot.empty) {
            return {
                status: 404,
                message: 'User not found'
            }
        }

        const formatdatauser = formatUserData(userQuerySnapshot.docs[0].data());

        return {
            status: 200,
            message: 'User retrieved successfully',
            data: {
                id: userQuerySnapshot.docs[0].data().id,
                ...formatdatauser
            }
        }
    }


    async getUsers(): Promise<IResBody> {
        const cachKey = 'userCach';
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
                EX: 3600
            });
        }

        if (users.length === 0) {
            return {
                status: 404,
                message: 'No Users found'
            };
        }

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

    async changePassword(userId: string, newPassword: string, oldPassword: string): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId);
        const userDoc = await userRef.get();

        const isPasswordValid = comparePassword(oldPassword, userDoc.data()?.password as string);

        if (isPasswordValid) {
            await userRef.update({
                ...userDoc.data(),
                password: encryptPassword(newPassword),
                updatedAt: firestoreTimestamp.now()
            });
            return {
                status: 200,
                message: 'Password changed succesfully'
            }
        } else {
            return {
                status: 401,
                message: 'Unauthorized'
            }
        }
    }

    async getUserFeed(userId: string): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId);
        const userDoc = await userRef.get();


        const posts = await this.postService.getPostsByUserId(userId);
        const comments = await this.commentService.getCommentsByUserId(userId);

        if (!userDoc.exists) {
            return {
                status: 404,
                message: 'User not found'
            }
        }

        const formattedUserData = formatUserData(userDoc.data());

        return {
            status: 200,
            message: 'User feed retrieved successfully',
            data: {
                user: {
                    id: userDoc.id,
                    ...formattedUserData
                },
                posts,
                comments
            }
        };

    }
}