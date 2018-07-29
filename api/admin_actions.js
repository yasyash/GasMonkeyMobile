import express from 'express';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import jsonWT from 'jsonwebtoken';
import config from './config';
import format from 'node.date-time';
import authenticate from './shared/authenticate';



import url from 'url';
import qs from 'querystring';


import FTP from '../models/ftp';
import SOAP from '../models/soap';
import USERS from '../models/user';
import METEO from '../models/meteostations';
import DEV from '../models/devices';

let router = express.Router();




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
            date_time: new Date().format('Y-MM-dd HH:mm:SS')
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
            //let id = Number(arr[0].idd) + 1;
            //   console.log({ "idd": idd, "address": address, "username": username, "pwd": pwd, "periods": periods, "date_time": date_time, "isdeleted": false })
            FTP.forge({ id }).save({
                address, username, pwd, periods, date_time, isdeleted

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

            console.log(id)

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
            //let id = Number(arr[0].idd) + 1;
            //   console.log({ "idd": idd, "address": address, "username": username, "pwd": pwd, "periods": periods, "date_time": date_time, "isdeleted": false })
            SOAP.forge({ id }).save({
                idd, namestation, code, updateperiod, useraccessright, address, login, password_soap,
                date_time_in, date_time_out, is_present

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
    //console.log(data.address);

    //   console.log(req.body);

    METEO.where({ id: data.id })
        .save({
            updateperiod: data.updateperiod,
            namestation: data.namestation,
            folder: data.folder,
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

    METEO.where({ idd: data.id })
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

    DEV.where({ is_present: true }).fetchAll().then(userlist => {
        resp.json({ userlist });
    }).catch(err => resp.status(500).json({ error: err }));
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
        }, { patch: true })
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
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data.address);

    //  console.log(req.body);

    DEV.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
        .then(result => {
            var result_parse0 = JSON.stringify(result);
            var arr = JSON.parse(result_parse0);
            let id = 1;
            //    console.log(String(Number(arr[0].id) + 1))
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

            // let meteo_field = data.meteo_field;
            let is_wind_sensor = false;
            let date_time_in = new Date().format('Y-MM-dd HH:mm:SS');
            let date_time_out = date_time_in;
            let is_present = true;
            //let id = Number(arr[0].idd) + 1;
            /*    console.log({
                    id, idd, typemeasure, serialnum, unit_name, average_period, unit_name,
                    measure_class, is_wind_sensor, max_consentration, max_day_consentration,
                    date_time_in, date_time_out, def_colour, is_present
                })*/
            DEV.forge({ id }).save({
                idd, typemeasure, serialnum, unit_name, average_period,
                measure_class, is_wind_sensor, max_consentration, max_day_consentration,
                date_time_in, date_time_out, def_colour, is_present
            }, { method: 'insert' })
                .then(result => resp.json({ success: true }))
                .catch(err => resp.status(500).json({ error: err }));

        }).catch(err => resp.status(500).json({ error: err }));
    //      console.log(arr[0].idd);



    // write the result

})

export default router;



