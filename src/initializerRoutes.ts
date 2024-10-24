import * as controllers from './controllers'
import * as routes from './routes'
import * as services from './services'
import { FirestoreCollections } from './types/firestore';
import { RedisClientType } from 'redis';

export function initializerRoutes(db: FirestoreCollections, redisClient: RedisClientType) {
    const userService = new services.UserService(db, redisClient);
    const userController = new controllers.UserController(userService);
    const UsersRoute = new routes.UsersRoute(userController);

    const postsService = new services.PostsService(db);
    const postsController = new controllers.PostsController(postsService);
    const PostsRoute = new routes.PostsRoute(postsController);

    return {
        UsersRoute,
        PostsRoute
    }
}