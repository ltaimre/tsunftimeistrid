module.exports = {
  apps: [
    {
      name: "tsunftimeistrid",
      script: "node_modules/.bin/next",
      args: "start -H 0.0.0.0 -p 3000",
      cwd: "/data01/virt136732/domeenid/www.pesa30.artun.ee/htdocs",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
