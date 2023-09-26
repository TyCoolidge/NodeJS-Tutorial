import { Application } from 'https://deno.land/x/oak/mod.ts';

import todoRoutes from './routes/todos.ts'; //must include filepath in deno
import { connectToDatabase } from './helpers/db.ts';

try {
    await connectToDatabase();
    console.log('Connected to MongoDB');
} catch (error) {
    console.error('MongoDB connection error:', error);
}

const app = new Application();

app.use(async (ctx, next) => {
    console.log('middleware');
    await next(); // if any middleware deals with async functionality, make all middlewares async
});

app.use(async (ctx, next) => {
    ctx.response.headers.set('Access-Control-Allow-Origin', '*');
    ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    await next();
});

// this middleware is async so above middleware should be too
app.use(todoRoutes.routes());
app.use(todoRoutes.allowedMethods());

await app.listen({ port: 8000 });

// Vanilla Deno
// Deno.serve({ port: 3000 }, _req => new Response('Port running at 3000'));

// const text = 'This is a test';

// const encoder = new TextEncoder();
// const data = encoder.encode(text);

// Deno.writeFile('message.txt', data).then(() => {
//     console.log('File wrote');
// });
