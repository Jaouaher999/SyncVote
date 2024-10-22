import { Timestamp } from 'firebase/firestore'


export interface User {
    id?: string;
    username?: string;
    email?: string;
    password?: string;
    role?: 'member' | 'admin';
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}