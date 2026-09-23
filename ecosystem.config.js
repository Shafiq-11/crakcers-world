module.exports = {
  apps: [
    {
      name: 'diwali-kadai',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Scale to available CPU cores on Hostinger VPS
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
}
