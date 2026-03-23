module.exports = {
  apps: [
    // ── 1. Frontend (Vite SPA) ──
    {
      name: 'skyverses-fe',
      cwd: './',
      script: 'npx',
      args: 'vite preview --port 5300 --host',
      env: {
        NODE_ENV: 'production',
        PORT: 5300
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/fe-error.log',
      out_file: './logs/fe-out.log',
      merge_logs: true,
    },

    // ── 2. CMS (Vite SPA) ──
    {
      name: 'skyverses-cms',
      cwd: './cms',
      script: 'npx',
      args: 'vite preview --port 5301 --host',
      env: {
        NODE_ENV: 'production',
        PORT: 5301
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/cms-error.log',
      out_file: './logs/cms-out.log',
      merge_logs: true,
    },

    // ── 3. Backend (Express API) ──
    {
      name: 'skyverses-api',
      cwd: './skyverses-backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5302
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      merge_logs: true,
    }
  ]
};
