import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
    return jwt.sign(
        {
            id: userId,
        },
        process.env.SECRET_KEY as string,
        {
            expiresIn: 86400
        }
    )
};