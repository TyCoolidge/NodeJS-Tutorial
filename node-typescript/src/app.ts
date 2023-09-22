// const express = require('express');
// typescript allows this import
// import express = require('express');

// with typescript we should use this import method
import express from 'express';

import todosRoutes from './routes/todos';

const app = express();

app.use(express.json());

app.use(todosRoutes);

app.listen(9090);
