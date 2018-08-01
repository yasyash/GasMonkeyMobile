import { SET_DATE, SET_REPORT_DATE } from "../actions/types";
import isEmpty from 'lodash.isempty';
import format from 'node.date-time';


const initialState = {
    dateTimeBegin: new Date().format('Y-MM-dd') + 'T00:00',
    dateTimeEnd: new Date().format('Y-MM-ddThh:mm')
};

export default (state = initialState, action = {}) => {
    let newstate = {};
    switch (action.type) {
        case SET_DATE:

            if ('dateTimeBegin' in action.data)
                newstate = { 'dateTimeBegin': action.data.dateTimeBegin, 'dateTimeEnd': state.dateTimeEnd };

            if ('dateTimeEnd' in action.data)
                newstate = { 'dateTimeBegin': state.dateTimeBegin, 'dateTimeEnd': action.data.dateTimeEnd };
            return newstate;

        case SET_REPORT_DATE:

            if ('dateReportBegin' in action.data)
                newstate = { 'dateReportBegin': action.data.dateReportBegin, 'dateReportEnd': state.dateReportEnd, 'dateTimeBegin': state.dateTimeBegin, 'dateTimeEnd': state.dateTimeEnd };

            if ('dateReportEnd' in action.data)
                newstate = { 'dateReportBegin': state.dateReportBegin, 'dateReportEnd': action.data.dateReportEnd, 'dateTimeBegin': state.dateTimeBegin, 'dateTimeEnd': state.dateTimeEnd };
            return newstate;

        default: return state;

    }

}