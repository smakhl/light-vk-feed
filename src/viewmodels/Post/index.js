import { makeDateFromUnixTime } from '../../utils/makeDateFromUnixTime';
import { hasPostBeenSeen, markPostSeen } from './storage';

export class Post {
    static hasPostBeenSeen(rawPost) {
        const uid = `${rawPost.source_id}_${rawPost.post_id}`;
        const date = makeDateFromUnixTime(rawPost.date);
        return hasPostBeenSeen(uid, date);
    }

    constructor(rawPost, sourcesNames) {
        this.sourceName = sourcesNames[-rawPost.source_id];
        this.uid = `${rawPost.source_id}_${rawPost.post_id}`;
        this.postUrl = `https://vk.com/wall${this.uid}`;
        this._date = makeDateFromUnixTime(rawPost.date);
        this.date = this._date.toLocaleString('ru');
        this.text = rawPost.text;
        this.seen = Post.hasPostBeenSeen(rawPost);

        const [repost] = rawPost.copy_history || [];
        if (repost) {
            this.repost = {
                sourceName: sourcesNames[-repost.from_id],
                date: makeDateFromUnixTime(repost.date).toLocaleString('ru'),
                attachments: repost.attachments,
            };
        }

        this.attachments = rawPost.attachments;
    }

    markSeen() {
        markPostSeen(this.uid, this._date);

        this.seen = true;
    }
}
