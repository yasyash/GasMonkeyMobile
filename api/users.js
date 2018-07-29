import express from 'express';
import bcrypt from 'bcrypt';
//import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';

import commonValidations from './shared/validations';
import User from '../models/user';

let router = express.Router();

function validateInput(data, otherValidations) {


    let { errors } = otherValidations(data);

    return User.query({
        where: { email: data.email },
        orWhere: { username: data.username }
    }).fetch().then(user => {
        if (user) {
            if (user.get('username') === data.username) { errors.username = 'Пользователь с данным именем уже существует...'; }
            if (user.get('email') === data.email) { errors.email = 'Пользователь с данным email уже существует...'; }
        }
        return {
            errors,
            isValid: isEmpty(errors)
        };

    })
}

router.get('/:identifier', (req, resp) => {
    User.query({
        select: ['username', 'email'],
        where: { username: req.params.identifier },
        orWhere: { email: req.params.identifier }
    }).fetch().then(user => {
        resp.json({user});
    })
});

router.post('/', (req, resp) => {
    validateInput(req.body, commonValidations)
        .then(({ errors, isValid }) => {


            if (isValid) {
                // resp.json({ success: true });
                const { username, passwrd, email, mobile } = req.body;
                const password_digest = bcrypt.hashSync(passwrd, 10);
                User.forge({
                    username, email, mobile, password_digest
                }, { hasTimestamps: true }).save()
                    .then(user => resp.json({ success: true }))
                    .catch(err => resp.status(500).json({ error: err }));

            } else {
                resp.status(400).json(errors);
            }


        });



});

export default router;