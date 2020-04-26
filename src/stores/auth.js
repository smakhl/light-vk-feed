import { writable } from 'svelte/store';
import { login, logout, getIsLoggedIn } from '../vk/auth';

export const AUTH_STATUS = {
    LOADING: 'LOADING',
    LOGGED_IN: 'LOGGED_IN',
    LOGGED_OUT: 'LOGGED_OUT',
};

function createAuthStore() {
    const { subscribe, set } = writable(AUTH_STATUS.LOADING);

    (async () => {
        try {
            const isLoggedIn = await getIsLoggedIn();
            if (isLoggedIn) {
                set(AUTH_STATUS.LOGGED_IN);
            } else {
                set(AUTH_STATUS.LOGGED_OUT);
            }
        } catch (e) {
            console.error(e);
            set(AUTH_STATUS.LOGGED_OUT);
        }
    })();

    return {
        subscribe,
        login: async () => {
            try {
                const isLoggedIn = await login();
                if (isLoggedIn) {
                    set(AUTH_STATUS.LOGGED_IN);
                }
            } catch (e) {
                console.error(e);
                set(AUTH_STATUS.LOGGED_OUT);
            }
        },
        logout: async () => {
            await logout();
            set(AUTH_STATUS.LOGGED_OUT);
            localStorage.clear();
        },
    };
}

export const auth = createAuthStore();
