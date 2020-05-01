<script>
    import Post from './Post.svelte';
    import { news, NEWS_STATUS } from '../stores/news';

    $: showPostSource = $news.feedName === 'All';
    let width;

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

<style>
    .feed {
        width: 100%;
    }
    p {
        text-align: center;
    }
</style>

<!-- prettier-ignore -->
<div class="feed" bind:clientWidth={width}>
    {#if $news.status === NEWS_STATUS.LOADED}
        {#each $news.feed as post, i (post.uid)}
            <Post {post} observer="{observer}" {showPostSource} {width} />
        {:else}
            <p>There's nothing new in your feed! Well done!</p>
        {/each}
    {:else}
        <p>Loading posts...</p>
    {/if}
</div>
