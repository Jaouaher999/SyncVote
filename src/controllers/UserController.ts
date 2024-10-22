import { Request, Response } from 'express';
import { UserService } from '../services';
import { validationResult } from 'express-validator';


export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async createUser(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request',
                data: errors.array()
            })
        } else {
            try {
                const { email, password, username } = request.body;

                const userData = { email, password, username };

                const userResponse = await this.userService.createUser(userData);


                response.status(userResponse.status).send({
                    ...userResponse
                })

            } catch (error) {
                response.status(400).json({
                    status: 500,
                    message: 'Internal server error'
                })
            }
        }


    }
}