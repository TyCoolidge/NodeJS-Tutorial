// const express = require('express');
import express from 'express';
// const resHandler = require('./response-handler');
// for non third party packages add file extension
import { resHandler } from './response-handler.js';

const app = express();

app.get('/', resHandler);

app.listen(3000);
