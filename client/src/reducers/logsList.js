import { SET_LOGS_LIST, DELETE_LOGS_LIST } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = {
    logsList: []
};

export default (state = [], action = {}) => {

    switch (action.type) {
        case SET_LOGS_LIST:
            return [...action.data];
        case DELETE_LOGS_LIST:
            return [];
        default: return state;

    }

}