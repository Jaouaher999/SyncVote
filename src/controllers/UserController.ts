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
                response.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                })
            }
        }
    }

    async updateUser(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request',
                data: errors.array()
            })
        } else {
            try {
                const userId = request.params.id;
                const updatedUserData = request.body;

                const userResponse = await this.userService.updateUser(userId, updatedUserData);


                response.status(userResponse.status).send({
                    ...userResponse
                })

            } catch (error) {
                response.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                })
            }
        }
    }

    async deleteUser(request: Request, response: Response): Promise<void> {
        try {
            const userId = request.params.id;

            const userResponse = await this.userService.deleteUser(userId);

            response.status(userResponse.status).json({
                ...userResponse
            });
        } catch (error) {
            response.status(500).json({
                status: 500,
                message: 'Internal server error'
            });
        }
    }

    async getUsers(request: Request, response: Response): Promise<void> {
        try {
            if (request.userRole == 'admin') {
                const userResponse = await this.userService.getUsers();


                response.status(userResponse.status).send({
                    ...userResponse
                })
            } else {
                response.status(401).json({
                    status: 401,
                    message: 'Unauthorized'
                })
            }


        } catch (error) {
            response.status(500).json({
                status: 500,
                message: 'Internal server error',
                data: error
            })
        }
    }

    async getUserById(request: Request, response: Response): Promise<void> {
        try {
            if (request.params.id) {
                const userResponse = await this.userService.getUserById(request.params.id);


                response.status(userResponse.status).send({
                    ...userResponse
                });
            } else {
                response.status(404).json({
                    status: 404,
                    message: 'User not found'
                })
            }


        } catch (error) {
            response.status(500).json({
                status: 500,
                message: 'Internal server error',
                data: error
            })
        }
    }

    async login(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request',
                data: errors.array()
            })
        } else {
            try {
                const { email, password } = request.body;
                const userData = { email, password };

                const userResponse = await this.userService.login(userData);

                response.status(userResponse.status).json({
                    ...userResponse
                });
            } catch (error) {
                response.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                })
            }
        }
    }
}