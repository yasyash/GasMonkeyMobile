import { SET_DATE } from "../actions/types";
import isEmpty from 'lodash.isempty';
import format from 'node.date-time';


const initialState = {
    dateTimeBegin: new Date().format('Y-MM-dd') + 'T00:00',
    dateTimeEnd: new Date().format('Y-MM-ddThh:mm')
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case SET_DATE:
            let newstate = {};

            if ('dateTimeBegin' in action.data)
                newstate = { 'dateTimeBegin': action.data.dateTimeBegin, 'dateTimeEnd': state.dateTimeEnd };

            if ('dateTimeEnd' in action.data)
                newstate = { 'dateTimeBegin': state.dateTimeBegin, 'dateTimeEnd': action.data.dateTimeEnd };
            return newstate;

        default: return state;

    }

}