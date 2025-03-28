import { BullMQ } from './types';

export default class UserQueue extends BullMQ {
    static get queue(): string {
        return 'user';
    }
}
