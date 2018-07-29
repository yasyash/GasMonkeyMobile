import { SET_METEO_STATION, DELETE_METEO_STATION } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    meteoStations: []
}];

export default (state = [], action = {}) => {

    switch (action.type) {
        case SET_METEO_STATION:
            return action.data;
            
        case DELETE_METEO_STATION:
            return [

                []

            ];
        default: return state;

    }

}