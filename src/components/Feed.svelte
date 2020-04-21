<script>
    import Post from './Post.svelte';
    export let posts;
    export let onPostRead;

    const handler = (entries, observer) => {
        entries.forEach((entry) => {
            const { boundingClientRect, isIntersecting, target } = entry;
            if (!isIntersecting && boundingClientRect.bottom <= 0) {
                const { postUid } = target.dataset;
                posts.find((n) => n.uid === postUid).markSeen();
                onPostRead();
                observer.unobserve(target);
            }
        });
        posts = posts;
    };
    const observer = new IntersectionObserver(handler, { threshold: 0 });
</script>

<style></style>

<!-- prettier-ignore -->
<div class="feed">
    {#each posts as post, i}
        <Post {post} observer={observer} />
    {/each}
</div>
