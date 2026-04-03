module.exports = {
  apps: [{
    name: 'nexus-command-center',
    script: 'npx',
    args: 'vite preview --port 5173 --host 0.0.0.0',
    cwd: '/workspace/temp-orquestrador/users/5aaf347f-952f-4355-8513-ac3f4024b43e/projetos/core',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
  }]
}
