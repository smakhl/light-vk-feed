import App from './App.svelte';

// return scroll position back to top
// on page refresh
history.scrollRestoration = 'manual';

const app = new App({
    target: document.body,
});

export default app;
