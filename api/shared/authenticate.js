import jwToken from 'jsonwebtoken';
import config from '../config';
import User from '../../models/user';

export default (req, resp, next) => {
    const authorizationHdr = req.headers['authorization'];
    let token;

    if (authorizationHdr) {
        token = authorizationHdr.split(' ')[1];
    }
    /* console.log(token);*/
    if (token) {

        jwToken.verify(token, config.jwtSecret, (err, decoded) => {
            if (err) {
                resp.status(401).json({ err: 'Invalid token...' });
            } else {
                //If Everything is ok
                User.query({
                    where: { id: decoded.id },
                    select: ['id', 'username', 'email', 'is_admin', 'is_active']
                }).fetch().then(user => {
                    if (!user) {
                        resp.status(404).json({ error: 'User not found...' });
                    } else {
                        if (user.get('is_active') == true) {

                            req.currentUser = user;
                            next();
                        }
                        else {
                            resp.status(404).json({ error: 'User not actives...' });

                        }
                    }
                });
            }
        });
    } else {
        resp.status(403).json({
            error: 'No token provided... '
        });
    }
}