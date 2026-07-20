module.exports = {
  apps: [
    {
      name: "booking-app-api",
      script: "./dist/main.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
