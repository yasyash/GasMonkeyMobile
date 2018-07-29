import React from 'react';
import ReactDOM from 'react-dom';
import es6x from 'es6x';

//import render from 'react-dom';
import './index.css';
//import App from './App';
//import { Router, hashHistory } from 'react-router';
import { BrowserRouter as Router, Route, browserHistory } from 'react-router-dom';
import './App.css';


import routes from './routes';

import registerServiceWorker from './registerServiceWorker';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import store from './reducers/rootReducer';
//import rootReducer from './reducers/index';
//import fCharts from './reducers/fusion'
//import {Route} from 'react-router';
import signUp from './signUp';

import { createLogger } from 'redux-logger';
import setAuthToken from './stuff/setAuthToken';
import MainApp from './MainApp';
import { setCurrentUser } from './actions/loginActions';
import jwtDecode from 'jwt-decode';
//import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


//const logger = createLogger();
//es6x.setOutputMethod(React.createElement); //plugin for JSX syntax

//injectTapEventPlugin();

//var realFs = require('fs');
//var gracefulFs = require('graceful-fs');
//gracefulFs.gracefulify(realFs);

if (sessionStorage.jwToken) {
      setAuthToken(sessionStorage.jwToken);
      store.dispatch(setCurrentUser(jwtDecode(sessionStorage.jwToken)));

}
//export const history = syncHistoryWithStore(browserHistory, store);


ReactDOM.render(
      <MuiThemeProvider>
            <Provider store={store}>

                  <Router >
                        <MainApp />

                  </Router>
            </Provider>
      </MuiThemeProvider>

      , document.getElementById('root'));
registerServiceWorker();

module.hot.accept();
