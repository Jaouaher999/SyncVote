import { Router } from 'express';
import { UserController } from '../controllers';
import { validateCreateUser } from '../middlewares/dataValidator';

export class UsersRoute {
    private userController: UserController;

    constructor(userController: UserController) {
        this.userController = userController;
    }

    createRouter(): Router {
        const router = Router();

        router.post('/users', validateCreateUser, this.userController.createUser.bind(this.userController));
        return router;
    }

    getRouter(): Router {
        const router = Router();

        router.get('/users', this.userController.getUsers.bind(this.userController));
        return router;
    }

}