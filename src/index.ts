import { createServer } from "./server";

const app = createServer();

app.listen({ port: 3000, host: '0.0.0.0' });


app.inject({
    method: 'POST',
    url: '/chat',
    body: {
        question: 'Qual é a melhor LLM para traduzir textos?',
    },
}).then((response) => {
    console.log('Response status', response.statusCode);
    console.log('Response body', response.body);
});