import express from 'express';
import bcrypt from 'bcrypt';
//import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import jsonWT from 'jsonwebtoken';
import config from './config';

import commonValidations from './shared/validations';
import User from '../models/user';

let router = express.Router();

router.post('/', (req, resp) => {
    const { identifier, passwrd } = req.body;
    User.query({
        where: { username: identifier },
        orWhere: { email: identifier }
    }).fetch().then(user => {
        if (user) {
            if (user.get('is_active') == true) {
                if (bcrypt.compareSync(passwrd, user.get('password_digest'))) {
                    const token = jsonWT.sign({
                        id: user.get('id'),
                        username: user.get('username'),
                        full: user.get('is_admin')
                    },
                        config.jwtSecret);

                    resp.json({ token });
                } else {
                    resp.status(401).json({ errors: { form: 'Недействительные полномочия...' } });
                    // there is invalid password
                }
            }
            else {
                resp.status(401).json({ errors: { form: 'Пользователь заблокирован...' } });

            }
        } else {
            resp.status(401).json({ errors: { form: 'Недействительные полномочия...' } });
            //user doesn't exist
        }
    });
});


export default router;