import * as _dotenv from 'dotenv';
_dotenv.config();

import { db, firestoreTimestamp } from '../utils/firestore-helper';
import { encryptPassword } from '../utils/password';

async function createAdmin() {
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
        const userQuerySnapshot = await db.users.where('email', '==', process.env.ADMIN_EMAIL).get();

        if (userQuerySnapshot.empty) {
            const userRef = db.users.doc();
            await userRef.set({
                email: process.env.ADMIN_EMAIL,
                username: process.env.ADMIN_USERNAME,
                password: encryptPassword(process.env.ADMIN_PASSWORD as string),
                role: 'admin',
                createdAt: firestoreTimestamp.now(),
                updatedAt: firestoreTimestamp.now()

            });

        }
        console.log('Admin created successfully');
    }
}

createAdmin().catch((err) => {
    console.error(err);
})