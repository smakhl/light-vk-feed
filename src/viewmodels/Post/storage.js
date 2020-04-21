export function markPostSeen(postUid, date) {
    const storageLabel = `seenPosts_${getDateLabel(date)}`;
    const seenPosts = localStorage.getItem(storageLabel) || '';
    localStorage.setItem(storageLabel, `${seenPosts}${postUid};`);
}

export function hasPostBeenSeen(postUid, date) {
    const seenPosts = localStorage.getItem(`seenPosts_${getDateLabel(date)}`);
    if (!seenPosts) return false;

    return seenPosts.includes(postUid + ';');
}

export function clearSeenPosts() {
    localStorage.removeItem('seenPosts');
}

function getDateLabel(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
