import { createServer } from "./server";
import { config } from "./config";
import { OpenRouterService } from "./openrouterService";

const openRouterService = new OpenRouterService(config);
const app = createServer(openRouterService);

app.listen({ port: config.port, host: "0.0.0.0" });

const question = "Quem foi o descobridor da penicilina?";

// (1) Recomendação do OpenRouter
app.inject({
    method: "POST",
    url: "/chat/recommend",
    payload: { question },
}).then((response) => {
    console.log("\n--- Recomendação (OpenRouter) ---");
    console.log("status", response.statusCode);
    console.log("body", response.body);
});

// (2) Comparativo manual dos modelos
app.inject({
    method: "POST",
    url: "/chat/compare",
    payload: { question },
}).then((response) => {
    console.log("\n--- Comparativo (seus modelos) ---");
    console.log("status", response.statusCode);
    console.log("body", response.body);
});
