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
import POINTS from '../models/points';
import ftp_upload from './ftp_actions';
import Settings from '../models/settings';
import PointsMeasure from '../models/points_measure';
import { ftp_end_measure_upload } from './ftp_actions';


import { exec } from 'child_process';

import { isString, isNumber } from 'util';

let router = express.Router();

//settings handling

router.get('/settings_get', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);

    Settings.query({
        where: ({ bunch: data.bunch }),
        andWhere: ({ type: data.type })
    }).fetchAll().then(data => {
        resp.json(data);
    }).catch(err => {

        resp.status(500).json({ error: err })
    });
    // write the result

});


//Points handling

router.post('/point_delete', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data);

    POINTS.where({ idd: data.id })
        .save({
            is_present: false
        }, { patch: true })
        .then(result => {

            exec('sudo systemctl stop fetcher-weather.service', (error, stdout, stderr) => {
                if (error) {
                    console.error(`error: ${error.message}`);
                    resp.json({ result: error });
                }

                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    resp.json({ result: stderr });
                }


                resp.json({ result: result });

            });
        }).catch(err => resp.status(500).json({ error: ' ' + err }));
    // write the result

})

router.post('/point_measure_activate', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data);
    POINTS.where({ idd: data.idd })
        .save({
            date_time_end: null, in_measure: true
        }, { patch: true })
        .then(result => {

            exec('sudo systemctl start fetcher-weather.service', (error, stdout, stderr) => {
                if (error) {
                    console.error(`error: ${error.message}`);
                    resp.json({ result: error });
                }

                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    resp.json({ result: stderr });
                }


                SOAP.where({ idd: data.idd })
                    .save({
                        date_time_in: new Date().format('dd-MM-Y H:mm:SS')
                    }, { patch: true })
                    .then(result =>
                        resp.json({ result: result })).catch(err => resp.status(500).json({ error: ' ' + err }));

            });

        }).catch(err => resp.status(500).json({ error: ' ' + err }));


})

router.post('/point_measure_stop', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;
    //console.log(data);
    var date_time_end = new Date().format('dd-MM-Y H:mm:SS'); //in case if measure close
    data.date_time_end = date_time_end;

    POINTS.where({ idd: data.idd })
        .save({
            date_time_end, in_measure: false
        }, { patch: true })
        .then(result => {

            exec('sudo systemctl stop fetcher-weather.service', (error, stdout, stderr) => {
                if (error) {
                    console.error(`error: ${error.message}`);
                    resp.json({ result: error });
                }

                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    resp.json({ result: stderr });
                }
                PointsMeasure.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
                    .then(res => {
                        var result_parse0 = JSON.stringify(res);
                        var arr = JSON.parse(result_parse0);
                        let id = 1;
                        // console.log(String(Number(arr[0].id) + 1))
                        if (!isEmpty(arr[0]))
                            id = (Number(arr[0].id) + 1);

                        PointsMeasure.forge({ id }).save({
                            idd: data.idd,
                            date_time_begin: data.date_time_begin, date_time_end: date_time_end, is_present: true, place: data.place, descr: data.descr,
                            lat: data.lat, lon: data.lon

                        }, { method: 'insert' })
                            .then(_resp => {

                                ftp_end_measure_upload(data).then(resp.json({ result: _resp }));



                            }).catch(err => resp.status(500).json({ error: 'Error insert points measure table. ' + err }));

                    }).catch(err => resp.status(500).json({ error: 'Error update points measure table. ' + err }));


            });

        }).catch(err => resp.status(500).json({ error: ' ' + err }));



})

router.post('/point_update', authenticate, (req, resp) => {

    let data = req.body;
    console.log(data);

    let date_time_begin = data.date_time_begin;
    let date_time_end = data.date_time_end;

    if (isEmpty(date_time_end)) {
        date_time_end = new Date().format('dd-MM-Y H:mm:SS'); //in case if measure close

        POINTS.where({ idd: data.idd })
            .save({
                date_time_end, in_measure: false
            }, { patch: true })
            .then(result => {

                ftp_upload();
                exec('sudo systemctl stop fetcher-weather.service', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`error: ${error.message}`);
                        resp.json({ result: error });
                    }

                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        resp.json({ result: stderr });
                    }


                    resp.json({ result: result });
                });

            }).catch(err => resp.status(500).json({ error: ' ' + err }));

    } else {
        let place = data.place;
        let descr = data.descr;
        let lon = data.lon;
        let lat = data.lat;
        let is_present = true;

        POINTS.where({ idd: data.idd })
            .save({
                date_time_begin, date_time_end, place, descr, lat, lon
            }, { patch: true })
            .then(result => {
                resp.json({ result });
            }).catch(err => resp.status(500).json({ error: ' ' + err }));

    }
    // write the result

})

router.post('/point_update_all', authenticate, (req, resp) => {

    let _data = req.body;
    //console.log( data);
    try {

        if (_data.length > 0) {
            _data.forEach((data, indx) => {
                let date_time_begin = data.date_time_begin;
                let date_time_end = data.date_time_end;

                if (isEmpty(date_time_end)) {
                    //date_time_end = new Date().format('dd-MM-Y H:mm:SS'); //in case if measure close
                    let place = data.place;
                    let descr = data.descr;
                    let lon = data.lon;
                    let lat = data.lat;
                    let _idd = data.idd;

                    POINTS.where({ idd: data.idd })
                        .save({
                            date_time_begin, place, descr, lat, lon
                        }, { patch: true })
                        .then(
                            PointsMeasure.where({ idd: _idd }).save({
                                place: place, descr: descr, lat: lat, lon: lon

                            }, { patch: true })
                                .then(
                                    SOAP.where({ idd: _idd }).save({
                                        place: place + ' ' + descr

                                    }, { patch: true })
                                        .then(
                                            //
                                        ).catch(err => console.log('ERROR in station update : ', err))
                                ).catch(err => console.log('ERROR in reports update: ', err))
                        ).catch(err => resp.status(500).json({ error: 'Update all points error on ID = ' + _idd + err }))

                } else {
                    let place = data.place;
                    let descr = data.descr;
                    let lon = data.lon;
                    let lat = data.lat;
                    let is_present = true;
                    let _idd = data.idd;

                    POINTS.where({ idd: data.idd })
                        .save({
                            date_time_begin, date_time_end, place, descr, lat, lon
                        }, { patch: true })
                        .then(
                            PointsMeasure.where({ idd: _idd }).save({
                                place: place, descr: descr, lat: lat, lon: lon

                            }, { patch: true })
                                .then(
                                    SOAP.where({ idd: _idd }).save({
                                        place: place + ' ' + descr

                                    }, { patch: true })
                                        .then(
                                            //
                                        ).catch(err => console.log('ERROR in station update: ', err))
                                ).catch(err => console.log('ERROR in reports update: ', err))
                        ).catch(err => resp.status(500).json({ error: 'Update all points error on ID = ' + _idd + err }));

                }
                // write the result
                resp.status(200).json({ err: 'Update all points OK.' })

            })
        }
    }
    catch (err) {
        err => console.log('ERROR ALL: ', err);
        return 0;
    }
})

router.post('/point_insert', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;

    //  console.log(req.body);

    POINTS.query('where', 'id', '>', '0').orderBy('id', 'DESC').fetchAll()
        .then(res => {
            var result_parse0 = JSON.stringify(res);
            var arr = JSON.parse(result_parse0);
            let id = 1;
            // console.log(String(Number(arr[0].id) + 1))
            if (!isEmpty(arr[0]))
                id = String(Number(arr[0].id) + 1);

            let date_time_begin = data.date_time_begin;
            //let date_time_end = data.date_time_end;
            if (isEmpty(date_time_begin))
                date_time_begin = new Date().format('Y-MM-dd H:mm:SS');
            // if (isEmpty(date_time_end))
            //    date_time_end = new Date().format('Y-mm-dd H:mm:SS');
            let idd = data.idd;

            let place = data.place;
            let descr = data.descr;
            let lon = data.lon;
            let lat = data.lat;
            let is_present = true;


            POINTS.forge({ id }).save({
                date_time_begin, place, descr, lat, lon, idd, is_present, in_measure: true

            }, { method: 'insert' })
                .then(

                    SOAP.query('where', 'is_present', '=', 'true').orderBy('id', 'DESC').fetchAll().then(_station => {
                        var result = JSON.stringify(_station);
                        var station = JSON.parse(result);
                        var id = station[0].id;
                        var idd_old = station[0].idd;
                        SOAP.where({ id })
                            .save({
                                idd, date_time_in: date_time_begin, place: place + "  " + descr
                            }, { patch: true })
                            .then(
                                DEV.where({ idd: idd_old }).save({
                                    idd
                                }, { patch: true })
                                    .then(

                                        FTP.where({ id: 12 })
                                            .save({

                                                name: idd

                                            }, { patch: true })
                                            .then(result => {
                                                exec('sudo systemctl start fetcher-weather.service', (error, stdout, stderr) => {
                                                    if (error) {
                                                        console.error(`error: ${error.message}`);
                                                        resp.json({ result: error });
                                                    }

                                                    if (stderr) {
                                                        console.error(`stderr: ${stderr}`);
                                                        resp.json({ result: stderr });
                                                    }


                                                    resp.json({ result: result });

                                                });
                                            }).catch(err => resp.status(500).json({ error: 'FTP update error' }))
                                    ).catch(err => resp.status(500).json({ error: 'Devices update error' }))

                            ).catch(err => resp.status(500).json({ error: 'Stations update error' }));


                    }).catch(err => {

                        resp.status(500).json({ error: 'Stations query error' })
                    })



                )
                .catch(err => resp.status(500).json({ error: 'Point insert error' }));


            //      console.log(arr[0].idd);



        }).catch(err => resp.status(500).json({ error: ' ' + err }));
    // write the result

})

router.post('/point_change', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;


    let idd = data.idd;




    SOAP.query('where', 'is_present', '=', 'true').orderBy('id', 'DESC').fetchAll().then(_station => {
        var result = JSON.stringify(_station);
        var station = JSON.parse(result);
        var id = station[0].id;
        var idd_old = station[0].idd;


        POINTS.where({ idd }).fetchAll().then(_point => {
            var result = JSON.stringify(_point);
            var point = JSON.parse(result);

            let place = point[0].place;
            let descr = point[0].descr;
            let lon = point[0].lon;
            let lat = point[0].lat;
            let date_time_begin = point[0].date_time_begin;
            let date_time_end = point[0].date_time_end;

            //console.log(place, lat, lon, descr, 'station id =', id);

            SOAP.where({ id })
                .save({
                    idd, date_time_in: date_time_begin, date_time_out: date_time_end, place: place + "  " + descr
                }, { patch: true })
                .then(
                    DEV.where({ idd: idd_old }).save({
                        idd
                    }, { patch: true })
                        .then(

                            FTP.where({ id: 12 })
                                .save({

                                    name: idd

                                }, { patch: true })
                                .then(result => {
                                    resp.json({ result });
                                }).catch(err => resp.status(500).json({ error: 'FTP update error ' + err }))
                        ).catch(err => resp.status(500).json({ error: 'Devices update error ' + err }))

                ).catch(err => resp.status(500).json({ error: 'Stations update error ' + err }));
        }).catch(err => {

            resp.status(500).json({ error: 'Points query error ' + err })
        })


    }).catch(err => {

        resp.status(500).json({ error: 'Stations query error' })
    })






    //      console.log(arr[0].idd);




})

router.get('/point_get', authenticate, (req, resp) => {
    //  

    // let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);

    POINTS.query('where', 'is_present', '=', 'true').orderBy('date_time_begin', 'DESC').fetchAll().then(points => {
        resp.json({ points });
    }).catch(err => {

        resp.status(500).json({ error: err })
    });
    // write the result

});

//Devices handling

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
    //console.log(data);

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
            // console.log(String(Number(arr[0].id) + 1))
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
    //console.log(data);

    //   console.log(req.body);
    var _ldc = Number(data.max_day_consentration);
    var _lmc = Number(data.max_consentration);
    var _min_r = Number(data.min_range);
    var _max_r = Number(data.max_range);

    if (isNaN(_ldc) || (_ldc == 0))
        _ldc = 1000;
    if (isNaN(_lmc) || (_lmc == 0))
        _lmc = 1000;
    if (isEmpty(toString(data.min_range)) || isNaN(data.min_range))
        _min_r = null;
    if (isEmpty(toString(data.min_range)) || isNaN(data.max_range))
        _max_r = null;

    DEV.where({ id: data.id })
        .save({
            //updateperiod: data.updateperiod,
            typemeasure: data.typemeasure,
            // date_time_out: new Date().format('dd-MM-Y HH:mm:SS'),
            serialnum: data.serialnum,
            idd: data.idd,
            unit_name: data.unit_name,
            def_colour: data.def_colour,
            max_consentration: _min_r,
            max_day_consentration: _max_r
            //  is_active: data.is_active,
            // is_admin: data.is_admin,
        }, { patch: true }).then(Macs.where({ chemical: data.typemeasure })
            .save({ max_d: _ldc, max_m: _lmc }, { patch: true }))
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



