import React from 'react';
import UserEventForm from './userEventForm';
import { connect } from 'react-redux';

import PointsForm from './PointsForm';


class PointsPage extends React.Component {
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
            auth: props.auth


        }
    }

    render() {
        return (
            <div >

                <PointsForm  {...this.state} />

            </div>
        );
    }
}



export default (PointsPage);