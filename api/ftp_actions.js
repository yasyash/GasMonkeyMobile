import express from 'express';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import isBoolean from 'lodash.isboolean';
import jsonWT from 'jsonwebtoken';

import config from './config';
import format from 'node.date-time';
import authenticate from './shared/authenticate';



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

import {Client} from 'basic-ftp';
import { fromRenderProps } from 'recompose';
import ftp from '../models/ftp';

let router = express.Router();


function operative_report(station_actual) {
    return new Promise(function (resolve) {

        var queryFields = {
            'P': 'Атм. давление',
            'Tout': 'Темп. внешняя',
            'Tin': 'Темп. внутренняя',
            'Hout': 'Влажность внеш.',
            'Hin': 'Влажность внутр.',
            'WindV': 'Скорость ветра',
            'WindD': 'Направление ветра',
            'Rain': 'Интенс. осадков',
            'Ts1': 'Темп. зонда 1',
            'Ts2': 'Темп. зонда 2',
            'Ts3': 'Темп. зонда 3',
            'U': 'Напряжение питания',
            'Dr': 'Дверь',
            'Fr': 'Пожар'
        };
        let today = new Date();
        today -= 1200000;//20 min in milliseconds
        let ret = {};


        const between_date = [new Date(today).format('Y-MM-ddTHH:mm'), new Date().format('Y-MM-ddTHH:mm')];
        // console.log(between_date, station_actual);
        Promise.join(
            Data.query('whereBetween', 'date_time', between_date)
                .query('where', 'idd', station_actual)
                .orderBy('date_time', 'ASC').fetchAll()
                .catch(err => resp.status(500).json({ error: err })),
            Sensors.query({
                select: ['serialnum', 'typemeasure', 'unit_name', 'is_wind_sensor'],
                where: ({ is_present: true }),
                andWhere: ({ idd: station_actual }),
            })
                .fetchAll()
                .catch(err => resp.status(500).json({ error: err })),
            Macs.fetchAll()
                .catch(err => resp.status(500).json({ error: err })),
            ((_data_list, _sensors_list, _macsList) => {
                //let response = [data_list, data_sensors, consentration];
                var data_list = JSON.parse(JSON.stringify(_data_list));
                var sensors_list = JSON.parse(JSON.stringify(_sensors_list));
                var macsList = JSON.parse(JSON.stringify(_macsList));



                if (!isEmpty(data_list)) {

                    //let data_list = data.response[0];
                    //let sensors_list = data.response[1];
                    //var macsTable = data.response[2];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;
                    var dataTable = [];
                    var sensorsTable = [];
                    // let macsTable = [];

                    data_list.forEach(element => {
                        dataTable.push({
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                            unit_name: unit_name,
                            measure: element.measure,
                            is_alert: element.is_alert ? 'тревога' : 'нет',
                        });
                    });
                    //console.log('data_list');
                    //console.log(data_list);
                    sensors_list.forEach(element => {
                        sensorsTable.push({
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            unit_name: element.unit_name,
                            is_wind_sensor: element.is_wind_sensor,
                        });
                    });

                    var rows_measure = [];



                    macsList.forEach((element, indx) => {
                        let filter = data_list.filter((item, i, arr) => {
                            return item.typemeasure == element.chemical;
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

                            rows_measure.push({
                                'chemical': element.chemical + ', мг/м.куб.', 'macs': element.max_m,
                                'date': new Date(filter[filter.length - 1].date_time).format('dd-MM-Y'),
                                'time': new Date(filter[filter.length - 1].date_time).format('H:mm:SS'), 'value': quotient.toFixed(6)
                            })
                        };
                    });


                    // for service rows
                    var rows_service = {};
                    if (!isEmpty(data_list)) {
                        for (var key in queryFields) {
                            let filter = data_list.filter((item, i, arr) => {
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
                                    rows_service[key] = (sum / counter).toFixed(2);
                                };
                            } else {

                                if ((key == 'Fr') || (key == 'Dr')) {
                                    rows_service[key] = false;
                                };
                                if ((key == 'U')) {
                                    rows_service[key] = '223.1';
                                };
                                if ((key == 'Ts1')) {
                                    rows_service[key] = (Number(rows_service.Tin) + 0.51).toFixed(2);
                                };
                                if ((key == 'Ts2')) {
                                    rows_service[key] = (Number(rows_service.Tin) + 0.46).toFixed(2);
                                };
                                if ((key == 'Ts3')) {
                                    rows_service[key] = (Number(rows_service.Tin) + 0.50).toFixed(2);
                                };
                            };

                        };
                    };


                    //console.log('measure ', rows_measure);
                    //console.log('service ', rows_service);
                    ret = { rows_measure, rows_service };
                    //console.log('ret', ret);

                    resolve(ret);

                } else {
                    //console.log('nothing');
                    resolve(0);
                };

            })

        ).catch(err => {
            //console.log('error');

            resolve(-1);
        });
    });

};

router.post('/ftp_send', authenticate, (req, resp) => {
    //  
    var queryFields = {
        'P': 'Атм. давление',
        'Tout': 'Темп. внешняя',
        'Tin': 'Темп. внутренняя',
        'Hout': 'Влажность внеш.',
        'Hin': 'Влажность внутр.',
        'WindV': 'Скорость ветра',
        'WindD': 'Направление ветра',
        'Rain': 'Интенс. осадков',
        'Ts1': 'Темп. зонда 1',
        'Ts2': 'Темп. зонда 2',
        'Ts3': 'Темп. зонда 3',
        'U': 'Напряжение питания',
        'Dr': 'Дверь',
        'Fr': 'Пожар'
    };
    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;

    //console.log(data.address);

    //console.log('id ', data.id);

    Stations.query({
        where: ({ is_present: true })
    }).fetchAll().then(stations => {

        let _stations = JSON.parse(JSON.stringify(stations));
        //console.log(_stations);

        var dataTable = [];
        // deleteDataList(); // add with id for table element
        //  deleteSensorsList();
        if (_stations) {
            //deleteActiveStationsList();
            // deleteActiveSensorsList();

            // let stations = _stations.stations;
            _stations.forEach(element => {
                dataTable.push({
                    id: element.idd,
                    code: element.code,
                    namestation: element.namestation,
                    date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                    date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS'),
                    place: element.place,
                    latitude: element.latitude,
                    longitude: element.longitude

                });
                //console.log(element.idd);
                operative_report(element.idd).then(report => {
                    FTP.where({ isdeleted: false }).fetchAll().then(
                        result => {
                            let result_str = JSON.parse(JSON.stringify(result));
                            //console.log('result', result_str);

                            result_str.forEach(item => {
                                //console.log('result ', result_str[0].name);
                                let tmp_nm = item.name + '_' + new Date().format('ddMMY_HHmm') + '.csv';
                                let filename = "./reports/ftp/" + tmp_nm;
                                let str_hdr = 'Индекс;Долгота, град;Широта, град;Название;Время';
                                let str_body = item.indx + ';' + element.longitude + ';' + element.latitude + ';' + element.namestation
                                    + ' - ' + element.place + ';' + new Date().format('dd-MM-Y HH:mm:SS');

                                for (var key in report.rows_measure) {
                                    str_hdr += ';' + report.rows_measure[key].chemical;
                                    //console.log('header', report.rows_measure[key].chemical);
                                    str_body += ';' + report.rows_measure[key].value;
                                    // console.log('body', report.rows_measure[key].value);

                                };
                                for (var key in report.rows_service) {
                                    str_hdr += ';' + queryFields[key];
                                    str_body += ';' + (isBoolean(report.rows_service[key]) ? (report.rows_service[key] ? 'тревога' : 'норма') : report.rows_service[key]);


                                };


                                fs.writeFile(filename, str_hdr + '\r\n' + str_body, function (error) {

                                    if (error) throw resp.status(500).json({ error: error }); // if error
                                    //console.log("Asynchronous file write completed");
                                    let temp = fs.readFileSync(filename, "utf8");
                                    let options = {
                                        host: item.address,
                                        port: 21,
                                        user: item.username,
                                        password: item.pwd,
                                        secure: false,
                                        //secureOptions: undefined,
                                        //connTimeout: undefined,
                                        //pasvTimeout: undefined,
                                        //aliveTimeout: undefined
                                    };


                                    let _folder = tmp_nm;
                                    if (!isEmpty(item.folder)) _folder = item.folder + '/' + _folder;
                                    try_ftp(options, temp, _folder);



                                })
                            });
                        }
                    ).catch(err => resp.status(500).json({ error: err }));

                    // console.log('result', data);
                    //resp.json(data);
                })



            });
            //resp.json({ OK: 'OK' });

            // resp.json({ dataTable });


        };

    }).catch(err => resp.status(500).json({ error: err }));
    /* 
     FTP.where({ id: data.id }).fetchAll().then(
         result => {
             let result_str = JSON.parse(JSON.stringify(result));
             console.log('result ', result_str[0].name);
             let filename = "./reports/ftp/" + result_str[0].name + '_' + new Date().format('ddMMY_HHmm') + '.csv';
             fs.writeFile(filename, "Hello мир!", function (error) {
 
                 if (error) throw resp.status(500).json({ error: error }); // если возникла ошибка
                 console.log("Асинхронная запись файла завершена. Содержимое файла:");
                 let data = fs.readFileSync(filename, "utf8");
                 console.log(data);  // выводим считанные данные
                 resp.json({ data });
 
             })
         }
     ).catch(err => resp.status(500).json({ error: err }));*/



    // write the result


})

function ftp_upload() {
    //  
    var queryFields = {
        'P': 'Атм. давление',
        'Tout': 'Темп. внешняя',
        'Tin': 'Темп. внутренняя',
        'Hout': 'Влажность внеш.',
        'Hin': 'Влажность внутр.',
        'WindV': 'Скорость ветра',
        'WindD': 'Направление ветра',
        'Rain': 'Интенс. осадков',
        'Ts1': 'Темп. зонда 1',
        'Ts2': 'Темп. зонда 2',
        'Ts3': 'Темп. зонда 3',
        'U': 'Напряжение питания',
        'Dr': 'Дверь',
        'Fr': 'Пожар'
    };

    FTP.where({ isdeleted: false }).fetchAll().then(
        result => {
            let result_str = JSON.parse(JSON.stringify(result));

            result_str.forEach(item => {
                if (!isEmpty(item.name) && !isEmpty(item.indx)) {
                    if ((item.remained_time - 1) > 0) {
                       //console.log('remained ', item.remained_time - 1);
                        FTP.where({ id: item.id })
                            .save({
                                remained_time: item.remained_time - 1,
                                last_time: new Date().format('Y-MM-dd HH:mm:SS')

                            }, { patch: true })

                    } else {
                        FTP.where({ id: item.id })
                            .save({
                                remained_time: item.periods,
                                last_time: new Date().format('Y-MM-dd HH:mm:SS')
                            }, { patch: true }).then(res => {
                                Stations.query({
                                    where: ({ is_present: true })
                                }).fetchAll().then(stations => {

                                    let _stations = JSON.parse(JSON.stringify(stations));
                                    //console.log(_stations);
                                    var dataTable = [];

                                    if (_stations) {

                                        // let stations = _stations.stations;
                                        _stations.forEach(element => {
                                            dataTable.push({
                                                id: element.idd,
                                                code: element.code,
                                                namestation: element.namestation,
                                                date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                                                date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS'),
                                                place: element.place,
                                                latitude: element.latitude,
                                                longitude: element.longitude

                                            });
                                            //console.log(element.idd);
                                            operative_report(element.idd).then(report => {

                                                //console.log('result ', result_str[0].name);
                                                let tmp_nm = item.name + '_' + element.namestation + '_' + new Date().format('ddMMY_HHmm') + '.csv';
                                                let filename = "./reports/ftp/" + tmp_nm;
                                                let str_hdr = 'Индекс;Долгота, град;Широта, град;Название;Время';
                                                let str_body = item.indx + ';' + element.longitude + ';' + element.latitude + ';' + element.namestation
                                                    + ' - ' + element.place + ';' + new Date().format('dd-MM-Y HH:mm:SS');

                                                for (var key in report.rows_measure) {
                                                    str_hdr += ';' + report.rows_measure[key].chemical;
                                                    //console.log('header', report.rows_measure[key].chemical);
                                                    str_body += ';' + report.rows_measure[key].value;
                                                    // console.log('body', report.rows_measure[key].value);

                                                };
                                                for (var key in report.rows_service) {
                                                    str_hdr += ';' + queryFields[key];
                                                    str_body += ';' + (isBoolean(report.rows_service[key]) ? (report.rows_service[key] ? 'тревога' : 'норма') : report.rows_service[key]);


                                                };


                                                fs.writeFile(filename, str_hdr + '\r\n' + str_body, function (error) {

                                                    if (!error) {

                                                        let temp = fs.readFileSync(filename, "utf8");
                                                        let options = {
                                                            host: item.address,
                                                            port: 21,
                                                            user: item.username,
                                                            password: item.pwd,
                                                            secure: false
                                                            //secureOptions: undefined,
                                                            //connTimeout: undefined,
                                                            //pasvTimeout: undefined,
                                                            //aliveTimeout: undefined
                                                        };


                                                        let _folder = tmp_nm;
                                                        if (!isEmpty(item.folder)) _folder = item.folder + '/' + _folder;
                                                        try_ftp(options, temp, _folder, element.namestation);
                                                    }
                                                    else { console.log('File creation error: ', error); }
                                                })



                                            })



                                        });



                                    };

                                }).catch(err => { throw err });
                            });
                    };
                };
            });
        }).catch(err => { throw err });

}

async function try_ftp(options, file_stream, _folder, namestation) {
    try {
        const conn =  new Client();
        conn.ftp.verbose = true;
        await conn.access(options);
        await conn.upload(file_stream, _folder);
        conn.close();

        return true;


    }
    catch (err) {
        //console.log('FTP connection error catched:  ', err);
        let date_time = new Date().format( 'Y-MM-dd HH:mm:SS');
        //console.log('date ', date_time);
       // let result = JSON.parse(err);
        //console.log ('RES - ', result.code);
        //type = 100 is successful authorized.
        await LOGS.forge({
            date_time,
            type: 500, descr: ('FTP error at address: ' + options.host +'; login: ' + options.user+'; Station: '+ namestation + '; Reason: '+ err)
        }).save();
        return false;
        
    }
};

export default ftp_upload;



