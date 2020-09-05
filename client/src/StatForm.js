import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';

import { queryMeteoEvent, queryFullEvent, queryLocalEvent } from './actions/queryActions';

import { Tabs, Tab } from 'material-ui/Tabs';
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

import { Bar, Line, Pie, Radar } from 'react-chartjs-2';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import "react-table/react-table.css";
import isNumber from 'lodash.isnumber';

import MenuStats from './menuStats';
import deepcopy from 'lodash';

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },


});



class StatsForm extends React.Component {
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

            dateTimeBegin: new Date().format('Y-MM-ddT') + '00:00:00',
            dateTimeEnd: new Date().format('Y-MM-ddT') + '23:59:59',

            station_actual: '',
            sensors_actual: [],
            stationsList,
            sensorsList,
            dataList,
            selected: [],
            selection: [],
            selectAll: false,
            chartData,
            locations: '',
            checkedLine: true,
            checkedMeteo: true,
            whatsRange: false, //false corresponds to % range of MACs
            isMeteo: false,//false corresponds to gazanalytic data
            pointStyle: 'crossRot',
            radius: 2,
            borderWidth: 1,
            borderDash: [5, 10],
            chemical: [],
            options: [],
            barThickness: null,
            beginChartData: [],
            meteoOptions: [],
            consentration: 0,
            rdrData: []
        };


        this.onClick = this.onSubmit.bind(this);
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


    handleRose = (name, event) => {
        const { dataList } = this.props;

        if (dataList.length > 0) {
            this.getRadarData(true, false);
        }
    }

    handleChangeExhaust = (name, event) => {
        this.setState({ [name]: event.target.value });

    };
    handleChangeParent(name, value) {
        this.setState({ [name]: value });

    };
    handleClickExhaust() {
        var _datasets = this.state.chartData.datasets;
        var { chartData } = this.state;
        var len = this.state.chartData.datasets.length;
        const _consentration = Number(this.state.consentration);
        if (len > 0) {
            //var _obj =Object.create( _datasets[len - 1]);
            //_obj=_datasets[len-1];
            _datasets[len - 1].label = 'ПДВ: ' + _consentration;
            _datasets[len - 1].hidden = false;
            _datasets[len - 1].data = [];
            _datasets[0].data.forEach((element, key) =>
                _datasets[len - 1].data.push(_consentration));

        }
        this.setState({ chartData });

    }
    ////////////    
    handleChangeToggle = (name, event) => {
        this.setState({ [name]: event.target.checked });
        if ((name === 'checkedMeteo')) {
            this.getChartData(event.target.checked, this.state.whatsRange);
        }
        if ((name === 'whatsRange')) {
            this.getChartData(this.state.checkedMeteo, event.target.checked);
        }

    };
    onSubmit(e) {
        e.preventDefault();

        alert('OK');

        //   this.props.createMyEvent(this.state);
    };

    onRefresh() {

        // e.preventDefault();

        this.loadData(1).then(data => {
            if (data) {
                this.setState({ dataList: this.setData(data) })
                this.setState({ isLoading: true })
                this.setState({ snack_msg: 'Данные успешно загружены...' })

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

        params.period_from = this.state.dateTimeBegin;
        params.period_to = this.state.dateTimeEnd;
        if (qtype === 1) {
            params.station = this.state.station_actual;
        }

        let data = await (this.props.queryFullEvent(params));
        //console.log(data);
        return data;
    };

    hideLine(state) {
        let { chartData } = this.state;
        let beginChartData = this.state.beginChartData;
        let arr = [];
        let keys = Object.keys(state);
        let name = keys[0];
        let obj = state[name];
        //let  options  = state;
        //var chrt = document.getElementById('line-chart');//.getContext("2d");
        //chartData.datasets.splice(1, );
        obj.forEach((element, indx) => {
            // beginChartData.datasets[indx].showLine = element.visible;
            //if (!element.visible) {
            //    let _indx = chartData.datasets.indexOf(beginChartData.datasets[indx]);
            //    chartData.datasets.splice(_indx, 1);

            //chartData.datasets[indx].radius = 0;
            //chartData.datasets[indx].pointRadius = 0;
            // chartData.datasets[indx].barThickness = 0;
            // chartData.datasets[indx].showLine = !chartData.datasets[indx].showLine;

            if (element.visible) {
                // if (beginChartData[indx]._meta) beginChartData[indx]._meta = {};
                // arr.push(beginChartData[indx]);

                //chartData.datasets[indx].radius = this.state.radius;
                //if (chartData.datasets[indx].borderDash.length == 0)
                //   chartData.datasets[indx].pointRadius = this.state.radius;
                chartData.datasets[indx].hidden = false;
                // chartData.datasets[indx].showLine = !chartData.datasets[indx].showLine;


                //  chartData.datasets[indx].barThickness=null;

            } else {
                chartData.datasets[indx].hidden = true;
            };

        });
        //  let obj = { labels: [], datasets: [] };
        // let labels = '';
        // Object.assign(obj.labels, chartData.labels);

        //obj.datasets.splice(1, );

        //Object.assign(obj.datasets, arr);
        this.setState({ [name]: obj });//change checkbox state - options and meteoOptions

        this.setState({ chartData });
        // chrt.update();
    };



    getRadarData(_state, _windData) {
        // Ajax calls here
        const { dataList } = this.props;
        const { meteoList } = this.props;
        const { sensors_actual } = this.state;
        const { sensorsList } = this.props;
        const { selectedSensors } = this.props;
        const { macs } = this.props;
        const { namestation } = this.state.stationsList[0].namestation;


        let beginChartData = [];
        let obj = [];
        let _boderColor = 'rgba(102, 0, 204, 0.6)';
        let colour_pairs = [];
        let options = [];//checkbox init state
        // Chart.defaults.global.layout.padding.top = 50;

        let chartData = {
            labels: ['С', ' ', 'ССВ', ' ', 'СВ', ' ', 'СВВ', ' ', 'В', ' ', 'ВЮВ', ' ', 'ЮВ', ' ', 'ЮВЮ', ' ', 'Ю', ' ', 'ЮЮЗ', ' ', 'ЮЗ', ' ', 'ЮЗЗ', ' ', 'З', ' ',
                'ЗСЗ', ' ', 'СЗ', ' ', 'СЗС', ' '],
            //0-27, 28 - 45, 46 - 90
            datasets: [

            ],


        };

        let chartOptions = {
            responsive: true,
            title: {
                display: true,
                text: 'Min and Max Settings'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        // the data minimum used for determining the ticks is Math.min(dataMin, suggestedMin)
                        suggestedMin: 10,
                        // the data maximum used for determining the ticks is Math.max(dataMax, suggestedMax)
                        suggestedMax: 100
                    }
                }]
            }
        };

        var N = 0, NNEL = 0, NNE = 0, NNER = 0, NE = 0, NEEL = 0, NEE = 0, NEER = 0, E = 0, ESEL = 0, ESE = 0, ESER = 0, SE = 0, SESL = 0,
            SES = 0, SESR = 0, S = 0, SSWL = 0, SSW = 0, SSWR = 0, SW = 0, SWWL = 0, SWW = 0, SWWR = 0, W = 0, WNWL = 0, WNW = 0, WNWR = 0,
            NW = 0, NWNL = 0, NWN = 0, NWNR = 0, SUM = dataList.length;
        if (_state) {
            dataList.forEach((item, indx) => {
                if ((item.measure >= 0) && (item.measure <= 11.2))
                    N++;
                if ((item.measure > 11.2) && (item.measure <= 22.4))
                    NNEL++;
                if ((item.measure > 22.4) && (item.measure <= 33.6))
                    NNE++;
                if ((item.measure > 33.6) && (item.measure <= 44.8))
                    NNER++;
                if ((item.measure > 44.8) && (item.measure <= 56.2))
                    NE++;
                if ((item.measure > 56.2) && (item.measure <= 67.4))
                    NEEL++;
                if ((item.measure > 67.4) && (item.measure <= 78.6))
                    NEE++;
                if ((item.measure > 78.6) && (item.measure <= 89.8))
                    NEER++;
                if ((item.measure > 89.8) && (item.measure <= 101.2))
                    E++;
                if ((item.measure > 101.2) && (item.measure <= 112.4))
                    ESEL++;
                if ((item.measure > 112.4) && (item.measure <= 123.6))
                    ESE++;
                if ((item.measure > 123.6) && (item.measure <= 134.8))
                    ESER++;
                if ((item.measure > 134.8) && (item.measure <= 145.2))
                    SE++;
                if ((item.measure > 145.2) && (item.measure <= 156.4))
                    SESL++;
                if ((item.measure > 156.4) && (item.measure <= 167.6))
                    SES++;
                if ((item.measure > 167.6) && (item.measure <= 178.8))
                    SESR++;
                if ((item.measure > 178.8) && (item.measure <= 190.2))
                    S++;
                if ((item.measure > 190.2) && (item.measure <= 201.4))
                    SSWL++;
                if ((item.measure > 201.4) && (item.measure <= 212.6))
                    SSW++;
                if ((item.measure > 212.6) && (item.measure <= 223.8))
                    SSWR++;
                if ((item.measure > 223.8) && (item.measure <= 235.2))
                    SW++;
                if ((item.measure > 235.2) && (item.measure <= 246.4))
                    SWWL++;
                if ((item.measure > 246.4) && (item.measure <= 257.6))
                    SWW++;
                if ((item.measure > 257.6) && (item.measure <= 268.8))
                    SWWR++;
                if ((item.measure > 268.8) && (item.measure <= 280.2))
                    W++;
                if ((item.measure > 280.2) && (item.measure <= 291.4))
                    WNWL++;
                if ((item.measure > 291.4) && (item.measure <= 302.6))
                    WNW++;
                if ((item.measure > 302.6) && (item.measure <= 313.8))
                    WNWR++;
                if ((item.measure > 313.8) && (item.measure <= 325.2))
                    NW++;
                if ((item.measure > 325.2) && (item.measure <= 336.4))
                    NWNL++;
                if ((item.measure > 336.4) && (item.measure <= 347.6))
                    NWN++;
                if ((item.measure > 347.6) && (item.measure <= 358.8))
                    NWNR++;
                if ((item.measure > 358.8) && (item.measure <= 360))
                    N++;

            })
            chartData.datasets.push({
                label: 'Загрузите данные',
                fill: false,
                borderColor: _boderColor,
                backgroundColor: _boderColor,
                pointBorderColor: '#fff',
                pointBackgroundColor: 'rgba(255,99,132,1)',
                data: [Number.parseInt(N / SUM * 100), Number.parseInt(NNEL / SUM * 100), Number.parseInt(NNE / SUM * 100), Number.parseInt(NNER / SUM * 100),
                Number.parseInt(NE / SUM * 100), Number.parseInt(NEEL / SUM * 100), Number.parseInt(NEE / SUM * 100), Number.parseInt(NEER / SUM * 100),
                Number.parseInt(E / SUM * 100), Number.parseInt(ESEL / SUM * 100), Number.parseInt(ESE / SUM * 100), Number.parseInt(ESER / SUM * 100), Number.parseInt(SE / SUM * 100),
                Number.parseInt(SESL / SUM * 100), Number.parseInt(SES / SUM * 100), Number.parseInt(SESR / SUM * 100), Number.parseInt(S / SUM * 100), Number.parseInt(SSWL / SUM * 100), Number.parseInt(SSW / SUM * 100),
                Number.parseInt(SSWR / SUM * 100), Number.parseInt(SW / SUM * 100), Number.parseInt(SWWL / SUM * 100), Number.parseInt(SWW / SUM * 100), Number.parseInt(SWWR / SUM * 100), Number.parseInt(W / SUM * 100),
                Number.parseInt(WNWL / SUM * 100), Number.parseInt(WNW / SUM * 100), Number.parseInt(WNWR / SUM * 100), Number.parseInt(NW / SUM * 100), Number.parseInt(NWNL / SUM * 100), Number.parseInt(NWN / SUM * 100),
                Number.parseInt(NWNR / SUM * 100)]
            });
            if (_state) chartData.datasets[0].label = dataList[0].typemeasure;
        }
        else {
            //SUM = Number.parseFloat(0.0);
            var SUM_N = Number.parseFloat(1.0), SUM_NNEL = Number.parseFloat(1.0), SUM_NNE = Number.parseFloat(1.0), SUM_NNER = Number.parseFloat(1.0), SUM_NE = Number.parseFloat(1.0), SUM_NEEL = Number.parseFloat(1.0), SUM_NEE = Number.parseFloat(1.0), SUM_NEER = Number.parseFloat(1.0), SUM_E = Number.parseFloat(1.0), SUM_ESEL = Number.parseFloat(1.0), SUM_ESE = Number.parseFloat(1.0), SUM_ESER = Number.parseFloat(1.0),
                SUM_SE = Number.parseFloat(1.0), SUM_SESL = Number.parseFloat(1.0), SUM_SES = Number.parseFloat(1.0), SUM_SESR = Number.parseFloat(1.0), SUM_S = Number.parseFloat(1.0), SUM_SSWL = Number.parseFloat(1.0), SUM_SSW = Number.parseFloat(1.0), SUM_SSWR = Number.parseFloat(1.0), SUM_SW = Number.parseFloat(1.0), SUM_SWWL = Number.parseFloat(1.0), SUM_SWW = Number.parseFloat(1.0),
                SUM_SWWR = Number.parseFloat(1.0), SUM_W = Number.parseFloat(1.0), SUM_WNWL = Number.parseFloat(1.0), SUM_WNW = Number.parseFloat(1.0), SUM_WNWR = Number.parseFloat(1.0), SUM_NW = Number.parseFloat(1.0), SUM_NWNL = Number.parseFloat(1.0), SUM_NWN = Number.parseFloat(1.0), SUM_NWNR = Number.parseFloat(1.0);

            var _firsttime = _windData[0].date_time;

            _windData.forEach((item, indx) => {


                let filter = dataList.filter((_item, i, arr) => {
                    return ((_item.date_time > _firsttime) && (_item.date_time <= item.date_time))
                });
                _firsttime = item.date_time;

                if (!isEmpty(filter)) {
                    //SUM += Number.parseFloat(filter[0].measure);
                    filter.forEach((_elem, _idx) => {
                        if ((item.measure >= 0) && (item.measure <= 11.2)) {
                            N += Number.parseFloat(_elem.measure);
                            SUM_N++;
                        }
                        if ((item.measure > 11.2) && (item.measure <= 22.4)) {
                            NNEL += Number.parseFloat(_elem.measure);
                            SUM_NNEL++;
                        }
                        if ((item.measure > 22.4) && (item.measure <= 33.6)) {
                            NNE += Number.parseFloat(_elem.measure);
                            SUM_NNE++;

                        }
                        if ((item.measure > 33.6) && (item.measure <= 44.8)) {
                            NNER += Number.parseFloat(_elem.measure);
                            SUM_NNER++;

                        }
                        if ((item.measure > 44.8) && (item.measure <= 56.2)) {
                            NE += Number.parseFloat(_elem.measure);
                            SUM_NE++;

                        }
                        if ((item.measure > 56.2) && (item.measure <= 67.4)) {
                            NEEL += Number.parseFloat(_elem.measure);
                            SUM_NEEL++;

                        }
                        if ((item.measure > 67.4) && (item.measure <= 78.6)) {
                            NEE += Number.parseFloat(_elem.measure);
                            SUM_NEE++;

                        }
                        if ((item.measure > 78.6) && (item.measure <= 89.8)) {
                            NEER += Number.parseFloat(_elem.measure);
                            SUM_NEER++;

                        }
                        if ((item.measure > 89.8) && (item.measure <= 101.2)) {
                            E += Number.parseFloat(_elem.measure);
                            SUM_E++;

                        }
                        if ((item.measure > 101.2) && (item.measure <= 112.4)) {
                            ESEL += Number.parseFloat(_elem.measure);
                            SUM_ESEL++;

                        }
                        if ((item.measure > 112.4) && (item.measure <= 123.6)) {
                            ESE += Number.parseFloat(_elem.measure);
                            SUM_ESE++;

                        }
                        if ((item.measure > 123.6) && (item.measure <= 134.8)) {
                            ESER += Number.parseFloat(_elem.measure);
                            SUM_ESER++;

                        }
                        if ((item.measure > 134.8) && (item.measure <= 145.2)) {
                            SE += Number.parseFloat(_elem.measure);
                            SUM_SE++;

                        }
                        if ((item.measure > 145.2) && (item.measure <= 156.4)) {
                            SESL += Number.parseFloat(_elem.measure);
                            SUM_SESL++;

                        }
                        if ((item.measure > 156.4) && (item.measure <= 167.6)) {
                            SES += Number.parseFloat(_elem.measure);
                            SUM_SES++;

                        }
                        if ((item.measure > 167.6) && (item.measure <= 178.8)) {
                            SESR += Number.parseFloat(_elem.measure);
                            SUM_SESR++;

                        }
                        if ((item.measure > 178.8) && (item.measure <= 190.2)) {
                            S += Number.parseFloat(_elem.measure);
                            SUM_S++;

                        }
                        if ((item.measure > 190.2) && (item.measure <= 201.4)) {
                            SSWL += Number.parseFloat(_elem.measure);
                            SUM_SSWL++;

                        }
                        if ((item.measure > 201.4) && (item.measure <= 212.6)) {
                            SSW += Number.parseFloat(_elem.measure);
                            SUM_SSW++;

                        }
                        if ((item.measure > 212.6) && (item.measure <= 223.8)) {
                            SSWR += Number.parseFloat(_elem.measure);
                            SUM_SSWR++;

                        }
                        if ((item.measure > 223.8) && (item.measure <= 235.2)) {
                            SW += Number.parseFloat(_elem.measure);
                            SUM_SW++;

                        }
                        if ((item.measure > 235.2) && (item.measure <= 246.4)) {
                            SWWL += Number.parseFloat(_elem.measure);
                            SUM_SWWL++;

                        }
                        if ((item.measure > 246.4) && (item.measure <= 257.6)) {
                            SWW += Number.parseFloat(_elem.measure);
                            SUM_SWW++;

                        }
                        if ((item.measure > 257.6) && (item.measure <= 268.8)) {
                            SWWR += Number.parseFloat(_elem.measure);
                            SUM_SWWR++;

                        }
                        if ((item.measure > 268.8) && (item.measure <= 280.2)) {
                            W += Number.parseFloat(_elem.measure);
                            SUM_W++;

                        }
                        if ((item.measure > 280.2) && (item.measure <= 291.4)) {
                            WNWL += Number.parseFloat(_elem.measure);
                            SUM_WNWL++;

                        }
                        if ((item.measure > 291.4) && (item.measure <= 302.6)) {
                            WNW += Number.parseFloat(_elem.measure);
                            SUM_WNW++;

                        }
                        if ((item.measure > 302.6) && (item.measure <= 313.8)) {
                            WNWR += Number.parseFloat(_elem.measure);
                            SUM_WNWR++;

                        }
                        if ((item.measure > 313.8) && (item.measure <= 325.2)) {
                            NW += Number.parseFloat(_elem.measure);
                            SUM_NW++;

                        }
                        if ((item.measure > 325.2) && (item.measure <= 336.4)) {
                            NWNL += Number.parseFloat(_elem.measure);
                            SUM_NWNL++;

                        }

                        if ((item.measure > 336.4) && (item.measure <= 347.6)) {
                            NWN += Number.parseFloat(_elem.measure);
                            SUM_NWN++;

                        }
                        if ((item.measure > 347.6) && (item.measure <= 358.8)) {
                            NWNR += Number.parseFloat(_elem.measure);
                            SUM_NWNR++;
                        }
                        if ((item.measure > 358.8) && (item.measure <= 360)) {
                            N += Number.parseFloat(_elem.measure);
                            SUM_N++;

                        }
                    });
                }

            })
            chartData.datasets.push({
                label: 'Загрузите данные',
                fill: false,
                borderColor: _boderColor,
                backgroundColor: _boderColor,
                pointBorderColor: '#fff',
                pointBackgroundColor: 'rgba(255,99,132,1)',
                data: [Number.parseFloat(N / SUM_N), Number.parseFloat(NNEL / SUM_NNEL), Number.parseFloat(NNE / SUM_NNE), Number.parseFloat(NNER / SUM_NNER),
                Number.parseFloat(NE / SUM_NE), Number.parseFloat(NEEL / SUM_NEEL), Number.parseFloat(NEE / SUM_NEE), Number.parseFloat(NEER / SUM_NEER),
                Number.parseFloat(E / SUM_E), Number.parseFloat(ESEL / SUM_ESEL), Number.parseFloat(ESE / SUM_ESE), Number.parseFloat(ESER / SUM_ESER), Number.parseFloat(SE / SUM_SE),
                Number.parseFloat(SESL / SUM_SESL), Number.parseFloat(SES / SUM_SES), Number.parseFloat(SESR / SUM_SESR), Number.parseFloat(S / SUM_S), Number.parseFloat(SSWL / SUM_SSWL), Number.parseFloat(SSW / SUM_SSW),
                Number.parseFloat(SSWR / SUM_SSWR), Number.parseFloat(SW / SUM_SW), Number.parseFloat(SWWL / SUM_SWWL), Number.parseFloat(SWW / SUM_SWW), Number.parseFloat(SWWR / SUM_SWWR), Number.parseFloat(W / SUM_W),
                Number.parseFloat(WNWL / SUM_WNWL), Number.parseFloat(WNW / SUM_WNW), Number.parseFloat(WNWR / SUM_WNWR), Number.parseFloat(NW / SUM_NW), Number.parseFloat(NWNL / SUM_NWNL), Number.parseFloat(NWN / SUM_NWN),
                Number.parseFloat(NWNR / SUM_NWNR)]
            });

            chartData.datasets[0].label = dataList[0].typemeasure;

            //console.log('SUM =', SUM)

            /*   console.log("data = ", Number.parseFloat(N / SUM_N ), Number.parseFloat(NNEL / SUM_NNEL ), Number.parseFloat(NNE / SUM_NNE ), Number.parseFloat(NNER / SUM_NNER ),
                   Number.parseFloat(NE / SUM_NE ), Number.parseFloat(NEEL / SUM_NEEL ), Number.parseFloat(NEE / SUM_NEE ), Number.parseFloat(NEER / SUM_NEER ),
                   Number.parseFloat(E / SUM_E ), Number.parseFloat(ESEL / SUM_ESEL ), Number.parseFloat(ESE / SUM_ESE ), Number.parseFloat(ESER / SUM_ESER ), Number.parseFloat(SE / SUM_SE ),
                   Number.parseFloat(SESL / SUM_SESL ), Number.parseFloat(SES / SUM_SES ), Number.parseFloat(SESR / SUM_SESR ), Number.parseFloat(S / SUM_S ), Number.parseFloat(SSWL / SUM_SSWL ), Number.parseFloat(SSW / SUM_SSW ),
                   Number.parseFloat(SSWR / SUM_SSWR ), Number.parseFloat(SW / SUM_SW ), Number.parseFloat(SWWL / SUM_SWWL ), Number.parseFloat(SWW / SUM_SWW ), Number.parseFloat(SWWR / SUM_SWWR ), Number.parseFloat(W / SUM_W ),
                   Number.parseFloat(WNWL / SUM_WNWL ), Number.parseFloat(WNW / SUM_WNW ), Number.parseFloat(WNWR / SUM_WNWR ), Number.parseFloat(NW / SUM_NW ), Number.parseFloat(NWNL / SUM_NWNL), Number.parseFloat(NWN / SUM_NWN),
                   Number.parseFloat(NWNR / SUM_NWNR ))*/
        }
        this.setState({ checkedLine: false });

        this.setState({ rdrData: chartData });

    }
    getChartData(_state, _range) {
        // Ajax calls here
        const { dataList } = this.props;
        const { meteoList } = this.props;
        const { sensors_actual } = this.state;
        const { sensorsList } = this.props;
        const { selectedSensors } = this.props;
        const { macs } = this.props;
        const { meteoOptions } = this.props;
        const stateOptions = this.state.options;
        const stateMeteoOption = this.state.meteoOptions;

        let beginChartData = [];
        let obj = [];
        let _boderColor = 'rgba(255, 99, 132, 0.6)';
        let colour_pairs = [];
        let options = [];//checkbox init state
        // Chart.defaults.global.layout.padding.top = 50;

        let chartData = {
            labels: ['0', '1', '2', '3', '4', '5'],

            datasets: [
                {
                    label: 'Загрузите данные',
                    fill: false,
                    borderColor: _boderColor,
                    backgroundColor: _boderColor,

                    data: [
                        0,
                        1,
                        0,
                        1,
                        0,
                        3
                    ],

                }
            ],


        };

        let chartOptions = {
            responsive: true,
            title: {
                display: true,
                text: 'Min and Max Settings'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        // the data minimum used for determining the ticks is Math.min(dataMin, suggestedMin)
                        suggestedMin: 10,
                        // the data maximum used for determining the ticks is Math.max(dataMax, suggestedMax)
                        suggestedMax: 10
                    }
                }]
            }
        };



        let title = '';
        let _timeaxis = [];
        if (_state) {
            if (dataList.length > 1) {
                let tmp = [];
                let _tmp = '';
                let filter = '';
                let i = 0;
                let label = '';
                let counter = 0;
                let chemical = [];//Chemical substance for MACs

                if (sensorsList.length > 0) {

                    chartData.datasets[0].data = [];
                    if (sensors_actual.length > 1) {
                        sensors_actual.forEach(element => {

                            dataList.forEach((item, indx) => {
                                if (isEmpty(filter)) {
                                    filter = sensorsList.filter((_item, i, arr) => {
                                        return _item.serialnum === element;
                                    });
                                };
                                if (filter[0].serialnum) {
                                    _tmp = item[filter[0].serialnum];

                                };

                                if (counter === 0) {
                                    if (indx > 0)
                                        _timeaxis.push(item['date_time']);
                                };

                                if (isNumber(_tmp)) {

                                    if (_range) {
                                        tmp.push(_tmp);
                                    } else {
                                        let _filter = macs.filter((_item, i, arr) => {
                                            return _item.chemical === filter[0].typemeasure;
                                        });
                                        if (!isEmpty(_filter))
                                            tmp.push(_tmp / _filter[0].max_m * 100); //normalize to 100 % range of macs
                                    };


                                    // tmp.push(_tmp);

                                } else {
                                    if (i === 0) label = filter[0].typemeasure;//_tmp;
                                };

                                i++;
                            });


                            let n = '#' + (filter[0].def_colour.toString(16));
                            let m = '#' + ((filter[0].def_colour + 20).toString(16));
                            colour_pairs.push({
                                sensor: filter[0].typemeasure,
                                colour: n
                            });

                            let emptydatasets =
                            {
                                label: label,
                                fill: false,
                                borderColor: n,
                                backgroundColor: m,
                                data: tmp,
                                pointStyle: this.state.pointStyle,
                                radius: this.state.radius,
                                borderWidth: this.state.borderWidth,
                                borderDash: [],

                            };
                            //chartData.datasets = obj;
                            if (!isEmpty(title)) {
                                title += ',';
                            };
                            title = title + ' ' + label;
                            if (_range) {
                                title += ' (' + filter[0].unit_name + ')';
                            } else {
                                title += ' (% от ПДК)';
                            };
                            //this.setState({ 'locations': title });
                            //if (isEmpty(stateOptions[0])) {//if first rendering - not simple switch
                            options.push({ chemical: filter[0].typemeasure, visible: true, id: counter });
                            //} else {
                            emptydatasets['hidden'] = !stateOptions[counter].visible;
                            //};
                            obj.push(emptydatasets);

                            label = '';
                            tmp = [];

                            filter = '';
                            i = 0;

                            counter++;
                        });

                    };
                }; //end multidata section
                if (sensors_actual.length === 1) {
                    let _filter = macs.filter((_item, i, arr) => {
                        return _item.chemical === dataList[0].typemeasure;
                    });
                    dataList.forEach(element => {
                        if (_range) {
                            tmp.push(element.measure);
                        } else {
                            if (!isEmpty(_filter))
                                tmp.push(element.measure / _filter[0].max_m * 100); //normalize to 100 % range of macs
                        };
                        _timeaxis.push(element['date_time']);

                    });
                    filter = sensorsList.filter((_item, i, arr) => {
                        return _item.serialnum === sensors_actual[0];
                    });
                    let n = '#' + (filter[0].def_colour.toString(16));
                    let m = '#' + ((filter[0].def_colour + 20).toString(16));
                    let emptydatasets =
                    {
                        label: dataList[0].typemeasure,
                        fill: false,
                        borderColor: n,
                        backgroundColor: m,
                        data: tmp,
                        pointStyle: this.state.pointStyle,
                        radius: this.state.radius,
                        borderWidth: this.state.borderWidth,
                        borderDash: [],

                    };

                    colour_pairs.push({
                        sensor: dataList[0].typemeasure,
                        colour: n
                    });
                    if (_range) {
                        title = dataList[0].typemeasure + ' (' + dataList[0].unit_name + ')';
                    } else {
                        title = dataList[0].typemeasure + ' (в процентах от ПДК)';

                    }

                    // if (isEmpty(stateOptions[0])) {
                    options.push({ chemical: (dataList[0].typemeasure), visible: true, id: 0 });
                    //} else {
                    // emptydatasets['hidden'] = !stateOptions[0].visible;
                    //};

                    obj.push(emptydatasets);
                    counter = 1;


                };



                //macs creation
                let obj_macs = [];
                let _arr = [];
                i = 0;
                // if (!this.state.isMeteo) {

                selectedSensors.forEach(element => {
                    let filter = macs.filter((_item, i, arr) => {
                        return _item.chemical === element.typemeasure;
                    });

                    if (!isEmpty(filter[0])) {
                        if (_range) {

                            _arr = new Array(_timeaxis.length + 1).join(filter[0].max_m + '|').split('|');
                        } else {
                            _arr = new Array(_timeaxis.length + 1).join(100 + '|').split('|'); //scaling macs to 100%
                        }
                        let _colour = '#' + element.def_colour.toString(16);


                        let emptydatasets =
                        {
                            label: filter[0].chemical + ' ПДК',
                            fill: false,
                            borderColor: _colour,
                            backgroundColor: _colour,
                            data: _arr,
                            pointStyle: 'circle',
                            radius: 0,
                            borderWidth: this.state.borderWidth + 2,
                            borderDash: [10, 10],
                            hidden: false
                        };


                        //if (isEmpty(stateOptions[0])) {
                        options.push({ chemical: (element.typemeasure + ' ПДК'), visible: true, id: selectedSensors.length + i });
                        //} else {
                        //   emptydatasets['hidden'] = !stateOptions[counter + i].visible;
                        //};
                        obj_macs.push(emptydatasets);

                        i++;
                    };
                });
                //} else {
                //   this.setState({options: meteoOptions });

                // }

                obj = obj.concat(obj_macs);
                /* var _tmp = [];
                 let _emptydatasets =
                 {
                     label: 'ПДВ',
                     fill: false,
                     borderColor: '#000000',
                     backgroundColor: '#000000',
                     data: [],
                     pointStyle: 'circle',
                     radius: 0,
                     borderWidth: this.state.borderWidth + 2,
                     borderDash: [10, 10],
                     hidden: true
                 };
    
                 _tmp.push(_emptydatasets);
                 obj = obj.concat(_tmp);*/

                Object.assign(beginChartData, obj);
                Object.assign(chartData.datasets, obj);
                Object.assign(chartData.labels, _timeaxis);

            }; // end fetch section when data is exist
            //console.log('data = ', chartData.datasets[0].data);


            this.setState({ beginChartData });

            this.setState({ chartData });

            // if (isEmpty(this.state.options[0]))
            this.setState({ options });

            this.setState({ 'locations': title });
            this.setState({ checkedLine: true });
            this.setState({ dateTimeBegin: new Date(dataList[0].date_time).format('dd-MM-Y') });
            this.setState({ dateTimeEnd: new Date(dataList[dataList.length - 1].date_time).format('dd-MM-Y') });

        } else //end gazoanalitic section
        {//begin of meteosection
            if (meteoList.length > 0) {
                let tmp = [];
                let _tmp = '';
                let filter = '';
                let i = 0;
                let label = '';
                let counter = 0;
                let chemical = [];//Chemical substance for MACs


                chartData.datasets[0].data = [];
                meteoOptions.forEach(element => {

                    meteoList.forEach((item, indx) => {


                        if (counter === 0) {
                            // if (indx > 0)
                            _timeaxis.push(item['date_time']);
                        };
                        if (toUpper(item[element.id]) != toUpper('null')) {
                            tmp.push(item[element.id]);
                        } else {
                            tmp.push('0');
                        };


                        //chartData.datasets = obj;


                    });
                    let n = 14104600 + counter * 8191;
                    let m = '#' + (n.toString(16));

                    n += 40;
                    n = '#' + (n.toString(16))
                    // let obj = chartData.datasets.concat(emptydatasets);
                    let emptydatasets =
                    {
                        label: element.header,
                        fill: false,
                        borderColor: n,
                        backgroundColor: m,
                        data: tmp,
                        pointStyle: this.state.pointStyle,
                        radius: this.state.radius,
                        borderWidth: this.state.borderWidth,
                        borderDash: [],
                        hidden: (!element.visible)
                    };
                    if (!isEmpty(stateMeteoOption[0]))
                        emptydatasets['hidden'] = !stateMeteoOption[counter].visible;

                    obj.push(emptydatasets);

                    tmp = [];



                    counter++;
                });
                Object.assign(chartData.datasets, obj);
                Object.assign(chartData.labels, _timeaxis);
                title = 'метеонаблюдений';
                //if (isEmpty(stateMeteoOption[0])) {
                this.setState({ meteoOptions });
                //};

            };

            this.setState({ chartData });

            if (!isEmpty(title)) {
                this.setState({ 'locations': title });
            } else {
                this.setState({ 'locations': '- данные отсутствуют...' });
            };

        };


    };

    handleClickPdf() {
        const { namestation } = this.state.stationsList[0];

        var cnvs = this.refs.chrts.chartInstance.canvas;
        console.log(this.refs.chrts);
        var img = cnvs.toDataURL("image/png").replace("image/png", "image/octet-stream");
        //var button = document.getElementById('sv-bt');
        //button.download = img;
        var link = document.getElementById('link_report');

        if (this.state.checkedLine) {
            link.setAttribute('download', 'График ' + this.state.locations + '_' + this.state.dateTimeEnd + '.png');
        } else {

            if (this.state.dateTimeBegin == this.state.dateTimeEnd) {

                link.setAttribute('download', 'Распределение_' + this.state.chartData.datasets[0].label + '_на_' + namestation + '_по_сторонам_света_за_' + this.state.dateTimeEnd + '.png');
            } else {
                link.setAttribute('download', 'Распределение_' + this.state.chartData.datasets[0].label + '_на_' + namestation + '_по_сторонам_света_с_' + this.state.dateTimeBegin + '_по_' + this.state.dateTimeEnd + '.png');

            }
        }
        link.setAttribute('href', img);
        link.click();
    };

    componentWillMount() {
        this.getChartData(false, false);
        //this.setState({ checkedMeteo: this.props.checkedMeteo });
        this.loadData(0).then(_data => {
            this.setState({ stationsList: _data });



        })

    }



    render() {
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, stationsList } = this.state;
        const { loadData } = this.props;
        const { classes } = this.props;
        const { sensorsList } = this.props;
        let titles = {
            display: this.props.displayTitle,
            text: 'Данные отсутствуют - сформируйте запрос',
            fontSize: 15
        };
        let _title = '';



        if (isEmpty(this.state.locations)) {
            if (this.state.checkedMeteo) { _title = 'График данных не загружен...' }
            else {
                _title = 'График метеоданных не загружен...'
            };
        } else {
            if (this.state.checkedLine) {
                _title = 'График ' + this.state.locations;
            } else {

                _title = 'Распределение ' + this.state.chartData.datasets[0].label + ' на ' + stationsList[0].namestation;

                if (this.state.dateTimeBegin == this.state.dateTimeEnd) {
                    _title += ' за ' + this.state.dateTimeBegin;
                } else {
                    _title += ' c ' + this.state.dateTimeBegin + ' по ' + this.state.dateTimeEnd;

                }
            }
        };
        titles = {
            display: this.props.displayTitle,
            text: _title,
            fontSize: 15
        };


        return (


            <Paper className={classes.root}>
                <a id="link_report"></a>
                <MenuStats
                    {...this.state}
                    handleChangeParent={this.handleChangeParent.bind(this)}
                    handleChangeToggle={this.handleChangeToggle.bind(this)}
                    handleClickPdf={this.handleClickPdf.bind(this)}
                    hideLine={this.hideLine.bind(this)}
                    handleClickPdf={this.handleClickPdf.bind(this)}
                    queryFullEvent={this.props.queryFullEvent.bind(this)}
                    queryLocalEvent={this.props.queryLocalEvent.bind(this)}
                    getChartData={this.getChartData.bind(this)}
                    handleRose={this.handleRose.bind(this)}
                    getRadarData={this.getRadarData.bind(this)}
                    //handleClickExhaust={this.handleClickExhaust.bind(this)}
                    value="checkedLine"
                //valueMeteo="checkedMeteo"
                />

                {(this.state.checkedLine) &&
                    <Line
                        ref='chrts'
                        data={this.state.chartData}
                        options={{
                            title: titles,
                            legend: {
                                display: this.props.displayLegend,
                                position: this.props.legendPosition
                            }
                        }}
                    />}
                {(!this.state.checkedLine) &&
                    <Radar
                        ref='chrts'
                        data={this.state.rdrData}
                        options={{
                            title: titles,
                            legend: {
                                display: this.props.displayLegend,
                                position: this.props.legendPosition
                            }
                        }}
                    />}

            </Paper >
        );
    }
}

function mapStateToProps(state) {
    let sensors = '';
    let station = '';
    let tmp = '';
    if (state.activeStationsList[1]) {
        tmp = state.activeStationsList.slice(state.activeStationsList.length - 1);
        sensors = tmp[0].sensors;

    };

    if (state.activeStationsList[0]) {
        station = state.activeStationsList[0].station;

    };
    if (!isEmpty(station)) { tmp = true } else { tmp = false };


    return {
        sensorsList: state.activeSensorsList,
        dataList: state.dataList,
        station_actual: station,
        sensors_actual: sensors,
        macs: state.macsList,
        selectedSensors: state.sensorsList,
        checkedMeteo: tmp,
        meteoList: state.meteoList

    };
}


StatsForm.propTypes = {
    queryMeteoEvent: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
    //loadData: PropTypes.func.isRequired
}

StatsForm.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryMeteoEvent, queryFullEvent, queryLocalEvent })(withRouter(withStyles(styles)(StatsForm)));