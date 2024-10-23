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