import Axios from "axios";

export function userSignupRequest(userData) {
    return dispatch => {
        return Axios.post('/api/users', userData);
    }
}

export function isUserExists(identifier) {
    return dispatch => {
        return Axios.get(`/api/users/${identifier}`);
    }
}