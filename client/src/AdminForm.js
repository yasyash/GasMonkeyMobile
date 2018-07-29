import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';


import MenuTable from './menuTable';

import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';
import IconButton from 'material-ui/IconButton';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';
import Switch from '@material-ui/core/Switch';
import SvgIcon from '@material-ui/core/SvgIcon';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import Typography from '@material-ui/core/Typography';


import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import "react-table/react-table.css";
import isNumber from 'lodash.isnumber';

import { getFtp, getSoap, getUser, getMeteo, getDev } from './actions/adminActions';

import FtpForm from './FtpForm';
import SoapForm from './SoapForm';
import UserForm from './UserForm';
import MeteoFormAdmin from './MeteoFormAdmin';
import EquipmentForm from './EquipmentForm';

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },


});

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
};


class AdminForm extends React.Component {
    constructor(props) {
        super(props);
        const {

            chartData,
            stationsList,
            sensorsList,
            sensors_actual,
            station_actual,
            dataList,


        } = props;



        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            isLoading: false,


            station_actual: '',
            sensors_actual: [],
            stationsList,
            sensorsList,
            dataList,
            macsList: [],
            selected: [],
            selection: [],
            selectAll: false,
            chartData,
            locations: '',
            checkedLine: true,
            checkedMeteo: true,
            pointStyle: 'crossRot',
            radius: 2,
            borderWidth: 1,
            borderDash: [5, 10],
            chemical: [],
            options: [],
            barThickness: null,
            beginChartData: [],
            meteoOptions: [],
            tab_no: 0,
            ftp_list: []
        };


        // this.onClick = this.onSubmit.bind(this);
        // this.onClose= this.handleClose.bind(this);
        //this.onExited= this.handleClose.bind(this);

        //   this.onRowSelection = this.onRowSelection.bind(this);
    }

    static defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
        locations: ''
    };




    handleChange = (event, tab_no) => {
        this.setState({ tab_no });
    };









    render() {
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, stationsList } = this.state;
        const { loadData } = this.props;
        const { classes } = this.props;
        const { sensorsList } = this.props;
        const { tab_no } = this.state;



        return (


            <Paper className={classes.root}>

                <Tabs>

                    <Tab label="Пользователи" >
                        <UserForm
                            {...this.state}
                            getUser={getUser}
                        />
                    </Tab>
                    <Tab label="Cтанции наблюдения" >
                        <SoapForm
                            {...this.state}
                            getSoap={getSoap}
                        />
                    </Tab>

                    <Tab label="Метеостанции">
                        <MeteoFormAdmin
                            {...this.state}
                            getMeteo={getMeteo}
                        />
                    </Tab>

                    <Tab label="Устройства">
                        <EquipmentForm
                            {...this.state}
                            getDev={getDev}
                        />
                    </Tab>

                    <Tab label="FTP выгрузка" >
                        <FtpForm
                            {...this.state}
                            getFtp={getFtp}
                        />
                    </Tab>


                </Tabs>

            </Paper >
        );
    }
}

function mapStateToProps(state) {
    let sensors = '';
    let station = '';
    let tmp = '';
    if (state.activeStationsList[1]) {
        tmp = state.activeStationsList.slice(state.activeStationsList.length - 1, );
        sensors = tmp[0].sensors;

    };

    if (state.activeStationsList[0]) {
        station = state.activeStationsList[0].station;

    };
    // if (!isEmpty(station)) { tmp = true } else { tmp = false };


    return {
        sensorsList: state.activeSensorsList,
        dataList: state.dataList,
        station_actual: station,
        sensors_actual: sensors,
        macs: state.macsList,
        selectedSensors: state.sensorsList,//all sensors of the station
        //checkedMeteo: tmp,
        //  meteoList: state.meteoList

    };
}


AdminForm.propTypes = {
    classes: PropTypes.object.isRequired,

    //loadData: PropTypes.func.isRequired
}

AdminForm.contextType = {
    // router: PropTypes.object.isRequired
}

export default (withRouter(withStyles(styles)(AdminForm)));
