import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import isBoolean from 'lodash.isboolean';
import jsonWT from 'jsonwebtoken';

import config from './config';
import format from 'node.date-time';
import authenticate from './shared/authenticate';
import nodemailer from 'nodemailer';


import url from 'url';
import qs from 'querystring';

import fs from 'fs';
import path from 'path';
import mime from 'mime';

import FTP from '../models/ftp';
import SOAP from '../models/soap';
import USERS from '../models/user';
import METEO from '../models/meteostations';
import DEV from '../models/devices';
import Stations from '../models/stations'
import Macs from '../models/macs';
import Sensors from '../models/sensors';
import Data from '../models/data';
import LOGS from '../models/logs';
import CRON from '../models/cron';

function cron_email() {
    USERS.query('where', 'is_admin', '=', 'true').orderBy('id', 'DESC').fetchAll()
        .then(users_res => {
            var users = JSON.parse(JSON.stringify(users_res));

            CRON.fetchAll().then(
                result => {
                    let result_str = JSON.parse(JSON.stringify(result));

                    var _time = result_str[0].date_time;
                    var _port = result_str[0].port;
                    var _usermailer = result_str[0].username;
                    var _passwordmailer = result_str[0].password;


                    LOGS.query('where', 'date_time', '>', _time)
                        .orderBy('date_time', 'ASC').fetchAll().then(
                            resp => {
                                let resp_str = JSON.parse(JSON.stringify(resp));
                                users.forEach(_user => {
                                    
                                    var transporter = nodemailer.createTransport({
                                        host: "smtp1.mtw.ru",
                                        port: _port,
                                        secure: false, // true for 465, false for other ports
                                        auth: {
                                            user: _usermailer, // generated ethereal user
                                            pass: _passwordmailer // generated ethereal password
                                        }
                                    });
                                    var last_time = _time;//resp_str[resp_str.lenght -1].date_time
                                    resp_str.forEach(element => {
                                        if (last_time < element.date_time)
                                            last_time = element.date_time;

                                        switch (element.type) {
                                            case 100:
                                                //console.log('element   ---   ', element.descr);
                                                try_email(transporter, element, _user.email);


                                                break;
                                            case 101:
                                                try_email(transporter, element, _user.email);

                                                break;

                                            case 102:
                                                try_email(transporter, element, _user.email);

                                                break;

                                            default: break;
                                        }
                                    });

                                    CRON.where({ id: 0 }).save({
                                        date_time: last_time
                                    }, { patch: true }).catch(err => {
                                        console.log('SQL update CRON table issue: ', err);
                                    });
                                });
                            }
                        )
                });
        });
}

async function try_email(transporter, element, email) {
    try {
        let info = await transporter.sendMail({
            from: '"GazMonkey" <test@ilit.ru>', // sender address
            to: email, // list of receivers
            subject: "Тревога ПДК...", // Subject line
            text: element.date_time + '   ' + element.descr  // plain text body
            //html: "<b>Hello world?</b>" // html body
        });
        console.log("Message sent: %s", info.messageId);

        return true;



    }
    catch (err) {
        console.log('SMTP connection error catched:  ', err.message);


        return false;

    }
};

export default cron_email;