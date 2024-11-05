import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helper';
import { Timestamp } from 'firebase/firestore';
import { Comment } from '../types/entities/Comment';
import { formatCommentData } from '../utils/formatData';
import { firestore } from 'firebase-admin';
import { RedisClientType } from 'redis';

export class CommentService {
    private db: FirestoreCollections;
    private redisClient: RedisClientType;

    constructor(db: FirestoreCollections, redisClient: RedisClientType) {
        this.db = db;
        this.redisClient = redisClient;
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
        const cachekey = 'commentsBy' + postId;

        let comments: Comment[] = [];

        const cachedComments = await this.redisClient.get(cachekey);

        if (cachedComments) {
            comments = JSON.parse(cachedComments);
        } else {
            const commentsQuerySnapshot = await this.db.comments.where('postId', '==', postId).get();

            for (const doc of commentsQuerySnapshot.docs) {
                const formadatacomment = formatCommentData(doc.data());
                comments.push({
                    id: doc.id,
                    ...formadatacomment
                });
            }

            await this.redisClient.set(cachekey, JSON.stringify(comments), {
                EX: 3600
            });
        }

        comments.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

        if (comments.length === 0) {
            return {
                status: 404,
                message: 'No comments found'
            };
        }

        return {
            status: 200,
            message: 'Comments retrieved successfully!',
            data: comments
        };
    }

    async getCommentsByUserId(userId: string): Promise<IResBody> {

        const comments: Comment[] = [];
        const commentsQuerySnapshot = await this.db.comments.where('createdBy', '==', userId).get();

        if (commentsQuerySnapshot.empty) {
            return {
                status: 404,
                message: 'Comments not found'
            }
        }

        for (const doc of commentsQuerySnapshot.docs) {
            const formadatacomment = formatCommentData(doc.data());
            comments.push({
                id: doc.id,
                ...formadatacomment
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
                ...formatdatacomment
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