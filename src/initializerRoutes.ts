import * as controllers from './controllers'
import * as routes from './routes'
import * as services from './services'
import { FirestoreCollections } from './types/firestore';
import { RedisClientType } from 'redis';

export function initializerRoutes(db: FirestoreCollections, redisClient: RedisClientType) {
    const postsService = new services.PostsService(db, redisClient);
    const postsController = new controllers.PostsController(postsService);
    const postsRoute = new routes.PostsRoute(postsController);

    const commentService = new services.CommentService(db, redisClient);
    const commentController = new controllers.CommentController(commentService);
    const commentsRoute = new routes.CommentsRoute(commentController);

    const userService = new services.UserService(db, redisClient, postsService, commentService);
    const userController = new controllers.UserController(userService);
    const usersRoute = new routes.UsersRoute(userController);

    return {
        usersRoute,
        postsRoute,
        commentsRoute
    }
}