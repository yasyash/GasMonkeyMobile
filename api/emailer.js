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


import USERS from '../models/user';
import DATA from '../models/sensors_data';
import LOGS from '../models/logs';
import CRON from '../models/cron';
import EQUIPMENTS from '../models/devices';
import STATIONS from '../models/stations';

function cron_email() {

    STATIONS.query('where', 'is_present', '=', 'true').fetchAll()
        .then(stations_res => {
            var stations = JSON.parse(JSON.stringify(stations_res));
            EQUIPMENTS.query('where', 'is_present', '=', 'true').fetchAll()
                .then(equipments_res => {
                    var equipments = JSON.parse(JSON.stringify(equipments_res));

                    USERS.query('where', 'is_admin', '=', 'true').orderBy('id', 'DESC').fetchAll()
                        .then(users_res => {
                            var users = JSON.parse(JSON.stringify(users_res));

                            CRON.query('where', 'id', '>', '-1').orderBy('date_time', 'DESC').fetchAll().then(
                                result => {
                                    let result_str = JSON.parse(JSON.stringify(result));

                                    var _time = new Date(result_str[0].date_time).format('Y-MM-dd HH:mm:SS');
                                    var _port = result_str[0].port;
                                    var _usermailer = result_str[0].username;
                                    var _passwordmailer = result_str[0].password;
                                    var _address = result_str[0].address;

                                    //console.log('TIME = ', _time);
                                    LOGS.query('where', 'date_time', '>', _time).orderBy('date_time', 'DESC').fetchAll()
                                        .then(resp => {
                                            let resp_str = JSON.parse(JSON.stringify(resp));
                                            //console.log('RESPONSE = ', resp_str);
                                            if (resp_str.length > 0) {
                                                users.forEach(_user => {


                                                    var transporter = nodemailer.createTransport({
                                                        host: _address, //smtp server
                                                        port: _port,
                                                        secure: false, // true for 465, false for other ports
                                                        auth: {
                                                            user: _usermailer, // generated ethereal user
                                                            pass: _passwordmailer // generated ethereal password
                                                        },
                                                        tls: {
                                                            // do not fail on invalid certs
                                                            rejectUnauthorized: false
                                                        },

                                                    });
                                                    // var last_time = _time;//resp_str[resp_str.lenght -1].date_time


                                                    //resp_str.forEach(element => {
                                                    //  if (last_time < element.date_time)
                                                    //});
                                                    equipments.forEach(_equipment => {
                                                        var iterator = [100, 101, 102, 110, 111, 120]; // types error

                                                        iterator.forEach((i, _ind) => {

                                                            var logs_list = resp_str.filter((item, _i, arr) => {
                                                                return ((item.type == i) && (_equipment.serialnum == item.idd));
                                                            });
                                                            //console.log('logs _ list lenght = ', logs_list.length);
                                                            if (logs_list.length > 0) {
                                                                var _station = stations.filter((_item, _i, arr) => {
                                                                    return ((_equipment.idd == _item.idd));
                                                                });
                                                                var namestation = _station[0].namestation;

                                                                console.log('logs_list = ', logs_list);

                                                                var _element = logs_list[0];

                                                                switch (i) { // type of alert
                                                                    case 100:
                                                                        //chemical alert - concentration exceeds 5 times less
                                                                        try_email(transporter, _element, _user.email, namestation);


                                                                        break;
                                                                    case 101:
                                                                        //chemical alert - concentration exceeds between 5 to 10 times 

                                                                        try_email(transporter, _element, _user.email, namestation);

                                                                        break;

                                                                    case 102:
                                                                        // chemical alert - concentration exceeds more than 10 times 

                                                                        try_email(transporter, _element, _user.email, namestation);

                                                                        break;

                                                                    case 110:
                                                                        try_email(transporter, _element, _user.email, namestation); //door alrm

                                                                        break;
                                                                    case 111:
                                                                        try_email(transporter, _element, _user.email, namestation); //fire alarm

                                                                        break;

                                                                    case 120:
                                                                        try_email(transporter, _element, _user.email, namestation); //internal temp. alarm

                                                                        break;

                                                                    default:

                                                                        break;
                                                                }
                                                            }
                                                        });
                                                    });
                                                    //console.log('Time is : ', last_time);
                                                    var last_time = new Date().format('Y-MM-dd HH:mm:SS');

                                                    CRON.where({ id: 0 }).save({
                                                        date_time: last_time
                                                    }, { patch: true }).catch(err => {
                                                        console.log('SQL update CRON table issue: ', err);
                                                    });
                                                });
                                            }
                                        }
                                        )
                                });
                        });
                });
        });
}

async function try_email(transporter, element, email, name) {
    try {
        console.log("Message sending:", email);

        let info = await transporter.sendMail({
            from: '"Сервер ГА данных" ' + email, // sender address
            to: email, // list of receivers
            subject: "Тревога на " + name, // Subject line
            text: new Date(element.date_time).format('Y-MM-dd HH:mm:SS') + '   ' + element.descr  // plain text body
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