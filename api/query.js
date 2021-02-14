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
import PointsMeasure from '../models/points_measure';

import url from 'url';
import qs from 'querystring';
import { filter } from 'ramda';
let router = express.Router();
//let router_acync = asyncify(router);


router.get('/', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    const between_date = [data.period_from, data.period_to];

    if (isEmpty(data.station)) {
        Stations.query({
            where: ({ is_present: true })
        }).fetchAll().then(stations => {
            resp.json({ stations });
        }).catch(err => resp.status(500).json({ error: err }));
    } else {
        if (isEmpty(data.sensors)) {
            Sensors.query({
                where: ({ is_present: true }),
                andWhere: ({ idd: data.station })

            }).fetchAll().then(sensors => {
                resp.json({ sensors });
            }).catch(err => resp.status(500).json({ error: err }));
        } else {
            Promise.join(
                Data.query('whereBetween', 'date_time', between_date)
                    .query('whereIn', 'serialnum', data.sensors)
                    .orderBy('date_time', 'ASC').fetchAll()
                    .catch(err => resp.status(500).json({ error: err })),
                Sensors.query({
                    select: ['serialnum', 'typemeasure', 'unit_name', 'def_colour', 'max_consentration', 'max_day_consentration'],
                    where: ({ is_present: true }),
                    andWhere: ({ idd: data.station }),
                })
                    .query('whereIn', 'serialnum', data.sensors)
                    .fetchAll()
                    .catch(err => resp.status(500).json({ error: err })),
                Macs.fetchAll()
                    .catch(err => resp.status(500).json({ error: err })),
                ((data_list, data_sensors, consentration) => {
                    let response = [data_list, data_sensors, consentration];
                    var _data_list = JSON.parse(JSON.stringify(data_list));

                    //console.log("data list ", _data_list);
                    resp.json({ response });
                })

            )

                .catch(err => resp.status(500).json({ error: err }));
        };
    };
    //'whereIn', 'serialnum', data.sensors,


});

router.get('/many', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    const between_date = [data.period_from, data.period_to];

    if (isEmpty(data.station)) {
        Stations.query({
            where: ({ is_present: true })
        }).fetchAll().then(stations => {
            resp.json({ stations });
        }).catch(err => resp.status(500).json({ error: err }));
    } else {
        if (isEmpty(data.sensors)) {
            Sensors.query({
                where: ({ is_present: true })
                // andWhere: ({ idd: data.station })

            }).query('whereIn', 'idd', data.station)
                .fetchAll().then(sensors => {
                    resp.json({ sensors });
                }).catch(err => resp.status(500).json({ error: err }));
        } else {
            Promise.join(
                Data.query('whereBetween', 'date_time', between_date)
                    .query('whereIn', 'serialnum', data.sensors)
                    .query('whereIn', 'idd', data.station)
                    .orderBy('date_time', 'ASC').fetchAll()
                    .catch(err => resp.status(500).json({ error: err })),
                Sensors.query({
                    select: ['serialnum', 'typemeasure', 'unit_name', 'def_colour', 'max_consentration', 'max_day_consentration'],
                    where: ({ is_present: true })

                })
                    .query('whereIn', 'serialnum', data.sensors)
                    .fetchAll()
                    .catch(err => resp.status(500).json({ error: err })),
                Macs.fetchAll()
                    .catch(err => resp.status(500).json({ error: err })),
                ((data_list, data_sensors, consentration) => {
                    let response = [data_list, data_sensors, consentration];
                    var _data_list = JSON.parse(JSON.stringify(data_list));

                    //console.log("data list ", [data.station]);
                    resp.json({ response });
                })

            )

                .catch(err => resp.status(500).json({ error: err }));
        };
    };
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



});

router.get('/by_type', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    const between_date = [data.period_from, data.period_to];

    if (isEmpty(data.station)) {
        Stations.query({
            where: ({ is_present: true })
        }).fetchAll().then(stations => {
            resp.json({ stations });
        }).catch(err => resp.status(500).json({ error: err }));
    } else {
        if (isEmpty(data.sensors)) {
            Sensors.query({
                where: ({ is_present: true }),
                andWhere: ({ idd: data.station })

            }).fetchAll().then(sensors => {
                resp.json({ sensors });
            }).catch(err => resp.status(500).json({ error: err }));
        } else {
            Promise.join(
                Data.query('whereBetween', 'date_time', between_date)
                    .query('whereIn', 'typemeasure', data.sensors)
                    .query('where', 'idd', data.station)
                    .orderBy('date_time', 'ASC').fetchAll()
                    .catch(err => resp.status(500).json({ error: err })),
                Sensors.query({
                    select: ['serialnum', 'typemeasure', 'unit_name', 'def_colour'],
                    where: ({ is_present: true }),
                    andWhere: ({ idd: data.station }),
                })
                    .query('whereIn', 'typemeasure', data.sensors)
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
        };
    };


});


router.get('/point_measure_get', authenticate, (req, resp) => {
    //  

    PointsMeasure.query('where', 'is_present', '=', 'true').orderBy('id', 'ASC').fetchAll()
        .then(res => resp.json({ measure_list: res })).catch(err => resp.status(500).json({ error: 'Error get points measure table. ' + err }));




});

async function load_data(points_list, macsList) {
    let between_date = [];
    var dataList = [];
    var rows_measure = [];
    var queryFields = {
        'P': 'Атм. давление',
        'Tout': 'Темп. внешняя',
        'Hout': 'Влажность внеш.',
        'WindV': 'Скорость ветра',
        'WindD': 'Направление ветра'
    }
    var rows_service = {};
    var data4report = [];
    const chemical = { 'NO': 'NO', 'NO2': 'NO2', 'NH3': 'NH3', 'NOx': 'NOx', 'SO2': 'SO2', 'H2S': 'H2S', 'O3': 'O3', 'CO': 'CO', 'CH2O': 'CH2O', 'CH': 'CH', 'CH4': 'CH4', 'HCH': 'HCH', 'PM1': 'PM1', 'PM2.5': 'PM25', 'PM10': 'PM10', 'Пыль общая': 'TSP', 'бензол': 'C6H6', 'толуол': 'C7H8', 'этилбензол': 'C8H10', 'м,п-ксилол': 'C8H10MP', 'о-ксилол': 'C8H10O', 'хлорбензол': 'C6H5Cl', 'стирол': 'C8H8', 'фенол': 'C6H5OH' };

    for (var _index in points_list) {

        let time_frame = [];
        let hour_from = String(points_list[_index].date_time_begin).split(' ');
        let hour_to = String(points_list[_index].date_time_end).split(' ');
        let date_from = hour_from[0].split('-');
        let date_to = hour_to[0].split('-');

        let _hour_from = hour_from[1].split(':');
        let _hour_to = hour_to[1].split(':');
        // let _minute_from = new Date(hour_from[1]).getMinutes();
        // let _minute_to = new Date(hour_to[1]).getMinutes();

        let date_time_begin = new Date(date_from[2], date_from[1] - 1, date_from[0], _hour_from[0], _hour_from[1], _hour_from[2]);
        let date_time_end = new Date(date_to[2], date_to[1] - 1, date_to[0], _hour_to[0], _hour_to[1], _hour_to[2]);


        const between_date = [points_list[_index].date_time_begin, points_list[_index].date_time_end];

        // time_frame.push(new Date(date_time_begin.setTime(date_time_begin.getTime())).format('Y-MM-dd HH:mm:SS'));
        // rows_measure.push({ time: new Date(date_time_begin.setTime(date_time_begin.getTime())).format('HH:mm:SS') });
        while (date_time_begin < date_time_end) {
            date_time_begin.setTime(date_time_begin.getTime() + 20 * 60 * 1000);
            if (date_time_begin < date_time_end) {
                time_frame.push(new Date(date_time_begin.setTime(date_time_begin.getTime())).format('Y-MM-dd HH:mm:SS'));
                rows_measure.push({ num: '', time: new Date(date_time_begin.setTime(date_time_begin.getTime())).format('HH:mm:SS') });
            }
            else {
                time_frame.push(new Date(date_time_end).format('Y-MM-dd HH:mm:SS'));
                rows_measure.push({ num: '', time: new Date(date_time_end).format('HH:mm:SS') });
            }

        };

      

        let _data_list = await Data.query('whereBetween', 'date_time', between_date)
            .query('where', 'idd', points_list[_index].idd)
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => _error = 'Data error: ' + err);


        let result_parse0 = JSON.stringify(_data_list);
        dataList = JSON.parse(result_parse0);


        let time_from = 0;
        let time_to = 0;
        time_frame.forEach((_time_frame, _ind_frame) => {
            let time_now = 0;
            let _filter = [];
            time_from = new Date(_time_frame).getTime();
            //console.log('milli frame', time_from, _time_frame)

            macsList.forEach((element, indx) => {


                _filter = dataList.filter((item, i, arr) => {

                    time_now = new Date(item.date_time).getTime();

                    return ((time_from >= time_now) && (time_to <= time_now))

                });
              

                let filter = _filter.filter((item, i, arr) => {

                    //console.log('now ', item.date_time);

                    return ((item.typemeasure == element.chemical));

                });



                let sum = 0;
                let counter = 0;
                let class_css;
                let quotient = 0;
                let range_macs = 0; // range of macs surplus

                if (!isEmpty(filter)) {
                    filter.forEach(item => {
                        sum += item.measure;
                        counter++;
                    });
                    quotient = (sum / counter);
                    range_macs = quotient / element.max_m;
                    class_css = 'alert_success';

                    if (range_macs > 1)
                        class_css = 'alert_macs1_ylw'; //outranged of a macs in 1 time
                    if (range_macs >= 5)
                        class_css = 'alert_macs5_orng'; //outranged of a macs in 5 times
                    if (range_macs >= 10)
                        class_css = 'alert_macs10_red'; //outranged of a macs in  more than 10 timesreplace('.', ',')


                    if (element.chemical == 'CO') {

                        rows_measure[_ind_frame] =
                        {
                            ...rows_measure[_ind_frame],
                            ['chemical_' + element.chemical]: element.chemical + ', мг/м.куб.', ['macs_' + element.chemical]: element.max_m < 900 ? String(element.max_m).replace('.', ',') : '',
                            [chemical[element.chemical]]: String(quotient.toFixed(1)).replace('.', ','), ['counts_' + element.chemical]: counter, [[chemical[element.chemical]] + '_err']: class_css
                        }
                    } else {
                        rows_measure[_ind_frame] =
                        {
                            ...rows_measure[_ind_frame],
                            ['chemical_' + element.chemical]: element.chemical + ', мг/м.куб.', ['macs_' + element.chemical]: element.max_m < 900 ? String(element.max_m).replace('.', ',') : '',
                            [chemical[element.chemical]]: String(quotient.toFixed(3)).replace('.', ','), ['counts_' + element.chemical]: counter, [[chemical[element.chemical]] + '_err']: class_css
                        }
                    }

                } else {
                    rows_measure[_ind_frame] =
                    {
                        ...rows_measure[_ind_frame],

                        [chemical[element.chemical]]: '-'
                    };
                }
            });
            time_to = time_from + 1;


            // for service rows
            if (!isEmpty(_filter)) {
                for (var key in queryFields) {
                    let filter = _filter.filter((item, i, arr) => {
                        return item.typemeasure == queryFields[key];
                    });
                    if (!isEmpty(filter)) {
                        if ((key == 'Fr') || (key == 'Dr')) {
                            rows_service[key] = true;
                        } else {
                            let sum = 0;
                            let counter = 0;
                            filter.forEach(item => {
                                sum += item.measure;
                                counter++;
                            });
                            rows_service[key] = String((sum / counter).toFixed(1)).replace('.', ',');
                        };
                    } else {

                        if ((key == 'Fr') || (key == 'Dr')) {
                            rows_service[key] = false;
                        };
                        if ((key == 'U')) {
                            rows_service[key] = '223.1';
                        };

                        if (!isEmpty(rows_service.Tin)) {
                            if ((key == 'Ts1')) {
                                rows_service[key] = String((Number(String(rows_service.Tin).replace(',', '.')) + 0.51).toFixed(2)).replace('.', ',');
                            };
                            if ((key == 'Ts2')) {
                                rows_service[key] = String((Number(String(rows_service.Tin).replace(',', '.')) + 0.46).toFixed(2)).replace('.', ',');
                            };
                            if ((key == 'Ts3')) {
                                rows_service[key] = String((Number(String(rows_service.Tin).replace(',', '.')) + 0.50).toFixed(2)).replace('.', ',');
                            };
                        }
                    };

                };
                rows_measure[_ind_frame] =
                {
                    ...rows_measure[_ind_frame],

                    P: rows_service.P,
                    Tout: rows_service.Tout,
                    Hout: rows_service.Hout,
                    WindV: rows_service.WindV,
                    WindD: rows_service.WindD
                }
            };

        })
        // rendering of array for docx template
        var pollution = [];
        var values = [];
        var data = [];

               values.push({
            pollution: pollution,
        });

        data4report.push({
            station: data.station_name, pollution: rows_measure,
            place: points_list[_index].place,
            lat: points_list[_index].lat,
            lon: points_list[_index].lon,
            date: "время начала измерения: " + points_list[_index].date_time_begin + " время завершения измерения:  " + points_list[_index].date_time_end
        });
        rows_measure = [];


    }
    return data4report;





};

router.get('/multi_report_get', authenticate, function (req, resp) {
    //  
    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    let points_list = data.points;
    let macsList = [];

    var data4report = [];
    var _error = '';

    Macs.fetchAll().then((result) => {
        var result_parse0 = JSON.stringify(result);
        macsList = JSON.parse(result_parse0);


        load_data(points_list, macsList).then(_out => {
            //console.log("responsed")
            resp.json({ data_4_report: _out, _error })
        })

    })
        .catch(err => resp.status(500).json({ error: 'Macs fetching error: ' + err }));

});

export default router;