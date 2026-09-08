const app = require("./app");
const { ensureTable } = require("./db");

const PORT = process.env.PORT || 3000;

async function start() {
  await ensureTable();
  app.listen(PORT, () => {
    console.log(`Wishboard backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
