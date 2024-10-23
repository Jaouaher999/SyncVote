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

                const commentData = { description };

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
            const commentsResponse = await this.commentService.getComments();

            response.status(commentsResponse.status).send({
                ...commentsResponse,
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