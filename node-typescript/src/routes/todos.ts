import { Router } from 'express';
import { Todo } from '../models/todo';

const todos: Todo[] = [];

type RequestBody = { text: string };
type RequestParams = { todoId: string };

const router = Router();

router.get('/', (req, res, next) => {
    res.status(200).json({ todos });
});

router.post('/todo', (req, res, next) => {
    const body = req.body as RequestBody;
    const params = req.params as RequestParams;
    const newTodo: Todo = {
        id: params.todoId,
        text: body.text,
    };
    todos.push(newTodo);
    res.status(201).json({ message: 'Todo added successfully', newTodo });
});

router.put('/todo/:todoId', (req, res, next) => {
    const body = req.body as RequestBody;
    const params = req.params as RequestParams;
    const todoIndex = todos.findIndex(item => item.id === params.todoId);
    if (todoIndex >= 0) {
        todos[todoIndex].text = body.text;
        return res.status(200).json({ message: 'Todo updated', updatedTodo: todos[todoIndex] });
    }
    res.status(404).json({ message: 'Could not find todo for this id' });
});

router.delete('/todo/:todoId', (req, res, next) => {
    const params = req.params as RequestParams;
    const todoIndex = todos.findIndex(item => item.id === params.todoId);
    if (todoIndex >= 0) {
        todos.splice(todoIndex, 1);
        return res.status(200).json({ message: 'Todo deleted', todos: todos });
    }
    res.status(404).json({ message: 'Could not find todo for this id' });
});

export default router;
