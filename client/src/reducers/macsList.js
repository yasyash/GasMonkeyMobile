import { SET_MACS_LIST } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    dataList: []
}];

export default (state = [], action = {}) => {

    switch (action.type) {
        case SET_MACS_LIST:
            return [
                

                     ...action.data
                
            ];
       
        default: return state;

    }

}