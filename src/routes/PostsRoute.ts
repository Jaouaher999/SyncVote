import { Router } from 'express';
import { PostsController } from '../controllers';
import { validateCreatePost } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt'

export class PostsRoute {
    private postsController: PostsController;

    constructor(postsController: PostsController) {
        this.postsController = postsController;
    }

    createRouter(): Router {
        const router = Router();

        router.post('/posts', authJwt.verifyToken, validateCreatePost, this.postsController.createPost.bind(this.postsController));
        router.get('/posts', this.postsController.getPosts.bind(this.postsController));


        return router;
    }
}