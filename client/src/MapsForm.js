import React, { Component } from 'react';

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
import IconButton from '@material-ui/core/IconButton';
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

import uuid from 'uuid/v1';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import isNumber from 'lodash.isnumber';

import L from 'leaflet';
import { LeafIcon } from 'leaflet';
import './map-widget.css';
import 'leaflet/dist/leaflet.css';
import markerPin from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { getStationsList } from './actions/stationsGetAction';
import { queryEvent, queryOperativeEvent } from './actions/queryActions';
import { getPoint, updatePoint, deletePoint, insertPoint } from './actions/adminActions';


import pinAlert from './pin-alert.png';
import pinGreen from './pin-green.png';

import Iframe from 'react-iframe';
import ThumbUp from '@material-ui/icons/ThumbUp';

import PointDialog from './stuff/PointDialog';
import { TableRowColumn } from 'material-ui';
import { updateSecurityUser } from './actions/adminActions';
import { access } from 'fs';

//const pngs = require.context('../../tiles', true, /\.png$/);


//const pinAlert = require.context('./', true, /\.svg$/);
//const keys = pngs.keys();

//const pngsArray = keys.map(key => pngs(key));

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    map: {
        height: '400px'
    },

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
    pin1: {
        color: '#000000',
    }



});

const outer = [[50.505, -29.09], [52.505, 29.09]]
const inner = [[49.505, -2.09], [53.505, 2.09]]



function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
};



class MapsForm extends React.Component {
    constructor(props) {
        super(props);
        const {

            chartData,
            stationsList,
            sensorsList,
        } = props;

        let today = new Date();
        today -= 1200000;//20 min in milliseconds

        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            bounds: outer,
            stationsList,
            dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm'),
            dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),
            _map: {},
            _markers: [],
            openDialog: false,
            lat: 0,
            lon: 0,
            idd: uuid(),
            isLoading: false,
            inMeasure: false,
            iddMeasure: ''
        };


    }

    static defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
        locations: ''
    };

    createButton(label, container) {
        var btn = L.DomUtil.create('button', '', container);
        btn.setAttribute('type', 'button');
        btn.innerHTML = label;
        // container.appendChild(btn);
        return btn;
    }

    handleSnackClose() {
        this.setState({ isLoading: false });

    };

    onMapClick(e) {
        var popup = L.popup();
        const { _map } = this.state;
        if (!this.state.inMeasure) {
            popup
                .setLatLng(e.latlng)
                .setContent('<b>Добавить точку наблюдения      <br/><br/>' + '<div align ="center"><button type="button" class="btn-primary" id = "btn_add" data = "add" >OK</button>'
                    + '&nbsp;&nbsp;&nbsp;&nbsp; <button type="button" class="btn-primary" id = "btn_cancel" data = "add" >Отмена</button></div>')
                .openOn(_map);

            //var dom = L.DomUtil.get('btn_add');

            L.DomEvent.addListener(L.DomUtil.get('btn_add'), 'click', () => {
                _map.closePopup();

                this.setState({ openDialog: true, lat: e.latlng.lat, lon: e.latlng.lng });

            });
            L.DomEvent.addListener(L.DomUtil.get('btn_cancel'), 'click', () => {
                _map.closePopup();
            });
        } else {
            popup
                .setLatLng(e.latlng)
                .setContent("Завершить текущее наблюдение <br/><br/> " +
                    '<div align = "center"> <button type="button" class="btn-primary" id = "btn_close" data = "close" >OK</button> &nbsp; &nbsp; <button type="button" class="btn-primary" id = "btn_cancel" data = "add" >Отмена</button></div>')
                .openOn(_map);


            L.DomEvent.addListener(L.DomUtil.get('btn_close'), 'click', () => {
                _map.closePopup();
                this.closeMeasure();
            });
            L.DomEvent.addListener(L.DomUtil.get('btn_cancel'), 'click', () => {
                _map.closePopup();
            });
        }
    }

    onClickInner = () => {
        this.setState({ bounds: inner })
    }

    onClickOuter = () => {
        this.setState({ bounds: outer })
    }


    handleChange = (event, tab_no) => {
        this.setState({ tab_no });
        //window.open("https://map.gpshome.ru/main/index.php?login=mosoblecomon&password=mosoblecomon");
    };


    onClickReset = () => {
        this.setState({ viewport: DEFAULT_VIEWPORT })
    }

    onViewportChanged = (viewport) => {
        this.setState({ viewport })
    }


    map_load() {
        this.props.getPoint().then(data => {
            var inMeasure = false;
            var iddMeasure = '';
            if (data.length > 0) {
                data.forEach((item) => {
                    const { _map } = this.state;



                    if ((item.date_time_end < item.date_time_begin)) {
                        inMeasure = true;
                        iddMeasure = item.idd;


                        let _Icon = L.icon({
                            iconUrl: pinAlert,
                            shadowUrl: markerShadow
                        });

                        var marker = L.marker([item.lat, item.lon], { icon: _Icon, title: (item.place ? item.place : "") + "\n" + (item.descr ? item.descr : "") + "\n Время начала наблюдения: " + item.date_time_begin, opacity: 1 }).addTo(_map);

                    } else {

                        let _Icon = L.icon({
                            iconUrl: markerPin,
                            shadowUrl: markerShadow
                        });
                        var marker = L.marker([item.lat, item.lon], {
                            icon: _Icon, title: (item.place ? item.place : "") + "\n" + (item.descr ? item.descr : "") + "\n Время начала наблюдения: " + item.date_time_begin +
                                "\n Время завершения наблюдения: " + item.date_time_end, opacity: 1
                        }).addTo(_map);


                    }
                    this.setState({ _markers: [...this.state._markers, marker], inMeasure: inMeasure });
                    if (!isEmpty(iddMeasure))
                        this.setState({ iddMeasure: iddMeasure });


                })
            }
        })

    }


    clickPopup(e) {
        const { _map, _markers, inMeasure } = this.state;
        //_markers[_markers.length-1].openPopup();
        var popup = L.popup();

        popup
            .setLatLng(e.latlng)
            .setContent((!inMeasure ? "Выбрать текущее положение для наблюдения <br/><br/>" +
                '<div align = "center"> <button type="button" class="btn-primary "id = "btn_add" data = "add" >OK</button> &nbsp; &nbsp; <button type="button" class="btn-primary" id = "btn_cancel" data = "add" >Отмена</button></div>' :
                "Завершить текущее наблюдение <br/><br/> " +
                '<div align = "center"> <button type="button" class="btn-primary" id = "btn_close" data = "close" >OK</button> &nbsp; &nbsp; <button type="button" class="btn-primary" id = "btn_cancel" data = "add" >Отмена</button></div>'))
            .openOn(_map);

        //var dom = L.DomUtil.get('btn_add');
        if (!inMeasure)

            L.DomEvent.addListener(L.DomUtil.get('btn_add'), 'click', () => {
                _map.closePopup();
                this.openMeasure(e.latlng);
            });
        if (inMeasure)
            L.DomEvent.addListener(L.DomUtil.get('btn_close'), 'click', () => {
                _map.closePopup();
                this.closeMeasure();
            });
        L.DomEvent.addListener(L.DomUtil.get('btn_cancel'), 'click', () => {
            _map.closePopup();
        });



    }

    openMeasure(params) {
        if (!this.state.inMeasure) {
            this.setState({ openDialog: true, lat: params.lat, lon: params.lng });
        } else {
            //alert("alert")
            if (confirm('Предыдущие измерения не завршены! Завершить?')) {
                this.setState({ openDialog: true, lat: params.lat, lon: params.lng });

            }

        }
    }


    closeMeasure(params) {
        var isReal = confirm('Завершить, уверены?');
        if (isReal) {
            if (!isEmpty(this.state.iddMeasure))
                this.props.updatePoint({ idd: this.state.iddMeasure, date_time_end: '' }).then(res => {
                    this.setState({ inMeasure: false, iddMeasure: '', _markers: [] })
                    this.map_load();
                    this.setState({ snack_msg: 'Измерения по текущей точке завершены...' });
                    this.setState({ isLoading: true });
                });

        }
    }

    componentDidMount() {


        const { stationsList } = this.props;
        let params = {};
        this.props.queryEvent(params).then(data => {
            let lat, lng = 0;
            let params = {};
            params.period_from = this.state.dateTimeBegin;
            params.period_to = this.state.dateTimeEnd;

            getStationsList(data);

            if (!isEmpty(data)) {
                lat = data[0].latitude;
                lng = data[0].longitude;
            }
            var lmap = L.map('mapBox', { center: [lat, lng], zoom: 10 });
            this.setState({ _map: lmap });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(lmap);

            lmap.on('contextmenu', this.onMapClick.bind(this));
            //var greenIcon = new LeafIcon({iconUrl: 'leaf-green.png'});
            this.map_load();
            data.map(item => {
                params.station = item.id;
                this.props.queryOperativeEvent(params).then(values => {
                    if (values) {
                        let dataList = values.dataTable;
                        let sensorsList = values.sensorsTable;
                        let macsList = values.macsTable;
                        let rows_measure = [];
                        let popupContent = "";
                        let class_css = 'alert_success';
                        let _alert = false;

                        macsList.forEach((element, indx) => {
                            let filter = dataList.filter((item, i, arr) => {
                                return item.typemeasure == element.chemical;
                            });
                            let sum = 0;
                            let counter = 0;
                            let quotient = 0;
                            let range_macs = 0; // range of macs surplus


                            if (!isEmpty(filter)) {
                                filter.forEach(item => {
                                    sum += item.measure;
                                    counter++;
                                });
                                quotient = (sum / counter);
                                range_macs = quotient / element.max_m;
                                class_css = 'alert_success';

                                if (range_macs > 1) {
                                    class_css = 'alert_macs1_ylw'; //outranged of a macs in 1 time
                                    _alert = true;
                                }
                                if (range_macs >= 5) {
                                    class_css = 'alert_macs5_orng'; //outranged of a macs in 5 times
                                    _alert = true;

                                }
                                if (range_macs >= 10) {
                                    class_css = 'alert_macs10_red'; //outranged of a macs in  more than 10 times
                                    _alert = true;
                                }

                                rows_measure.push({
                                    'chemical': element.chemical + ', мг/м.куб.', 'macs': element.max_m,
                                    'date': new Date(filter[filter.length - 1].date_time).format('dd-MM-Y'),
                                    'time': new Date(filter[filter.length - 1].date_time).format('H:mm:SS'), 'value': quotient.toFixed(3), 'className': class_css
                                })

                                var prcnt = range_macs;

                                if (class_css != 'alert_success') {
                                    popupContent += '<div style = "background-color: #ff8080">' + element.chemical + " : " + quotient.toFixed(3) + " (" + prcnt.toFixed(3) + " долей ПДК)" + '</div>';
                                }
                                else {
                                    popupContent += element.chemical + " : " + quotient.toFixed(3) + " (" + prcnt.toFixed(3) + " долей ПДК)" + "<br/>";

                                }
                            };
                        });

                        if (!_alert) {
                            let _Icon = L.icon({
                                iconUrl: pinGreen,
                                shadowUrl: markerShadow,
                            });
                            var marker = L.marker([item.latitude, item.longitude], { icon: _Icon, title: item.namestation + "\n" + item.place, opacity: 1 }).on('click', (e) => {
                                console.log(e.latlng);
                                this.clickPopup(e);
                            }).addTo(lmap);


                        }
                        else {
                            let _Icon = L.icon({
                                iconUrl: pinAlert,
                                shadowUrl: markerShadow
                            });
                            var marker = L.marker([item.latitude, item.longitude], { icon: _Icon, title: item.namestation + "\n" + item.place, opacity: 1 }).addTo(lmap).on('click', function (e) {
                                console.log(e.latlng);
                            });

                        }

                        if (!isEmpty(popupContent)) {
                            popupContent += "<br/>";
                        }

                        let dir_wind = dataList.filter((item, i, arr) => {
                            return item.typemeasure == 'Направление ветра';
                        });

                        if (!isEmpty(dir_wind)) {
                            let sum = 0;
                            dir_wind.forEach(_item => {
                                sum += _item.measure;
                            });
                            let avrg = (sum / dir_wind.length) * Math.PI / 180;


                            let arr_hi = Math.PI + avrg + 0.175;
                            let arr_low = Math.PI + avrg - 0.175;

                            let line = [
                                [item.latitude, item.longitude],
                                [item.latitude + Math.cos(Math.PI + avrg) * 0.004, item.longitude + Math.sin(Math.PI + avrg) * 0.004],
                                [item.latitude + Math.cos(Math.PI + avrg) * 0.004 - Math.cos(arr_low) * 0.0012, item.longitude + Math.sin(Math.PI + avrg) * 0.004 - Math.sin(arr_low) * 0.0012],
                                [item.latitude + Math.cos(Math.PI + avrg) * 0.004, item.longitude + Math.sin(Math.PI + avrg) * 0.004],
                                [item.latitude + Math.cos(Math.PI + avrg) * 0.004 - Math.cos(arr_hi) * 0.0012, item.longitude + Math.sin(Math.PI + avrg) * 0.004 - Math.sin(arr_hi) * 0.0012],
                            ];

                            L.polyline(line, { color: 'red', weight: 1 }).addTo(lmap);

                            popupContent += "Напр. ветра: " + (sum / dir_wind.length).toFixed(0) + " град.<br/>";

                            let bar = dataList.filter((item, i, arr) => {
                                return item.typemeasure == 'Атм. давление';
                            });
                            sum = 0;
                            bar.forEach(_item => {
                                sum += _item.measure;
                            });
                            popupContent += "Атм. давление: " + (sum / bar.length).toFixed(0) + " мм.рт.ст.<br/>";

                            let temp = dataList.filter((item, i, arr) => {
                                return item.typemeasure == 'Темп. внешняя';
                            });
                            sum = 0;
                            temp.forEach(_item => {
                                sum += _item.measure;
                            });
                            popupContent += "Темп. внешняя: " + (sum / temp.length).toFixed(1) + " С<br/>";

                            let hum = dataList.filter((item, i, arr) => {
                                return item.typemeasure == 'Влажность внеш.';
                            });
                            sum = 0;
                            hum.forEach(_item => {
                                sum += _item.measure;
                            });
                            popupContent += "Влажность внеш.: " + (sum / hum.length).toFixed(0) + " %<br/>";


                        };
                        popupContent += (!this.state.inMeasure ? " <br/>Выбрать для наблюдения: " +
                            '<button type="button" class="btn-primary" id = "btn_add" data = "add" >OK</button>' :
                            " <br/>Завершить наблюдение: " +
                            '<button type="button" class="btn-primary" id = "btn_close" data = "close" >OK</button>')
                        //marker.bindPopup(popupContent, { autoClose: false });
                        this.setState({ _markers: [...this.state._markers, marker] });

                    }
                });
            })
        });
    }



    onClick(event) {
        if (event == 'true')
            window.open("https://map.gpshome.ru/main/index.php?login=mosoblecomon&password=mosoblecomon");
    }

    handleDialogAdd() {
        let { idd, descr, place, lat, lon } = this.state;

        if (isEmpty(descr) && isEmpty(place)) {
            //insert action

            alert("Адрес и описание точки не может быть одновременно не заполнено!");

        } else {

            this.props.insertPoint({ idd, descr, place, lat, lon })
                .then(resp => {

                    if (resp.status == 200) {
                        this.setState({ snack_msg: 'Данные успешно добавлены...' });
                        this.setState({ isLoading: true });
                        this.map_load();

                    } else {
                        this.setState({ snack_msg: 'Ошибка сервера...' });

                        this.setState({ isLoading: true });
                    };
                    this.setState({ openDialog: false });

                });


        }

    }

    handleDialogClose() {
        this.setState({ openDialog: false });
    };

    handleDialogChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
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
                <script src="leaflet/leaflet.js"></script>
                <Tabs >

                    <Tab label="Карта точек наблюдения" >
                        <div id='container'>
                            <div id='mapBox' />
                        </div>
                        <PointDialog
                            openDialog={this.state.openDialog}
                            lat={this.state.lat}
                            lon={this.state.lon}
                            idd={this.state.idd}

                            handleSnackClose={this.handleSnackClose.bind(this)}

                            handleDialogClose={this.handleDialogClose.bind(this)}
                            handleAdd={this.handleDialogAdd.bind(this)}
                            handleChange={this.handleDialogChange.bind(this)}
                        />


                        <Snackbar
                            open={this.state.isLoading}
                            snack_msg={this.state.snack_msg}
                            // TransitionComponent={<Slider direction="up" />}
                            autoHideDuration={3000}
                            onClose={this.handleSnackClose.bind(this)}

                            message={<span id="message-id">{this.state.snack_msg}</span>}

                        />
                    </Tab>

                </Tabs>

            </Paper >
        );
    }
}

function mapStateToProps(state) {

    return {
        stationsList: state.stationsList,
    };
}


MapsForm.propTypes = {
    classes: PropTypes.object.isRequired,

    //loadData: PropTypes.func.isRequired
}

MapsForm.contextType = {
    // router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryEvent, queryOperativeEvent, getPoint, updatePoint, insertPoint, deletePoint })(withRouter(withStyles(styles)(MapsForm)));
