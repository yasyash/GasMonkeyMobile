import { combineReducers, applyMiddleware } from 'redux';
import { SET_CURRENT_USER, DELETE_CURRENT_USER } from "../actions/types";
import isEmpty from 'lodash.isempty';

const initialState = [{
    isAuthenticated: false,
    user: {username:'', id:''}
}];

export default (state = initialState, action = {}) => {

    switch (action.type) {
        case SET_CURRENT_USER:
            return [
                {
                    isAuthenticated: !isEmpty(action.user),
                    user: action.user,
                }
            ];

        default: return state;

    }

}