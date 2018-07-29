import Axios from "axios";
import format from 'node.date-time';


import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import FileDownload from 'js-file-download';

export function reportGen(paramstr) {
    return dispatch => {
        const data = JSON.stringify(paramstr);
        console.log('parameters is ', data);

        return Axios.create({ responseType: 'blob' }).get('/api/operative_report/', { params: { data } })
            .then(resp => {
                return resp;
            })//.then(file => { FileDownload(file, 'report.docx'); });
    }
};

export function reportGet_monthly(paramstr) {
    
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/operative_report/get_monthly', { params: { data } })
            .then(resp => resp.data.response);
            
    };

    export function reportGet_tza4 (paramstr) {
    
        const data = JSON.stringify(paramstr);
        //  console.log('parameters is ', data);

        return Axios.get('/api/operative_report/get_tza4', { params: { data } })
            .then(resp => resp.data.response);
            
    };