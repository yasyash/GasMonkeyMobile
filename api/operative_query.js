import express from 'express';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import jsonWT from 'jsonwebtoken';
import config from './config';

import authenticate from './shared/authenticate';

import commonValidations from './shared/validations';
import Stations from '../models/stations';
import Sensors from '../models/sensors';
import Data from '../models/data';
import Macs from '../models/macs';
import User from '../models/user';
import Logs from '../models/logs';

import date from 'date-and-time';
import url from 'url';
import qs from 'querystring';

let router = express.Router();



router.get('/', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    const between_date = [data.period_from, data.period_to];
    //     console.log('data ', between_date);


    Promise.join(
        Data.query('whereBetween', 'date_time', between_date)
            .query('where', 'idd', data.station)
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Sensors.query({
            select: ['serialnum', 'typemeasure', 'unit_name', 'is_wind_sensor'],
            where: ({ is_present: true }),
            andWhere: ({ idd: data.station }),
        })
            .fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Macs.fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        ((data_list, data_sensors, consentration) => {
            let response = [data_list, data_sensors, consentration];
            resp.json({ response });
        })

    )

        .catch(err => resp.status(500).json({ error: err }));


    //'whereIn', 'serialnum', data.sensors,


});

router.get('/all', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    const between_date = [data.period_from, data.period_to];
    const between_wide_date = [new Date(data.period_from).format('Y-MM-ddT00:00'), data.period_to];// from begin of day
    //console.log('data ', between_wide_date);


    Promise.join(
        Data.query('whereBetween', 'date_time', between_date)
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Sensors.query({
            select: ['serialnum', 'typemeasure', 'unit_name', 'is_wind_sensor'],
            where: ({ is_present: true }),

        })
            .fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Macs.query('where', 'max_m', '>', 0).orderBy('chemical', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Logs.query('whereBetween', 'date_time', between_wide_date)
            .orderBy('date_time', 'DESC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        ((data_list, data_sensors, consentration, logs_list) => {
            let response = [data_list, data_sensors, consentration, logs_list];
            resp.json({ response });
        })

    )

        .catch(err => resp.status(500).json({ error: err }));


    //'whereIn', 'serialnum', data.sensors,


});
//  andWhereBetween: ('date_time_in', {[data.period_from, data.period_to]} )
router.post('/', authenticate, (req, resp) => {
    //  const {dateTimeBegin, dateTimeEnd} = req.body;
    //consol.log('query in');
    Stations.query({
    }).fetchAll().then(stations => {
        resp.json({ stations });
    })
        .catch(err => resp.status(500).json({ error: err }));



})

router.get('/board', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    const between_date = [data.period_from, data.period_to];
    const between_wide_date = [new Date(data.period_from).format('Y-MM-ddT00:00'), data.period_to];// from begin of day
    //console.log('data ', between_wide_date);


    Promise.join(
        Data.query('whereBetween', 'date_time', between_date)
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: 'data error' })),
        Sensors.query({
            select: ['idd','serialnum', 'typemeasure', 'unit_name', 'is_wind_sensor', 'measure_class'],
            where: ({ is_present: true })
        })
            .fetchAll()
            .catch(err => resp.status(500).json({ error: 'sensors error' })),
        Macs.query('where', 'max_m', '>', 0).orderBy('chemical', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: 'macs error' })),
        Logs.query('whereBetween', 'date_time', between_wide_date)
            .orderBy('date_time', 'DESC').fetchAll()
            .catch(err => resp.status(500).json({ error: 'logs error' })),
        ((_data_list, data_sensors, consentration, logs_list) => {

            var __data_list = JSON.parse(JSON.stringify(_data_list));
            var _data_sensors = JSON.parse(JSON.stringify(data_sensors));
            var _consentration = JSON.parse(JSON.stringify(consentration));


            var data_list = [];
            //console.log('data entry = ', __data_list.length);

            ///20 min averaging
            _data_sensors.map((element, j) => {
                var _measure = 0;
                var _now = Date.parse(new Date()) - 1200000;
                var _time_end = _now + 1200000;

                if (__data_list.length > 0) {
                    var _data = __data_list.filter((opt, k, arr) => {
                        var _tmp_date = Date.parse(new Date(opt.date_time.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")));
                        return ((opt.serialnum == element.serialnum) && (_tmp_date > _now) &&
                            (_tmp_date <= _time_end));
                    })


                    if (_data.length > 0) {

                        _data.map((opt, j) => {

                            _measure += Number(opt.measure);

                        });

                        let _macs = _consentration.filter((opt, k, arr) => {
                            return ((opt.chemical == element.typemeasure));
                        })
                        if (_macs.length > 0) {
                            var max_m = _macs[0].max_m;
                        } else {
                            var max_m = 10000; //fake treshould for not gazanalytic measure (Voltage, weather etc.)
                        }

                        var increase = true;
                        if (_data.length > 1) {
                            (_data[_data.length - 1].measure > _data[_data.length - 2].measure) ? increase = true : increase = false;

                            //console.log("last ", _data[_data.length - 1]," prev ",  _data[_data.length - 2])
                        }

                        data_list.push({
                            'id': _data[_data.length - 1].idd, 'typemeasure': _data[_data.length - 1].typemeasure, 'serialnum': _data[_data.length - 1].serialnum,
                            'date_time': _data[_data.length - 1].date_time, 'unit_name': element.unit_name, 'measure': _measure / _data.length,
                            'is_alert': ((_measure / _data.length > Number(max_m)) ? true : false), 'momental_measure': Number(_data[_data.length - 1].measure), 'increase': increase
                        });
                    }

                }
            })////


            /*   _data_sensors.forEach(element => {
                   console.log('data sensors = ', element.serialnum);
                   var _tmp = __data_list.filter((opt, k, arr) => {
                       return ((opt.serialnum == element.serialnum));
                   })
                   if (_tmp.length > 0) {
                       data_list = [...data_list, ..._tmp];
                   }
               });*/
            //console.log('exit = ', data_list.length);
            //console.log('data = ', data_list);

            let response = [data_list, data_sensors, consentration, logs_list];
            resp.json({ response });
        })

    )

        .catch(err => resp.status(500).json({ error: 'general error' }));


    //'whereIn', 'serialnum', data.sensors,


});

export default router;