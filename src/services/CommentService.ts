import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { Timestamp } from 'firebase/firestore';
import { Comment } from '../types/entities/Comment';
import { formatPostData } from '../utils/formatData';

export class CommentService {
    private db: FirestoreCollections;

    constructor(db: FirestoreCollections) {
        this.db = db;
    }

    async createComment(commentData: Comment): Promise<IResBody> {
        const commentRef = this.db.comments.doc();
        await commentRef.set({
            ...commentData,
            voteCount: 0,
            createdAt: firestoreTimestamp.now(),
            updatedAt: firestoreTimestamp.now(),
        });

        return {
            status: 201,
            message: 'Comment created successfully!',
        };
    }


    async getCommentsByPostId(postId: string): Promise<IResBody> {
        const comments: Comment[] = [];
        const commentsQuerySnapshot = await this.db.comments.where('createdBy', '==', postId).get();

        for (const doc of commentsQuerySnapshot.docs) {
            const formadatacomment = formatPostData(doc.data());
            comments.push({
                id: doc.id,
                ...formadatacomment,
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

    async updateComment(userId: string, commentId: string, updatedComment: Partial<Comment>): Promise<IResBody> {
        const commentRef = this.db.comments.doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return {
                status: 404,
                message: 'Comment not found'
            }
        }
        if (userId == commentDoc.data()?.createdBy) {
            await commentRef.update({
                ...updatedComment,
                updatedAt: firestoreTimestamp.now()
            });
            return {
                status: 200,
                message: 'Comment updated'
            }
        } else {
            return {
                status: 401,
                message: 'Unauthorized'
            }
        }
    }

    async deleteComment(commentId: string): Promise<IResBody> {
        const commentRef = this.db.comments.doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return {
                status: 404,
                message: 'Comment not found'
            }
        }

        await commentRef.delete();

        return {
            status: 200,
            message: 'Comment deleted successfully'
        }
    }


}