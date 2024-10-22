import { Request, Response } from 'express';
import { UserService } from '../services';

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async createUser(request: Request, response: Response): Promise<void> {
        await this.userService.createUser();

        response.status(201).send({
            message: 'testusercreate success'
        })
    }
}