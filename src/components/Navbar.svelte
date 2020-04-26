<script>
    export let source;
    export let readCount;
    export let totalCount;
    export let shouldShowLogoutBtn;
    export let handleLogoutClick;
</script>

<!-- prettier-ignore -->
<nav>
    {#if totalCount}
        <span class="title">
            {source} ({readCount}/{totalCount})
        </span>
    {/if}
    {#if shouldShowLogoutBtn}
        <button on:click={handleLogoutClick} class="logout">
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
    .logout {
        margin: 0;
        margin-right: 8px;
        font-size: 12px;
        height: 80%;
    }
    .exit-icon {
        height: 100%;
    }
</style>
