import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { Timestamp } from 'firebase/firestore';
import { Comment } from '../types/entities/Comment';

export class CommentService {
    private db: FirestoreCollections;

    constructor(db: FirestoreCollections) {
        this.db = db;
    }

    async createComment(commentData: Comment): Promise<IResBody> {
        const commentRef = this.db.comments.doc();
        await commentRef.set({
            ...commentData,
            createdAt: firestoreTimestamp.now(),
            updatedAt: firestoreTimestamp.now(),
        });

        return {
            status: 201,
            message: 'Comment created successfully!',
        };
    }


    async getComments(): Promise<IResBody> {
        const comments: Comment[] = [];
        const commentsQuerySnapshot = await this.db.comments.get();

        for (const doc of commentsQuerySnapshot.docs) {
            comments.push({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
                updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
            });
        }

        return {
            status: 200,
            message: 'Comments retrieved successfully!',
            data: comments
        };
    }


}