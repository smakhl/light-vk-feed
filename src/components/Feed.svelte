<script>
    import Post from './Post.svelte';
    import { markPostSeen } from '../storage';
    export let news;

    history.scrollRestoration = 'manual';

    const handler = (entries, observer) => {
        entries.forEach((entry) => {
            const { boundingClientRect, isIntersecting, target } = entry;

            if (!isIntersecting && boundingClientRect.bottom <= 0) {
                const { postUid } = target.dataset;
                news.find((n) => n.post_uid === postUid).seen = true;
                news = news;

                markPostSeen(postUid);

                observer.unobserve(target);
            }
        });
    };
    const observer = new IntersectionObserver(handler, { threshold: 0 });
</script>

<style>
    .feed {
        padding: 8px;
    }
</style>

<!-- prettier-ignore -->
<div class="feed">
    {#each news as item, i}
        <Post {item} observer={observer} />
    {/each}
</div>
