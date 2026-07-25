import { Storage } from '../services/storage.js';

const GITHUB_CLIENT_ID = 'Ov23li0fuiyN4kp952dt';

export const Auth = {
  async checkSession() {
    const token = Storage.session.get('github_token');
    if (!token) return null;
    try {
      const resp = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
      });
      if (resp.ok) {
        const user = await resp.json();
        return { id: `github_${user.id}`, login: user.login, avatar: user.avatar_url };
      }
    } catch (e) {
      console.error('Auth check failed:', e);
    }
    return null;
  },

  login() {
    const state = Math.random().toString(36).substring(7);
    Storage.session.set('oauth_state', state);
    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user&state=${state}`;
    window.location.href = url;
  },

  logout() {
    Storage.session.remove('github_token');
    Storage.session.remove('user_data');
    window.location.reload();
  }
};
