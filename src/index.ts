import { loadEnv } from "./env";
import { buildServer } from "./server";

const env = loadEnv();
const app = buildServer(env);

app.listen({ port: env.port, host: env.host })
    .then((address) => {
        console.log(`Orkestra ouvindo em ${address}`);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
