import { Router } from 'express';
import { CommentController } from '../controllers';
import { validateCreateComment } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt';

export class CommentsRoute {
    private commentController: CommentController;

    constructor(commentController: CommentController) {
        this.commentController = commentController;
    }

    createRouter(): Router {
        const router = Router();

        router.get('/comments/post/:postId', this.commentController.getComments.bind(this.commentController));
        router.get('/comments/:id', this.commentController.getCommentById.bind(this.commentController));
        router.post('/comments/:postId', authJwt.verifyToken, validateCreateComment, this.commentController.createComment.bind(this.commentController));
        router.put('/comments/:id', authJwt.verifyToken, this.commentController.updateComment.bind(this.commentController));
        router.delete('/comments/:id', authJwt.verifyToken, this.commentController.deleteComment.bind(this.commentController));
        router.put('/comments/:id/upVote', authJwt.verifyToken, this.commentController.upVote.bind(this.commentController));
        router.put('/comments/:id/downVote', authJwt.verifyToken, this.commentController.downVote.bind(this.commentController));

        return router;
    }
}