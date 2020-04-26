<script>
    import Post from './Post.svelte';
    import { news, NEWS_STATUS } from '../stores/news';

    $: showPostSource = $news.feedName === 'All';

    const handler = (entries, observer) => {
        entries.forEach((entry) => {
            const { boundingClientRect, isIntersecting, target } = entry;
            if (!isIntersecting && boundingClientRect.bottom <= 0) {
                const { postUid } = target.dataset;
                news.markSeen(postUid);
                observer.unobserve(target);
            }
        });
    };
    const observer = new IntersectionObserver(handler, { threshold: 0 });
</script>

<style></style>

<!-- prettier-ignore -->
{#each $news.feed as post, i (post.uid)}
<Post {post} observer="{observer}" {showPostSource} />
{/each}
