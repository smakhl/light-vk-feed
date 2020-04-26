// https://vk.com/dev/permissions
const wallAccessCode = 8192;
const friendsAccessCode = 2;
const ACCESS_LEVEL = (wallAccessCode + friendsAccessCode).toString();
const APP_ID = 7412293;

VK.init({
    apiId: APP_ID,
});

export function login() {
    return new Promise((resolve, reject) => {
        VK.Auth.login((result) => {
            if (result.status === 'connected') {
                resolve(result);
            } else {
                reject(result);
            }
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
