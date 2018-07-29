import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';


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
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import isNumber from 'lodash.isnumber';
import classnames from 'classnames';

import MenuReport from './menuReport';

import { queryOperativeEvent, queryEvent, queryMeteoEvent } from './actions/queryActions';
import { reportGen } from './actions/genReportActions';
import { reportGet_tza4 } from './actions/genReportActions';

import { dateAddAction } from './actions/dateAddAction';


const styles = theme => ({

    _td: { textAlign: 'center' },
    alert_macs1_ylw: {
        backgroundColor: '#ffff1a'
    },
    alert_macs5_orng: {
        backgroundColor: '#ff4d00'
    },

    alert_macs10_red: {
        backgroundColor: '#ff0000'
    },
    alert_success: {
        color: '#000000',
        backgroundColor: '#ffffff'
    }



});



class Tza4Report extends React.Component {
    constructor(props) {
        super(props);
        const {

            chartData,

            station_actual,
            stationsList,
            sensorsList,
            dataList,
            sensors_actual



        } = props;

        // let today = new Date().getFullYear()+'-'+new Date().getFullYear()+'-01';

        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            isLoading: false,
            dateTimeBegin: new Date(new Date().getFullYear(), new Date().getMonth(), 1, '0', '0').format('Y-MM-ddTHH:mm'),
            dateTimeEnd: new Date().format('Y-MM-ddT') + '23:59',
            station_actual,
            station_name: '',
            sensors_actual,
            stationsList,
            sensorsList,
            dataList,
            selected: [],
            selection: [],
            selectAll: false,
            chemical: [],
            options: [],
            barThickness: null,
            beginChartData: [],
            tza4: [],
            adds: [],
            data_4_report: [],

        };

        //first init
       // dateAddAction({ 'dateTimeBegin': this.state.dateTimeBegin });
        //dateAddAction({ 'dateTimeEnd': this.state.dateTimeEnd });
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

    daysInMonth = (month) => {
        let days = 33 - new Date(new Date().getFullYear(), month, 33).getDate();
        return days;

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
    async    loadData(params) {


        let data = await (this.props.queryOperativeEvent(params));
        //console.log(data);
        return data;
    };

    async    loadMeteoData(params) {

        let data = await (this.props.queryMeteoEvent(params));

        return data;
    };

    handleReportChange(state) {
        this.setState({ station_actual: state.station_actual, station_name: state.station_name, chemical: state.chemical });

        let params = {};

        // this.setState({ dateTimeBegin: this.props.dateTimeBegin, dateTimeEnd: this.props.dateTimeEnd });
        //this.loadData().then(data => this.setState({ sensorsList: data }));

        //tza report
        if (isEmpty(state.dateTimeBegin)) {
            params.period_from = this.props.dateTimeBegin;
            params.period_to = this.props.dateTimeEnd;
        }
        else {
            params.period_from = state.dateTimeBegin;
            params.period_to = state.dateTimeEnd;
        };
        params.station = state.station_actual;
        params.station_name = state.station_name;
        params.chemical = state.chemical
        params.get = true;

        reportGet_tza4(params).then(resp => {
            if (resp) {

                let adds = resp.adds;
                let tza4_tmpl = resp.tza4;
                let data = resp.data;

                this.setState({ 'data_4_report': data });
                // this.setState({ 'station_name': state.station_name });
                this.setState({ 'adds': adds });
                this.setState({ 'tza4': tza4_tmpl });

                this.setState({ isLoading: true });
                this.setState({ snack_msg: 'Данные успешно загружены...' });
            }
            else {
                this.setState({ isLoading: false })
                this.setState({ snack_msg: 'Данные отсутствуют...' })

            };


        });


    };


    handleSnackClose() {
        this.setState({ isLoading: false });
        this.setState({ isUpdated: false });

    };


    componentWillMount() {


    }



    render() {
        const { classes } = this.props;
        const { tza4 } = this.state;
        const { adds } = this.state;
        const { snack_msg, isLoading } = this.state;




        return (


            <Paper >
                <br />
                <MenuReport
                    {...this.props} snack_msg={snack_msg} isLoading={isLoading}
                    station_name={this.state.station_name}
                    station_actual={this.state.station_actual}
                    //dateTimeBegin={this.state.dateTimeBegin}
                    report_type='tza4'
                    data_4_report={this.state.data_4_report}
                    handleReportChange={this.handleReportChange.bind(this)}
                    handleSnackClose={this.handleSnackClose.bind(this)}

                />

                <Typography component="div" style={{ padding: 2 * 1 }} id="tza4_report">

                    <table style={{ "width": '100%' }} id="tza4_report_table_header">
                        <tbody>
                            <tr>
                                <td style={{ 'width': '45%' }}>Станция: {this.state.station_name} &nbsp; &nbsp; Примесь: {this.state.chemical}  </td>

                                <td style={{ 'width': '45%', 'textAlign': 'right' }}>год {new Date(this.props.dateTimeBegin).format('Y')} месяц {new Date(this.props.dateTimeBegin).format('MM')} </td>
                                <td style={{ 'width': '5%' }}>&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>


                    <table border="1" width="100%" style={{ 'Align': 'center' }} className={classes._td} id="tza4_report_table">
                        <tbody>

                            <tr >
                                <td style={{ 'width': '3%' }} >
                                    D
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    P
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    01 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    02 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    03 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    04 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    05 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    06 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    07 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    08 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    09 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    10 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    11 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    12 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    13 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    14 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    15 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    16 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    17 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    18 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    19 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    20 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    21 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    22 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    23 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    24 час
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    Sum Qc
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    n
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    Qc
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    Qm
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    T Qm
                                 </td>
                                <td style={{ 'width': '3%' }} >
                                    Tq
                                 </td>


                            </tr>



                            {(tza4) && 
                            tza4.map((option, i) => (
                                <tr key={'tr_' + i}>
                                    <td style={{ 'width': '3%' }} >
                                        {option[0]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                       { option[1]}

                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                       { option[2]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[3]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[4]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[5]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[6]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[7]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[8]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[9]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[10]}

                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[11]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[12]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[13]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[14]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[15]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[16]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[17]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[18]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[19]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[20]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[21]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[22]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[23]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[24]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[25]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[26]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[27]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[28]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[29]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[30]}
                                 </td>
                                    <td style={{ 'width': '3%', 'fontSize': '10px' }} >
                                        {option[31]}
                                 </td>
                                </tr>
                            ))}
                            <tr>

                            </tr>

                            {(adds) && <tr key='adds'>
                                <td style={{ 'width': '3%' }} colSpan="25">
                                </td>
                                <td style={{ 'width': '3%' , 'fontSize': '12px'}} >
                                    M
                                 </td>
                                <td style={{ 'width': '3%' , 'fontSize': '12px'}} >
                                    {adds.M_SumQc}
                                </td>
                                <td style={{ 'width': '3%' , 'fontSize': '12px'}} >
                                    {adds.M_n}
                                </td>
                                <td style={{ 'width': '3%' , 'fontSize': '12px'}} >
                                    {adds.M_Qc}
                                </td>
                                <td style={{ 'width': '3%' }} colSpan="3">
                                    -
                                 </td>

                            </tr>}
                            {(adds) && <tr key='adds1'>
                                <td style={{ 'width': '3%' }} colSpan="26">
                                </td>
                                <td style={{ 'width': '3%' , 'fontSize': '12px'}} >
                                    Max Qc
                                    </td>

                                <td style={{ 'width': '3%' , 'fontSize': '12px'}} colSpan="5">
                                    {adds.Max_Qc}
                                </td>


                            </tr>

                            }
                            {(adds) && <tr key='adds2'>
                                <td style={{ 'width': '3%' }} colSpan="26">
                                </td>
                                <td style={{ 'width': '3%' , 'fontSize': '12px'}} >
                                    Tmax Qc
                                    </td>

                                <td style={{ 'width': '3%' , 'fontSize': '12px'}} colSpan="5">
                                    {adds.Tmax_Qc}
                                </td>


                            </tr>

                            }
                            {(adds) && <tr key='adds3'>
                                <td style={{ 'width': '3%' }} colSpan="26">
                                </td>
                                <td style={{ 'width': '3%', 'fontSize': '12px' }} >
                                    Sum Dcc
                                    </td>

                                <td style={{ 'width': '3%', 'fontSize': '12px'}} colSpan="5">
                                    {adds.Sum_Dcc}
                                </td>


                            </tr>

                            }

                        </tbody>
                    </table>
                </Typography>
            </Paper >
        );
    }
}

function mapStateToProps(state) {


    return {
        dateTimeBegin: state.datePickers.dateTimeBegin,
        dateTimeEnd: state.datePickers.dateTimeEnd

    };
}


Tza4Report.propTypes = {
    classes: PropTypes.object.isRequired,
    queryOperativeEvent: PropTypes.func.isRequired,    //loadData: PropTypes.func.isRequired
    queryMeteoEvent: PropTypes.func.isRequired,
    reportGen: PropTypes.func.isRequired,
    reportGet_tza4: PropTypes.func.isRequired
}

Tza4Report.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryOperativeEvent, queryMeteoEvent, reportGen, reportGet_tza4 })(withRouter(withStyles(styles)(Tza4Report)));