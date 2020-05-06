import { readable } from 'svelte/store';

const NAV_HEIGHT = 42;

export const shouldShowControls = readable(true, (set) => {
    let prevScrollPos = window.pageYOffset;
    window.onscroll = function () {
        const currentScrollPos = window.pageYOffset;
        const scrollingDown =
            currentScrollPos > prevScrollPos && currentScrollPos > NAV_HEIGHT;
        const reachedBottom =
            window.innerHeight + window.scrollY >=
            document.body.scrollHeight - window.innerHeight * 0.2;

        if (scrollingDown && !reachedBottom) {
            set(false);
        } else {
            set(true);
        }
        prevScrollPos = currentScrollPos;
    };
});
