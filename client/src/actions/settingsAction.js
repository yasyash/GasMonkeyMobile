import Axios from "axios";
import format from 'node.date-time';

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

//Points handling

export function getSettings(_bunch, _type) {

    const data = JSON.stringify({ bunch: _bunch, type: _type });
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.get('/api/admin/settings_get', { params: {data: data }})
            .then(resp => {
                let list = [];
                let data = resp.data[0].nominal;

                return data;
            })
    };
};


export function updateSettings(paramstr) {

    // const data = JSON.stringify(paramstr);
    //  console.log('parameters is ', data);
    return dispatch => {
        return Axios.post('/api/admin/point_update_all', paramstr)
            .then(resp => resp)
    };
};

