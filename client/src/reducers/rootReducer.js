import { combineReducers, applyMiddleware } from 'redux';
import flashMessages from './flashMessages';

import { composeWithDevTools } from 'redux-devtools-extension';
import { createStore } from 'redux';
import thunk from 'redux-thunk';
import auth from './auth';

import dataList from './dataList';

import sensorsList from './sensorsList';

import meteoList from './meteoList';

import activeStationsList from './activeStationsList';

import activeSensorsList from './activeSensorsList';

import macsList from './macsList';

import datePickers from './datePickers';

import meteoStation from './meteoStation';

export default createStore(
    combineReducers({
        meteoStation, datePickers, macsList, activeStationsList, activeSensorsList, meteoList,
        dataList, sensorsList, flashMessages, auth
    }),
    composeWithDevTools(applyMiddleware(thunk))
);

