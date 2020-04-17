// https://vk.com/dev/permissions
const wallAccessCode = 8192;
const friendsAccessCode = 2;
const ACCESS_LEVEL = (wallAccessCode + friendsAccessCode).toString();

VK.init({
    apiId: 7412293,
});

export function login() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(({ session }) => {
            resolve(Boolean(session));
        }, ACCESS_LEVEL);
    });
}

export function logout() {
    return new Promise((resolve, reject) => {
        VK.Auth.logout(() => {
            resolve();
        });
    });
}

export function getIsLoggedIn() {
    return new Promise((resolve, reject) => {
        VK.Auth.getLoginStatus(({ status }) => {
            resolve(status === 'connected');
        });
    });
}
