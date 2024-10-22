import * as controllers from './controllers'
import * as routes from './routes'
import * as services from './services'

export function initializerRoutes() {
    const userService = new services.UserService();
    const userController = new controllers.UserController(userService);
    const UsersRoute = new routes.UsersRoute(userController);

    return {
        UsersRoute,
    }
}