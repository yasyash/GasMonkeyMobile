import { SET_CURRENT_TIME, DELETE_CURRENT_TIME } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    end_measure:''
}];

export default (state = initialState, action = {}) => {

    switch (action.type) {
        case SET_CURRENT_TIME:
            return [
                {
                    end_measure: action.date_time_end
                }
            ];
            case DELETE_CURRENT_TIME:
                return [
                    {
                        end_measure: ''
                    }
                ];
        default: return state;

    }

}