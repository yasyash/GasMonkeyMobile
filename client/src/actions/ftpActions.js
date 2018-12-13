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




export function sendFtp(paramstr) {

    // const data = JSON.stringify(paramstr);
      console.log('parameters is ');
    return dispatch => {
        return Axios.post('/api/ftp/ftp_send', { id: paramstr })
            .then(resp => {
                console.log(resp);
            }
            )
    };
};

