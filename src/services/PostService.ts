import { Post } from '../types/entities/Post';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { Timestamp } from 'firebase/firestore';

export class PostsService {
    private db: FirestoreCollections;

    constructor(db: FirestoreCollections) {
        this.db = db;
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
        const posts: Post[] = [];
        const postsQuerySnapshot = await this.db.posts.get();

        for (const doc of postsQuerySnapshot.docs) {
            posts.push({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
                updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
            });
        }

        return {
            status: 200,
            message: 'Posts retrieved successfully!',
            data: posts
        };
    }


}