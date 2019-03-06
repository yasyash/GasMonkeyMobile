

import React from 'react';
import UserEventForm from './userEventForm';
import { connect } from 'react-redux';

import MapsForm from './MapsForm';


class MapsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            errors: {},
            isLoading: false,
            stationsList: [],
            sensorsList: [],
            selectedSensors: [],
            dataList: [],
            meteoList: [],
            station_actual: '',
            sensors_actual: [],
            chartDate: {},
            macs: [], //max allowable consentration


        }
    }

    render() {
        return (
            <div >

                <MapsForm  {...this.state}  />

            </div>
        );
    }
}



export default (MapsPage);