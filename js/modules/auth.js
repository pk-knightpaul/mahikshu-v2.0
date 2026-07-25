export const Auth = {
  async checkSession() {
    // Guest mode — no OAuth required for Phase 1
    // All preferences save to localStorage
    return null;
  },

  login() {
    alert('GitHub OAuth requires a backend proxy. Using guest mode with localStorage instead.');
  },

  logout() {
    localStorage.removeItem('mahikshu_prefs');
    localStorage.removeItem('mahikshu_theme');
    window.location.reload();
  }
};
