// Proxy: /api/* -> http://localhost:8000/* (sin /api)
// Formato compatible con Vite (Angular 21)
module.exports = {
  '/api': {
    target: 'http://localhost:8000',
    secure: false,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
};
