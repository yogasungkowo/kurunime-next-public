module.exports = {
  apps: [
    {
      name: 'kurunime-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 'max', // Menggunakan seluruh core CPU (cluster mode) atau ganti ke 1
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
