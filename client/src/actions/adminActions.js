import Axios from "axios";
import format from 'node.date-time';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import FileDownload from 'js-file-download';

function wrapData(data_in) {
    const data = data_in.map(item => {
        const _id = shortid.generate();


        Object.assign(item, { _id: _id });
        return item;
    });
    return data;
}


export function getFtp() {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.get('/api/admin/ftp_get')
            .then(resp => {
                let list = [];
                let data = resp.data.ftplist;

                data.forEach(element => {
                    list.push({
                        indx: element.indx,
                        address: element.address,
                        username: element.username,
                        pwd: element.pwd,
                        folder: element.folder,
                        name: element.name,
                        periods: element.periods,
                        date_time: new Date(element.date_time).format('dd-MM-Y HH:mm:SS'),
                        idd: String(element.id)
                    })

                });


                return wrapData(list);
            })
    };
};

export function updateFtp(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/ftp_update', ...paramstr)
            .then(resp => resp)
    };
};

export function deleteFtp(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/ftp_del', { id: paramstr })
            .then(resp => resp)
    };
};

export function insertFtp(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/ftp_insert', paramstr)
            .then(resp => resp)
    };
};

///// SOAP

export function getSoap() {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.get('/api/admin/soap_get')
            .then(resp => {
                let list = [];
                let data = resp.data.ftplist;

                data.forEach(element => {
                    list.push({
                        address: element.address,
                        is_present: element.is_present ? 'включена' : 'деактивирована',
                        login: element.login,
                        password_soap: element.password_soap,
                        updateperiod: element.updateperiod,
                        namestation: element.namestation,
                        useraccessright: element.useraccessright,
                        date_time_in: new Date(element.date_time_in).format('dd-MM-Y HH:mm:SS'),
                        idd: element.idd,
                        place: element.place,
                        latitude: element.latitude,
                        longitude: element.longitude
                    })

                });


                return wrapData(list);
            })
    };
};

export function updateSoap(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/soap_update', ...paramstr)
            .then(resp => resp)
    };
};
export function activateSoap(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/soap_activate', { id: paramstr })
            .then(resp => resp)
    };
};
export function deleteSoap(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/soap_del', { id: paramstr })
            .then(resp => resp)
    };
};

export function insertSoap(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/soap_insert', paramstr)
            .then(resp => resp)
    };
};

// User's API

export function getUser() {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.get('/api/admin/user_get')
            .then(resp => {
                let list = [];
                let data = resp.data.userlist;

                data.forEach(element => {
                    list.push({
                        username: element.username,
                        email: element.email,
                        mobile: element.mobile,
                        created_at: new Date(element.created_at).format('dd-MM-Y HH:mm:SS'),
                        updated_at: new Date(element.updated_at).format('dd-MM-Y HH:mm:SS'),
                        is_active: element.is_active ? 'да' : 'нет',
                        is_admin: element.is_admin ? 'да' : 'нет',
                        idd: element.id
                    })

                });


                return wrapData(list);
            })
    };
};

export function updateUser(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/user_update', ...paramstr)
            .then(resp => resp)
    };
};
export function updateSecurityUser(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/user_security_update', ...paramstr)
            .then(resp => resp)
    };
};

export function deleteUser(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/user_del', { id: paramstr })
            .then(resp => resp)
    };
};

export function insertUser(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/user_insert', paramstr)
            .then(resp => resp)
    };
};

// Meteostation's API


export function getMeteo() {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.get('/api/admin/meteo_get')
            .then(resp => {
                let list = [];
                let data = resp.data.userlist;

                data.forEach(element => {
                    list.push({
                        updateperiod: element.updateperiod,
                        namestation: element.namestation,
                        date_time_in: new Date(element.date_time_in).format('dd-MM-Y HH:mm:SS'),
                        idd: element.idd,
                        id: element.id,
                        folder: element.folder
                    })

                });


                return wrapData(list);
            })
    };
};

export function updateMeteo(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/meteo_update', ...paramstr)
            .then(resp => resp)
    };
};


export function deleteMeteo(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/meteo_del', { id: paramstr })
            .then(resp => resp)
    };
};

export function insertMeteo(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/meteo_insert', paramstr)
            .then(resp => resp)
    };
};

//Equipment's API

export function getDev() {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.get('/api/admin/dev_get')
            .then(resp => {
                var list = [];
                const stns = resp.data.stations_list;
                const devs = resp.data.dev_list;
                var idd_old = '';
                var filter = [];

                devs.forEach(element => {
                    if (idd_old != element.idd) {
                        filter = stns.filter((item, i, arr) => {
                            return item.idd == element.idd;
                        });
                        idd_old = filter[0].idd;
                    }
                    list.push({
                        id: String(element.id),
                        namestation: filter[0].namestation,
                        idd: element.idd,
                        typemeasure: element.typemeasure,
                        serialnum: element.serialnum,
                        date_time_in: new Date(element.date_time_in).format('dd-MM-Y HH:mm:SS'),
                        date_time_out: new Date(element.date_time_out).format('dd-MM-Y HH:mm:SS'),
                        unit_name: element.unit_name,
                        def_colour: element.def_colour,
                        max_consentration: element.max_consentration,
                        max_day_consentration: element.max_day_consentration
                    })

                });


                return wrapData(list);
            })
    };
};

export function updateDev(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/dev_update', ...paramstr)
            .then(resp => resp)
    };
};


export function deleteDev(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/dev_del', { idd: paramstr })
            .then(resp => resp)
    };
};

export function insertDev(paramstr) {


    return dispatch => {
        return Axios.post('/api/admin/dev_insert', paramstr)
            .then(resp => resp)
    };
};