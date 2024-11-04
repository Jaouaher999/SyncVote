import { Request, Response } from 'express';
import { PostsService } from '../services';
import { validationResult } from 'express-validator';

export class PostsController {
    private postsService: PostsService;

    constructor(postsService: PostsService) {
        this.postsService = postsService;
    }

    async createPost(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request.',
                data: errors.array(),
            });
        } else {
            try {
                const { title, description, categories } = request.body;

                const postData = {
                    title,
                    description,
                    categories,
                    createdBy: request.userId
                };

                const postResponse = await this.postsService.createPost(postData);

                response.status(postResponse.status).send({
                    ...postResponse,
                });
            } catch (error) {
                response.status(500).json({
                    status: 500,
                    message: 'Internal server error',
                    data: error
                });
            }
        }
    }

    async deletePost(request: Request, response: Response): Promise<void> {
        try {
            if (request.params.id) {
                const postId = request.params.id;

                const postResponse = await this.postsService.deletePost(postId, request.userId as string);

                response.status(postResponse.status).json({
                    ...postResponse
                });
            } else {
                response.status(404).json({
                    status: 404,
                    message: 'Post not found'
                })
            }


        } catch (error) {
            response.status(500).json({
                status: 500,
                message: 'Internal server error'
            });
        }
    }

    async getPosts(request: Request, response: Response): Promise<void> {
        try {
            const category = request.query.category as string | undefined;
            const postsResponse = await this.postsService.getPosts(category);

            response.status(postsResponse.status).send({
                ...postsResponse,
            });

        } catch (error) {
            response.status(500).json({
                status: 500,
                message: 'Internal server error',
                data: error
            });
        }
    }

    async getPostsByUserId(request: Request, response: Response): Promise<void> {
        console.log('1111');
        try {
            const postsResponse = await this.postsService.getPostsByUserId(request.params.userId);
            response.status(postsResponse.status).send({
                ...postsResponse,
            });

        } catch (error) {
            response.status(500).json({
                status: 500,
                message: 'Internal server error',
                data: error
            });
        }
    }

    async updatePost(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request',
                data: errors.array()
            })
        } else {
            try {
                if (request.params.id) {
                    const postId = request.params.id;
                    const updatedPostData = request.body;

                    const postResponse = await this.postsService.updatePost(request.userId as string, postId, updatedPostData);


                    response.status(postResponse.status).send({
                        ...postResponse
                    })
                } else {
                    response.status(404).json({
                        status: 404,
                        message: 'Post not found'
                    })
                }
            } catch (error) {
                response.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                })
            }
        }
    }

    async getPostById(request: Request, response: Response): Promise<void> {
        try {
            if (request.params.id) {
                const postResponse = await this.postsService.getPostById(request.params.id);


                response.status(postResponse.status).send({
                    ...postResponse
                });
            } else {
                response.status(404).json({
                    status: 404,
                    message: 'Post not found'
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

    async upVote(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request',
                data: errors.array()
            })
        } else {
            try {
                if (request.params.id) {
                    const postId = request.params.id;

                    const postResponse = await this.postsService.upVote(request.userId as string, postId);

                    response.status(postResponse.status).send({
                        ...postResponse
                    })
                } else {
                    response.status(404).json({
                        status: 404,
                        message: 'Post not found'
                    })
                }
            } catch (error) {
                response.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                })
            }
        }
    }

    async downVote(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request',
                data: errors.array()
            })
        } else {
            try {
                if (request.params.id) {
                    const postId = request.params.id;

                    const postResponse = await this.postsService.downVote(request.userId as string, postId);

                    response.status(postResponse.status).send({
                        ...postResponse
                    })
                } else {
                    response.status(404).json({
                        status: 404,
                        message: 'Post not found'
                    })
                }
            } catch (error) {
                response.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                })
            }
        }
    }
}