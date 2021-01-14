import { SET_CURRENT_POINT, DELETE_CURRENT_POINT } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    active_point:''
}];

export default (state = initialState, action = {}) => {

    switch (action.type) {
        case SET_CURRENT_POINT:
            return [
                {
                    active_point: action.data
                }
            ];
            case DELETE_CURRENT_POINT:
                return [
                    {
                        active_point: ''
                    }
                ];
        default: return state;

    }

}