import { body } from 'express-validator';

export const validateCreateUser = [
    body('email').isEmail().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('username').notEmpty().withMessage('Username is required'),
];