import { SET_DATA_LIST, DELETE_DATA_LIST } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    dataList: []
}];

export default (state = initialState, action = {}) => {

    switch (action.type) {
        case SET_DATA_LIST:
            return [
                

                     ...action.data
                
            ];
        case DELETE_DATA_LIST:
            return [
                
                     []
                
            ];
        default: return state;

    }

}