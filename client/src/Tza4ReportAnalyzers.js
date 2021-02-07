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
import { reportGen, reportXlsGen } from './actions/genReportActions';
import { reportGet_tza4_auto } from './actions/genReportActions';

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
    },
    alert_range: {
        backgroundColor: '#ffa500'
    },
    alert_empty: {
        backgroundColor: '#a5a5cc'
    }



});



class Tza4ReportAnalyzers extends React.Component {
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
            dateReportBegin: new Date(new Date().getFullYear(), new Date().getMonth(), 1, '0', '0').format('Y-MM-ddTHH:mm'),
            dateReportEnd: new Date().format('Y-MM-ddT') + '23:59',
            station_actual,
            station_name: '',
            sensors_actual,
            stationsList,
            sensorsList,
            dataList,
            selected: [],
            selection: [],
            selectAll: false,
            chemic: ['NO', 'NO2', 'NH3', 'SO2', 'H2S', 'O3', 'CO', 'CH2O', 'PM1', 'PM2.5', 'PM10', 'Пыль общая', 'бензол', 'толуол', 'этилбензол', 'м,п-ксилол', 'о-ксилол', 'хлорбензол', 'стирол', 'фенол'],
            chemical: [],
            options: [],
            barThickness: null,
            beginChartData: [],
            tza4: [],
            adds: [],
            data_4_report: [],
            tza4_meteo: [],
            checked_meteo: false,
            autoHideDuration: 3000

        };

        //first init
        // dateAddAction({ 'dateReportBegin': this.state.dateReportBegin });
        //dateAddAction({ 'dateReportEnd': this.state.dateReportEnd });
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

        // this.setState({ dateReportBegin: this.props.dateReportBegin, dateReportEnd: this.props.dateReportEnd });
        //this.loadData().then(data => this.setState({ sensorsList: data }));

        //tza report
        if (isEmpty(state.dateReportBegin)) {
            if (!isEmpty(this.props.dateReportBegin)) {
                params.period_from = new Date(new Date(this.props.dateReportBegin).getFullYear(), new Date(this.props.dateReportBegin).getMonth(), 1, '0', '0').format('Y-MM-ddTHH:mm');
                params.period_to = this.props.dateReportEnd;
            } else {
                params.period_from = this.state.dateReportBegin;
                params.period_to = this.state.dateReportEnd;
            }
        }
        else {
            params.period_from = state.dateReportBegin;
            params.period_to = state.dateReportEnd;
        };
        params.station = state.station_actual;
        params.station_name = state.station_name;
        params.chemical = state.chemical
        params.get = true;
        params.checked_meteo = this.state.checked_meteo;
        params.chemic = this.state.chemic;
        params.place = this.props.stationsList[0].place;
        params.lat = this.props.stationsList[0].latitude;
        params.lon = this.props.stationsList[0].longitude;


        this.setState({ isLoading: true });
        this.setState({ autoHideDuration: 200000, snack_msg: 'Дождитесь завершения операции...' });
        reportGet_tza4_auto(params).then(resp => {
            if (resp) {

                //let adds = resp.adds;
                let tza4_tmpl = resp.tza4;
                let data = resp.data;
                //let tza4_meteo = resp.meteo;

                this.setState({ 'data_4_report': data });
                // this.setState({ 'station_name': state.station_name });
                //this.setState({ 'adds': adds });
                //this.setState({ 'tza4_meteo': tza4_meteo });
                this.setState({ 'tza4': tza4_tmpl });

                this.setState({ isLoading: true });
                this.setState({ autoHideDuration: 3000, snack_msg: 'Данные успешно загружены...' });
            }
            else {
                this.setState({ isLoading: false })
                this.setState({ autoHideDuration: 3000, snack_msg: 'Данные отсутствуют...' })

            };


        });


    };


    handleSnackClose() {
        this.setState({ isLoading: false });
        this.setState({ isUpdated: false });

    };
    handleToggleMeteo(name, event) {
        this.setState({ [name]: event.target.checked });
    }

    componentWillMount() {


    }



    render() {
        const { classes, stationsList } = this.props;
        const { tza4_meteo, tza4, chemic } = this.state;
        const { adds } = this.state;
        const { snack_msg, isLoading, checked_meteo, autoHideDuration } = this.state;
        let place = '', lon = '', lat = '';
        if (stationsList.length > 0) {
            place = stationsList[0].place;
            lon = stationsList[0].longitude;
            lat = stationsList[0].latitude;

        }



        return (


            <Paper >
                <br />
                <MenuReport
                    {...this.props} snack_msg={snack_msg} isLoading={isLoading} autoHideDuration={autoHideDuration}
                    station_name={this.state.station_name}
                    station_actual={this.state.station_actual}
                    //dateReportBegin={this.state.dateReportBegin}
                    report_type='tza4_auto'
                    data_4_report={this.state.data_4_report}
                    handleReportChange={this.handleReportChange.bind(this)}
                    handleSnackClose={this.handleSnackClose.bind(this)}
                    handleToggleMeteo={this.handleToggleMeteo.bind(this)}
                    checked_meteo={checked_meteo}
                />

                <Typography component="div" style={{ padding: 2 * 1 }} id="tza4_report_auto">
                    <div style={{ textAlign: '-webkit-center', position: 'center' }}>

                        <table style={{ "width": '90%', textAlign: 'center' }} id="tza4_report_auto_legend">
                            <tbody>
                                <tr>
                                    <td >Легенда:&nbsp;&nbsp;&nbsp; </td>
                                    <td className=
                                        {classes['alert_empty']}>Нарушена достоверность - менее 75% данных</td>
                                    <td >&nbsp;&nbsp;&nbsp; </td>
                                    <td className=
                                        {classes['alert_range']}>Нарушена достоверность - выход за диапазон     </td>
                                    <td >&nbsp;&nbsp;&nbsp; </td>
                                    <td className=
                                        {classes['alert_macs1_ylw']}>Превышение менее 5 ПДК</td>
                                    <td > &nbsp;&nbsp;&nbsp;</td>
                                    <td className=
                                        {classes['alert_macs5_orng']}>Превышение 5 и менее 10 ПДК</td>
                                    <td >&nbsp;&nbsp;&nbsp; </td>
                                    <td className=
                                        {classes['alert_macs10_red']}>Превышение более 10 ПДК</td>


                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <table style={{ "width": '100%' }} id="tza4_report_table_header">
                        <tbody>
                            <tr>
                                <td style={{ 'width': '45%' }}>  </td>

                                <td style={{ 'width': '45%', 'textAlign': 'right' }}></td>
                                <td style={{ 'width': '5%' }}>&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>


                    <table border="1" width="100%" style={{ 'Align': 'center' }} className={classes._td} id="tza4_report_table_auto">


                        <tbody>
                            <tr>
                                <td colSpan="5">Пост&nbsp;</td>
                                <td colSpan="21">Год&nbsp;&nbsp;{new Date(this.props.dateReportBegin).format('Y')} &nbsp;&nbsp;&nbsp;&nbsp;месяц&nbsp;&nbsp;{new Date(this.props.dateReportBegin).format('MM')}</td>
                            </tr>
                            <tr>
                                <td colSpan="5">{this.state.station_name}</td>
                                <td>Координаты поста</td>
                                <td colSpan="20">Адрес: &nbsp;&nbsp;{place} &nbsp;&nbsp;&nbsp;&nbsp; широта: &nbsp;&nbsp;{lat}&nbsp;&nbsp;&nbsp;&nbsp;долгота: &nbsp;&nbsp;{lon}</td>
                            </tr>
                            <tr>
                                <td rowSpan="2">Дата</td>
                                <td rowSpan="2">Срок</td>
                                <td rowSpan="2">Темп., С</td>
                                <td colSpan="2">Ветер</td>
                                <td rowSpan="2">Отн. влаж., %</td>
                                <td colSpan="20">Концентрация примесей, мг/м3</td>
                            </tr>
                            <tr>
                                <td>напр., гр.</td>
                                <td>скорость, м/с</td>
                                <td>{chemic[0]}</td>
                                <td>{chemic[1]}</td>
                                <td>{chemic[2]}</td>
                                <td>{chemic[3]}</td>
                                <td>{chemic[4]}</td>
                                <td>{chemic[5]}</td>
                                <td>{chemic[6]}</td>
                                <td>{chemic[7]}</td>
                                <td>{chemic[8]}</td>
                                <td>{chemic[9]}</td>
                                <td>{chemic[10]}</td>
                                <td>{chemic[11]}</td>
                                <td>{chemic[12]}</td>
                                <td>{chemic[13]}</td>
                                <td>{chemic[14]}</td>
                                <td>{chemic[15]}</td>
                                <td>{chemic[16]}</td>
                                <td>{chemic[17]}</td>
                                <td>{chemic[18]}</td>
                                <td>{chemic[19]}</td>
                            </tr>

                            {(tza4) &&
                                tza4.map((time, i) => (
                                    time[i + 1].map((minutes_frame, j) => (
                                        <tr key={'tza_tbl_' + i + '_' + j}>
                                            <td style={{ 'width': '3%', 'fontSize': '14px' }}>{i + 1}</td>
                                            <td style={{ 'width': '3%', 'fontSize': '14px' }}>{minutes_frame.time}</td>
                                            <td style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame['tempr']}</td>
                                            <td style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame['dir']}</td>
                                            <td style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame['spd']}</td>
                                            <td style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame['hum']}</td>
                                            <td className=
                                                {classes[minutes_frame[0][chemic[0] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[0][chemic[0]]}</td>
                                            <td className=
                                                {classes[minutes_frame[1][chemic[1] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[1][chemic[1]]}</td>
                                            <td className=
                                                {classes[minutes_frame[2][chemic[2] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[2][chemic[2]]}</td>
                                            <td className=
                                                {classes[minutes_frame[3][chemic[3] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[3][chemic[3]]}</td>
                                            <td className=
                                                {classes[minutes_frame[4][chemic[4] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[4][chemic[4]]}</td>
                                            <td className=
                                                {classes[minutes_frame[5][chemic[5] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[5][chemic[5]]}</td>
                                            <td className=
                                                {classes[minutes_frame[6][chemic[6] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[6][chemic[6]]}</td>
                                            <td className=
                                                {classes[minutes_frame[7][chemic[7] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[7][chemic[7]]}</td>
                                            <td className=
                                                {classes[minutes_frame[8][chemic[8] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[8][chemic[8]]}</td>
                                            <td className=
                                                {classes[minutes_frame[9][chemic[9] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[9][chemic[9]]}</td>
                                            <td className=
                                                {classes[minutes_frame[10][chemic[10] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[10][chemic[10]]}</td>
                                            <td className=
                                                {classes[minutes_frame[11][chemic[11] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[11][chemic[11]]}</td>
                                            <td className=
                                                {classes[minutes_frame[12][chemic[12] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[12][chemic[12]]}</td>
                                            <td className=
                                                {classes[minutes_frame[13][chemic[13] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[13][chemic[13]]}</td>
                                            <td className=
                                                {classes[minutes_frame[14][chemic[14] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[14][chemic[14]]}</td>
                                            <td className=
                                                {classes[minutes_frame[15][chemic[15] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[15][chemic[15]]}</td>
                                            <td className=
                                                {classes[minutes_frame[16][chemic[16] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[16][chemic[16]]}</td>
                                            <td className=
                                                {classes[minutes_frame[17][chemic[17] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[17][chemic[17]]}</td>
                                            <td className=
                                                {classes[minutes_frame[18][chemic[18] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[18][chemic[18]]}</td>
                                            <td className=
                                                {classes[minutes_frame[19][chemic[19] + '_class']]} style={{ 'width': '3%', 'fontSize': '12px' }}>{minutes_frame[19][chemic[19]]}</td>
                                        </tr>))
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
        dateReportBegin: state.datePickers.dateReportBegin,
        dateReportEnd: state.datePickers.dateReportEnd

    };
}


Tza4ReportAnalyzers.propTypes = {
    classes: PropTypes.object.isRequired,
    queryOperativeEvent: PropTypes.func.isRequired,    //loadData: PropTypes.func.isRequired
    queryMeteoEvent: PropTypes.func.isRequired,
    reportGen: PropTypes.func.isRequired,
    reportGet_tza4_auto: PropTypes.func.isRequired
}

Tza4ReportAnalyzers.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryOperativeEvent, queryMeteoEvent, reportGen, reportXlsGen, reportGet_tza4_auto })(withRouter(withStyles(styles)(Tza4ReportAnalyzers)));