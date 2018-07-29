import Axios from "axios";
import format from 'node.date-time';
import { addDataList, deleteDataList } from './dataAddActions';
import { addSensorsList, deleteSensorsList, addActiveSensorsList, deleteActiveSensorsList } from './sensorsAddAction';
import { addMeteoList, deleteMeteoList } from './meteoAddAction';
import { addActiveStationsList, deleteActiveStationsList, getFirstActiveStationsList } from './stationsAddAction';
import { addConsentrationList } from './consentrationAddAction';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';

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
                            date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS')
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
                return {dataTable, sensorsTable, macsTable};
            });




    };
};

/* export function queryEvent(params) {
    return dispatch => {
        return Axios.get('/api/query', params).then(resp => {
            let stations = resp.stations;
            return stations;
        });


    }
}; */