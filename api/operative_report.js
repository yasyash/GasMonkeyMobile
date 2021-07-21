import express from 'express';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import jsonWT from 'jsonwebtoken';
import config from './config';

import authenticate from './shared/authenticate';

import Sensors from '../models/sensors';
import Data from '../models/data';

import url from 'url';
import qs from 'querystring';

import officegen from 'officegen';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import date from 'date-and-time';

import carbone from 'carbone';


import Macs from '../models/macs';

let router = express.Router();




router.post('/', authenticate, (req, resp) => {
    //  

    let data = req.body;

    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    //const between_date = [data.period_from, data.period_to];
    // const between_date = ['2018-05-21 00:00:00', '2018-05-21 19:05:00']
    // console.log('sensors ', data.sensors[0]);
    //if (data.report == 'operative') {
    //console.log(data.html);
    if (data.report == 'operative') {
        var filename = 'OperativeReport_station_' + data.station + '_' + data.date + '.docx';
        var filereport = 'operative_templ.docx'
    };
    if (data.report == 'multi') {
        var filename = 'Multi_Report_MEL_' + data.date + '.docx';
        var filereport = 'multi_templ.docx'
    };
    if (data.report == 'daily') {
        var filename = 'DailyReport_station_' + data.station + '_' + data.date + '.docx';
        var filereport = 'daily_templ.docx'
    };

    if (data.report == 'monthly') {
        var filename = 'MonthlyReport_station_' + data.station + '_' + data.date + '.docx';
        var filereport = 'monthly_templ.docx'
    };

    if (data.report == 'tza4') {
        var filename = 'TZA_4_Report_station_' + data.station + '_Substance_' + data.chemical + '_' + data.date + '.docx';

        var filereport = "";
        if (!data.checked_meteo) {
            filereport = 'tza4_templ.docx'
        } else {
            filereport = 'tza4_wm_templ.docx'
        }
    };
    var filepath = './reports/';




    resp.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    resp.setHeader('Content-disposition', 'attachment; filename=' + filename);

    carbone.render(path.resolve(filepath + filereport), data.data_4_report, function (err, result) {
        if (err) {
            return console.log(err);
        }
        // write the result

        // write the result
        resp.send(result);

    });

    

});

router.post('/report_excel', authenticate, (req, resp) => {
    //  

    //let query = url.parse(req.url).query;
    //let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    //const between_date = [data.period_from, data.period_to];
    // const between_date = ['2018-05-21 00:00:00', '2018-05-21 19:05:00']
    // console.log('sensors ', data.sensors[0]);
    //if (data.report == 'operative') {
    //console.log(data.html);
    let data = req.body;
    let checked_meteo = data.checked_meteo;
    
    if (data.report == 'operative') {
        var filename = 'OperativeReport_station_' + data.station + '_' + data.date + '.xlsx';
        var filereport = 'operative_templ.xlsx'
    };

    if (data.report == 'multi') {
        var filename = 'Multi_Report_MEL_' + data.date + '.xlsx';
        var filereport = 'multi_templ.xlsx'
    };

    if (data.report == 'daily') {
        var filename = 'DailyReport_station_' + data.station + '_' + data.date + '.xlsx';
        var filereport = 'daily_templ.xlsx'
    };

    if (data.report == 'monthly') {
        var filename = 'MonthlyReport_station_' + data.station + '_' + data.date + '.xlsx';
        var filereport = 'monthly_templ.xlsx'
    };

    if (data.report == 'tza4') {
        var filename = 'TZA_4_Report_station_' + data.station + '_Substance_' + data.chemical + '_' + data.date + '.xlsx';
        if (!checked_meteo) {
            var filereport = 'tza4_templ.xlsx'
        } else {
            var filereport = 'tza4_wm_templ.xlsx'
            //console.log("WITH METEO")

        }
    };

    if (data.report == 'tza4_auto') {
        var filename = 'TZA_4_2015_Report_station_' + data.station + '_' + data.date + '.xlsx';

        var filereport = 'tza4_auto_templ.xlsx'
        //console.log("WITH METEO")


    };

    if (data.report == 'table') {
        var filename = 'Table_' + data.station + '_' + data.chemical + '_' + data.date + '.xlsx';
        var filereport = 'table_templ.xlsx'
    };
    var filepath = './reports/';




    resp.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    resp.setHeader('Content-disposition', 'attachment; filename=' + filename);

    carbone.render(path.resolve(filepath + filereport), data.data_4_report, function (err, result) {
        if (err) {
            return console.log(err);
        }
        // write the result

        // write the result
        resp.send(result);

    });


});

function daysInMonth(month) {
    let days = 33 - new Date(new Date().getFullYear(), month, 33).getDate();
    return days;

};

async function loadData(station, between_date, station_name) {
    //var qry = "((date_time::varchar like '%:%0:%') or (date_time::varchar like '%:%2:%') or (date_time::varchar like '%:%4:%') or (date_time::varchar like '%:%6:%') or (date_time::varchar like '%:%8:%') ) AND sensors_data.typemeasure in (select equipments.typemeasure from equipments where idd = '" + station + "' and equipments.measure_class = 'data')";
    //consoleconsole.log('loadData');
    let data = await Promise.join(
        Data.query('whereBetween', 'date_time', between_date)
            .query('where', 'idd', station)
            //.query({
            //    andWhereRaw: (qry)
            //})
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        Sensors.query({
            select: ['serialnum', 'typemeasure', 'unit_name', 'is_wind_sensor'],
            where: ({ is_present: true }),
            andWhere: ({ idd: station }),
        })
            .fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        Macs.fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        Data.query('whereBetween', 'date_time', between_date)
            .query('where', 'idd', station)
            .query({
                andWhereRaw: ("((date_time::varchar like '%:%0:%') or (date_time::varchar like '%:%5:%') ) and (typemeasure = 'Направление ветра' or typemeasure = 'Интенс. осадков' or typemeasure = 'Влажность внеш.' or typemeasure = 'Скорость ветра' or typemeasure = 'Атм. давление' or typemeasure = 'Темп. внешняя')")
            })
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        ((data_list, data_sensors, consentration, meteo) => {
            let data = [data_list, data_sensors, consentration, meteo];
            return data;
        })

    )
        .catch(err => {
            console.log(err);
            return []
        });

    return data;

};

async function loadMeteo(station, between_date) {

    //console.log('between', between_date, 'station ', station);
    let data = await Data.query('whereBetween', 'date_time', between_date)
        .query('where', 'idd', station)
        .query({
            //  andWhereRaw: ("(date_time::varchar like  '%:%5:%' or  date_time::varchar like '%:%0:%')")
            andWhereRaw: ("(date_time::varchar like  '%:%5:%' or  date_time::varchar like '%:%0:%' or  date_time::varchar like '%:%2%')")
        })
        .orderBy('date_time', 'ASC').fetchAll()
        .catch(err => {
            console.log(err);
            return []
        });
    // console.log('data len ' + data.length);
    let result_parse = JSON.stringify(data);
    let arr = JSON.parse(result_parse);
    const _data = [];
    for (const ind in arr) {
        if ((arr[ind].typemeasure == 'Направление ветра') || (arr[ind].typemeasure == 'Интенс. осадков') || (arr[ind].typemeasure == 'Влажность внеш.') ||
            (arr[ind].typemeasure == 'Скорость ветра') || (arr[ind].typemeasure == 'Атм. давление') || (arr[ind].typemeasure == 'Темп. внешняя')) {
            _data.push(arr[ind]);
        }

    }
    return _data;
};

async function loadData_tza(station, between_date, station_name, chemic) {
    var qry = "((date_time::varchar like '%:%0:%') or (date_time::varchar like '%:%2:%') or (date_time::varchar like '%:%4:%') or (date_time::varchar like '%:%6:%') or (date_time::varchar like '%:%8:%') ) ";
    //consoleconsole.log('loadData');
    let data = await Promise.join(
        Data.query('whereBetween', 'date_time', between_date)
            .query('where', 'idd', station)
            .query('where', 'typemeasure', chemic)
            .query({
                andWhereRaw: (qry)
            })
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        Sensors.query({
            select: ['serialnum', 'typemeasure', 'unit_name', 'measure_class'],
            where: ({ is_present: true }),
            andWhere: ({ idd: station }),
        })
            .fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        Macs.fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        ((data_list, data_sensors, consentration) => {
            let data = [data_list, data_sensors, consentration];
            return data;
        })
    )
        .catch(err => {
            console.log(err);
            return []
        });
    return data;

};

async function loadData_tza_auto(station, between_date, station_name, chemic) {
    var qry = "typemeasure in (select equipments.typemeasure from equipments where idd = '" + station + "' and equipments.measure_class = 'data')";
    // console.log(between_date, station, chemic);
    let data = await Promise.join(
        Data.query('whereBetween', 'date_time', between_date)
            .query('where', 'idd', station)
            .query('whereIn', 'typemeasure', chemic)
            .query({
                andWhereRaw: (qry)
            })
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        Sensors.query({
            select: ['serialnum', 'typemeasure', 'unit_name', 'measure_class'],
            where: ({ is_present: true }),
            andWhere: ({ idd: station }),
        })
            .fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        Macs.fetchAll()
            .catch(err => {
                console.log(err);
                return []
            }),
        ((data_list, data_sensors, consentration) => {
            let data = [data_list, data_sensors, consentration];
            return data;
        })
    )
        .catch(err => {
            console.log(err);
            return []
        });
    return data;

};

router.get('/get_monthly', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    let station_name = data.station_name;

    const between_date = [data.period_from, data.period_to];
    //console.log('between ', between_date);

    //console.log('time in =', Date.now());
    //var start1 = Date.now();
    loadData(data.station, between_date, station_name).then(result => {

        let result_parse0 = JSON.stringify(result[0]);
        let arr0 = JSON.parse(result_parse0);
        let result_parse1 = JSON.stringify(result[1]);
        let arr1 = JSON.parse(result_parse1);
        let result_parse2 = JSON.stringify(result[2]);
        let arr2 = JSON.parse(result_parse2);
        let result_parse3 = JSON.stringify(result[3]);
        let _meteo = JSON.parse(result_parse3);

        //console.log("quantity = ", _meteo.length)
        //console.log('time transaction =', Date.now() - start1);


        const template_chemical = ['NO', 'NO2', 'NH3', 'SO2', 'H2S', 'O3', 'CO', 'CH2O', 'PM1', 'PM2.5', 'PM10', 'Пыль общая', 'бензол', 'толуол', 'этилбензол', 'м,п-ксилол', 'о-ксилол', 'хлорбензол', 'стирол', 'фенол'];
        const chemical_classes = { //classes dangerous
            'NO': 3,
            'NO2': 3,
            'NH3': 4,
            'SO2': 3,
            'H2S': 3,
            'O3': 1,
            'CO': 4,
            'CH2O': 2,
            'PM1': 3,
            'PM2.5': 3,
            'PM10': 3,
            'Пыль общая': 3,
            'бензол': 2,
            'толуол': 3,
            'этилбензол': 4,
            'м,п-ксилол': 3,
            'о-ксилол': 3,
            'хлорбензол': 3,
            'стирол': 3,
            'фенол': 2
        };

        let dataList = arr0;
        let sensorsList = arr1;
        let macsList = arr2;
        let avrg_measure = [];
        let data_raw = [];
        let _data_raw = [];
        let times = 0;
        let time_frame = [];
        var last_day = '';
        let period_from = between_date[0];
        let minute20_frame = [];

        if (new Date().getMonth() != new Date(period_from).getMonth()) {
            last_day = daysInMonth(new Date(period_from).getMonth());
        } else {
            last_day = new Date().getDate();
        }


        for (var ms = 1; ms < last_day + 1; ms++) {

            time_frame.push(date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY'));
            // console.log('date ', date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY'));
            _data_raw.push({ 'time': date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY') });


        }
        //let i = 0;
        for (var h = 0; h < 24; h++) {
            for (var m = 19; m < 60; m += 20) {

                minute20_frame.push(h.toString() + ':' + m.toString());
                // data_raw.push({ 'time': date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY'), 'minutes_20': i });

                //i++;
                //data_raw.push({ 'time': h.toString() + ':' + m.toString() });
            };
        };

        //console.log('begin');
        macsList.forEach((element, indx) => {
            //    console.log('Macs list ', element);
            if ((element.chemical == 'NO') || (element.chemical == 'NO2') || (element.chemical == 'NH3') ||
                (element.chemical == 'SO2') || (element.chemical == 'H2S') ||
                (element.chemical == 'O3') || (element.chemical == 'CO') || (element.chemical == 'CH2O') ||
                (element.chemical == 'PM1') || (element.chemical == 'PM2.5') ||
                (element.chemical == 'PM10') || (element.chemical == 'Пыль общая') || (element.chemical == 'бензол') ||
                (element.chemical == 'толуол') || (element.chemical == 'этилбензол') || (element.chemical == 'м,п-ксилол') ||
                (element.chemical == 'о-ксилол') || (element.chemical == 'хлорбензол') || (element.chemical == 'стирол') || (element.chemical == 'фенол')) {

                let sensor = sensorsList.filter((item, i) => {
                    return item.typemeasure == element.chemical;

                })

                let filter = dataList.filter((item, i, arr) => {
                    // if (item.chemical == 'H2S') console.log('data raw ', item);
                    return item.typemeasure == element.chemical;
                });
                let sum_all = 0;
                let counter = 0;
                let frame_count = 0;
                let class_css;
                let quotient = 0;
                let range_macs = 0; // range of macs surplus
                let max = 0;
                let max_time = '-';
                let min = 1000000;
                let min_time = '-';
                let max_sum = 0;
                let max_time_sum = '-';
                let min_sum = 1000000;
                let min_time_sum = '-';
                let local_max_sum = 0;
                let max_time_sum_momental = '-';
                let counter_macs1 = 0;
                let counter_macs5 = 0;
                let counter_macs10 = 0;
                let time_in = 0;
                let tim_out = '';
                let temp_raw = [];
                let day_now = 0;
                let time_from = 0;
                let time_to = 0;
                let sum_alert = 0;
                var coefficient = 1.0;
                let meteo_complete = false;
                let temp = -1000;
                let dir = -1000;
                let spd = -1000;
                let hum = -1000;
                let is_range = false;
                let range_out_counter = 0;

                if (!isEmpty(filter)) {

                    //console.logconsole.log('chemical ', element.chemical);
                    //if (element.chemical == 'H2S') console.log('data raw ', filter);

                    time_frame.forEach((item, ind) => {
                        //         console.log('item ', item);
                        // let tmp = item.split(':');
                        //let up_sec = tmp[0] * 3600 + tmp[1] * 60;

                        // console.log('raw ' + up_sec);

                        //time_in = up_sec;

                        //meteo calculation

                        if (!meteo_complete) {
                            const meteo = [];

                            for (var elem = 0; elem < _meteo.length; elem++) {
                                day_now = date.format(new Date(_meteo[elem].date_time), 'DD-MM-YYYY');

                                if ((day_now == item))
                                    meteo.push(_meteo[elem]);
                            }


                            //meteo avrg
                            if (meteo.length > 0) {
                                let _temp = -1000.0, _temp_cnt = 0;
                                let _dir = -1000.0, _dir_cnt = 0;
                                let _spd = -1000.0, _spd_cnt = 0;
                                let _hum = -1000.0, _hum_cnt = 0;

                                meteo.forEach(_meteo => {
                                    if (_meteo.typemeasure == 'Направление ветра') {
                                        if (_dir_cnt == 0) _dir = 0.0;
                                        _dir += Number(_meteo.measure);
                                        _dir_cnt++;
                                    }
                                    if (_meteo.typemeasure == 'Темп. внешняя') {
                                        if (_temp_cnt == 0) _temp = 0.0;

                                        _temp += Number(_meteo.measure);
                                        _temp_cnt++;
                                    }
                                    if (_meteo.typemeasure == 'Скорость ветра') {
                                        if (_spd_cnt == 0) _spd = 0.0;

                                        _spd += Number(_meteo.measure);
                                        _spd_cnt++;
                                    }
                                    if (_meteo.typemeasure == 'Влажность внеш.') {
                                        if (_hum_cnt == 0) _hum = 0.0;

                                        _hum += Number(_meteo.measure);
                                        _hum_cnt++;
                                    }

                                })
                                if (_dir_cnt > 0)
                                    dir = _dir / _dir_cnt;
                                if (_temp_cnt > 0)
                                    temp = _temp / _temp_cnt;
                                if (_spd_cnt > 0)
                                    spd = _spd / _spd_cnt;
                                if (_hum_cnt > 0)
                                    hum = _hum / _hum_cnt;
                            }
                        }

                        //pollution calculation
                        let obj = filter.filter((elem, i, arr) => { //selection data by day frame

                            day_now = date.format(new Date(elem.date_time), 'DD-MM-YYYY');


                            return (day_now == item);
                        });
                        //console.log('data lenghth =', obj.length, 'day now ', obj.length > 0 ? date.format(new Date(obj[0].date_time), 'DD-MM-YYYY') : 'no data ', item);
                        // if (element.chemical == 'H2S') console.log('data raw ', obj);


                        let sum = 0; //day sum
                        let day_counter = 0;
                        let local_counter_macs1 = 0;
                        let local_counter_macs5 = 0;
                        let local_counter_macs10 = 0;

                        minute20_frame.forEach((minutes_20, _inx) => {
                            let time_now = 0;
                            let tmp = minutes_20.split(':');
                            time_from = tmp[0] * 3600 + tmp[1] * 60;

                            let data_minute20 = obj.filter((elem, i, arr) => {


                                time_now = new Date(elem.date_time).getHours() * 3600 +
                                    new Date(elem.date_time).getMinutes() * 60 + new Date(elem.date_time).getSeconds();

                                return ((time_from >= time_now) && (time_to <= time_now));
                            });


                            time_to = time_from + 1;
                            let local_cnt = 0;
                            let local_sum = 0;
                            class_css = 'alert_success';
                            range_out_counter = 0;

                            if (!isEmpty(data_minute20)) {  //hour's list in day frame

                                data_minute20.forEach((unit => {
                                    //if (unit.typemeasure = 'H2S') console.log('unit ', unit);


                                    sum += unit.measure;
                                    local_cnt++;
                                    local_sum += unit.measure;

                                    sum_all += unit.measure;

                                    day_counter++;
                                    counter++;


                                    //if (unit.measure < min) {
                                    //   min = unit.measure;
                                    //   min_time = date.format(new Date(unit.date_time), 'DD-MM-YYYY HH:mm:SS');
                                    // }

                                    //if (unit.measure > max) {
                                    //   max = unit.measure;
                                    //  max_time = date.format(new Date(unit.date_time), 'DD-MM-YYYY');
                                    // }
                                    if (sensor.max_day_consentration < unit.measure)
                                        range_out_counter++;



                                }))
                                local_sum = local_sum / local_cnt;


                                // console.log('index out', ind, 'raw ', data_raw[ind]);


                                if (local_sum > max) {
                                    max = local_sum;
                                    max_time = item + ' ' + minutes_20;
                                }



                                if ((local_sum / 10) >= element.max_m) {
                                    counter_macs10++;
                                    local_counter_macs10++;

                                } else {

                                    if ((local_sum / 5) >= element.max_m) {


                                        counter_macs5++;
                                        local_counter_macs5++;

                                    } else {
                                        if (local_sum >= element.max_m) //element.max_d may be changed to max_m on Krasnoyarsk demand
                                        {
                                            counter_macs1++;
                                            local_counter_macs1++;

                                        }
                                    }
                                }




                            } //else {
                            //  let dt = data_raw[_inx];
                            // console.log('elem ', element.chemical, dt, ind, _inx, data_raw[0], data_raw[1]);

                            //dt[element.chemical] = '-';
                            //data_raw[_inx] = dt;
                            //};
                            if (local_cnt > 0) {
                                frame_count++;

                            }



                        });

                        // meteo calc.
                        if (!meteo_complete) {
                            if (dir > -1) {
                                let dt = _data_raw[ind];
                                dt['dir'] = dir.toFixed(0);
                                _data_raw[ind] = dt;
                                dir = -1000;


                            } else {
                                let dt = _data_raw[ind];

                                dt['dir'] = '-';
                                _data_raw[ind] = dt;

                            }
                            if (temp > -100) {
                                let dt = _data_raw[ind];

                                dt['temp'] = temp.toFixed(1);
                                _data_raw[ind] = dt;
                                temp = -1000;

                            } else {
                                let dt = _data_raw[ind];

                                dt['temp'] = '-';
                                _data_raw[ind] = dt;

                            }
                            if (spd > -1) {
                                let dt = _data_raw[ind];

                                dt['spd'] = spd.toFixed(0);
                                _data_raw[ind] = dt;
                                spd = -1000;

                            } else {
                                let dt = _data_raw[ind];

                                dt['spd'] = '-';

                                _data_raw[ind] = dt;

                            }
                            if (hum > -1) {
                                let dt = _data_raw[ind];

                                dt['hum'] = hum.toFixed(0);
                                _data_raw[ind] = dt;
                                hum = -1000;

                            } else {
                                let dt = _data_raw[ind];


                                dt['hum'] = '-';
                                _data_raw[ind] = dt;

                            }

                        }

                        //pollution calculation
                        if (day_counter > 0) {
                            sum = sum / day_counter;
                            let dt = _data_raw[ind];
                            class_css = 'alert_success';

                            if (element.chemical == 'CO') {
                                dt[element.chemical] = sum.toFixed(1);


                            } else {
                                dt[element.chemical] = sum.toFixed(3);
                            }


                            if (local_counter_macs1 > 0)
                                class_css = 'alert_macs1_ylw'; //outranged of a macs in 1 time
                            if (local_counter_macs5 > 0)
                                class_css = 'alert_macs5_orng'; //outranged of a macs in 5 times
                            if (local_counter_macs10 > 0)
                                class_css = 'alert_macs10_red'; //outranged of a macs in  more than 10 times
                            if (day_counter < 54)
                                class_css = 'alert_empty';

                            if (range_out_counter > 4)
                                class_css = 'alert_range';

                            dt[element.chemical + '_class'] = class_css;
                            //console.log(element.chemical, " - days", ind, " day count ", day_counter);

                            _data_raw[ind] = dt;


                            if (sum < min_sum) {
                                min_sum = sum;
                                min_time_sum = item;
                            }

                            if (sum > max_sum) {
                                max_sum = sum;
                                max_time_sum = item;
                            }
                        } else {
                            let dt = _data_raw[ind];
                            dt[element.chemical] = '-';

                            class_css = 'alert_success';

                            dt[element.chemical + '_class'] = class_css;

                            _data_raw[ind] = dt;
                        }
                    });
                    meteo_complete = true;

                    //after all days
                    if (counter > 0)
                        quotient = (sum_all / counter);
                    //range_macs = quotient / element.max_d;
                    class_css = 'alert_success';
                    times++;

                    if (counter_macs1 > 0)
                        class_css = 'alert_macs1_ylw'; //outranged of a macs in 1 time
                    if (counter_macs5 > 0)
                        class_css = 'alert_macs5_orng'; //outranged of a macs in 5 times
                    if (counter_macs10 > 0)
                        class_css = 'alert_macs10_red'; //outranged of a macs in  more than 10 times

                    if (chemical_classes[element.chemical] == 1) //coefficients for class dangerous
                        coefficient = 1.7;
                    if (chemical_classes[element.chemical] == 2)
                        coefficient = 1.3;
                    if (chemical_classes[element.chemical] == 3)
                        coefficient = 1.0;
                    if (chemical_classes[element.chemical] == 4)
                        coefficient = 0.9;


                    let sum_pow2 = 0;
                    time_frame.forEach((item, ind) => {
                        let dt = _data_raw[ind];
                        if (!isNaN(Number(dt[element.chemical]))) {

                            sum_pow2 += (Number(dt[element.chemical]) - quotient) * (Number(dt[element.chemical]) - quotient)
                            //console.log("sigma", sum_pow2);
                        }
                    });

                    avrg_measure.push({

                        'chemical': element.chemical,
                        'value': quotient.toFixed(3),
                        'counts': frame_count,
                        //'min': min, 'min_time': min_time,
                        'max': max, 'max_time': max_time,
                        'min_sum': min_sum, 'min_time_sum': min_time_sum,
                        'max_sum': max_sum, 'max_time_sum': max_time_sum,
                        'counter_macs1': counter_macs1,
                        'counter_macs5': counter_macs5,
                        'counter_macs10': counter_macs10,
                        's_index': Number(element.max_m) < 900 ? Number(max / element.max_m).toFixed(1) : '-',
                        'gre_repeatably': Number(element.max_m) < 900 ? Number(Number(counter_macs1 + counter_macs5 + counter_macs10) / frame_count * 100).toFixed(2) : '-',
                        'sigma': Math.sqrt(sum_pow2 / (frame_count - 1)).toFixed(3),
                        //'pollut_ind': Number(element.max_d) < 900 ? Number(quotient / element.max_d * coefficient).toFixed(1) : '-',
                        'className': class_css
                    })

                };

            };
        });
        //console.log('data', avrg_measure);
        //console.log('end');
        let name
        let chemical = [];
        let value = [];
        let counts = [];
        //let min = [];
        //let min_time = []
        let max = [];
        let max_time = [];
        let min_sum = [];
        let min_time_sum = []
        let max_sum = [];
        let max_time_sum = [];
        let counter_macs1 = [];
        let counter_macs5 = [];
        let counter_macs10 = [];
        let className = [];
        let s_index = [];
        let gre_repeatably = [];
        let sigma = [];


        chemical.push('Наименование');
        value.push('Среднемесячное значение');
        counts.push('Количество');
        min_sum.push('Минимальное значение');
        min_time_sum.push('Время минимального значения');
        max_sum.push('Максимальное значение');
        max_time_sum.push('Время максимального значения');
        // min.push('Мин. разовая концентрация');
        // min_time.push('Дата наблюдения мин.р. концентрации');
        max.push('Макс. разовая концентрация');
        max_time.push('Дата наблюдения макс. р. концентрации');
        counter_macs1.push('Количество превышений ПДК');
        counter_macs5.push('Количество превышений 5*ПДК');
        counter_macs10.push('Количество превышений 10*ПДК');
        s_index.push('Стандартный индекс');
        gre_repeatably.push('Наибольшая повторяемость, %');
        sigma.push('Ср. квадр. отклонение');
        className.push('ClassName');

        template_chemical.forEach(item => {


            let filter = avrg_measure.filter((opt, i, arr) => {
                return item == opt.chemical;
            });

            if (isEmpty(filter)) {
                _data_raw.forEach((opt, indx) => {
                    _data_raw[indx] = { ..._data_raw[indx], [item]: '-' };

                });
            }

            if (!isEmpty(filter)) {
                filter.forEach(element => {
                    if (element.chemical == 'CO') {
                        chemical.push(element.chemical);
                        value.push(String(Number(element.value).toFixed(1)).replace('.', ','));
                        counts.push(element.counts);
                        min_sum.push(String(Number(element.min_sum).toFixed(1)).replace('.', ','));
                        min_time_sum.push(element.min_time_sum);
                        max_sum.push(String(Number(element.max_sum).toFixed(1)).replace('.', ','));
                        max_time_sum.push(element.max_time_sum);
                        // min.push(Number(element.min).toFixed(3));
                        // min_time.push(element.min_time);
                        max.push(String(Number(element.max).toFixed(1)).replace('.', ','));
                        max_time.push(element.max_time);
                        counter_macs1.push(element.counter_macs1);
                        counter_macs5.push(element.counter_macs5);
                        counter_macs10.push(element.counter_macs10);
                        s_index.push(String(element.s_index).replace('.', ','));
                        gre_repeatably.push(String(element.gre_repeatably).replace('.', ','));
                        sigma.push(String(element.sigma).replace('.', ','));
                        className.push(element.className);
                    }
                    else {
                        chemical.push(element.chemical);
                        value.push(String(Number(element.value).toFixed(3)).replace('.', ','));
                        counts.push(element.counts);
                        min_sum.push(String(Number(element.min_sum).toFixed(3)).replace('.', ','));
                        min_time_sum.push(element.min_time_sum);
                        max_sum.push(String(Number(element.max_sum).toFixed(3)).replace('.', ','));
                        max_time_sum.push(element.max_time_sum);
                        // min.push(Number(element.min).toFixed(3));
                        // min_time.push(element.min_time);
                        max.push(String(Number(element.max).toFixed(3)).replace('.', ','));
                        max_time.push(element.max_time);
                        counter_macs1.push(element.counter_macs1);
                        counter_macs5.push(element.counter_macs5);
                        counter_macs10.push(element.counter_macs10);
                        s_index.push(String(element.s_index).replace('.', ','));
                        gre_repeatably.push(String(element.gre_repeatably).replace('.', ','));
                        sigma.push(String(element.sigma).replace('.', ','));
                        className.push(element.className);
                    }


                });
            } else {
                chemical.push(item);
                value.push('-');
                counts.push('-');
                min_sum.push('-');
                min_time_sum.push('-');
                max_sum.push('-');
                max_time_sum.push('-');
                //  min.push('-');
                //  min_time.push('-');
                max.push('-');
                max_time.push('-');
                counter_macs1.push('-');
                counter_macs5.push('-');
                counter_macs10.push('-');
                s_index.push('-');
                gre_repeatably.push('-');
                sigma.push('-');
                className.push('');

            };
        });
        let _avrg_measure = [];
        _avrg_measure.push(chemical, value, counts, max_sum, max_time_sum, min_sum, min_time_sum,
            max, max_time, counter_macs1, counter_macs5, counter_macs10, s_index, gre_repeatably, sigma, className);


        // rendering of array for docx template

        var pollution = [];
        var values = [];
        var data = [];
        _data_raw.forEach((element, ind) => {
            pollution.push({
                time: element.time, valueNO: String(element.NO).replace('.', ','), valueNO2: String(element.NO2).replace('.', ','), valueNH3: String(element.NH3).replace('.', ','), valueSO2: String(element.SO2).replace('.', ','),
                valueH2S: String(element.H2S).replace('.', ','), valueO3: String(element.O3).replace('.', ','), valueCO: String(element.CO).replace('.', ','), valueCH2O: String(element.CH2O).replace('.', ','), valuePM1: String(element.PM1).replace('.', ','),
                valuePM25: String(element['PM2.5']).replace('.', ','), valuePM10: String(element.PM10).replace('.', ','), valueTSP: String(element['Пыль общая']).replace('.', ','),
                valueC6H6: String(element['бензол']).replace('.', ','), valueC7H8: String(element['толуол']).replace('.', ','), valueC8H10: String(element['этилбензол']).replace('.', ','),
                valueC8H10MP: String(element['м,п-ксилол']).replace('.', ','), valueC8H10O: String(element['о-ксилол']).replace('.', ','), valueC6H5Cl: String(element['хлорбензол']).replace('.', ','),
                valueC8H8: String(element['стирол']).replace('.', ','), valueC6H5OH: String(element['фенол']).replace('.', ','), valueTemp: String(element['temp']).replace('.', ','), valueDir: element['dir'], valueSpd: element['spd'], valueHum: element['hum']
            });
        })
        // values.push({
        //    date: new Date().format('dd-MM-Y'), pollution: pollution
        //});
        // let str = '';
        //  let measure = [];
        _avrg_measure.forEach((element, ind) => {
            if ((ind > 0) && (ind < _avrg_measure.length - 1)) {
                pollution.push({
                    time: element[0], valueNO: element[1], valueNO2: element[2], valueNH3: element[3], valueSO2: element[4],
                    valueH2S: element[5], valueO3: element[6], valueCO: element[7], valueCH2O: element[8], valuePM1: element[9],
                    valuePM25: element[10], valuePM10: element[11], valueTSP: element[12],
                    valueC6H6: element[13], valueC7H8: element[14], valueC8H10: element[15],
                    valueC8H10MP: element[16], valueC8H10O: element[17], valueC6H5Cl: element[18],
                    valueC8H8: element[19], valueC6H5OH: element[20]

                });
            }
        });

        //console.log('time total =', Date.now() - start1);

        //values.push(measure);
        values.push({
            year: date.format(new Date(period_from), 'YYYY'),
            month: date.format(new Date(period_from), 'MM'), pollution: pollution
        });
        data.push({ station: station_name, values: values });
        //console.log('time total =', Date.now() - start1);

        let response = {};

        response.data_raw = _data_raw;
        response.avrg_measure = _avrg_measure;
        response.data = data;
        resp.json({ response });
    });





    //begin rendering




});

router.get('/get_tza4', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    let station_name = data.station_name;
    let chemic = data.chemical;
    let meteo_add = data.checked_meteo;
    const between_date = [data.period_from, data.period_to];
    let point_descr = data.point_descr;

    //console.log('chemical : ', chemic);
    //console.log('time in =', Date.now());
    //var start1 = Date.now();
    loadMeteo(data.station, between_date).then(_result => {

        //let _result_parse0 = JSON.stringify(_result);
        let meteo_all = _result;
        //console.log('result : ', meteo_all.length);
        loadData_tza(data.station, between_date, station_name, chemic).then(result => {
            //console.log('time transaction =', Date.now() - start1);

            var result_parse0 = JSON.stringify(result[0]);
            var arr0 = JSON.parse(result_parse0);
            var result_parse1 = JSON.stringify(result[1]);
            var arr1 = JSON.parse(result_parse1);
            var result_parse2 = JSON.stringify(result[2]);
            var arr2 = JSON.parse(result_parse2);

            const template_chemical = ['NO', 'NO2', 'NH3', 'SO2', 'H2S', 'O3', 'CO', 'CH2O', 'PM1', 'PM2.5', 'PM10', 'Пыль общая'];

            var dataList = arr0;
            var sensorsList = arr1;
            var macsList = arr2;
            var avrg_measure = [];
            var data_raw = [];
            var times = 0;
            var time_frame = [];
            var last_day = '';
            var period_from = between_date[0];
            var time_now = 0;
            var Tq_sum = 0; //where Q > MAC moment
            var n_monthly = 0;

            var macs_one = macsList.filter((item, i, arr) => {
                return (item.chemical == chemic);
            });

            if (new Date().getMonth() != new Date(period_from).getMonth()) {
                last_day = daysInMonth(new Date(period_from).getMonth());
            } else {
                last_day = new Date().getDate();
            }


            for (var ms = 1; ms < last_day + 1; ms++) {

                time_frame.push(date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY'));
                // console.log('date ', date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY'));

            }
            var sumQc = 0;
            var Qc = 0;
            var counter = 0;
            var Qmax = 0;
            var Qmax_time = '-';
            var QmaxC = 0;
            var QmaxC_time = '-';
            var maxQc = 0;
            var maxQc_time = '-';
            var counter_macs1 = 0;

            var time_in = 0;
            var time_out = 0;
            var temp_day = [];
            var day_now = 0;
            var up_sec = 0;
            var Tq_day = 0;
            var alert_macs = false;
            var n_daily = 0;
            var period_in = 0; //begin of period where Q > MACs
            var M_sumQc = 0;
            var tza4_templ = [];
            var dataDayList = [];
            let meteo_complete = false;
            let temp = -1000;
            let dir = -1000;
            let spd = -1000;
            let hum = -1000;
            let tempr_day = [], dir_day = [], spd_day = [], hum_day = [], tza4_templ_meteo = [];

            var chemical_one = sensorsList.filter((item, i, arr) => {
                return (item.typemeasure == chemic);
            });

            //if weather calculations
            if ((chemical_one[0].measure_class != 'data') || (chemic == 'CO'))
                var signs = 1;
            else
                var signs = 3;

            //console.log('between ', chemical_one[0]);
            time_frame.forEach((element, indx) => { //step by day

                temp_day.push(indx + 1);
                temp_day.push('непр.');
                // console.log(' day ' + element);
                let dataDayList = dataList.filter((item, i, arr) => {
                    time_now = date.format(new Date(item.date_time), 'DD-MM-YYYY');


                    return (element == time_now);
                });


                if (!isEmpty(dataDayList)) {
                    //    console.log('Macs list ', element);
                    for (var hour = 3600; hour <= 86400; hour += 3600) { //step by hour
                        time_in = hour - 3600;//select hours data 
                        let minutes = dataDayList.filter((item, i, arr) => {
                            time_now = new Date(item.date_time).getHours() * 3600 +
                                new Date(item.date_time).getMinutes() * 60 + new Date(item.date_time).getSeconds();

                            return ((hour > time_now) && (time_in <= time_now));
                        });

                        if (!meteo_complete) {
                            const meteo = [];

                            for (const elem in meteo_all) { // console.log('elem ', meteo_all[elem]) 
                                time_now = new Date(meteo_all[elem].date_time).getHours() * 3600 + new Date(meteo_all[elem].date_time).getMinutes() * 60 +
                                    new Date(meteo_all[elem].date_time).getSeconds();
                                day_now = date.format(new Date(meteo_all[elem].date_time), 'DD-MM-YYYY');

                                if ((hour > time_now) && (time_in <= time_now) && (day_now == element) && ((meteo_all[elem].typemeasure == 'Направление ветра') ||
                                    (meteo_all[elem].typemeasure == 'Скорость ветра') ||
                                    (meteo_all[elem].typemeasure == 'Влажность внеш.') || (meteo_all[elem].typemeasure == 'Темп. внешняя'))) {
                                    meteo.push(meteo_all[elem]);
                                }
                            }

                            //meteo avrg
                            if (meteo.length > 0) {
                                let _temp = -1000.0, _temp_cnt = 0;
                                let _dir = -1000.0, _dir_cnt = 0;
                                let _spd = -1000.0, _spd_cnt = 0;
                                let _hum = -1000.0, _hum_cnt = 0;

                                meteo.forEach(_meteo => {
                                    if (_meteo.typemeasure == 'Направление ветра') {
                                        if (_dir_cnt == 0) _dir = 0.0;
                                        _dir += Number(_meteo.measure);
                                        _dir_cnt++;
                                    }
                                    if (_meteo.typemeasure == 'Темп. внешняя') {
                                        if (_temp_cnt == 0) _temp = 0.0;

                                        _temp += Number(_meteo.measure);
                                        _temp_cnt++;
                                    }
                                    if (_meteo.typemeasure == 'Скорость ветра') {
                                        if (_spd_cnt == 0) _spd = 0.0;

                                        _spd += Number(_meteo.measure);
                                        _spd_cnt++;
                                    }
                                    if (_meteo.typemeasure == 'Влажность внеш.') {
                                        if (_hum_cnt == 0) _hum = 0.0;

                                        _hum += Number(_meteo.measure);
                                        _hum_cnt++;
                                    }

                                })
                                if (_dir_cnt > 0)
                                    dir = _dir / _dir_cnt;
                                if (_temp_cnt > 0)
                                    temp = _temp / _temp_cnt;
                                if (_spd_cnt > 0)
                                    spd = _spd / _spd_cnt;
                                if (_hum_cnt > 0)
                                    hum = _hum / _hum_cnt;
                            } else {
                                tempr_day.push('-');
                                hum_day.push('-');
                                dir_day.push('-');
                                spd_day.push('-');

                            }
                        }


                        if (!isEmpty(minutes)) {
                            let sum = 0.0;
                            let local_cnt = 1;

                            minutes.forEach((item, indx) => { //step by minute temp_day = [], dir_day = [], spd_day = [], hum_day = []
                                //let up_sec = tmp[0] * 3600 + tmp[1] * 60;

                                // console.log('raw ' + up_sec);
                                let _date = date.format(new Date(item.date_time), 'mm');

                                if (_date < 21) {
                                    if (item.measure != undefined) {
                                        sum += item.measure;
                                        local_cnt++;

                                    }
                                    else {
                                        sum += 0.0;
                                    }


                                    if (item.measure >= macs_one.max_m) {
                                        //console.log('alert');

                                        if (!alert_macs) {
                                            n_daily++;
                                            period_in = new Date(item.date_time).getHours() * 3600 +
                                                new Date(item.date_time).getMinutes() * 60 + new Date(item.date_time).getSeconds();
                                            //time in seconds
                                        };

                                        alert_macs = true;
                                    } else {
                                        if (alert_macs) {
                                            Tq_day = Tq_day + (new Date(item.date_time).getHours() * 3600 +
                                                new Date(item.date_time).getMinutes() * 60 + new Date(item.date_time).getSeconds()) - period_in;
                                            //time in seconds
                                            period_in = 0;
                                        };
                                        alert_macs = false;
                                    };
                                }
                            });

                            sum = sum / local_cnt;

                            if (sum > Qmax) {
                                Qmax = sum;
                                Qmax_time = time_in / 3600 + ':19:59';//'01:01:01';//toString(hour/3600) + ':19:59';  +//date.format(new Date(time_now), 'HH:19:59');
                            }
                            if (!meteo_complete) {
                                if (dir > -1) {

                                    dir_day.push(dir.toFixed(0));
                                    dir = -1000;

                                } else {
                                    dir_day.push('-');

                                }
                                if (temp > -100) {
                                    tempr_day.push(temp.toFixed(1));
                                    temp = -1000;

                                } else {
                                    tempr_day.push('-');
                                }
                                if (spd > -1) {
                                    spd_day.push(spd.toFixed(0));
                                    spd = -1000;

                                } else {
                                    spd_day.push('-');

                                }
                                if (hum > -1) {
                                    hum_day.push(hum.toFixed(0));
                                    hum = -1000;

                                } else {
                                    spd_day.push('-');

                                }

                            }
                            temp_day.push(sum.toFixed(signs));
                            sumQc += sum;
                        } else {
                            temp_day[1] = 'нет';
                            temp_day.push('-');
                        };
                    };//end 24-hours frame
                } else {
                    temp_day[1] = 'нет';
                    temp_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');

                    tempr_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');
                    hum_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');
                    dir_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');
                    spd_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');

                };


                //Tq_day = Tq_day.toFixed(0) ; 
                Tq_sum = Tq_sum + Tq_day;
                n_monthly = n_monthly + n_daily;
                Qc = sumQc / 24;

                M_sumQc = M_sumQc + sumQc;


                if (Qc > QmaxC) {
                    QmaxC = Qc;
                    QmaxC_time = element;
                }

                if (Qc >= macs_one.max_d)
                    counter_macs1++;

                temp_day.push(sumQc.toFixed(signs), n_daily, Qc.toFixed(signs), Qmax.toFixed(signs), Qmax_time, Tq_day.toFixed(0), { tempr: tempr_day, hum: hum_day, spd: spd_day, dir: dir_day });
                tza4_templ.push(temp_day);
                tza4_templ_meteo.push({ tempr: tempr_day, hum: hum_day, spd: spd_day, dir: dir_day });
                //console.log(tempr_day, hum_day, spd_day, dir_day)

                tempr_day = [], dir_day = [], spd_day = [], hum_day = [];
                //push data should above this code
                Qmax = 0;
                Qmax_time = '-';
                Tq_day = 0;
                n_daily = 0;
                temp_day = [];
                sumQc = 0;

            });
            meteo_complete = true;

            // M_sumQc, n_monthly, ...M(Qc) ~conter_macs1
            // QmaxC, 
            // QmaxC_time
            //counter_macs1



            // rendering of array for docx template

            var pollution = [];
            var values = [];
            var data = [];
            /*if (!meteo_add) {
                tza4_templ.forEach((element, ind) => {
                    pollution.push({
                        time: element[0], P: element[1], h1: element[2].replace('.', ','), h2: element[3].replace('.', ','), h3: element[4].replace('.', ','), h4: element[5].replace('.', ','),
                        h5: element[6].replace('.', ','), h6: element[7].replace('.', ','), h7: element[8].replace('.', ','), h8: element[9].replace('.', ','), h9: element[10].replace('.', ','), h10: element[11].replace('.', ','),
                        h11: element[12].replace('.', ','), h12: element[13].replace('.', ','), h13: element[14].replace('.', ','), h14: element[15].replace('.', ','), h15: element[16].replace('.', ','), h16: element[17].replace('.', ','),
                        h17: element[18].replace('.', ','), h18: element[19].replace('.', ','), h19: element[20].replace('.', ','), h20: element[21].replace('.', ','), h21: element[22].replace('.', ','),
                        h22: element[23].replace('.', ','), h23: element[24].replace('.', ','), h24: element[25].replace('.', ','), SumQc: element[26].replace('.', ','), n: element[27], Qc: element[28].replace('.', ','),
                        Qm: element[29].replace('.', ','), Tm: element[30], Tq: element[31]
                    });
                })
            } else {*/
            let key = '';
            tza4_templ.forEach((element, ind) => {
                pollution.push({
                    time: element[0], P: element[1], h1: element[2].replace('.', ','), h2: element[3].replace('.', ','), h3: element[4].replace('.', ','), h4: element[5].replace('.', ','),
                    h5: element[6].replace('.', ','), h6: element[7].replace('.', ','), h7: element[8].replace('.', ','), h8: element[9].replace('.', ','), h9: element[10].replace('.', ','), h10: element[11].replace('.', ','),
                    h11: element[12].replace('.', ','), h12: element[13].replace('.', ','), h13: element[14].replace('.', ','), h14: element[15].replace('.', ','), h15: element[16].replace('.', ','), h16: element[17].replace('.', ','),
                    h17: element[18].replace('.', ','), h18: element[19].replace('.', ','), h19: element[20].replace('.', ','), h20: element[21].replace('.', ','), h21: element[22].replace('.', ','),
                    h22: element[23].replace('.', ','), h23: element[24].replace('.', ','), h24: element[25].replace('.', ','), SumQc: element[26].replace('.', ','), n: element[27], Qc: element[28].replace('.', ','),
                    Qm: element[29].replace('.', ','), Tm: element[30], Tq: element[31], Temp: element[32].tempr, Hum: element[32].hum, Spd: element[32].spd, Dir: element[32].dir,
                    Temp1: String(element[32].tempr[0]).replace('.', ','), Temp2: String(element[32].tempr[1]).replace('.', ','), Temp3: String(element[32].tempr[2]).replace('.', ','), Temp4: String(element[32].tempr[3]).replace('.', ','),
                    Temp5: String(element[32].tempr[4]).replace('.', ','), Temp6: String(element[32].tempr[5]).replace('.', ','), Temp7: String(element[32].tempr[6]).replace('.', ','), Temp8: String(element[32].tempr[7]).replace('.', ','),
                    Temp9: String(element[32].tempr[8]).replace('.', ','), Temp10: String(element[32].tempr[9]).replace('.', ','), Temp11: String(element[32].tempr[10]).replace('.', ','), Temp12: String(element[32].tempr[11]).replace('.', ','),
                    Temp13: String(element[32].tempr[12]).replace('.', ','), Temp14: String(element[32].tempr[13]).replace('.', ','), Temp15: String(element[32].tempr[14]).replace('.', ','),
                    Temp16: String(element[32].tempr[15]).replace('.', ','), Temp17: String(element[32].tempr[16]).replace('.', ','), Temp18: String(element[32].tempr[17]).replace('.', ','), Temp19: String(element[32].tempr[18]).replace('.', ','),
                    Temp20: String(element[32].tempr[19]).replace('.', ','), Temp21: String(element[32].tempr[20]).replace('.', ','), Temp22: String(element[32].tempr[21]).replace('.', ','), Temp23: String(element[32].tempr[22]).replace('.', ','),
                    Temp24: String(element[32].tempr[23]).replace('.', ','),
                    Hum1: String(element[32].hum[0]).replace('.', ','), Hum2: String(element[32].hum[1]).replace('.', ','), Hum3: String(element[32].hum[2]).replace('.', ','), Hum4: String(element[32].hum[3]).replace('.', ','),
                    Hum5: String(element[32].hum[4]).replace('.', ','), Hum6: String(element[32].hum[5]).replace('.', ','), Hum7: String(element[32].hum[6]).replace('.', ','), Hum8: String(element[32].hum[7]).replace('.', ','),
                    Hum9: String(element[32].hum[8]).replace('.', ','), Hum10: String(element[32].hum[9]).replace('.', ','), Hum11: String(element[32].hum[10]).replace('.', ','), Hum12: String(element[32].hum[11]).replace('.', ','),
                    Hum13: String(element[32].hum[12]).replace('.', ','), Hum14: String(element[32].hum[13]).replace('.', ','), Hum15: String(element[32].hum[14]).replace('.', ','),
                    Hum16: String(element[32].hum[15]).replace('.', ','), Hum17: String(element[32].hum[16]).replace('.', ','), Hum18: String(element[32].hum[17]).replace('.', ','), Hum19: String(element[32].hum[18]).replace('.', ','),
                    Hum20: String(element[32].hum[19]).replace('.', ','), Hum21: String(element[32].hum[20]).replace('.', ','), Hum22: String(element[32].hum[21]).replace('.', ','), Hum23: String(element[32].hum[22]).replace('.', ','),
                    Hum24: String(element[32].hum[23]).replace('.', ','),
                    Spd1: String(element[32].spd[0]).replace('.', ','), Spd2: String(element[32].spd[1]).replace('.', ','), Spd3: String(element[32].spd[2]).replace('.', ','), Spd4: String(element[32].spd[3]).replace('.', ','),
                    Spd5: String(element[32].spd[4]).replace('.', ','), Spd6: String(element[32].spd[5]).replace('.', ','), Spd7: String(element[32].spd[6]).replace('.', ','), Spd8: String(element[32].spd[7]).replace('.', ','),
                    Spd9: String(element[32].spd[8]).replace('.', ','), Spd10: String(element[32].spd[9]).replace('.', ','), Spd11: String(element[32].spd[10]).replace('.', ','), Spd12: String(element[32].spd[11]).replace('.', ','),
                    Spd13: String(element[32].spd[12]).replace('.', ','), Spd14: String(element[32].spd[13]).replace('.', ','), Spd15: String(element[32].spd[14]).replace('.', ','),
                    Spd16: String(element[32].spd[15]).replace('.', ','), Spd17: String(element[32].spd[16]).replace('.', ','), Spd18: String(element[32].spd[17]).replace('.', ','), Spd19: String(element[32].spd[18]).replace('.', ','),
                    Spd20: String(element[32].spd[19]).replace('.', ','), Spd21: String(element[32].spd[20]).replace('.', ','), Spd22: String(element[32].spd[21]).replace('.', ','), Spd23: String(element[32].spd[22]).replace('.', ','),
                    Spd24: String(element[32].spd[23]).replace('.', ','),
                    Dir1: String(element[32].dir[0]).replace('.', ','), Dir2: String(element[32].dir[1]).replace('.', ','), Dir3: String(element[32].dir[2]).replace('.', ','), Dir4: String(element[32].dir[3]).replace('.', ','),
                    Dir5: String(element[32].dir[4]).replace('.', ','), Dir6: String(element[32].dir[5]).replace('.', ','), Dir7: String(element[32].dir[6]).replace('.', ','), Dir8: String(element[32].dir[7]).replace('.', ','),
                    Dir9: String(element[32].dir[8]).replace('.', ','), Dir10: String(element[32].dir[9]).replace('.', ','), Dir11: String(element[32].dir[10]).replace('.', ','), Dir12: String(element[32].dir[11]).replace('.', ','),
                    Dir13: String(element[32].dir[12]).replace('.', ','), Dir14: String(element[32].dir[13]).replace('.', ','), Dir15: String(element[32].dir[14]).replace('.', ','),
                    Dir16: String(element[32].dir[15]).replace('.', ','), Dir17: String(element[32].dir[16]).replace('.', ','), Dir18: String(element[32].dir[17]).replace('.', ','), Dir19: String(element[32].dir[18]).replace('.', ','),
                    Dir20: String(element[32].dir[19]).replace('.', ','), Dir21: String(element[32].dir[20]).replace('.', ','), Dir22: String(element[32].dir[21]).replace('.', ','), Dir23: String(element[32].dir[22]).replace('.', ','),
                    Dir24: String(element[32].dir[23]).replace('.', ',')
                });


            });
            //}
            //values.push(measure);
            values.push({
                point: point_descr,
                chemical: chemic,
                year: date.format(new Date(period_from), 'YYYY'),
                month: date.format(new Date(period_from), 'MM'), pollution: pollution,
                M_SumQc: String(M_sumQc.toFixed(3)).replace('.', ','), M_n: n_monthly, M_Qc: counter_macs1, Max_Qc: String(QmaxC.toFixed(3)).replace('.', ','), Tmax_Qc: QmaxC_time,
                Sum_Dcc: String(counter_macs1.toFixed(3)).replace('.', ',')
            });

            //  console.log('values ' + values);

            data.push({ station: station_name, values: values });

            let response = {};

            //console.log('time total =', Date.now() - start1);

            response.meteo = tza4_templ_meteo;
            response.tza4 = tza4_templ;
            response.adds = {
                M_SumQc: M_sumQc.toFixed(3), M_n: n_monthly, M_Qc: counter_macs1, Max_Qc: QmaxC.toFixed(3), Tmax_Qc: QmaxC_time,
                Sum_Dcc: counter_macs1.toFixed(3)
            };
            response.data = data;
            resp.json({ response });
        });

    });
});





//begin rendering

router.get('/get_tza4_auto', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    let station_name = data.station_name;
    let place = data.place;
    let lat = data.lat;
    let lon = data.lon;
    let chemic = data.chemic;
    let meteo_add = data.checked_meteo;
    const between_date = [data.period_from, data.period_to];
    //console.log('place = ', place, lat, lon, station_name);
    //var start1 = Date.now();
    loadMeteo(data.station, between_date).then(_result => {

        //let _result_parse0 = JSON.stringify(_result);
        let meteo_all = _result;

        loadData_tza_auto(data.station, between_date, station_name, chemic).then(result => {
            //console.log('time transaction =', Date.now() - start1);

            var result_parse0 = JSON.stringify(result[0]);
            var arr0 = JSON.parse(result_parse0);
            var result_parse1 = JSON.stringify(result[1]);
            var arr1 = JSON.parse(result_parse1);
            var result_parse2 = JSON.stringify(result[2]);
            var arr2 = JSON.parse(result_parse2);

            const template_chemical = ['NO', 'NO2', 'NH3', 'SO2', 'H2S', 'O3', 'CO', 'CH2O', 'PM1', 'PM2.5', 'PM10', 'Пыль общая'];

            var dataList = arr0;
            var sensorsList = arr1;
            var macsList = arr2;
            var avrg_measure = [];
            var data_raw = [];
            var times = 0;
            var time_frame = [];
            var last_day = '';
            var period_from = between_date[0];
            var time_now = 0;
            var Tq_sum = 0; //where Q > MAC moment
            var n_monthly = 0;
            var minute20_frame = [];



            //var macs_one = macsList.filter((item, i, arr) => {
            //      return (item.chemical == chemic);
            // });

            if (new Date().getMonth() != new Date(period_from).getMonth()) {
                last_day = daysInMonth(new Date(period_from).getMonth());
            } else {
                last_day = new Date().getDate();
            }


            for (var ms = 1; ms < last_day + 1; ms++) {

                time_frame.push(date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY'));
                // console.log('date ', date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY'));

            }

            for (var h = 0; h < 24; h++) {
                for (var m = 19; m < 60; m += 20) {

                    minute20_frame.push(h.toString() + ':' + m.toString());
                    // data_raw.push({ 'time': date.format(new Date(new Date(period_from).getFullYear(), new Date(period_from).getMonth(), ms), 'DD-MM-YYYY'), 'minutes_20': i });

                    //i++;
                    //data_raw.push({ 'time': h.toString() + ':' + m.toString() });
                };
            };

            // macsList.forEach((macs_one, _indx) => {


            var sumQc = 0;
            var Qc = 0;
            var counter = 0;
            var Qmax = 0;
            var Qmax_time = '-';
            var QmaxC = 0;
            var QmaxC_time = '-';
            var maxQc = 0;
            var maxQc_time = '-';
            var counter_macs1 = 0;

            var time_in = 0;
            var time_out = 0;
            var temp_day = [];
            var one_day = [];
            var one_day_chem = [];
            var day_now = 0;
            var up_sec = 0;
            var Tq_day = 0;
            var alert_macs = false;
            var n_daily = 0;
            var period_in = 0; //begin of period where Q > MACs
            var M_sumQc = 0;
            var tza4_templ = [];
            var dataDayList = [];
            let meteo_complete = false;
            let tempr_day = [], dir_day = [], spd_day = [], hum_day = [], tza4_templ_meteo = [];
            let range_out_counter = 0;


            //console.log('between ', chemical_one[0]);
            time_frame.forEach((element, indx) => { //step by day

                let dataDayList = dataList.filter((item, i, arr) => {
                    time_now = date.format(new Date(item.date_time), 'DD-MM-YYYY');


                    return (element == time_now);
                });

                const meteo = [];
                let time_from = 0;
                let time_to = 0;

                for (const elem in meteo_all) { // meteo from one day

                    day_now = date.format(new Date(meteo_all[elem].date_time), 'DD-MM-YYYY');

                    if ((day_now == element) && ((meteo_all[elem].typemeasure == 'Направление ветра') ||
                        (meteo_all[elem].typemeasure == 'Скорость ветра') ||
                        (meteo_all[elem].typemeasure == 'Влажность внеш.') || (meteo_all[elem].typemeasure == 'Темп. внешняя'))) {
                        meteo.push(meteo_all[elem]);
                    }


                }


                //temp_day.push('непр.');


                minute20_frame.forEach((minutes_20, _inx) => {//step by 20 minutes in day




                    // console.log(' day ' + element);

                    let time_now = 0;
                    let tmp = minutes_20.split(':');
                    time_from = tmp[0] * 3600 + tmp[1] * 60;
                    const meteo20 = [];

                    let data_minute20 = dataDayList.filter((elem, i, arr) => {


                        time_now = new Date(elem.date_time).getHours() * 3600 +
                            new Date(elem.date_time).getMinutes() * 60 + new Date(elem.date_time).getSeconds();

                        return ((time_from >= time_now) && (time_to <= time_now));
                    });

                    for (const elem in meteo) { // meteo  of 20 minutes 
                        time_now = new Date(meteo[elem].date_time).getHours() * 3600 + new Date(meteo[elem].date_time).getMinutes() * 60 +
                            new Date(meteo[elem].date_time).getSeconds();

                        if ((time_from >= time_now) && (time_to <= time_now)) {
                            meteo20.push(meteo_all[elem]);
                        }
                    }
                    let temp = -1000;
                    let dir = -1000;
                    let spd = -1000;
                    let hum = -1000;
                    //20 minutes frame counters
                    let _temp = -1000.0, _temp_cnt = 0;
                    let _dir = -1000.0, _dir_cnt = 0;
                    let _spd = -1000.0, _spd_cnt = 0;
                    let _hum = -1000.0, _hum_cnt = 0;
                    let weather = [];
                    meteo_complete = false;
                    time_to = time_from + 1;



                    //if (!isEmpty(data_minute20)) {

                    chemic.forEach((_chemic) => {
                        // console.log('cheminc ', _chemic);
                        var chemical_one = sensorsList.filter((item, i, arr) => {
                            return (item.typemeasure == _chemic);
                        });
                        //console.log('chemincal_one', chemical_one);
                        //if weather calculations
                        if (chemical_one.length > 0) {
                            if ((chemical_one[0].measure_class != 'data') || (_chemic == 'CO'))
                                var signs = 1;
                            else
                                var signs = 3;
                        }

                        var macs_one = macsList.filter((item, i, arr) => {
                            return (item.chemical == _chemic);
                        });


                        let data_minute20_one_chemical = data_minute20.filter((elem, i, arr) => {

                            return (elem.typemeasure == _chemic);
                        });

                        if (!isEmpty(data_minute20_one_chemical)) {
                            let local_cnt = 0;
                            let local_sum = 0;    //    console.log('Macs list ', element);
                            range_out_counter = 0;
                            data_minute20_one_chemical.forEach(unit => {

                                local_cnt++;
                                local_sum += unit.measure;
                                if (chemical_one.max_day_consentration < unit.measure)
                                    range_out_counter++;

                                if (!meteo_complete) {
                                    //meteo avrg - one in 20 minutes frame
                                    if (meteo.length > 0) {


                                        meteo20.forEach(_meteo => {
                                            if (_meteo.typemeasure == 'Направление ветра') {
                                                if (_dir_cnt == 0) _dir = 0.0;
                                                _dir += Number(_meteo.measure);
                                                _dir_cnt++;
                                            }
                                            if (_meteo.typemeasure == 'Темп. внешняя') {
                                                if (_temp_cnt == 0) _temp = 0.0;

                                                _temp += Number(_meteo.measure);
                                                _temp_cnt++;
                                            }
                                            if (_meteo.typemeasure == 'Скорость ветра') {
                                                if (_spd_cnt == 0) _spd = 0.0;

                                                _spd += Number(_meteo.measure);
                                                _spd_cnt++;
                                            }
                                            if (_meteo.typemeasure == 'Влажность внеш.') {
                                                if (_hum_cnt == 0) _hum = 0.0;

                                                _hum += Number(_meteo.measure);
                                                _hum_cnt++;
                                            }

                                        })

                                    }

                                }

                            });//end of 20 minutes frame by one chemical

                            if (!meteo_complete) {
                                if (_dir_cnt > 0)
                                    dir = _dir / _dir_cnt;
                                if (_temp_cnt > 0)
                                    temp = _temp / _temp_cnt;
                                if (_spd_cnt > 0)
                                    spd = _spd / _spd_cnt;
                                if (_hum_cnt > 0)
                                    hum = _hum / _hum_cnt;

                                //one_day_chem.push({ weather });
                            }
                            meteo_complete = true;
                            local_sum = local_sum / local_cnt;
                            let class_css = 'alert_success';

                            if (local_sum > (macs_one[0].max_m))
                                class_css = 'alert_macs1_ylw'; //outranged of a macs in 1 time
                            if (local_sum / 5 > (macs_one[0].max_m))
                                class_css = 'alert_macs5_orng'; //outranged of a macs in 5 times
                            if (local_sum / 10 > (macs_one[0].max_m))
                                class_css = 'alert_macs10_red'; //outranged of a macs in  more than 10 times

                            if (local_cnt < 10)
                                class_css = 'alert_empty'

                            if (range_out_counter > 4)
                                class_css = 'alert_range';

                            one_day_chem.push({ [_chemic]: local_sum.toFixed(signs), [_chemic + '_class']: class_css })


                            // console.log('index out', ind, 'raw ', data_raw[ind]);

                            // if ((local_sum ) >= element.max_m) {
                        } else  //    n_daily++;
                        {
                            one_day_chem.push({ [_chemic]: '-' });

                        }

                    });

                    // after all chemical calculation
                    if (dir > -1) {
                        //weather.push({ dir: dir.toFixed(1) });
                        dir = dir.toFixed(1);
                        //dir = -1000;

                    } else {
                        dir = '-';

                    }
                    if (temp > -100) {
                        //weather.push({ tempr: temp.toFixed(1) });
                        temp = temp.toFixed(1);
                        //temp = -1000;

                    } else {
                        temp = '-';
                    }
                    if (spd > -1) {
                        //weather.push({ spd: spd.toFixed(0) });
                        spd = spd.toFixed(0);
                        //spd = -1000;

                    } else {
                        spd = '-';

                    }
                    if (hum > -1) {
                        //weather.push({ hum: hum.toFixed(0) });
                        hum = hum.toFixed(0);
                        //hum = -1000;

                    } else {
                        hum = '-';

                    }
                    //}
                    // } else {
                    //  temp_day[1] = 'нет';
                    //    temp_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');

                    //    tempr_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');
                    //    hum_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');
                    //    dir_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');
                    //   spd_day.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');

                    // };

                    one_day.push({ time: [minutes_20], tempr: temp, dir, spd, hum, ...one_day_chem });
                    one_day_chem = [];
                    //Tq_day = Tq_day.toFixed(0) ; 

                });

                tza4_templ.push({ [indx + 1]: one_day });
                one_day = [];

            });

            //tza4_templ.push([...temp_day]);
            // });
            // M_sumQc, n_monthly, ...M(Qc) ~conter_macs1
            // QmaxC, 
            // QmaxC_time
            //counter_macs1



            // rendering of array for docx template

            var pollution = [];
            var values = [];
            var data = [];
            /*if (!meteo_add) {
                tza4_templ.forEach((element, ind) => {
                    pollution.push({
                        time: element[0], P: element[1], h1: element[2].replace('.', ','), h2: element[3].replace('.', ','), h3: element[4].replace('.', ','), h4: element[5].replace('.', ','),
                        h5: element[6].replace('.', ','), h6: element[7].replace('.', ','), h7: element[8].replace('.', ','), h8: element[9].replace('.', ','), h9: element[10].replace('.', ','), h10: element[11].replace('.', ','),
                        h11: element[12].replace('.', ','), h12: element[13].replace('.', ','), h13: element[14].replace('.', ','), h14: element[15].replace('.', ','), h15: element[16].replace('.', ','), h16: element[17].replace('.', ','),
                        h17: element[18].replace('.', ','), h18: element[19].replace('.', ','), h19: element[20].replace('.', ','), h20: element[21].replace('.', ','), h21: element[22].replace('.', ','),
                        h22: element[23].replace('.', ','), h23: element[24].replace('.', ','), h24: element[25].replace('.', ','), SumQc: element[26].replace('.', ','), n: element[27], Qc: element[28].replace('.', ','),
                        Qm: element[29].replace('.', ','), Tm: element[30], Tq: element[31]
                    });
                })
            } else {*/
            let key = '';

            let response = {};
            tza4_templ.forEach((time, i) => {
                time[i + 1].map((element, j) => {
                    pollution.push({
                        day: i + 1,
                        time: element.time, tempr: String(element.tempr).replace('.', ','), dir: String(element.dir).replace('.', ','), spd: String(element.spd).replace('.', ','), hum: String(element.hum).replace('.', ','),
                        valueNO: String(element[0].NO).replace('.', ','), valueNO2: String(element[1].NO2).replace('.', ','), valueNH3: String(element[2].NH3).replace('.', ','), valueSO2: String(element[3].SO2).replace('.', ','),
                        valueH2S: String(element[4].H2S).replace('.', ','), valueO3: String(element[5].O3).replace('.', ','), valueCO: String(element[6].CO).replace('.', ','), valueCH2O: String(element[7].CH2O).replace('.', ','), valuePM1: String(element[8].PM1).replace('.', ','),
                        valuePM25: String(element[9]['PM2.5']).replace('.', ','), valuePM10: String(element[10].PM10).replace('.', ','), valueTSP: String(element[11]['Пыль общая']).replace('.', ','),
                        valueC6H6: String(element[12]['бензол']).replace('.', ','), valueC7H8: String(element[13]['толуол']).replace('.', ','), valueC8H10: String(element[14]['этилбензол']).replace('.', ','),
                        valueC8H10MP: String(element[15]['м,п-ксилол']).replace('.', ','), valueC8H10O: String(element[16]['о-ксилол']).replace('.', ','), valueC6H5Cl: String(element[17]['хлорбензол']).replace('.', ','),
                        valueC8H8: String(element[18]['стирол']).replace('.', ','), valueC6H5OH: String(element[19]['фенол']).replace('.', ',')
                    });
                });
            });
            values.push({
                place: place,
                lat: lat,
                lon: lon,
                year: date.format(new Date(period_from), 'YYYY'),
                month: date.format(new Date(period_from), 'MM'), pollution: pollution

            });

            //  console.log('values ' + values);


            data.push({ station: station_name, values: values });

            //console.log('time total =', Date.now() - start1);

            response.tza4 = tza4_templ;
            response.data = data;

            resp.json({ response });
        });

    });
});





export default router;





