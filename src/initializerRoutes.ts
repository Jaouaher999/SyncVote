import * as controllers from './controllers'
import * as routes from './routes'
import * as services from './services'
import { FirestoreCollections } from './types/firestore';

export function initializerRoutes(db: FirestoreCollections) {
    const userService = new services.UserService(db);
    const userController = new controllers.UserController(userService);
    const UsersRoute = new routes.UsersRoute(userController);

    return {
        UsersRoute,
    }
}