import express from 'express';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import jsonWT from 'jsonwebtoken';
import config from './config';
import format from 'node.date-time';
import authenticate from './shared/authenticate';
import isUUid from 'validator/lib/isUUID';

import url from 'url';
import qs from 'querystring';

import SRV from '../models/service';
import INJ from '../models/injection';
import FTP from '../models/ftp';
import SOAP from '../models/soap';
import USERS from '../models/user';
import METEO from '../models/meteostations';
import DEV from '../models/devices';
import Stations from '../models/stations'
import Macs from '../models/macs';
import DATA from '../models/data';
import { isString } from 'util';

let router = express.Router();

router.post('/srv_del', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.idd);

    SRV.where({ id: data.id })
        .save({
            is_present: false
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: ' ' + err }));
    // write the result

})

router.post('/srv_update', authenticate, (req, resp) => {

    let data = req.body;
    //console.log( data.last_time);

    let date_time = data.date_time;
    if (isEmpty(date_time))
        date_time = new Date().format('dd-mm-Y H:mm:SS');
    let serialnum = data.serialnum;
    let name = data.name;
    let result = data.result;
    let person = data.person;
    let note = data.note;
    let inv_num = data.inv_num;
    let is_present = true;
    SRV.where({ id: data.id })
        .save({
            date_time, serialnum, name, result, person, note, inv_num


        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: ' ' + err }));
    // write the result

})
router.post('/srv_insert', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    console.log(data);

    //  console.log(req.body);

    SRV.query('where', 'id', '>', '0').orderBy('date_time', 'DESC').fetchAll()
        .then(res => {
            var result_parse0 = JSON.stringify(res);
            var arr = JSON.parse(result_parse0);
            let id = 1;
            // console.log(String(Number(arr[0].id) + 1))
            if (!isEmpty(arr[0]))
                id = String(Number(arr[0].id) + 1);

            let date_time = data.date_time;
            if (isEmpty(date_time))
                date_time = new Date().format('dd-mm-Y H:mm:SS');
            let serialnum = data.serialnum;
            let name = data.name;
            let result = data.result;
            let person = data.person;
            let note = data.note;
            let inv_num = data.inv_num;
            let is_present = true;
            //let id = Number(arr[0].idd) + 1;
            //    console.log({  date_time, serialnum, name, result, person, note, inv_num, is_present })
            SRV.forge({ id }).save({
                date_time, serialnum, name, result, person, note, inv_num, is_present

            }, { method: 'insert' })
                .then(result => resp.json({ success: true }))
                .catch(err => resp.status(500).json({ error: err }));


            //      console.log(arr[0].idd);



        }).catch(err => resp.status(500).json({ error: ' ' + err }));
    // write the result

})


router.get('/srv_get', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);

    SRV.query('where', 'is_present', '=', 'true').orderBy('date_time', 'DESC').fetchAll().then(srv_list => {
        resp.json({ srv_list });
    }).catch(err => {

        resp.status(500).json({ error: err })
    });
    // write the result

});
//REST api
router.post('/api_insert', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //  console.log(req.body);

    INJ.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
        .then(result => {
            var result_parse0 = JSON.stringify(result);
            var arr = JSON.parse(result_parse0);
            let id = 1;
            console.log(String(Number(arr[0].id) + 1))
            if (!isEmpty(arr[0]))
                id = String(Number(arr[0].id) + 1);

            let idd = data.idd;
            let indx = data.index;
            let code = data.code;
            let token = data.token;
            let uri = data.uri;
            let date_time = new Date().format('Y-MM-dd HH:mm:SS');
            let last_time = new Date().format('Y-MM-dd HH:mm:SS');

            let is_present = false;
            let msg_id = 0;

            //let id = Number(arr[0].idd) + 1;
            INJ.forge({ id }).save({
                idd, indx, code, token, uri, date_time, last_time, msg_id, is_present

            }, { method: 'insert' })
                .then(result => resp.json({ success: true }))
                .catch(err => resp.status(500).json({ error: err }));


            //      console.log(arr[0].idd);



        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/api_del', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.idd);

    INJ.where({ id: data.id })
        .save({
            is_present: false
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/api_update', authenticate, (req, resp) => {

    let data = req.body;
    let _is_present = true;
    //console.log( data.last_time);
    if (data.is_present == true)
        _is_present = data.is_present;

    INJ.where({ id: data.id })
        .save({
            indx: data.indx,
            token: data.token,
            uri: data.uri,
            code: String(data.code),
            msg_id: data.msg_id,
            last_time: data.last_time,
            date_time: data.date_time,
            idd: data.idd, is_present: _is_present

        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.get('/api_get', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);

    INJ.fetchAll().then(api_list => {
        resp.json({ api_list });
    }).catch(err => resp.status(500).json({ error: err }));
    // write the result

});

router.get('/ftp_get', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);

    FTP.where({ isdeleted: false }).fetchAll().then(ftplist => {
        resp.json({ ftplist });
    }).catch(err => resp.status(500).json({ error: err }));
    // write the result

});


router.post('/ftp_update', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //   console.log(req.body);

    FTP.where({ id: data.idd })
        .save({
            indx: data.indx,
            address: data.address,
            username: data.username,
            pwd: data.pwd,
            folder: data.folder,
            name: data.name,
            periods: data.periods,
            date_time: new Date().format('Y-MM-dd HH:mm:SS'),
            remained_time: data.periods
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/ftp_del', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.idd);

    //  console.log(req.body);

    FTP.where({ id: data.id })
        .save({
            isdeleted: true
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/ftp_insert', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //  console.log(req.body);

    FTP.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
        .then(result => {
            var result_parse0 = JSON.stringify(result);
            var arr = JSON.parse(result_parse0);
            let id = 1;
            //console.log(String(Number(arr[0].id) + 1))
            if (!isEmpty(arr[0]))
                id = String(Number(arr[0].id) + 1);

            let address = data.address;
            let username = data.username;
            let pwd = data.pwd;
            let periods = data.periods;
            let date_time = new Date().format('Y-MM-dd HH:mm:SS');
            let isdeleted = false;
            let remained_time = data.periods;

            //let id = Number(arr[0].idd) + 1;
            //   console.log({ "idd": idd, "address": address, "username": username, "pwd": pwd, "periods": periods, "date_time": date_time, "isdeleted": false })
            FTP.forge({ id }).save({
                address, username, pwd, periods, date_time, isdeleted, remained_time

            }, { method: 'insert' })
                .then(result => resp.json({ success: true }))
                .catch(err => resp.status(500).json({ error: err }));


            //      console.log(arr[0].idd);



        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

/// SOAP  API

router.get('/soap_get', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);

    SOAP.fetchAll().then(ftplist => {
        resp.json({ ftplist });
    }).catch(err => resp.status(500).json({ error: err }));
    // write the result

});


router.post('/soap_update', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //   console.log(req.body);

    SOAP.where({ idd: data.idd })
        .save({
            address: data.address,
            login: data.login,
            password_soap: data.password_soap,
            updateperiod: data.updateperiod,
            namestation: data.namestation,
            place: data.place,
            latitude: data.latitude,
            longitude: data.longitude,
            date_time_out: new Date().format('Y-MM-dd HH:mm:SS')
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/soap_activate', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.id);

    //  console.log(req.body);

    SOAP.where({ idd: data.id })
        .save({
            is_present: true
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})


router.post('/soap_del', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.id);

    //  console.log(req.body);

    SOAP.where({ idd: data.id })
        .save({
            is_present: false
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/soap_insert', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    // console.log(data.id);
    //  console.log(req.body);

    SOAP.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
        .then(result => {
            var result_parse0 = JSON.stringify(result);
            var arr = JSON.parse(result_parse0);
            let id = 1;
            if (!isEmpty(arr[0]))
                id = String(Number(arr[0].id) + 1);

            //console.log(data.idd);

            let namestation = data.namestation;
            let address = data.address;
            let password_soap = data.password_soap;
            let login = data.login;
            let updateperiod = data.updateperiod;
            let date_time_in = new Date().format('Y-MM-dd HH:mm:SS');
            let date_time_out = new Date().format('Y-MM-dd HH:mm:SS');
            let is_present = true;
            let useraccessright = 'view';
            let code = 0;
            let idd = data.idd;
            let place = data.place;
            let latitude = data.latitude;
            let longitude = data.longitude;
            //let id = Number(arr[0].idd) + 1;
            //   console.log({ "idd": idd, "address": address, "username": username, "pwd": pwd, "periods": periods, "date_time": date_time, "isdeleted": false })
            SOAP.forge({ id }).save({
                idd, namestation, code, updateperiod, useraccessright, address, login, password_soap,
                date_time_in, date_time_out, place, latitude, longitude, is_present

            }, { method: 'insert' })
                .then(result => resp.json({ success: true }))
                .catch(err => resp.status(500).json({ error: err }));


            //      console.log(arr[0].idd);



        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

/// User's  API

router.get('/user_get', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);

    USERS.fetchAll().then(userlist => {
        resp.json({ userlist });
    }).catch(err => resp.status(500).json({ error: err }));
    // write the result

});


router.post('/user_update', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //   console.log(req.body);

    USERS.where({ id: data.idd })
        .save({
            username: data.username,
            email: data.email,
            mobile: data.mobile,
            updated_at: new Date().format('Y-MM-dd HH:mm:SS'),
            //  is_active: data.is_active,
            // is_admin: data.is_admin,
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/user_security_update', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //   console.log(req.body);

    USERS.where({ id: data.idd })
        .save({

            is_active: data.is_active,
            is_admin: data.is_admin,
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})
router.post('/user_del', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.idd);

    //  console.log(req.body);

    USERS.where({ id: data.id })
        .save({
            is_active: false
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/user_insert', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //  console.log(req.body);

    USERS.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
        .then(result => {
            var result_parse0 = JSON.stringify(result);
            var arr = JSON.parse(result_parse0);
            let id = 1;
            //     console.log(String(Number(arr[0].id) + 1))
            if (!isEmpty(arr[0]))
                id = String(Number(arr[0].id) + 1);
            let address = data.address;
            let username = data.username;
            let pwd = data.pwd;
            let periods = data.periods;
            let date_time = new Date().format('Y-MM-dd HH:mm:SS');
            let isdeleted = false;
            //let id = Number(arr[0].idd) + 1;
            //   console.log({ "idd": idd, "address": address, "username": username, "pwd": pwd, "periods": periods, "date_time": date_time, "isdeleted": false })
            USERS.forge({ id }).save({
                address, username, pwd, periods, date_time, isdeleted

            }, { method: 'insert' })
                .then(result => resp.json({ success: true }))
                .catch(err => resp.status(500).json({ error: err }));


            //      console.log(arr[0].idd);



        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

// Meteostation's API

router.get('/meteo_get', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);

    METEO.where({ is_present: true }).fetchAll().then(userlist => {
        resp.json({ userlist });
    }).catch(err => resp.status(500).json({ error: err }));
    // write the result

});


router.post('/meteo_update', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.id);

    //   console.log(req.body);

    METEO.where({ id: data.id })
        .save({
            updateperiod: data.updateperiod,
            namestation: data.namestation,
            //folder: data.folder,
            // date_time_out: new Date().format('dd-MM-Y HH:mm:SS'),
            idd: data.idd
            //  is_active: data.is_active,
            // is_admin: data.is_admin,
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})


router.post('/meteo_del', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.idd);

    //  console.log(req.body);

    METEO.where({ id: data.id })
        .save({
            is_present: false
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/meteo_insert', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //  console.log(req.body);

    METEO.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
        .then(result => {
            var result_parse0 = JSON.stringify(result);
            var arr = JSON.parse(result_parse0);
            let id = 1;
            if (!isEmpty(arr[0]))
                id = String(Number(arr[0].id) + 1);
            //    console.log(String(Number(arr[0].id) + 1))
            let namestation = data.namestation;
            let updateperiod = data.updateperiod;
            let idd = data.idd;

            let date_time_in = new Date().format('Y-MM-dd HH:mm:SS');
            let date_time_out = date_time_in;
            let is_present = true;
            //let id = Number(arr[0].idd) + 1;
            //  console.log({ "idd": idd })
            METEO.forge({ id }).save({
                idd, namestation, updateperiod, date_time_in, date_time_out, is_present
            }, { method: 'insert' })
                .then(result => resp.json({ success: true }))
                .catch(err => resp.status(500).json({ error: err }));

        }).catch(err => resp.status(500).json({ error: err }));
    //      console.log(arr[0].idd);



    // write the result

})

// Equipment's API

router.get('/dev_get', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    Promise.join(Stations.query({
        where: ({ is_present: true })
    }).fetchAll().catch(err => resp.status(500).json({ error: err })),
        DEV.where({ is_present: true }).fetchAll().catch(err => resp.status(500).json({ error: err })),
        Macs.query('where', 'max_m', '>', 0).orderBy('chemical', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        ((stations_list, dev_list, macs_list) => {
            resp.json({ stations_list, dev_list, macs_list });
        })).catch(err => resp.status(500).json({ error: err }));

    // write the result

});


router.post('/dev_update', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //   console.log(req.body);

    DEV.where({ id: data.id })
        .save({
            updateperiod: data.updateperiod,
            typemeasure: data.typemeasure,
            // date_time_out: new Date().format('dd-MM-Y HH:mm:SS'),
            serialnum: data.serialnum,
            idd: data.idd,
            unit_name: data.unit_name,
            def_colour: data.def_colour,
            max_consentration: data.max_consentration,
            max_day_consentration: data.max_day_consentration

            //  is_active: data.is_active,
            // is_admin: data.is_admin,
        }, { patch: true }).then(Macs.where({ chemical: data.typemeasure })
            .save({ max_d: data.max_day_consentration, max_m: data.max_consentration }, { patch: true }))
        .catch(err => resp.status(500).json({ error: err }))
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})


router.post('/dev_del', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.idd);

    //  console.log(req.body);

    DEV.where({ serialnum: data.idd })
        .save({
            is_present: false
        }, { patch: true })
        .then(result => {
            resp.json({ result });
        }).catch(err => resp.status(500).json({ error: err }));
    // write the result

})

router.post('/dev_insert', authenticate, (req, resp) => {

    let data = req.body;


    DEV.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
        .then(result => {
            var result_parse0 = JSON.stringify(result);
            var arr = JSON.parse(result_parse0);
            let id = 1;

            if (!isEmpty(arr[0]))
                id = String(Number(arr[0].id) + 1);
            let typemeasure = data.typemeasure;
            let serialnum = data.serialnum;
            let idd = data.idd;
            let unit_name = data.unit_name;
            let def_colour = data.def_colour;
            let max_consentration = data.max_consentration;
            let max_day_consentration = data.max_day_consentration;
            let average_period = 60;
            let measure_class = 'data';
            if (data.is_meteo == 'true') measure_class = data.meteo_field;

            let is_wind_sensor = false;
            let date_time_in = new Date().format('Y-MM-dd HH:mm:SS');
            let date_time_out = date_time_in;
            let is_present = true;

            DEV.forge({ id }).save({
                idd, typemeasure, serialnum, unit_name, average_period,
                measure_class, is_wind_sensor, max_consentration, max_day_consentration,
                date_time_in, date_time_out, def_colour, is_present
            }, { method: 'insert' })
                .then(Macs.where({ chemical: data.typemeasure }).fetchAll()
                    .then(result_macs => {
                        var _result_macs = JSON.stringify(result_macs);
                        var arr_macs = JSON.parse(_result_macs);
                        if ((!isEmpty(max_consentration)) && (!isEmpty(max_day_consentration))) {

                            if (isEmpty(arr_macs[0])) {

                                Macs.forge({
                                    chemical: typemeasure,
                                    max_m: max_consentration,
                                    max_d: max_day_consentration
                                }).save()
                                    .catch(err => resp.status(500).json({ error: err }))
                            }
                        }
                    })
                    .catch(err => {
                        //console.log('1');

                        resp.status(500).json({ error: err });
                    })
                )
                .then(result => resp.json({ success: true }))
                .catch(err => resp.status(500).json({ error: err }));

        }).catch(err => resp.status(500).json({ error: err }));

    // write the result

});

router.post('/data_update', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(req.data);
    let data = req.body;
    var isErr = 0;
    //console.log(data.address);

    var _tmp = Date.parse(data[0].date_time);

    if (!isNaN(_tmp)) {

        //data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;4
        for (var i = 0; i < data.length; i++) {

            if (!updateSQL(data[i].serialnum, data[i].date_time, parseFloat(data[i].measure)))
                isErr++;

            // console.log("serial  ", data[i].serialnum, " is Str - ", isString(data[i].serialnum))
            // console.log("date_time ", data[i].date_time, " is Str - ", isString(data[i].date_time))
            // console.log("measure ", data[i].measure, " is Str - ", isString(data[i].measure))

        }

    }
    else {
        //data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;
        var _data = [];
        for (var _key in data[0]) {
            if (isUUid(_key))
                _data.push(_key);
        }

        _data.forEach((element, indx) => {
            for (var i = 1; i < data.length; i++) {
                let ii = updateSQL(element, data[i].date_time, parseFloat(data[i][element]));

                if (!ii)
                    isErr++;
                //console.log("num err - ", isErr)
                //console.log("serialnum ", element, " is Str - ", isString(element))
                //console.log("date_time ", data[i].date_time.toString(), " is Str - ", isString(data[i].date_time.toString()))
                //console.log("measure ", parseFloat(data[i][element]), " is Str - ", isString(parseFloat(data[i][element])))
            }
        });

    }

    return resp.json({ errcount: isErr });

    // write the result

})

async function updateSQL(element, date_time, value) {

    await DATA.where({ serialnum: element, date_time: date_time })
        .save({
            measure: value
        }, { patch: true }).then(resizeTo => {
            return true;
        }
        ).catch(err => {
            DATA.where({ serialnum: element, date_time: date_time }).fetchAll()
                .then(out => {
                    var _out = JSON.stringify(out);
                    var _arr = JSON.parse(_out);

                    if (_arr.length == 0) {
                        DEV.query('where', 'serialnum', '=', element).fetchAll()
                            .then(result => {

                                var result_parse0 = JSON.stringify(result);
                                var arr = JSON.parse(result_parse0);

                                DATA.forge().save({
                                    serialnum: element, date_time: date_time, measure: value, idd: arr[0].idd, typemeasure: arr[0].typemeasure,
                                    is_alert: false

                                }, { method: 'insert' });
                            }
                            );

                        return false;
                    };
                });
        });




}

export default router;



