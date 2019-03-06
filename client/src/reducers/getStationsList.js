import { GET_STATION_LIST} from "../actions/types";
import isEmpty from 'lodash.isempty';



export default (state = [], action = {}) => {

    switch (action.type) {
        case GET_STATION_LIST:
            
                const stations = action.data;
                return   stations ;

        default: return state;

    }

}