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
import { dateAddReportAction } from './actions/dateAddAction';


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


class DailyReport extends React.Component {
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
        let today = new Date();

        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            isLoading: false,
            dateReportBegin: new Date().format('Y-MM-ddT') + '00:00',
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


        //  dateAddAction({ 'dateReportBegin': this.state.dateReportBegin });
        // dateAddAction({ 'dateReportEnd': this.state.dateReportEnd });
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
    async    loadData(params) {


        let data = await (this.props.queryOperativeEvent(params));
        //console.log(data);
        return data;
    };

    async    loadMeteoData(params) {

        let data = await (this.props.queryMeteoEvent(params));

        return data;
    };

    handleReportChange = (state) => {
        this.setState({ station_actual: state.station_actual, station_name: state.station_name });

        let params = {};
        //e.preventDefault();
        // this.setState({ dateReportBegin: this.props.dateReportBegin, dateReportEnd: this.props.dateReportEnd });
        //this.loadData().then(data => this.setState({ sensorsList: data }));

        const template_chemical = ['NO', 'NO2', 'NH3', 'SO2', 'H2S', 'O3', 'CO', 'CH2O', 'PM1', 'PM2.5', 'PM10', 'Пыль общая', 'бензол', 'толуол', 'этилбензол', 'м,п-ксилол', 'о-ксилол', 'хлорбензол', 'стирол', 'фенол'];
        const chemical_classes = { //classes dangerous
            'NO': 3,
            'NO2': 3,
            'NH3': 4,
            'SO2': 3,
            'H2S': 3,
            'O3': 1,
            'CO': 4,
            'CH2O': 2,
            'PM1': 3,
            'PM2.5': 3,
            'PM10': 3,
            'Пыль общая': 3,
            'бензол': 2,
            'толуол': 3,
            'этилбензол': 4,
            'м,п-ксилол': 3,
            'о-ксилол': 3,
            'хлорбензол': 3,
            'стирол': 3,
            'фенол': 2
        };
        if (isEmpty(state.dateReportBegin)) {
            params.period_from = this.props.dateReportBegin;
            params.period_to = this.props.dateReportEnd;
        }
        else {
            params.period_from = state.dateReportBegin;
            params.period_to = state.dateReportEnd;
        };
        params.station = state.station_actual;
        this.loadData(params).then(data => {
            if (data) {
                let dataList = data.dataTable;
                let sensorsList = data.sensorsTable;
                let macsList = data.macsTable;
                let _meteo = data.meteo;

                let avrg_measure = [];
                let data_raw = [];
                let times = 0;
                let time_frame = [];
                let mill_sec = 0;
                let meteo_complete = false;
                var temp = -1000;
                var dir = -1000;
                var spd = -1000;
                var hum = -1000;

                this.setState({ dataList: dataList });
                this.setState({ sensorsList: sensorsList });
                this.setState({ macsList: macsList });

                //for (var ms = -6060000; ms < 80340000; ms += 1200000) {
                for (var h = 0; h < 24; h++) {
                    for (var m = 19; m < 60; m += 20) {

                        time_frame.push(h.toString() + ':' + m.toString());

                        data_raw.push({ 'time': h.toString() + ':' + m.toString() });
                    };
                };
                // addActiveSensorsList(this.state.selection);
                //getFirstActiveStationsList();
                //addActiveStationsList({ sensors: this.state.selection });


                macsList.forEach((element, indx) => {
                    if ((element.chemical == 'NO') || (element.chemical == 'NO2') || (element.chemical == 'NH3') ||
                        (element.chemical == 'SO2') || (element.chemical == 'H2S') ||
                        (element.chemical == 'O3') || (element.chemical == 'CO') || (element.chemical == 'CH2O') ||
                        (element.chemical == 'PM1') || (element.chemical == 'PM2.5') ||
                        (element.chemical == 'PM10') || (element.chemical == 'Пыль общая') || (element.chemical == 'бензол') ||
                        (element.chemical == 'толуол') || (element.chemical == 'этилбензол') || (element.chemical == 'м,п-ксилол') ||
                        (element.chemical == 'о-ксилол') || (element.chemical == 'хлорбензол') || (element.chemical == 'стирол') || (element.chemical == 'фенол')) {

                        let filter = dataList.filter((item, i, arr) => {
                            return item.typemeasure == element.chemical;
                        });
                        let sum_all = 0;
                        let counter = 0;
                        let frame_count = 0;
                        let class_css;
                        let quotient = 0;
                        let range_macs = 0; // range of macs surplus
                        let max = 0;
                        let max_time = '-';
                        let min = 1000000;
                        let min_time = '-';
                        let counter_macs1 = 0;
                        let counter_macs5 = 0;
                        let counter_macs10 = 0;
                        let time_in = 0;
                        let tim_out = '';
                        let temp_raw = [];
                        let sum_alert = 0;
                        var coefficient = 1.0;


                        if (!isEmpty(filter)) {


                            time_frame.forEach((item, ind) => {

                                let tmp = item.split(':');
                                let up_sec = tmp[0] * 3600 + tmp[1] * 60;
                                let time_now = 0
                                // console.log('raw ' + up_sec);

                                let obj = filter.filter((elem, i, arr) => {

                                    time_now = new Date(elem.date_time).getHours() * 3600 +
                                        new Date(elem.date_time).getMinutes() * 60 + new Date(elem.date_time).getSeconds();
                                    // console.log('base ' + time_now);


                                    return ((up_sec >= time_now) && (time_in <= time_now));
                                });

                                if (!meteo_complete) {
                                    let meteo = _meteo.filter((elem, i, arr) => {

                                        time_now = new Date(elem.date_time).getHours() * 3600 +
                                            new Date(elem.date_time).getMinutes() * 60 + new Date(elem.date_time).getSeconds();
                                        // console.log('base ' + time_now);


                                        return ((up_sec >= time_now) && (time_in <= time_now) );
                                    });

                                    //meteo avrg
                                    if (meteo.length > 0) {
                                        let _temp = -1000.0, _temp_cnt = 0;
                                        let _dir = -1000.0, _dir_cnt = 0;
                                        let _spd = -1000.0, _spd_cnt = 0;
                                        let _hum = -1000.0, _hum_cnt = 0;

                                        meteo.forEach(_meteo => {
                                            if (_meteo.typemeasure == 'Направление ветра') {
                                                if (_dir_cnt == 0) _dir = 0.0;
                                                _dir += Number(_meteo.measure);
                                                _dir_cnt++;
                                            }
                                            if (_meteo.typemeasure == 'Темп. внешняя') {
                                                if (_temp_cnt == 0) _temp = 0.0;

                                                _temp += Number(_meteo.measure);
                                                _temp_cnt++;
                                            }
                                            if (_meteo.typemeasure == 'Скорость ветра') {
                                                if (_spd_cnt == 0) _spd = 0.0;

                                                _spd += Number(_meteo.measure);
                                                _spd_cnt++;
                                            }
                                            if (_meteo.typemeasure == 'Влажность внеш.') {
                                                if (_hum_cnt == 0) _hum = 0.0;

                                                _hum += Number(_meteo.measure);
                                                _hum_cnt++;
                                            }

                                        })
                                        if (_dir_cnt > 0)
                                            dir = _dir / _dir_cnt;
                                        if (_temp_cnt > 0)
                                            temp = _temp / _temp_cnt;
                                        if (_spd_cnt > 0)
                                            spd = _spd / _spd_cnt;
                                        if (_hum_cnt > 0)
                                            hum = _hum / _hum_cnt;
                                    }
                                }
                                time_in = up_sec;

                                let sum = 0;
                                let local_cnt = 0;
                                if (!isEmpty(obj)) {
                                    obj.forEach((unit => {
                                        sum += unit.measure;
                                        local_cnt++;

                                        counter++;

                                        sum_all += unit.measure;


                                    }))
                                    sum = sum / local_cnt;

                                    if (sum < min) {
                                        min = sum;
                                        min_time = item;
                                    }

                                    if (sum > max) {
                                        max = sum;
                                        max_time = item;
                                    }
                                    if (sum > element.max_m) {
                                        sum_alert++;
                                    }

                                    let dt = data_raw[ind];
                                    if (element.chemical == 'CO') {
                                        dt[element.chemical] = sum.toFixed(1);

                                    } else {
                                        dt[element.chemical] = sum.toFixed(3);
                                    }
                                    data_raw[ind] = dt;

                                    if (sum > element.max_m)
                                        counter_macs1++;
                                    if ((sum / 5) >= element.max_m)
                                        counter_macs5++;
                                    if ((sum / 10) >= element.max_m)
                                        counter_macs10++;

                                } else {
                                    let dt = data_raw[ind];
                                    dt[element.chemical] = '-';
                                    data_raw[ind] = dt;
                                };
                                if (local_cnt > 0) {
                                    frame_count++

                                }
                                if (!meteo_complete) {
                                    if (dir > -1) {
                                        let dt = data_raw[ind];
                                        dt['dir'] = dir.toFixed(0);
                                        data_raw[ind] = dt;
                                        dir = -1000;


                                    } else {
                                        let dt = data_raw[ind];

                                        dt['dir'] = '-';
                                        data_raw[ind] = dt;

                                    }
                                    if (temp > -100) {
                                        let dt = data_raw[ind];

                                        dt['temp'] = temp.toFixed(1);
                                        data_raw[ind] = dt;
                                        temp = -1000;

                                    } else {
                                        let dt = data_raw[ind];

                                        dt['temp'] = '-';
                                        data_raw[ind] = dt;

                                    }
                                    if (spd > -1) {
                                        let dt = data_raw[ind];

                                        dt['spd'] = spd.toFixed(0);
                                        data_raw[ind] = dt;
                                        spd = -1000;

                                    } else {
                                        let dt = data_raw[ind];

                                        dt['spd'] = '-';

                                        data_raw[ind] = dt;

                                    }
                                    if (hum > -1) {
                                        let dt = data_raw[ind];

                                        dt['hum'] = hum.toFixed(0);
                                        data_raw[ind] = dt;
                                        hum = -1000;

                                    } else {
                                        let dt = data_raw[ind];


                                        dt['hum'] = '-';
                                        data_raw[ind] = dt;

                                    }

                                }
                            });

                            meteo_complete = true;

                            quotient = (sum_all / counter);
                            range_macs = quotient / element.max_d;
                            class_css = 'alert_success';
                            times++;

                            if (range_macs > 1)
                                class_css = 'alert_macs1_ylw'; //outranged of a macs in 1 time
                            if (range_macs >= 5)
                                class_css = 'alert_macs5_orng'; //outranged of a macs in 5 times
                            if (range_macs >= 10)
                                class_css = 'alert_macs10_red'; //outranged of a macs in  more than 10 times


                            if (chemical_classes[element.chemical] == 1) //coefficients for class dangerous
                                coefficient = 1.7;
                            if (chemical_classes[element.chemical] == 2)
                                coefficient = 1.3;
                            if (chemical_classes[element.chemical] == 3)
                                coefficient = 1.0;
                            if (chemical_classes[element.chemical] == 4)
                                coefficient = 0.9;

                            avrg_measure.push({

                                'chemical': element.chemical,
                                'value': quotient.toFixed(3),
                                'counts': frame_count,
                                'min': min, 'min_time': min_time,
                                'max': max, 'max_time': max_time,
                                'counter_macs1': counter_macs1,
                                'counter_macs5': counter_macs5,
                                'counter_macs10': counter_macs10,
                                's_index': Number(max / element.max_m).toFixed(1),
                                'gre_repeatably': Number(sum_alert / counter * 100).toFixed(2),
                                'pollut_ind': Number(quotient / element.max_d * coefficient).toFixed(1),
                                'className': class_css
                            })
                        };

                    };
                });


                let name
                let chemical = [];
                let value = [];
                let counts = [];
                let min = [];
                let min_time = []
                let max = [];
                let max_time = [];
                let counter_macs1 = [];
                let counter_macs5 = [];
                let counter_macs10 = [];
                let className = [];
                let s_index = [];
                let gre_repeatably = [];
                let pollut_ind = [];

                chemical.push('Наименование');
                value.push('Среднесуточное значение');
                counts.push('Количество');
                min.push('Минимальное значение');
                min_time.push('Время минимального значения');
                max.push('Максимальное значение');
                max_time.push('Время максимального значения');
                counter_macs1.push('Количество превышений ПДК');
                counter_macs5.push('Количество превышений 5*ПДК');
                counter_macs10.push('Количество превышений 10*ПДК');
                s_index.push('Стандартный индекс');
                gre_repeatably.push('Наибольшая повторяемость, %');
                pollut_ind.push('ИЗА');
                className.push('ClassName');

                template_chemical.forEach(item => {


                    let filter = avrg_measure.filter((opt, i, arr) => {
                        return item == opt.chemical;
                    });

                    if (isEmpty(filter)) {
                        data_raw.forEach((opt, indx) => {
                            data_raw[indx] = { ...data_raw[indx], [item]: '-' };

                        });
                    }

                    if (!isEmpty(filter)) {
                        filter.forEach(element => {
                            if (element.chemical == 'CO') {
                                chemical.push(element.chemical);
                                value.push(String(Number(element.value).toFixed(1)).replace('.', ','));
                                counts.push(element.counts);
                                min.push(String(Number(element.min).toFixed(1)).replace('.', ','));
                                min_time.push(element.min_time);
                                max.push(String(Number(element.max).toFixed(1)).replace('.', ','));
                                max_time.push(element.max_time);
                                counter_macs1.push(element.counter_macs1);
                                counter_macs5.push(element.counter_macs5);
                                counter_macs10.push(element.counter_macs10);
                                s_index.push(String(element.s_index).replace('.', ','));
                                gre_repeatably.push(String(element.gre_repeatably).replace('.', ','));
                                pollut_ind.push(String(element.pollut_ind).replace('.', ','));
                                className.push(element.className);
                            } else {
                                chemical.push(element.chemical);
                                value.push(String(Number(element.value).toFixed(3)).replace('.', ','));
                                counts.push(element.counts);
                                min.push(String(Number(element.min).toFixed(3)).replace('.', ','));
                                min_time.push(element.min_time);
                                max.push(String(Number(element.max).toFixed(3)).replace('.', ','));
                                max_time.push(element.max_time);
                                counter_macs1.push(element.counter_macs1);
                                counter_macs5.push(element.counter_macs5);
                                counter_macs10.push(element.counter_macs10);
                                s_index.push(String(element.s_index).replace('.', ','));
                                gre_repeatably.push(String(element.gre_repeatably).replace('.', ','));
                                pollut_ind.push(String(element.pollut_ind).replace('.', ','));
                                className.push(element.className);
                            }


                        });
                    } else {
                        chemical.push(item);
                        value.push('-');
                        counts.push('-');
                        min.push('-');
                        min_time.push('-');
                        max.push('-');
                        max_time.push('-');
                        counter_macs1.push('-');
                        counter_macs5.push('-');
                        counter_macs10.push('-');
                        s_index.push('-');
                        gre_repeatably.push('-');
                        pollut_ind.push('-');
                        className.push('');

                    };
                });
                let _avrg_measure = [];
                _avrg_measure.push(chemical, value, counts, max, max_time, min, min_time, counter_macs1, counter_macs5,
                    counter_macs10, s_index, gre_repeatably, pollut_ind, className);


                // rendering of array for docx template

                var pollution = [];
                var values = [];
                var data = [];
                data_raw.forEach((element, ind) => {
                    pollution.push({
                        time: element.time, valueNO: element.NO.replace('.', ','), valueNO2: element.NO2.replace('.', ','), valueNH3: element.NH3.replace('.', ','), valueSO2: element.SO2.replace('.', ','),
                        valueH2S: element.H2S.replace('.', ','), valueO3: element.O3.replace('.', ','), valueCO: element.CO.replace('.', ','), valueCH2O: element.CH2O.replace('.', ','), valuePM1: element.PM1.replace('.', ','),
                        valuePM25: element['PM2.5'].replace('.', ','), valuePM10: element.PM10.replace('.', ','), valueTSP: element['Пыль общая'].replace('.', ','),
                        valueC6H6: element['бензол'].replace('.', ','), valueC7H8: element['толуол'].replace('.', ','), valueC8H10: element['этилбензол'].replace('.', ','),
                        valueC8H10MP: element['м,п-ксилол'].replace('.', ','), valueC8H10O: element['о-ксилол'].replace('.', ','), valueC6H5Cl: element['хлорбензол'].replace('.', ','),
                        valueC8H8: element['стирол'].replace('.', ','), valueC6H5OH: element['фенол'].replace('.', ','), valueTemp: element['temp'].replace('.', ','), valueDir: element['dir'], valueSpd: element['spd'], valueHum: element['hum']
                    });
                })
                // values.push({
                //    date: new Date().format('dd-MM-Y'), pollution: pollution
                //});
                // let str = '';
                //  let measure = [];
                _avrg_measure.forEach((element, ind) => {
                    if ((ind > 0) && (ind < _avrg_measure.length - 1)) {
                        pollution.push({
                            time: element[0], valueNO: element[1], valueNO2: element[2], valueNH3: element[3], valueSO2: element[4],
                            valueH2S: element[5], valueO3: element[6], valueCO: element[7], valueCH2O: element[8], valuePM1: element[9],
                            valuePM25: element[10], valuePM10: element[11], valueTSP: element[12],
                            valueC6H6: element[13], valueC7H8: element[14], valueC8H10: element[15],
                            valueC8H10MP: element[16], valueC8H10O: element[17], valueC6H5Cl: element[18],
                            valueC8H8: element[19], valueC6H5OH: element[20], valueTemp: element[21], valueDir: element[22], valueSpd: element[23], valueHum: element[24]
                        });
                    }
                });
                //values.push(measure);
                values.push({
                    date: new Date(this.props.dateReportBegin).format('dd-MM-Y'), pollution: pollution
                });
                data.push({ station: this.state.station_name, values: values });

                this.setState({ 'data_4_report': data });
                // this.setState({ 'station_name': state.station_name });
                this.setState({ 'data_raw': data_raw });
                this.setState({ 'avrg_measure': _avrg_measure });

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
                    {...this.props} snack_msg={snack_msg} isLoading={isLoading} autoHideDuration ={3000}
                    station_name={this.state.station_name}
                    station_actual={this.state.station_actual}
                    //dateReportBegin={this.state.dateReportBegin}
                    report_type='daily'
                    data_4_report={this.state.data_4_report}
                    handleReportChange={this.handleReportChange.bind(this)}
                    handleSnackClose={this.handleSnackClose.bind(this)}

                />

                <Typography component="div" style={{ padding: 2 * 1 }} id="daily_report">

                    <table style={{ "width": '100%' }} id="daily_report_table_header">
                        <tbody>
                            <tr>
                                <td style={{ 'width': '45%' }}>Станция: {this.state.station_name}</td>

                                <td style={{ 'width': '45%', 'textAlign': 'right' }}>{new Date(this.props.dateReportBegin).format('dd-MM-Y')}</td>
                                <td style={{ 'width': '5%' }}>&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>


                    <table border="1" width="100%" style={{ 'Align': 'center' }} className={classes._td} id="daily_report_table">
                        <tbody>
                            <tr >
                                <td style={{ 'width': '3%' }} rowSpan="2">
                                    <b> Время</b>
                                </td>
                                <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                    Темп.,
                                    С
                            </td>
                                <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                    Напр. ветра, град.
                            </td>
                                <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                    Скор. ветра, м/с                            </td>
                                <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                    Отн. влажность, %
                                </td>
                                <td style={{ 'width': '85%' }} colSpan="20">
                                    <b> Концентрация, мг/м. куб.</b>
                                </td>
                            </tr>

                            <tr style={{ 'fontSize': '11px' }}>


                                <td style={{ 'width': '5%' }} >
                                    NO
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    NO2
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    NH3
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    SO2
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    H2S
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    O3
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    CO
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    CH2O
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    PM-1
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    PM-2.5
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    PM-10
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    Пыль общая
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    бензол
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    толуол
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    этилбензол
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    м,п-ксилол

                                    </td>
                                <td style={{ 'width': '5%' }} >
                                    о-ксилол
                                  </td>
                                <td style={{ 'width': '5%' }} >
                                    хлорбензол
                                </td>
                                <td style={{ 'width': '5%' }} >
                                    стирол
                                 </td>
                                <td style={{ 'width': '5%' }} >
                                    фенол
                                      </td>
                            </tr>


                            {(data_raw) &&// if not empty
                                data_raw.map((option, i) => (
                                    <tr key={'tr_' + i} style={{ 'fontSize': '11px' }}>
                                        <td> {option.time}</td>
                                        <td> {option.temp}</td>
                                        <td> {option.dir}</td>
                                        <td> {option.spd}</td>
                                        <td> {option.hum}</td>
                                        <td> {option.NO}</td>
                                        <td> {option.NO2}</td>
                                        <td> {option.NH3}</td>
                                        <td> {option.SO2}</td>
                                        <td> {option.H2S}</td>
                                        <td> {option.O3}</td>
                                        <td> {option.CO}</td>
                                        <td> {option.CH2O}</td>
                                        <td> {option.PM1}</td>
                                        <td> {option['PM2.5']}</td>
                                        <td> {option.PM10}</td>
                                        <td> {option['Пыль общая']}</td>
                                        <td> {option['бензол']}</td>
                                        <td> {option['толуол']}</td>
                                        <td> {option['этилбензол']}</td>
                                        <td> {option['м,п-ксилол']}</td>
                                        <td> {option['о-ксилол']}</td>
                                        <td> {option['хлорбензол']}</td>
                                        <td> {option['стирол']}</td>
                                        <td> {option['фенол']}</td>



                                    </tr>
                                ))}
                            <tr>

                            </tr>
                            {(avrg_measure) &&// if not empty
                                avrg_measure.map((option, i) => (
                                    (i > 0 && i < avrg_measure.length - 1) &&
                                    <tr key={'trm_' + i} style={{ 'fontSize': '11px' }}>
                                        <td colSpan="5"> {option[0]}</td>

                                        <td> {option[1]}</td>
                                        <td> {option[2]}</td>
                                        <td> {option[3]}</td>
                                        <td> {option[4]}</td>
                                        <td> {option[5]}</td>
                                        <td> {option[6]}</td>
                                        <td> {option[7]}</td>
                                        <td> {option[8]}</td>
                                        <td> {option[9]}</td>
                                        <td> {option[10]}</td>
                                        <td> {option[11]}</td>
                                        <td> {option[12]}</td>
                                        <td> {option[13]}</td>
                                        <td> {option[14]}</td>
                                        <td> {option[15]}</td>
                                        <td> {option[16]}</td>
                                        <td> {option[17]}</td>
                                        <td> {option[18]}</td>
                                        <td> {option[19]}</td>
                                        <td> {option[20]}</td>

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
        dateReportBegin: state.datePickers.dateReportBegin,
        dateReportEnd: state.datePickers.dateReportEnd

    };
}


DailyReport.propTypes = {
    classes: PropTypes.object.isRequired,
    queryOperativeEvent: PropTypes.func.isRequired,    //loadData: PropTypes.func.isRequired
    queryMeteoEvent: PropTypes.func.isRequired,
    reportGen: PropTypes.func.isRequired
}

DailyReport.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryOperativeEvent, queryMeteoEvent, reportGen, reportXlsGen })(withRouter(withStyles(styles)(DailyReport)));