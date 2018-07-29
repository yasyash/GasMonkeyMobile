import { SET_METEO_LIST, DELETE_METEO_LIST, SET_METEO_STATION } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    meteoList: []
}];

export default (state = [], action = {}) => {

    switch (action.type) {
        case SET_METEO_LIST:
            return [
                

                     ...action.data
                
            ];
        case DELETE_METEO_LIST:
            return [
                
                     []
                
            ];
        default: return state;

    }

}