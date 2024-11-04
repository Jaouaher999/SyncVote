import { Post } from '../types/entities/Post';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { Timestamp } from 'firebase/firestore';
import { RedisClientType } from 'redis';
import { formatPostData } from '../utils/formatData';
import { firestore } from 'firebase-admin';

export class PostsService {
    private db: FirestoreCollections;
    private redisClient: RedisClientType;

    constructor(db: FirestoreCollections, redisClient: RedisClientType) {
        this.db = db;
        this.redisClient = redisClient;
    }

    async createPost(postData: Post): Promise<IResBody> {
        const postRef = this.db.posts.doc();
        await postRef.set({
            ...postData,
            voteCount: 0,
            createdAt: firestoreTimestamp.now(),
            updatedAt: firestoreTimestamp.now(),
        });

        return {
            status: 201,
            message: 'Post created successfully!',
        };
    }


    async getPosts(category?: string): Promise<IResBody> {
        const cacheKey = category ? `postCache:${category}` : 'postCache:all';

        let posts: Post[] = [];

        const cachedPosts = await this.redisClient.get(cacheKey);

        if (cachedPosts) {
            posts = JSON.parse(cachedPosts);
        } else {
            const postsQuerySnapshot = category ? await this.db.posts.where("categories", "array-contains", category).get() : await this.db.posts.get();

            for (const doc of postsQuerySnapshot.docs) {
                const formatdatapost = formatPostData(doc.data());
                posts.push({
                    id: doc.id,
                    ...formatdatapost,
                    createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
                    updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
                });
            }

            await this.redisClient.set(cacheKey, JSON.stringify(posts), {
                EX: 3600
            });
        }
        return {
            status: 200,
            message: 'Posts retrieved successfully!',
            data: posts
        };
    }

    async deletePost(postId: string, userId: string): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId).get();

        const postRef = this.db.posts.doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return {
                status: 404,
                message: 'Post not found'
            }
        }
        if (userId == postDoc.data()?.createdBy || userRef.data()?.role == 'admin') {
            await postRef.delete();

            return {
                status: 200,
                message: 'Post deleted successfully'
            }
        } else {
            return {
                status: 401,
                message: 'Unauthorized'
            }
        }


    }

    async getPostById(postId: string): Promise<IResBody> {
        const postQuerySnapshot = await this.db.posts.doc(postId).get();

        if (!postQuerySnapshot.exists) {
            return {
                status: 404,
                message: 'Post not found'
            }
        }

        const formatdatapost = formatPostData(postQuerySnapshot.data());

        return {
            status: 200,
            message: 'Post retrieved successfully',
            data: {
                id: postId,
                ...formatdatapost,
                createdAt: (postQuerySnapshot.data()?.createdAt as Timestamp)?.toDate(),
                updatedAt: (postQuerySnapshot.data()?.updatedAt as Timestamp)?.toDate(),
            }
        }
    }

    async updatePost(userId: string, postId: string, updatedPost: Partial<Post>): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId).get();

        const postRef = this.db.posts.doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return {
                status: 404,
                message: 'Post not found'
            }
        }

        if (userId == postDoc.data()?.createdBy || userRef.data()?.role == 'admin') {
            await postRef.update({
                ...updatedPost,
                updatedAt: firestoreTimestamp.now()
            });
            return {
                status: 200,
                message: 'Post updated',
            }
        } else {
            return {
                status: 401,
                message: 'Unauthorized'
            }
        }
    }

    async getPostsByUserId(userId: string): Promise<IResBody> {
        const cachKey = 'postsByUserId/' + userId;
        let posts: Post[] = [];

        const cachedPosts = await this.redisClient.get(cachKey);

        if (cachedPosts) {
            posts = JSON.parse(cachedPosts);
        } else {
            const postsQuerySnapshot = await this.db.posts.where("createdBy", "==", userId).get();

            for (const doc of postsQuerySnapshot.docs) {

                posts.push({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
                    updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
                });
            }

            await this.redisClient.set(cachKey, JSON.stringify(posts), {
                EX: 3600
            });
        }
        return {
            status: 200,
            message: 'Posts retrieved successfully!',
            data: posts
        };
    }

    async upVote(userId: string, postId: string): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId).get();

        const postRef = this.db.posts.doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return {
                status: 404,
                message: 'Post not found'
            }
        }

        if (postDoc.data()?.usersVote?.includes(userRef.id)) {
            return {
                status: 404,
                message: 'User already voted'
            }
        } else {
            await postRef.update({
                ...postDoc.data(),
                usersVote: firestore.FieldValue.arrayUnion(userRef.id),
                voteCount: firestore.FieldValue.increment(1)
            });
            return {
                status: 200,
                message: 'Vote updated'
            }
        }
    }

    async downVote(userId: string, postId: string): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId).get();

        const postRef = this.db.posts.doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return {
                status: 404,
                message: 'Post not found'
            }
        }

        if (postDoc.data()?.usersVote?.includes(userRef.id)) {
            return {
                status: 404,
                message: 'User already voted'
            }
        } else {
            await postRef.update({
                ...postDoc.data(),
                usersVote: firestore.FieldValue.arrayUnion(userRef.id),
                voteCount: firestore.FieldValue.increment(-1)
            });
            return {
                status: 200,
                message: 'Vote updated'
            }
        }
    }
}