import { writable } from 'svelte/store';
import { getNews } from '../vk/data/news';

export const NEWS_STATUS = {
    EMPTY: 'EMPTY',
    LOADING: 'LOADING',
    LOADED: 'LOADED',
    FAILED: 'FAILED',
};

export const news = createNewsStore();

function createNewsStore() {
    const initialState = {
        status: NEWS_STATUS.EMPTY,
        feedName: 'All',
        feeds: { All: [] },
        feed: [],
    };
    const onFeedChangedCallbacks = [];

    const { subscribe, set, update } = writable(initialState);

    return {
        subscribe,
        load: async () => {
            let lastFeedName;
            update((s) => {
                lastFeedName = s.feedName;
                return { ...s, status: NEWS_STATUS.LOADING };
            });
            try {
                const feeds = await getNews();
                const feedName = feeds[lastFeedName] ? lastFeedName : 'All';
                const feed = feeds[feedName];

                set({
                    status: NEWS_STATUS.LOADED,
                    feeds,
                    feedName,
                    feed,
                });
            } catch (e) {
                console.error(e);
                set({ status: NEWS_STATUS.FAILED });
            }
        },
        reset: () => {
            set(initialState);
        },
        setFeed: (newFeedName) => {
            update((s) => {
                return {
                    ...s,
                    feedName: newFeedName,
                    feed: s.feeds[newFeedName],
                };
            });
            onFeedChangedCallbacks.forEach((cb) => {
                cb();
            });
        },
        onFeedChanged: (cb) => {
            onFeedChangedCallbacks.push(cb);
        },
        markSeen: (postUid) => {
            update((s) => {
                s.feed.find((post) => post.uid === postUid).markSeen();
                return s;
            });
        },
        markFeedSeen: () => {
            update((s) => {
                s.feed.forEach((post) => post.markSeen());
                return s;
            });
        },
    };
}
