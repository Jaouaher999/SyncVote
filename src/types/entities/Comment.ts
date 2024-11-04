import {Timestamp} from 'firebase/firestore';

export interface Comment {
    id?: string;
    description?: string;
    voteCount?: number;
    postId?: string;
    createdBy?: string;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
    usersVote?: string[];
}