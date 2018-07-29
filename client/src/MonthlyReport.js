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
import { reportGet_monthly } from './actions/genReportActions';

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



class MonthlyReport extends React.Component {
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
            data_raw: [],
            avrg_measure: [],
            data_4_report: [],
            queryFields: {
                'P': 'Атм. давление',
                'Tout': 'Темп. внешняя',
                'Tin': 'Темп. внутренняя',
                'Hout': 'Влажность внеш.',
                'Hin': 'Влажность внутр.',
                'WindV': 'Скорость ветра',
                'WindD': 'Направление ветра',
                'Rain': 'Интенс. осадков',
                'Ts1': 'Темп. зонда 1',
                'Ts2': 'Темп. зонда 2',
                'Ts3': 'Темп. зонда 3',
                'U': 'Напряжение питания',
                'Dr': 'Дверь',
                'Fr': 'Пожар'
            }
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
        this.setState({ station_actual: state.station_actual, station_name: state.station_name });

        let params = {};

        // this.setState({ dateTimeBegin: this.props.dateTimeBegin, dateTimeEnd: this.props.dateTimeEnd });
        //this.loadData().then(data => this.setState({ sensorsList: data }));

        //const template_chemical = ['NO', 'NO2', 'SO2', 'H2S', 'O3', 'CO', 'PM2.5', 'PM10'];
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
        params.get = true;

        reportGet_monthly(params).then(resp => {
            if (resp) {

                let avrg_measure = resp.avrg_measure;
                let data_raw = resp.data_raw;
                let data = resp.data;
                let proxy = [];
                data_raw.forEach(element => {
                    if (!isEmpty(element))
                        proxy.push(element);
                });
                this.setState({ 'data_4_report': data });
                // this.setState({ 'station_name': state.station_name });
                this.setState({ 'data_raw': proxy });
                this.setState({ 'avrg_measure': avrg_measure });

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
        const { data_raw } = this.state;
        const { avrg_measure } = this.state;
        const { snack_msg, isLoading } = this.state;
        const alert = 'ТРЕВОГА';
        const norm = 'отсутствует';

        const Title_operative = [{
            Header: "Параметры загрязнения",
            style: { 'width': '50%' },
            columns: [
                {
                    Header: "№",
                    id: "id",
                    style: { 'width': '10%' }
                },
                {
                    Header: "Наименование",
                    id: "name",
                    style: { 'width': '20%' }
                },
                {
                    Header: "ПДКмр, мг/м.куб.",
                    id: "pdk_mr",
                    style: { 'width': '20%' }
                },
                {
                    Header: "Разовая концентрация (средняя за 20 мин), мг/м.куб.",
                    style: { 'width': '50%' },
                    columns: [
                        {
                            Header: "дата время",
                            id: "date_time",
                            style: { 'width': '25%' }
                        },
                        {
                            Header: "значение",
                            id: "date_time",
                            style: { 'width': '25%' }
                        }
                    ]
                }
            ]
        }

        ];




        return (


            <Paper >
                <br />
                <MenuReport
                    {...this.props} snack_msg={snack_msg} isLoading={isLoading}
                    station_name={this.state.station_name}
                    station_actual={this.state.station_actual}
                    //dateTimeBegin={this.state.dateTimeBegin}
                    report_type='monthly'
                    data_4_report={this.state.data_4_report}
                    handleReportChange={this.handleReportChange.bind(this)}
                    handleSnackClose={this.handleSnackClose.bind(this)}

                />

                <Typography component="div" style={{ padding: 2 * 1 }} id="monthly_report">

                    <table style={{ "width": '100%' }} id="monthly_report_table_header">
                        <tbody>
                            <tr>
                                <td style={{ 'width': '45%' }}>Станция: {this.state.station_name}</td>

                                <td style={{ 'width': '45%', 'textAlign': 'right' }}>год {new Date(this.props.dateTimeBegin).format('Y')} месяц {new Date(this.props.dateTimeBegin).format('MM')} </td>
                                <td style={{ 'width': '5%' }}>&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>


                    <table border="1" width="100%" style={{ 'Align': 'center' }} className={classes._td} id="monthly_report_table">
                        <tbody>
                            <tr >
                                <td style={{ 'width': '15%' }} rowSpan="2">
                                    <b> Время</b>
                                </td>
                                <td style={{ 'width': '85%' }} colSpan="8">
                                    <b> Концентрация, мг/м. куб.</b>
                                </td>
                            </tr>
                            <tr >
                                <td style={{ 'width': '10%' }} >
                                    NO
                                 </td>
                                <td style={{ 'width': '10%' }} >
                                    NO2
                                 </td>
                                <td style={{ 'width': '10%' }} >
                                    SO2
                                 </td>
                                <td style={{ 'width': '10%' }} >
                                    H2S
                                 </td>
                                <td style={{ 'width': '10%' }} >
                                    O3
                                 </td>
                                <td style={{ 'width': '10%' }} >
                                    CO
                                 </td>
                                <td style={{ 'width': '10%' }} >
                                    PM-10
                                 </td>
                                <td style={{ 'width': '10%' }} >
                                    PM-2.5
                                 </td>
                            </tr>


                            {(data_raw) &&// if not empty
                                data_raw.map((option, i) => (
                                    <tr key={'tr_' + i}>
                                        <td> {option.time}</td>
                                        <td> {option.NO}</td>
                                        <td> {option.NO2}</td>
                                        <td> {option.SO2}</td>
                                        <td> {option.H2S}</td>
                                        <td> {option.O3}</td>
                                        <td> {option.CO}</td>
                                        <td> {option.PM10}</td>
                                        <td> {option['PM2.5']}</td>

                                    </tr>
                                ))}
                            <tr>

                            </tr>
                            {(avrg_measure) &&// if not empty
                                avrg_measure.map((option, i) => (
                                    (i > 0 && i < avrg_measure.length - 1) &&
                                    <tr key={'trm_' + i}>
                                        <td> {option[0]}</td>
                                        <td> {option[1]}</td>
                                        <td> {option[2]}</td>
                                        <td> {option[3]}</td>
                                        <td> {option[4]}</td>
                                        <td> {option[5]}</td>
                                        <td> {option[6]}</td>
                                        <td> {option[7]}</td>
                                        <td> {option[8]}</td>

                                    </tr>
                                ))}



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


MonthlyReport.propTypes = {
    classes: PropTypes.object.isRequired,
    queryOperativeEvent: PropTypes.func.isRequired,    //loadData: PropTypes.func.isRequired
    queryMeteoEvent: PropTypes.func.isRequired,
    reportGen: PropTypes.func.isRequired,
    reportGet_monthly: PropTypes.func.isRequired
}

MonthlyReport.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryOperativeEvent, queryMeteoEvent, reportGen, reportGet_monthly })(withRouter(withStyles(styles)(MonthlyReport)));