import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';

import { queryOperativeEvent, queryEvent } from './actions/queryActions';
import { dateAddAction } from './actions/dateAddAction';

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

import { Bar, Line, Pie } from 'react-chartjs-2';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import "react-table/react-table.css";
import isNumber from 'lodash.isnumber';

import OperativeReport from './OperativeReport';
import DailyReport from './DailyReport';
import MonthlyReport from './MonthlyReport';
import Tza4Report from './Tza4Report';

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


class ReportForm extends React.Component {
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
            tab_no: 0
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

    ////////////    
    handleChangeToggle = (name, event) => {
        this.setState({ [name]: event.target.checked });
        if (name === 'checkedMeteo') {
            // this.setState({ [name]: event.target.checked });
            this.getChartData(event.target.checked);
        }
    };
    onSubmit(e) {
        e.preventDefault();

        alert('OK');

        //   this.props.createMyEvent(this.state);
    };



    handleChange = (event, tab_no) => {
        this.setState({ tab_no });
    };

    handleLoad() {
        let params = {};
        //e.preventDefault();
        this.setState({ dateTimeBegin: this.props.dateTimeBegin, dateTimeEnd: this.props.dateTimeEnd });
        //this.loadData().then(data => this.setState({ sensorsList: data }));


        // 0 - all stations, 1- all sensors of the station, 2 - selected sensors
        if (!isEmpty(this.state.sensors_actual)) {
            params.period_from = this.props.dateTimeBegin;
            params.period_to = this.props.dateTimeEnd;


            params.station = this.props.station_actual;
            params.sensors = this.state.sensors_actual;
            this.props.queryEvent(params).then(data => {
                if (data) {
                    this.setState({ dataList: data })
                    this.setState({ isLoading: true })
                    this.setState({ snack_msg: 'Данные успешно загружены...' })
                    // addActiveSensorsList(this.state.selection);
                    getFirstActiveStationsList();
                    addActiveStationsList({ sensors: this.state.selection });

                }
                else {
                    this.setState({ isLoading: false })
                    this.setState({ snack_msg: 'Данные отсутствуют...' })

                }
            });
        }

    };

    handleClick() {

        //e.preventDefault();

        this.loadData(1).then(data => {
            if (data) {
                this.loadData(3);
                // this.setState({ sensorsList: this.setData(data) })
                this.setState({ isLoading: true });
                this.setState({ snack_msg: 'Данные успешно загружены...' });
                this.setState({ isUpdated: true });

            }
            else {
                this.setState({ isLoading: false })
                this.setState({ snack_msg: 'Данные отсутствуют...' })

            }
        });

        //alert('loadData');

        //   this.props.createMyEvent(this.state);
    };

    async    loadData(qtype) {
        let params = {};
        // 0 - all stations, 1- all sensors of the station, 2 - selected sensors
        //3 - macs table
        params.period_from = this.state.dateTimeBegin;
        params.period_to = this.state.dateTimeEnd;
        if (qtype === 1) {
            params.station = this.state.station_actual;
            // if (this.props.station_actual.length > 0) { deleteActiveStationsList(); };
            addActiveStationsList({ station: this.state.station_actual });
            deleteDataList();
            deleteSensorsList();
            //this.setState({ slection: '' })
        };
        if (qtype === 2) {
            params.station = this.state.station_actual;
            params.sensors = this.state.sensors_actual;
            // addActiveSensorsList(this.state.sensors_actual);

        }; // query for sensors data had been sent to the TableSensors component

        if (qtype === 3) {
            params.sensors = this.state.sensors_actual;

        };
        let data = await (this.props.queryEvent(params));
        //console.log(data);
        return data;
    };


    componentWillMount() {
        this.loadData(0).then(data => {
            if (this.props.station_actual) {
                let selection = [];
                if (this.props.station_actual.length > 0) {
                    data.forEach(element => {
                        if (element.id == this.props.station_actual) {
                            selection.push(element._id);
                        };
                    });
                    this.setState({ selection });
                    this.setState({ station_actual: this.props.station_actual });
                }
            }
            this.setState({ stationsList: data });
            //console.log('RF '+ data);
        });

    }



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
                    <Tab label="Оперативный" >
                        <OperativeReport {...this.state}
                        />
                    </Tab>
                    <Tab label="Суточный" >
                        <DailyReport {...this.state}
                            dateTimeBegin={new Date().format('Y-MM-ddT') + '00:00'}
                            dateTimeEnd={new Date().format('Y-MM-ddT') + '23:59:59'}
                        />
                    </Tab>
                    <Tab label="Ежемесячный">
                        <MonthlyReport {...this.state}
                            dateTimeBegin={new Date().format('Y-MM-ddT') + '00:00'}
                            dateTimeEnd={new Date().format('Y-MM-ddT') + '23:59:59'}
                        />
                    </Tab>
                    <Tab label="ТЗА-4" >
                    <Tza4Report {...this.state}
                            dateTimeBegin={new Date().format('Y-MM-ddT') + '00:00'}
                            dateTimeEnd={new Date().format('Y-MM-ddT') + '23:59:59'}
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


ReportForm.propTypes = {
    classes: PropTypes.object.isRequired,
    queryOperativeEvent: PropTypes.func.isRequired

    //loadData: PropTypes.func.isRequired
}

ReportForm.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryOperativeEvent, queryEvent })(withRouter(withStyles(styles)(ReportForm)));
