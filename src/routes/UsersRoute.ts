import { Router } from 'express';
import { UserController } from '../controllers';

export class UsersRoute {
    private userController: UserController;

    constructor(userController: UserController) {
        this.userController = userController;
    }

    createRouter(): Router {
        const router = Router();

        router.post('/users', this.userController.createUser.bind(this.userController));
        return router;
    }



}