import Axios from "axios";
import format from 'node.date-time';
import { addDataList, deleteDataList } from './dataAddActions';
import { addSensorsList, deleteSensorsList, addActiveSensorsList, deleteActiveSensorsList } from './sensorsAddAction';
import { addMeteoList, deleteMeteoList } from './meteoAddAction';
import { addActiveStationsList, deleteActiveStationsList, getFirstActiveStationsList } from './stationsAddAction';
import { addConsentrationList } from './consentrationAddAction';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import moment from 'moment';

function wrapData(data_in) {
    const data = data_in.map(item => {
        const _id = shortid.generate();


        Object.assign(item, { _id: _id });
        return item;
    });
    return data;
}

export function queryEvent(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/query/', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                const dataTable = [];
                // deleteDataList(); // add with id for table element
                //  deleteSensorsList();
                if (data.stations) {
                    //deleteActiveStationsList();
                    // deleteActiveSensorsList();

                    let stations = data.stations;
                    stations.forEach(element => {
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
                    });
                    return wrapData(dataTable);
                };

                if (data.sensors) {
                    deleteActiveSensorsList();
                    getFirstActiveStationsList();
                    let sensors = data.sensors;
                    sensors.forEach(element => {
                        dataTable.push({
                            id: element.idd,
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                            date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS'),
                            average_period: element.average_period,
                            unit_name: element.unit_name,
                            measure_class: element.measure_class,
                            is_wind_sensor: element.is_wind_sensor,
                            max_consentration: element.max_consentration,
                            max_day_consentration: element.max_day_consentration,
                            def_colour: element.def_colour

                        });
                    });
                    //addActiveStationsList(paramstr.station);
                    let wrappedDataTable = wrapData(dataTable);
                    addActiveSensorsList(wrappedDataTable);
                    return wrappedDataTable;
                };
                if (data.response) {
                    let data_list = data.response[0];
                    let sensors_list = data.response[1];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;

                    if (sensors_list.length == 1) {
                        var _data = [];
                        var _tmp = 0;
                        var counter = 0;
                        var units = 0;
                        var first_date = data_list[0].date_time;
                        var last_date = data_list[data_list.length - 1].date_time;
                        var first_hour = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                        var first_minute = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                        var work_date = moment(first_date);

                        var _i = 0;
                        var _j = 0;
                        while (work_date.isBefore(last_date)) { //averaging data
                            _tmp = 0;
                            counter = 0;
                            work_date.add(paramstr.averaging, 'minutes');
                            for (_j = _i; ((_j < data_list.length) && (!work_date.isBefore(data_list[_j].date_time))); _j++) {

                                _tmp += data_list[_j].measure;
                                counter++;

                            }

                            if (counter) {
                                data_list[_i].measure = _tmp / counter;
                                data_list[_i].date_time = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                _data.push(data_list[_i]);
                            }
                            _i = _j;
                            first_date = new Date(work_date).format('Y-MM-dd HH:mm:SS');

                        }

                        _data.forEach(element => {
                            let filter = sensors_list.filter((item, i, arr) => {
                                return item.serialnum == element.serialnum;
                            });
                            //console.log('element  ', element);



                            if (!isEmpty(filter[0])) { unit_name = filter[0].unit_name }
                            dataTable.push({
                                id: element.idd,
                                typemeasure: element.typemeasure,
                                serialnum: element.serialnum,
                                date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                                unit_name: unit_name,
                                measure: element.measure.toFixed(3),
                                is_alert: element.is_alert ? 'тревога' : 'нет',
                            });

                        });
                    }

                    else {
                        let size_arr = sensors_list.length + 1;//datetime, sensor1, ..., sensorN
                        let obj = { date_time: 'Время наблюдения' };
                        //tmp_arr.push({});//table header - first element
                        sensors_list.forEach(_id => {
                            obj[_id.serialnum] = _id.typemeasure + ' (' + _id.unit_name + ')';
                        });

                        dataTable.push(obj); //insert first element
                        var units = 0;
                        var _data = [];

                        sensors_list.forEach(_id => {

                            var _data_list_filter = data_list.filter((item, i, arr) => {
                                return item.serialnum == _id.serialnum;
                            });

                            var _tmp = 0;
                            var counter = 0;
                            var first_date = data_list[0].date_time;
                            var last_date = data_list[data_list.length - 1].date_time;
                            var work_date = moment(first_date);


                            var _i = 0;
                            var _j = 0;
                            while (work_date.isBefore(last_date)) { //averaging data
                                _tmp = 0;
                                counter = 0;
                                work_date.add(paramstr.averaging, 'minutes');
                                for (_j = _i; ((_j < _data_list_filter.length) && (!work_date.isBefore(_data_list_filter[_j].date_time))); _j++) {

                                    _tmp += _data_list_filter[_j].measure;
                                    counter++;

                                }

                                if (counter) {
                                    _data_list_filter[_i].measure = _tmp / counter;
                                    if (units) {
                                        let _find_date = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                        _data.filter((__item, __i, __arr) => {
                                            if (__item.date_time == _find_date) {
                                                let obj = {};
                                                //obj[_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure;
                                                _data[__i][_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure.toFixed(3);
                                            }
                                        });
                                    } else {
                                        let obj = {};
                                        obj['date_time'] = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                        obj[_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure.toFixed(3);
                                        _data.push(obj);
                                    };
                                }
                                _i = _j;
                                first_date = new Date(work_date).format('Y-MM-dd HH:mm:SS');

                            }

                            units++;

                        });
                        _data.forEach(_element => {
                            dataTable.push(_element); //add all elements
                        });

                    };

                    // Max allowable consentration

                    let consentration = data.response[2];

                    addConsentrationList(wrapData(consentration));
                    /*macs.forEach(element => {
                        dataTable.push({
                            chemical: element.chemical,
                            max_m: element.max_m,
                            max_n: element.max_n
                        });
                    });*/

                    addDataList(wrapData(dataTable)); // add with id for table element
                    addSensorsList(wrapData(sensors_list));

                    return dataTable;
                };

                return dataTable;

            });
    }
};
export function queryManyEvent(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/query/many', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                const dataTable = [];
                // deleteDataList(); // add with id for table element
                //  deleteSensorsList();
                if (data.stations) {
                    //deleteActiveStationsList();
                    // deleteActiveSensorsList();

                    let stations = data.stations;
                    stations.forEach(element => {
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
                    });
                    return wrapData(dataTable);
                };

                if (data.sensors) {
                    deleteActiveSensorsList();
                    getFirstActiveStationsList();
                    let sensors = data.sensors;
                    sensors.forEach(element => {
                        dataTable.push({
                            id: element.idd,
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                            date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS'),
                            average_period: element.average_period,
                            unit_name: element.unit_name,
                            measure_class: element.measure_class,
                            is_wind_sensor: element.is_wind_sensor,
                            max_consentration: element.max_consentration,
                            max_day_consentration: element.max_day_consentration,
                            def_colour: element.def_colour

                        });
                    });
                    //addActiveStationsList(paramstr.station);
                    let wrappedDataTable = wrapData(dataTable);
                    addActiveSensorsList(wrappedDataTable);
                    return wrappedDataTable;
                };
                if (data.response) {
                    let data_list = data.response[0];
                    let sensors_list = data.response[1];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;

                    if (sensors_list.length == 1) {
                        if (data_list.length > 0) {
                            var _data = [];
                            var _tmp = 0;
                            var counter = 0;
                            var units = 0;
                            var first_date = data_list[0].date_time;
                            var last_date = data_list[data_list.length - 1].date_time;
                            var first_hour = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                            var first_minute = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                            var work_date = moment(first_date);

                            var _i = 0;
                            var _j = 0;
                            while (work_date.isBefore(last_date)) { //averaging data
                                _tmp = 0;
                                counter = 0;
                                work_date.add(paramstr.averaging, 'minutes');
                                for (_j = _i; ((_j < data_list.length) && (!work_date.isBefore(data_list[_j].date_time))); _j++) {

                                    _tmp += data_list[_j].measure;
                                    counter++;

                                }

                                if (counter) {
                                    data_list[_i].measure = _tmp / counter;
                                    data_list[_i].date_time = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                    _data.push(data_list[_i]);
                                }
                                _i = _j;
                                first_date = new Date(work_date).format('Y-MM-dd HH:mm:SS');

                            }

                            _data.forEach(element => {
                                let filter = sensors_list.filter((item, i, arr) => {
                                    return item.serialnum == element.serialnum;
                                });
                                //console.log('element  ', element);



                                if (!isEmpty(filter[0])) { unit_name = filter[0].unit_name }
                                dataTable.push({
                                    id: element.idd,
                                    typemeasure: element.typemeasure,
                                    serialnum: element.serialnum,
                                    date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                                    unit_name: unit_name,
                                    measure: element.measure.toFixed(3),
                                    is_alert: element.is_alert ? 'тревога' : 'нет',
                                });

                            });
                        }
                    }
                    else {
                        let size_arr = sensors_list.length + 1;//datetime, sensor1, ..., sensorN
                        let obj = { date_time: 'Время наблюдения' };
                        //tmp_arr.push({});//table header - first element
                        sensors_list.forEach(_id => {
                            obj[_id.serialnum] = _id.typemeasure + ' (' + _id.unit_name + ')';
                        });

                        dataTable.push(obj); //insert first element
                        var units = 0;
                        var _data = [];

                        sensors_list.forEach(_id => {

                            var _data_list_filter = data_list.filter((item, i, arr) => {
                                return item.serialnum == _id.serialnum;
                            });

                            var _tmp = 0;
                            var counter = 0;
                            var first_date = data_list[0].date_time;
                            var last_date = data_list[data_list.length - 1].date_time;
                            var work_date = moment(first_date);


                            var _i = 0;
                            var _j = 0;
                            while (work_date.isBefore(last_date)) { //averaging data
                                _tmp = 0;
                                counter = 0;
                                work_date.add(paramstr.averaging, 'minutes');
                                for (_j = _i; ((_j < _data_list_filter.length) && (!work_date.isBefore(_data_list_filter[_j].date_time))); _j++) {

                                    _tmp += _data_list_filter[_j].measure;
                                    counter++;

                                }

                                if (counter) {
                                    _data_list_filter[_i].measure = _tmp / counter;
                                    if (units) {
                                        let _find_date = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                        _data.filter((__item, __i, __arr) => {
                                            if (__item.date_time == _find_date) {
                                                let obj = {};
                                                //obj[_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure;
                                                _data[__i][_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure.toFixed(3);
                                            }
                                        });
                                    } else {
                                        let obj = {};
                                        obj['date_time'] = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                        obj[_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure.toFixed(3);
                                        _data.push(obj);
                                    };
                                }
                                _i = _j;
                                first_date = new Date(work_date).format('Y-MM-dd HH:mm:SS');

                            }

                            units++;

                        });
                        _data.forEach(_element => {
                            dataTable.push(_element); //add all elements
                        });

                    };

                    // Max allowable consentration

                    let consentration = data.response[2];

                    addConsentrationList(wrapData(consentration));
                    /*macs.forEach(element => {
                        dataTable.push({
                            chemical: element.chemical,
                            max_m: element.max_m,
                            max_n: element.max_n
                        });
                    });*/

                    addDataList(wrapData(dataTable)); // add with id for table element
                    addSensorsList(wrapData(sensors_list));

                    return dataTable;
                };

                return dataTable;

            });
    }
};
export function queryMeteoEvent(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/meteoquery/', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                const dataTable = [];
                if (data.stations) {
                    let stations = data.stations;
                    stations.forEach(element => {
                        dataTable.push({
                            id: element.idd,
                            namestation: element.namestation,
                            updateperiod: element.updateperiod,
                            date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                            date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS')
                        });
                    });
                    return wrapData(dataTable);
                };

                if (data.sensors) {
                    deleteMeteoList(); // add with id for table element

                    let sensors = data.sensors;
                    sensors.forEach(element => {
                        dataTable.push({
                            id: element.station,
                            date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                            temp_out: element.temp_out,
                            temp_hi: element.temp_hi,
                            temp_low: element.temp_low,
                            hum_out: element.hum_out,
                            dew_pt: element.dew_pt,
                            speed_wind: element.speed_wind,
                            dir_wind: element.dir_wind,
                            run_wind: element.run_wind,
                            speed_wind_hi: element.speed_wind_hi,
                            dir_wind_hi: element.dir_wind_hi,
                            chill_wind: element.chill_wind,
                            heat_indx: element.heat_indx,
                            thw_indx: element.thw_indx,
                            thsw_indx: element.thsw_indx,
                            bar: element.bar,
                            rain: element.rain,
                            rain_rate: element.rain_rate,
                            rad_solar: element.rad_solar,
                            enrg_solar: element.enrg_solar,
                            rad_solar_hi: element.rad_solar_hi,
                            uv_indx: element.uv_indx,
                            uv_dose: element.uv_dose,
                            uv_hi: element.uv_hi,
                            heat_dd: element.heat_dd,
                            coll_dd: element.coll_dd,
                            temp_in: element.temp_in,
                            hum_in: element.hum_in,
                            dew_in: element.dew_in,
                            heat_in: element.heat_in,
                            emc_in: element.emc_in,
                            density_air_in: element.density_air_in,
                            et: element.et,
                            samp_wind: element.samp_wind,
                            tx_wind: element.station,
                            recept_iss: element.recept_iss,
                            int_arc: element.int_arc

                        });
                    });
                    // setMeteoStation('123-321');
                    addMeteoList(wrapData(dataTable)); // add with id for table element

                    return dataTable;
                };



                return dataTable;

            });
    }
};

export function queryOperativeEvent(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/operative_query/', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                if (data.response) {
                    let data_list = data.response[0];
                    let sensors_list = data.response[1];
                    var macsTable = data.response[2];
                    var meteo = data.response[3];

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

                    sensors_list.forEach(element => {
                        sensorsTable.push({
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            unit_name: element.unit_name,
                            is_wind_sensor: element.is_wind_sensor,
                        });
                    });




                }
                return { dataTable, sensorsTable, macsTable, meteo };
            });




    };
};

export function queryAllDataOperativeEvent(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/operative_query/all', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                if (data.response) {
                    let data_list = data.response[0];
                    let sensors_list = data.response[1];
                    var macsTable = data.response[2];
                    let _logs_list = data.response[3];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;
                    var dataTable = [],
                        sensorsTable = [],
                        alertsTable = [],
                        systemTable = [],
                        last = '';
                    // let macsTable = [];

                    data_list.forEach(element => {
                        dataTable.push({
                            id: element.idd,
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                            unit_name: unit_name,
                            measure: element.measure,
                            is_alert: element.is_alert
                        });
                    });

                    sensors_list.forEach(element => {
                        sensorsTable.push({
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            unit_name: element.unit_name,
                            is_wind_sensor: element.is_wind_sensor,
                        });
                    });
                    var iterator = [0, 100, 101, 102, 110, 111, 112, 113, 114, 115, 120, 200, 404, 500]; //all type error

                    iterator.forEach((i, _ind) => {

                        let logs_list = _logs_list.filter((item, _i, arr) => {
                            return item.type == i;
                        });

                        logs_list.forEach((element, indx) => {
                            if ((Number(element.type) >= 100) && (Number(element.type) <= 115)) {
                                alertsTable.push({
                                    date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                                    type: element.type,
                                    descr: element.descr,
                                    id: element.idd
                                });
                            }

                            if (Number(element.type) == 0) {
                                if (indx != logs_list.length - 1) {
                                    if (last != element.descr)
                                        systemTable.push({
                                            date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                            type: element.type,
                                            descr: element.descr,
                                            is_visible: true

                                        });
                                } else {
                                    systemTable.push({
                                        date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                        type: element.type,
                                        descr: element.descr,
                                        is_visible: true
                                    });
                                }

                            }
                            if (Number(element.type) == 200) {
                                systemTable.push({
                                    date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                    type: element.type,
                                    descr: element.descr,
                                    is_visible: true

                                });
                            }

                            if ((Number(element.type) == 500) || ((Number(element.type) == 404))) {
                                if (indx != logs_list.length - 1) {
                                    if (last != element.descr)
                                        systemTable.push({
                                            date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                            type: element.type,
                                            descr: element.descr,
                                            is_visible: true

                                        });

                                } else {
                                    systemTable.push({
                                        date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                        type: element.type,
                                        descr: element.descr,
                                        is_visible: true
                                    });
                                }

                            }

                            last = element.descr;
                        });
                    });


                }
                return { dataTable, sensorsTable, macsTable, alertsTable, systemTable };


            });




    };
};

export function queryByTypeEvent(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/query/by_type', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                const dataTable = [];

                // deleteDataList(); // add with id for table element
                //  deleteSensorsList();

                if (data.response) {
                    let data_list = data.response[0];
                    let sensors_list = data.response[1];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;

                    if (sensors_list.length == 1) {

                        data_list.forEach(element => {
                            let filter = sensors_list.filter((item, i, arr) => {
                                return item.serialnum == element.serialnum;
                            });
                            if (!isEmpty(filter[0])) { unit_name = filter[0].unit_name }
                            dataTable.push({
                                id: element.idd,
                                typemeasure: element.typemeasure,
                                serialnum: element.serialnum,
                                date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                                unit_name: unit_name,
                                measure: element.measure,
                                is_alert: element.is_alert ? 'тревога' : 'нет',
                            });

                        });
                    }

                    else {
                        let size_arr = sensors_list.length + 1;//datetime, sensor1, ..., sensorN
                        let obj = { date_time: 'Время наблюдения' };
                        //tmp_arr.push({});//table header - first element
                        sensors_list.forEach(_id => {
                            obj[_id.serialnum] = _id.typemeasure + ' (' + _id.unit_name + ')';
                        });

                        dataTable.push(obj); //insert first element


                        let tmp_arr = data_list;

                        while (tmp_arr.length > 0) {
                            let obj = {};
                            let one = tmp_arr[0];
                            let nex_arr = [];

                            tmp_arr.forEach(element => {

                                if (element.date_time !== one.date_time) {
                                    nex_arr.push(element);
                                }
                                else {
                                    obj['date_time'] = new Date(element.date_time).format('Y-MM-dd HH:mm:SS');
                                    obj[element.serialnum] = element.measure;
                                }




                            });
                            tmp_arr = nex_arr;
                            dataTable.push(obj);
                        }

                    };

                    // Max allowable consentration for all gaz sensors

                    let consentration = data.response[2];

                    addConsentrationList(wrapData(consentration));
                    addDataList(wrapData(dataTable)); // add with id for table element
                    addSensorsList(wrapData(sensors_list));
                    addActiveSensorsList(sensors_list);
                    return dataTable;
                };

                return dataTable;

            });
    }
};

export function queryFullEvent(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/query/', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                const dataTable = [];
                // deleteDataList(); // add with id for table element
                //  deleteSensorsList();
                if (data.stations) {
                    //deleteActiveStationsList();
                    // deleteActiveSensorsList();

                    let stations = data.stations;
                    stations.forEach(element => {
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
                    });
                    return wrapData(dataTable);
                };

                if (data.sensors) {
                    deleteActiveSensorsList();
                    getFirstActiveStationsList();
                    let sensors = data.sensors;
                    sensors.forEach(element => {
                        dataTable.push({
                            id: element.idd,
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                            date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS'),
                            average_period: element.average_period,
                            unit_name: element.unit_name,
                            measure_class: element.measure_class,
                            is_wind_sensor: element.is_wind_sensor,
                            max_consentration: element.max_consentration,
                            max_day_consentration: element.max_day_consentration,
                            def_colour: element.def_colour

                        });
                    });
                    //addActiveStationsList(paramstr.station);
                    let wrappedDataTable = wrapData(dataTable);
                    addActiveSensorsList(wrappedDataTable);
                    return wrappedDataTable;
                };
                if (data.response) {
                    let data_list = data.response[0];
                    let sensors_list = data.response[1];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;
                    if (data_list.length > 0) {
                        if (sensors_list.length == 1) {
                            var _data = [];
                            var _tmp = 0;
                            var counter = 0;
                            var units = 0;
                            var first_date = data_list[0].date_time;
                            var last_date = data_list[data_list.length - 1].date_time;
                            var first_hour = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                            var first_minute = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                            var work_date = moment(first_date);

                            var _i = 0;
                            var _j = 0;
                            while (work_date.isBefore(last_date)) { //averaging data
                                _tmp = 0;
                                counter = 0;
                                work_date.add(paramstr.averaging, 'minutes');
                                for (_j = _i; ((_j < data_list.length) && (!work_date.isBefore(data_list[_j].date_time))); _j++) {

                                    _tmp += data_list[_j].measure;
                                    counter++;

                                }

                                if (counter) {
                                    data_list[_i].measure = _tmp / counter;
                                    data_list[_i].date_time = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                    _data.push(data_list[_i]);
                                }
                                _i = _j;
                                first_date = new Date(work_date).format('Y-MM-dd HH:mm:SS');

                            }

                            _data.forEach(element => {
                                let filter = sensors_list.filter((item, i, arr) => {
                                    return item.serialnum == element.serialnum;
                                });
                                //console.log('element  ', element);



                                if (!isEmpty(filter[0])) { unit_name = filter[0].unit_name }
                                dataTable.push({
                                    id: element.idd,
                                    typemeasure: element.typemeasure,
                                    serialnum: element.serialnum,
                                    date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                                    unit_name: unit_name,
                                    measure: element.measure.toFixed(3),
                                    is_alert: element.is_alert ? 'тревога' : 'нет',
                                });

                            });
                        }

                        else {
                            let size_arr = sensors_list.length + 1;//datetime, sensor1, ..., sensorN
                            let obj = { date_time: 'Время наблюдения' };
                            //tmp_arr.push({});//table header - first element
                            sensors_list.forEach(_id => {
                                obj[_id.serialnum] = _id.typemeasure + ' (' + _id.unit_name + ')';
                            });

                            dataTable.push(obj); //insert first element
                            var units = 0;
                            var _data = [];

                            sensors_list.forEach(_id => {

                                var _data_list_filter = data_list.filter((item, i, arr) => {
                                    return item.serialnum == _id.serialnum;
                                });

                                var _tmp = 0;
                                var counter = 0;
                                var first_date = data_list[0].date_time;
                                var last_date = data_list[data_list.length - 1].date_time;
                                var work_date = moment(first_date);


                                var _i = 0;
                                var _j = 0;
                                while (work_date.isBefore(last_date)) { //averaging data
                                    _tmp = 0;
                                    counter = 0;
                                    work_date.add(paramstr.averaging, 'minutes');
                                    for (_j = _i; ((_j < _data_list_filter.length) && (!work_date.isBefore(_data_list_filter[_j].date_time))); _j++) {

                                        _tmp += _data_list_filter[_j].measure;
                                        counter++;

                                    }

                                    if (counter) {
                                        _data_list_filter[_i].measure = _tmp / counter;
                                        if (units) {
                                            let _find_date = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                            _data.filter((__item, __i, __arr) => {
                                                if (__item.date_time == _find_date) {
                                                    let obj = {};
                                                    //obj[_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure;
                                                    _data[__i][_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure.toFixed(3);
                                                }
                                            });
                                        } else {
                                            let obj = {};
                                            obj['date_time'] = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                            obj[_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure.toFixed(3);
                                            _data.push(obj);
                                        };
                                    }
                                    _i = _j;
                                    first_date = new Date(work_date).format('Y-MM-dd HH:mm:SS');

                                }

                                units++;

                            });
                            _data.forEach(_element => {
                                dataTable.push(_element); //add all elements
                            });

                        };
                    }
                    // Max allowable consentration

                    let consentration = data.response[2];

                    addConsentrationList(wrapData(consentration));
                    /*macs.forEach(element => {
                        dataTable.push({
                            chemical: element.chemical,
                            max_m: element.max_m,
                            max_n: element.max_n
                        });
                    });*/

                    addDataList(wrapData(dataTable)); // add with id for table element
                    addSensorsList(wrapData(sensors_list));

                    return dataTable;
                };

                return dataTable;

            });
    }
};

export function queryLocalEvent(paramstr) {//reducers will not taken
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/query/', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                const dataTable = [];
                // deleteDataList(); // add with id for table element
                //  deleteSensorsList();
                if (data.stations) {
                    //deleteActiveStationsList();
                    // deleteActiveSensorsList();

                    let stations = data.stations;
                    stations.forEach(element => {
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
                    });
                    return wrapData(dataTable);
                };

                if (data.sensors) {
                    //deleteActiveSensorsList();
                    // getFirstActiveStationsList();
                    let sensors = data.sensors;
                    sensors.forEach(element => {
                        dataTable.push({
                            id: element.idd,
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                            date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS'),
                            average_period: element.average_period,
                            unit_name: element.unit_name,
                            measure_class: element.measure_class,
                            is_wind_sensor: element.is_wind_sensor,
                            max_consentration: element.max_consentration,
                            max_day_consentration: element.max_day_consentration,
                            def_colour: element.def_colour

                        });
                    });
                    //addActiveStationsList(paramstr.station);
                    let wrappedDataTable = wrapData(dataTable);
                    //addActiveSensorsList(wrappedDataTable);
                    return wrappedDataTable;
                };
                if (data.response) {
                    let data_list = data.response[0];
                    let sensors_list = data.response[1];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;
                    if (data_list.length > 0) {
                        if (sensors_list.length == 1) {
                            var _data = [];
                            var _tmp = 0;
                            var counter = 0;
                            var units = 0;
                            var first_date = data_list[0].date_time;
                            var last_date = data_list[data_list.length - 1].date_time;
                            var first_hour = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                            var first_minute = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                            var work_date = moment(first_date);

                            var _i = 0;
                            var _j = 0;
                            while (work_date.isBefore(last_date)) { //averaging data
                                _tmp = 0;
                                counter = 0;
                                work_date.add(paramstr.averaging, 'minutes');
                                for (_j = _i; ((_j < data_list.length) && (!work_date.isBefore(data_list[_j].date_time))); _j++) {

                                    _tmp += data_list[_j].measure;
                                    counter++;

                                }

                                if (counter) {
                                    data_list[_i].measure = _tmp / counter;
                                    data_list[_i].date_time = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                    _data.push(data_list[_i]);
                                }
                                _i = _j;
                                first_date = new Date(work_date).format('Y-MM-dd HH:mm:SS');

                            }

                            _data.forEach(element => {
                                let filter = sensors_list.filter((item, i, arr) => {
                                    return item.serialnum == element.serialnum;
                                });
                                //console.log('element  ', element);



                                if (!isEmpty(filter[0])) { unit_name = filter[0].unit_name }
                                dataTable.push({
                                    id: element.idd,
                                    typemeasure: element.typemeasure,
                                    serialnum: element.serialnum,
                                    date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                                    unit_name: unit_name,
                                    measure: element.measure.toFixed(3),
                                    is_alert: element.is_alert ? 'тревога' : 'нет',
                                });

                            });
                        }

                        else {
                            let size_arr = sensors_list.length + 1;//datetime, sensor1, ..., sensorN
                            let obj = { date_time: 'Время наблюдения' };
                            //tmp_arr.push({});//table header - first element
                            sensors_list.forEach(_id => {
                                obj[_id.serialnum] = _id.typemeasure + ' (' + _id.unit_name + ')';
                            });

                            dataTable.push(obj); //insert first element
                            var units = 0;
                            var _data = [];

                            sensors_list.forEach(_id => {

                                var _data_list_filter = data_list.filter((item, i, arr) => {
                                    return item.serialnum == _id.serialnum;
                                });

                                var _tmp = 0;
                                var counter = 0;
                                var first_date = data_list[0].date_time;
                                var last_date = data_list[data_list.length - 1].date_time;
                                var work_date = moment(first_date);


                                var _i = 0;
                                var _j = 0;
                                while (work_date.isBefore(last_date)) { //averaging data
                                    _tmp = 0;
                                    counter = 0;
                                    work_date.add(paramstr.averaging, 'minutes');
                                    for (_j = _i; ((_j < _data_list_filter.length) && (!work_date.isBefore(_data_list_filter[_j].date_time))); _j++) {

                                        _tmp += _data_list_filter[_j].measure;
                                        counter++;

                                    }

                                    if (counter) {
                                        _data_list_filter[_i].measure = _tmp / counter;
                                        if (units) {
                                            let _find_date = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                            _data.filter((__item, __i, __arr) => {
                                                if (__item.date_time == _find_date) {
                                                    let obj = {};
                                                    //obj[_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure;
                                                    _data[__i][_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure.toFixed(3);
                                                }
                                            });
                                        } else {
                                            let obj = {};
                                            obj['date_time'] = new Date(first_date).format('Y-MM-dd HH:mm:SS');
                                            obj[_data_list_filter[_i].serialnum] = _data_list_filter[_i].measure.toFixed(3);
                                            _data.push(obj);
                                        };
                                    }
                                    _i = _j;
                                    first_date = new Date(work_date).format('Y-MM-dd HH:mm:SS');

                                }

                                units++;

                            });
                            _data.forEach(_element => {
                                dataTable.push(_element); //add all elements
                            });

                        };
                    }
                    // Max allowable consentration

                    let consentration = data.response[2];

                    // addConsentrationList(wrapData(consentration));
                    /*macs.forEach(element => {
                        dataTable.push({
                            chemical: element.chemical,
                            max_m: element.max_m,
                            max_n: element.max_n
                        });
                    });*/

                    //  addDataList(wrapData(dataTable)); // add with id for table element
                    // addSensorsList(wrapData(sensors_list));

                    return dataTable;
                };

                return dataTable;

            });
    }
};

export function queryDashBoardDataOperativeEvent(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/operative_query/board', { params: { data } })
            .then(resp => resp.data)
            .then(data => {
                if (data.response) {
                    let data_list = data.response[0];
                    let sensors_list = data.response[1];
                    var macsTable = data.response[2];
                    let _logs_list = data.response[3];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;
                    var dataTable = [],
                        sensorsTable = [],
                        alertsTable = [],
                        systemTable = [],
                        last = '';
                    // let macsTable = [];
                    data_list.forEach(element => {
                        dataTable.push({
                            id: element.id,
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                            unit_name: element.unit_name,
                            measure: element.measure,
                            is_alert: element.is_alert,
                            momental_measure : element.momental_measure,
                            increase: element.increase
                        });
                    });

                    sensors_list.forEach(element => {
                        sensorsTable.push({
                            id:  element.idd,
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            unit_name: element.unit_name,
                            is_wind_sensor: element.is_wind_sensor,
                            measure_class: element.measure_class
                        });
                    });
                    var iterator = [0, 100, 101, 102, 110, 111, 112, 113, 114, 115, 120, 200, 404, 500]; //all type error

                    iterator.forEach((i, _ind) => {

                        let logs_list = _logs_list.filter((item, _i, arr) => {
                            return item.type == i;
                        });

                        logs_list.forEach((element, indx) => {
                            if ((Number(element.type) >= 100) && (Number(element.type) <= 115)) {
                                alertsTable.push({
                                    date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                                    type: element.type,
                                    descr: element.descr,
                                    id: element.idd
                                });
                            }

                            if (Number(element.type) == 0) {
                                if (indx != logs_list.length - 1) {
                                    if (last != element.descr)
                                        systemTable.push({
                                            date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                            type: element.type,
                                            descr: element.descr,
                                            is_visible: true

                                        });
                                } else {
                                    systemTable.push({
                                        date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                        type: element.type,
                                        descr: element.descr,
                                        is_visible: true
                                    });
                                }

                            }
                            if (Number(element.type) == 200) {
                                systemTable.push({
                                    date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                    type: element.type,
                                    descr: element.descr,
                                    is_visible: true

                                });
                            }

                            if ((Number(element.type) == 500) || ((Number(element.type) == 404))) {
                                if (indx != logs_list.length - 1) {
                                    if (last != element.descr)
                                        systemTable.push({
                                            date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                            type: element.type,
                                            descr: element.descr,
                                            is_visible: true

                                        });

                                } else {
                                    systemTable.push({
                                        date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                                        type: element.type,
                                        descr: element.descr,
                                        is_visible: true
                                    });
                                }

                            }

                            last = element.descr;
                        });
                    });


                }
                return { dataTable, sensorsTable, macsTable, alertsTable, systemTable };


            });




    };
};
