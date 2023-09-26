import { Router } from 'https://deno.land/x/oak/mod.ts';
import { ObjectId } from 'https://deno.land/x/mongo@v0.32.0/mod.ts';
import { getDb } from '../helpers/db.ts';

const router = new Router();

interface Todo {
    id?: string;
    text: string;
}

router.get('/todos', async ctx => {
    const todos = await getDb().collection('todos').find().toArray();
    const transformedTodos = todos.map((todo: { _id: ObjectId; text: string }) => {
        return { id: todo._id.toString(), text: todo.text };
    });
    ctx.response.body = {
        todos: transformedTodos, //Oak will auto set response to JSON if an object is in the body
    };
});

router.post('/todos', async ctx => {
    const data = await ctx.request.body().value;

    const newTodo: Todo = await getDb().collection('todos').insertOne({ text: data.text });

    ctx.response.body = {
        message: 'Created Todo!',
        newTodo,
    };
});

router.put('/todos/:todoId', async ctx => {
    const todoId = ctx.params.todoId;
    const data = await ctx.request.body().value;

    const updatedTodo = await getDb()
        .collection('todos')
        .updateOne({ _id: new ObjectId(todoId) }, { $set: { text: data.text } });
    if (updatedTodo) {
        return (ctx.response.body = {
            message: 'Updated Todo!',
            updatedTodo,
        });
    }
    ctx.response.body = {
        message: 'Could not find todo for this id',
    };
    ctx.response.status = 404;
});

router.delete('/todos/:todoId', async ctx => {
    const todoId = ctx.params.todoId;
    const result = await getDb()
        .collection('todos')
        .deleteOne({ _id: new ObjectId(todoId) });
    if (result >= 0) {
        return (ctx.response.body = { message: 'Todo deleted' });
    }
    ctx.response.body = {
        message: 'Could not find todo for this id',
    };
    ctx.response.status = 404;
});

export default router;
