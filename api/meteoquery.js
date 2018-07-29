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

import User from '../models/user';
import Meteo from '../models/meteo';
import MeteoStations from '../models/meteostations';
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
    // const between_date = ['2018-05-21 00:00:00', '2018-05-21 19:05:00']
    // console.log('sensors ', data.sensors[0]);

    if (isEmpty(data.station)) {
        MeteoStations.query({
            where: ({ is_present: true })
        }).fetchAll().then(stations => {
            resp.json({ stations });
        }).catch(err => resp.status(500).json({ error: err }));
    } else {
        //console.log(data.station);
        //console.log(data.between_date);

        Meteo.query('whereBetween', 'date_time', between_date)
            .query('where', 'station', data.station)
            .orderBy('date_time', 'ASC').fetchAll()
            .then(sensors => { resp.json({ sensors }); })
            .catch(err => resp.status(500).json({ error: err }));
    }
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

export default router;