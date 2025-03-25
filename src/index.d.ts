import { User } from '@modules/user/user.entity';

declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}

declare module 'express' {
    interface Request {
        user: User;
    }
}
