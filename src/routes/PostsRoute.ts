import { Router } from 'express';
import { PostsController } from '../controllers';
import { validateCreatePost } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt';

export class PostsRoute {
    private postsController: PostsController;

    constructor(postsController: PostsController) {
        this.postsController = postsController;
    }

    createRouter(): Router {
        const router = Router();

        router.post('/posts', authJwt.verifyToken, validateCreatePost, this.postsController.createPost.bind(this.postsController));
        router.get('/posts', this.postsController.getPosts.bind(this.postsController));
        router.get('/posts/:id', this.postsController.getPostById.bind(this.postsController));
        router.put('/posts/:id', authJwt.verifyToken, this.postsController.updatePost.bind(this.postsController));
        router.delete('/posts/:id', authJwt.verifyToken, this.postsController.deletePost.bind(this.postsController));
        router.get('/posts/user/:userId', this.postsController.getPostsByUserId.bind(this.postsController));

        router.put('/posts/:id/upVote', authJwt.verifyToken, this.postsController.upVote.bind(this.postsController));
        router.put('/posts/:id/downVote', authJwt.verifyToken, this.postsController.downVote.bind(this.postsController));
        router.get('/posts/title/:title', this.postsController.getPostByTitle.bind(this.postsController));

        return router;
    }
}