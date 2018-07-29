import Axios from "axios";

export default function setAuthToken(token) {
    if (token) {
        Axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
        delete Axios.defaults.headers.common['Authorization'];
    }
}