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
            update((s) => {
                return { ...s, status: NEWS_STATUS.LOADING };
            });
            try {
                const feeds = await getNews();
                const lastFeedName = getLastFeed();
                let feedName;
                if (feeds[lastFeedName]) {
                    feedName = lastFeedName;
                } else {
                    feedName = 'All';
                    setLastFeed('All');
                }
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
                    feed: s.feeds[newFeedName].filter((p) => !p.seen),
                };
            });
            onFeedChangedCallbacks.forEach((cb) => {
                cb();
            });
            setLastFeed(newFeedName);
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

function setLastFeed(feed) {
    localStorage.setItem('lastFeed', feed);
}

function getLastFeed() {
    return localStorage.getItem('lastFeed');
}
