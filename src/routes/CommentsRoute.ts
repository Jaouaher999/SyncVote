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

        router.post('/comments', validateCreateComment, this.commentController.createComment.bind(this.commentController));
        router.get('/comments/:postId', authJwt.verifyToken, this.commentController.getComments.bind(this.commentController));
        router.put('/comments/:id', authJwt.verifyToken, this.commentController.updateComment.bind(this.commentController));
        router.delete('/comments/:id', authJwt.verifyToken, this.commentController.deleteComment.bind(this.commentController));


        return router;
    }
}