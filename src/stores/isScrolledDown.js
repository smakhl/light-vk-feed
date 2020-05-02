import { readable } from 'svelte/store';

const NAV_HEIGHT = 42;

export const isScrolledDown = readable(false, (set) => {
    let prevScrollPos = window.pageYOffset;
    window.onscroll = function () {
        const currentScrollPos = window.pageYOffset;
        const scrolledDown = currentScrollPos > prevScrollPos;
        if (scrolledDown && currentScrollPos > NAV_HEIGHT) {
            set(true);
        } else {
            set(false);
        }
        prevScrollPos = currentScrollPos;
    };
});
