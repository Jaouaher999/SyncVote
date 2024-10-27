import { Request, Response } from 'express';
import { CommentService } from '../services';
import { validationResult } from 'express-validator';

export class CommentController {
    private commentService: CommentService;

    constructor(commentService: CommentService) {
        this.commentService = commentService;
    }

    async createComment(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request.',
                data: errors.array(),
            });
        } else {
            try {
                const { description } = request.body;

                const commentData = { description, createdBy: request.userId, postId: request.params.postId };

                const commentResponse = await this.commentService.createComment(commentData);

                response.status(commentResponse.status).send({
                    ...commentResponse,
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

    async getComments(request: Request, response: Response): Promise<void> {
        try {
            if (request.userRole == 'admin') {
                const commentsResponse = await this.commentService.getCommentsByPostId(request.params.postId);

                response.status(commentsResponse.status).send({
                    ...commentsResponse,
                });
            } else {
                response.status(401).json({
                    status: 401,
                    message: 'Unauthorized'
                });
            }

        } catch (error) {
            response.status(500).json({
                status: 500,
                message: 'Internal server error',
                data: error
            });
        }
    }

    async deleteComment(request: Request, response: Response): Promise<void> {
        try {
            if (request.userRole == 'admin') {
                if (request.params.id) {
                    const commentId = request.params.id;

                    const commentResponse = await this.commentService.deleteComment(commentId);

                    response.status(commentResponse.status).json({
                        ...commentResponse
                    });
                } else {
                    response.status(404).json({
                        status: 404,
                        message: 'Comment not found'
                    })
                }

            } else {
                response.status(401).json({
                    status: 401,
                    message: 'Unauthorized'
                })
            }


        } catch (error) {
            response.status(500).json({
                status: 500,
                message: 'Internal server error'
            });
        }
    }

    async updateComment(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.status(400).json({
                status: 400,
                message: 'Bad request',
                data: errors.array()
            })
        } else {
            try {
                if (request.userRole == 'admin') {
                    if (request.params.id) {
                        const commentId = request.params.id;
                        const updatedCommentData = request.body;

                        delete updatedCommentData.role;

                        const commentResponse = await this.commentService.updateComment(request.userId as string, commentId, updatedCommentData);


                        response.status(commentResponse.status).send({
                            ...commentResponse
                        })
                    } else {
                        response.status(404).json({
                            status: 404,
                            message: 'Comment not found'
                        })
                    }

                } else {
                    response.status(401).json({
                        status: 401,
                        message: 'Unauthorized'
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