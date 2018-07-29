

import React from 'react';
import UserEventForm from './userEventForm';
import { connect } from 'react-redux';

import AdminForm from './AdminForm';


class AdminPage extends React.Component {
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
            <div className="container">

                <AdminForm  {...this.state} />

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fixedHeader: state.fixedHeader,
        fixedFooter: state.fixedFooter,
        stripedRows: state.stripedRows,
        showRowHover: state.showRowHover,
        selectable: state.selectable,
        multiSelectable: state.multiSelectable,
        enableSelectAll: state.enableSelectAll,
        deselectOnClickaway: state.deselectOnClickaway,
        showCheckboxes: state.showCheckboxes,
        height: state.height
    };
}


export default (AdminPage);