import { SET_ACTIVE_SENSORS_LIST, DELETE_ACTIVE_SENSORS_LIST } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    sensorsList: []
}];

export default (state = [], action = {}) => {

    switch (action.type) {
        case SET_ACTIVE_SENSORS_LIST:
            return [
                

                     ...action.data
                
            ];
        case DELETE_ACTIVE_SENSORS_LIST:
            return [
                
                     []
                
            ];
        default: return state;

    }

}