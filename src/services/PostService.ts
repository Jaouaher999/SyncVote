import { Post } from '../types/entities/Post';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { Timestamp } from 'firebase/firestore';
import { RedisClientType } from 'redis';
import { formatPostData } from '../utils/formatData';

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


    async getPosts(): Promise<IResBody> {
        const cachKey = 'postsCach';
        let posts: Post[] = [];

        const cachedPosts = await this.redisClient.get(cachKey);

        if (cachedPosts) {
            posts = JSON.parse(cachedPosts);
        } else {
            const postsQuerySnapshot = await this.db.posts.get();

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

    async deletePost(postId: string): Promise<IResBody> {
        const postRef = this.db.posts.doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return {
                status: 404,
                message: 'Post not found'
            }
        }

        await postRef.delete();

        return {
            status: 200,
            message: 'Post deleted successfully'
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

        const formatdatacomment = formatPostData(postQuerySnapshot.data());

        return {
            status: 200,
            message: 'Post retrieved successfully',
            data: {
                id: postId,
                ...formatdatacomment,
                createdAt: (postQuerySnapshot.data()?.createdAt as Timestamp)?.toDate(),
                updatedAt: (postQuerySnapshot.data()?.updatedAt as Timestamp)?.toDate(),
            }
        }
    }

    async updatePost(userId: string, postId: string, updatedPost: Partial<Post>): Promise<IResBody> {
        const postRef = this.db.posts.doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return {
                status: 404,
                message: 'Post not found'
            }
        }

        if (userId == postDoc.data()?.createdBy) {
            await postRef.update({
                ...updatedPost,
                updatedAt: firestoreTimestamp.now()
            });
            return {
                status: 200,
                message: 'Post updated'
            }
        } else {
            return {
                status: 401,
                message: 'Unauthorized'
            }
        }



    }


}