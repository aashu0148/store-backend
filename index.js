import app from "./app.js";

import { PORT } from "./utils/secret.js";

const server = app.listen(PORT, () => {
  console.log(`Backend is up at : ${PORT}`);
});

export default server;
