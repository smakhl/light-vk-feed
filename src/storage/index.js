export function markPostSeen(postUid) {
    const seenPosts = localStorage.getItem('seenPosts') || '';
    localStorage.setItem('seenPosts', `${seenPosts}${postUid};`);
}

export function hasPostBeenSeen(postUid) {
    const seenPosts = localStorage.getItem('seenPosts');
    if (!seenPosts) return false;

    return seenPosts.includes(postUid + ';');
}

export function clearSeenPosts() {
    localStorage.removeItem('seenPosts');
}
