import { SET_STATION_LIST, DELETE_STATION_LIST, FIRST_STATION_LIST } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    sensorsList: []
}];

export default (state = [], action = {}) => {

    switch (action.type) {
        case SET_STATION_LIST:
            if (action.data.station) {
                const station = action.data.station;
                return [  {station} ];

            };
            if (action.data.sensors) {
                const sensors = action.data.sensors;
                return [state[0], { sensors }];

            };


        case DELETE_STATION_LIST:
            return [

                []

            ];
        case FIRST_STATION_LIST:
            return [

                state[0]

            ];

        default: return state;

    }

}