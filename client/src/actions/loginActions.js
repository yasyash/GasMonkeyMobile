import Axios from "axios";
import setAuthToken from '../stuff/setAuthToken';
//import jwToken from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import { SET_CURRENT_USER } from "./types";

export function setCurrentUser(user) {
    return {
        type: SET_CURRENT_USER,
        user
    };
}

export function login(data) {
    return dispatch => {
        return Axios.post('/api/auth', data).then(resp => {
            let token = resp.data.token;
            sessionStorage.setItem('jwToken', token);
            setAuthToken(token);
            dispatch(setCurrentUser(jwtDecode(token)));
        }
        );
    }
}

export function logout(data) {
    return dispatch => {

        sessionStorage.removeItem('jwToken');
        setAuthToken(false);
        dispatch(setCurrentUser({}));
    }
       
}
