<script>
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { auth, AUTH_STATUS } from '../stores/auth';
    import { news, NEWS_STATUS } from '../stores/news';

    const flyProps = {
        y: -100,
        opacity: 0.5,
    };

    $: source = $news.feedName;
    $: readCount = $news.feed.filter((n) => n.seen).length;
    $: totalCount = $news.feed.length;

    function handleLogoutClick() {
        if (!confirm('Are you sure?')) {
            return;
        }
        auth.logout();
    }
</script>

<!-- prettier-ignore -->
<nav transition:fly="{flyProps}">
    {#if totalCount}
        <span class="title">
            {source} ({readCount}/{totalCount})
        </span>
    {/if}
    {#if $auth === AUTH_STATUS.LOGGED_IN}
        <button on:click={handleLogoutClick} class="logout-btn">
            <img class="exit-icon" src="icons/door.svg" alt="">
        </button>
    {/if}
</nav>

<style>
    nav {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        background-color: #68a5eb;
        height: 42px;

        position: fixed;
        top: 0;
        left: 0;
        right: 0;

        z-index: 1;
    }
    .title {
        margin-left: 24px;
        margin-right: auto;
        padding-right: 1em;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #fff;
    }
    .logout-btn {
        margin: 0;
        margin-right: 8px;
        font-size: 12px;
        height: 34px;
        width: 34px;
    }
    .exit-icon {
        height: 100%;
    }
</style>
