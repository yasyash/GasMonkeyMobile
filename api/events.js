import express from 'express';
import bcrypt from 'bcrypt';
//import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import jsonWT from 'jsonwebtoken';
import config from './config';

import authenticate from './shared/authenticate';

import commonValidations from './shared/validations';
import User from '../models/user';

let router = express.Router();

router.post('/', authenticate,(req, resp) => {
resp.status(201).json({success: true});
})

export default router;