import { Comment } from "../types/entities/Comment";
import { Post } from "../types/entities/Post";
import { User } from "../types/entities/User"

export const formatUserData = (userData?: User): Partial<User> => {
    if (userData) {
        const user = { ...userData };

        delete user.password;
        delete user.createdAt;
        delete user.updatedAt;
        return user;
    }

    return {};
};

export const formatPostData = (postData?: Post): Partial<Post> => {
    if (postData) {
        const post = { ...postData };

        delete post.usersVote;
        delete post.createdAt;
        delete post.updatedAt;
        return post;
    }

    return {};
};

export const formatCommentData = (commentData?: Comment): Partial<Comment> => {
    if (commentData) {
        const comment = { ...commentData };

        delete comment.createdAt;
        delete comment.updatedAt;
        return comment;
    }

    return {};
};