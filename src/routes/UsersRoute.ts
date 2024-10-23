import { Router } from 'express';
import { UserController } from '../controllers';
import { validateCreateUser, validateLoginUser } from '../middlewares/dataValidator';

export class UsersRoute {
    private userController: UserController;

    constructor(userController: UserController) {
        this.userController = userController;
    }

    createRouter(): Router {
        const router = Router();

        router.post('/users', validateCreateUser, this.userController.createUser.bind(this.userController));
        router.get('/users', this.userController.getUsers.bind(this.userController));
        router.post('/auth/login', validateLoginUser, this.userController.login.bind(this.userController));
        return router;
    }
}