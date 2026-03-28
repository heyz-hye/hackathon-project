import 'dotenv/config'
import { createApp } from "./app.js";
import { PORT, DATA_FILE } from "./config.js";
import { createJsonFileStore } from "./store/jsonFileStore.js";

const store = createJsonFileStore(DATA_FILE);
const app = createApp(store);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Temp data file: ${DATA_FILE}`);
});
