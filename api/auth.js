import express from 'express';
import bcrypt from 'bcrypt';
//import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import jsonWT from 'jsonwebtoken';
import config from './config';
import date from 'date-and-time';

import commonValidations from './shared/validations';
import User from '../models/user';
import LOGS from '../models/logs';


let router = express.Router();

router.post('/', (req, resp) => {
    const { identifier, passwrd } = req.body;
    const ip =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;

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

                    let date_time = date.format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()), 'YYYY-MM-DD HH:mm:ss');
                    //console.log('date ', date_time);
                    //type = 100 is successful authorized.
                    LOGS.forge({
                        date_time,
                        type: 200, descr: ('User - ' + user.get('username') + ' from ip - ' + ip + ' - logged in.')
                    }).save()
                        .then(result => resp.json({ token }))
                        .catch(err => resp.status(500).json({ error: err }));
                    //                       resp.json({ token });

                } else {
                    let date_time = date.format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()), 'YYYY-MM-DD HH:mm:ss');
                    //console.log('date ', date_time);
                    //type = 100 is successful authorized.
                    LOGS.forge({
                        date_time,
                        type: 401, descr: ('User - ' + user.get('username') + ' from ip - ' + ip + ' - invalid password.')
                    }).save().then(result =>
                        resp.status(401).json({ errors: { form: 'Недействительные полномочия...' } }));
                    // there is invalid password
                }
            }
            else {
                let date_time = date.format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()), 'YYYY-MM-DD HH:mm:ss');

                LOGS.forge({
                    date_time,
                    type: 401, descr: ('User - ' + user.get('username') + ' from ip - ' + ip + ' - blocked.')
                }).save().then(result =>
                    resp.status(401).json({ errors: { form: 'Пользователь заблокирован...' } }));

            }
        } else {
            let date_time = date.format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()), 'YYYY-MM-DD HH:mm:ss');
            LOGS.forge({
                date_time,
                type: 401, descr: ('User - ' + identifier + ' - illegal authority.')
            }).save().then(result =>
                resp.status(401).json({ errors: { form: 'Недействительные полномочия...' } }));
            //user doesn't exist
        }
    });
});


export default router;