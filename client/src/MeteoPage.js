

import React from 'react';
import UserEventForm from './userEventForm';
import { queryMeteoEvent } from './actions/queryActions';
import { connect } from 'react-redux';

import MeteoForm from './MeteoForm';


class MeteoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            errors: {},
            isLoading: false,

            fixedHeader: true,
            fixedFooter: true,
            stripedRows: true,
            showRowHover: false,
            selectable: true,
            multiSelectable: false,
            enableSelectAll: false,
            deselectOnClickaway: false,
            showCheckboxes: true,
            height: '100px',
            dateTimeBegin: new Date().format('Y-MM-dd') + 'T00:00:00',
            dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),

            stationsList: [] ,
            sensorsList: [] ,
            dataList:[]


        }
    }

    render() {
        return (
            <div className="container">

                <MeteoForm queryMeteoEvent={queryMeteoEvent} {...this.state} />

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


export default connect(mapStateToProps, { queryMeteoEvent })(MeteoPage);