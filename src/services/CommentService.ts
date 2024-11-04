import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { Timestamp } from 'firebase/firestore';
import { Comment } from '../types/entities/Comment';
import { formatCommentData } from '../utils/formatData';
import { firestore } from 'firebase-admin';

export class CommentService {
    private db: FirestoreCollections;

    constructor(db: FirestoreCollections) {
        this.db = db;
    }

    async createComment(commentData: Comment, postsId: string): Promise<IResBody> {
        const commentRef = this.db.comments.doc();
        await commentRef.set({
            ...commentData,
            postId: postsId,
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
        const commentsQuerySnapshot = await this.db.comments.where('postId', '==', postId).get();

        for (const doc of commentsQuerySnapshot.docs) {
            const formadatacomment = formatCommentData(doc.data());
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
        const userRef = await this.db.users.doc(userId).get();

        const commentRef = this.db.comments.doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return {
                status: 404,
                message: 'Comment not found'
            }
        }
        if (userId == commentDoc.data()?.createdBy || userRef.data()?.role == 'admin') {
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

    async deleteComment(userId: string, commentId: string): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId).get();

        const commentRef = this.db.comments.doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return {
                status: 404,
                message: 'Comment not found'
            }
        }

        if (userId == commentDoc.data()?.createdBy || userRef.data()?.role == 'admin') {
            await commentRef.delete();

            return {
                status: 200,
                message: 'Comment deleted successfully'
            }
        } else {
            return {
                status: 401,
                message: 'Unauthorized'
            }
        }
    }

    async getCommentById(commentId: string): Promise<IResBody> {
        const commentQuerySnapshot = await this.db.comments.doc(commentId).get();

        if (!commentQuerySnapshot.exists) {
            return {
                status: 404,
                message: 'Comment not found'
            }
        }

        const formatdatacomment = formatCommentData(commentQuerySnapshot.data());

        return {
            status: 200,
            message: 'Comment retrieved successfully',
            data: {
                id: commentId,
                ...formatdatacomment,
                createdAt: (commentQuerySnapshot.data()?.createdAt as Timestamp)?.toDate(),
                updatedAt: (commentQuerySnapshot.data()?.updatedAt as Timestamp)?.toDate(),
            }
        }
    }

    async upVote(userId: string, commentId: string): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId).get();

        const commentRef = this.db.comments.doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return {
                status: 404,
                message: 'Comment not found'
            }
        }

        if (commentDoc.data()?.usersVote?.includes(userRef.id)) {
            return {
                status: 404,
                message: 'User already voted'
            }
        } else {
            await commentRef.update({
                ...commentDoc.data(),
                usersVote: firestore.FieldValue.arrayUnion(userRef.id),
                voteCount: firestore.FieldValue.increment(1)
            });
            return {
                status: 200,
                message: 'Vote updated'
            }
        }
    }

    async downVote(userId: string, commentId: string): Promise<IResBody> {
        const userRef = await this.db.users.doc(userId).get();

        const commentRef = this.db.comments.doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return {
                status: 404,
                message: 'Comment not found'
            }
        }

        if (commentDoc.data()?.usersVote?.includes(userRef.id)) {
            return {
                status: 404,
                message: 'User already voted'
            }
        } else {
            await commentRef.update({
                ...commentDoc.data(),
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