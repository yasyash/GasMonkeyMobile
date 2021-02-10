import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import Grow from "@material-ui/core/Grow";
import Grid from "@material-ui/core/Grid";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Hidden from "@material-ui/core/Hidden";
import Popover from "@material-ui/core/Popover";
// @material-ui/icons
import Language from "@material-ui/icons/Language";
import DateRange from "@material-ui/icons/DateRange";
import Backup from '@material-ui/icons/Backup';
import Place from '@material-ui/icons/Place';
import Build from '@material-ui/icons/Build';
import Notifications from "@material-ui/icons/Notifications";
//import Notifier from './stuff/Notifier';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import StationsIcon from '@material-ui/icons/AccountBalance';
import StationIcon from './icons/Stations';
import Backdown from '@material-ui/icons/CloudDownload';

// core components
import GridItem from "material-dashboard-react/components/Grid/GridItem";
import Card from "material-dashboard-react/components/Card/Card";
import CardBody from "material-dashboard-react/components/Card/CardBody";
import CardHeader from "material-dashboard-react/components/Card/CardHeader";
import CardIcon from "material-dashboard-react/components/Card/CardIcon";
import CardFooter from 'material-dashboard-react/components/Card/CardFooter';
import GridContainer from "material-dashboard-react/components/Grid/GridContainer";
import Tabs from "material-dashboard-react/components/CustomTabs/CustomTabs";
import SnackbarContent from "./stuff/SnackbarContent";
//import Snackbar from "material-dashboard-react/components/Snackbar/Snackbar2";
//import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import Divider from '@material-ui/core/Divider';

import isEmpty from 'lodash.isempty';
import CloudyIcon from '@material-ui/icons/WbCloudy';
import Weather from './icons/Weather';
import CloudOffIcon from '@material-ui/icons/CloudOff';
//import moment from 'moment';
//import Sidebar from 'material-dashboard-react/components/Sidebar/Sidebar';
//import appRoutes from 'material-dashboard-react/routes/index';

import dashboardStyle from "material-dashboard-react/assets/jss/material-dashboard-react/views/dashboardStyle";

import * as _materialDashboardReact from "material-dashboard-react/assets/jss/material-dashboard-react";

import { queryDashBoardDataOperativeEvent, queryDashBoardAlertsHistory, queryAllDataOperativeEvent, queryEvent, queryMeteoEvent } from './actions/queryActions';
import { addLogsList, deleteLogsList } from './actions/logsAddActions';
import { getPoint, getActivePoint } from './actions/adminActions';
import { pointAddAction, pointDeleteAction } from './actions/dataAddActions';
import { getSettings } from './actions/settingsAction';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilderTwoTone';
import HistoryToggleOffTwoToneIcon from './icons/HistoryToggleOffTwoTone';
//import { filter } from 'ramda';
//import auth from './reducers/auth';
import TextField from '@material-ui/core/TextField';
//import request from 'request';


const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  ...dashboardStyle,
  cardIcon: {
    "&$warningCardHeader,&$successCardHeader,&$dangerCardHeader,&$infoCardHeader,&$primaryCardHeader,&$roseCardHeader": {
      borderRadius: "3px",
      backgroundColor: "#999",
      padding: "5px",
      marginTop: "-20px",
      marginRight: "15px",
      float: "left"
    }
  },
  warningCardHeader: _materialDashboardReact.warningCardHeader,
  successCardHeader: _materialDashboardReact.successCardHeader,
  dangerCardHeader: _materialDashboardReact.dangerCardHeader,
  infoCardHeader: _materialDashboardReact.infoCardHeader,
  primaryCardHeader: _materialDashboardReact.primaryCardHeader,
  roseCardHeader: _materialDashboardReact.roseCardHeader,
  close: {
    width: theme.spacing.unit * 3,
    height: theme.spacing.unit * 3,
    paddingTop: '2px !important'

  },
  icon: {
    fontSize: 20,
  },
  inactiveicon:
  {
    backgroundColor: 'grey'
  },
  message: {
    textAlign: 'justify',
    fontSize: 10
  },


});

class DashBoard extends Component {

  constructor(props) {
    super(props);

    let today = new Date();
    today -= 1200000;

    this.state = {
      stationsList: [],
      dataList: [],
      sensorsList: [],
      macsList: [],
      alertsList: [],
      systemList: [],
      dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm:SS'),
      dateTimeEnd: new Date().format('Y-MM-ddTHH:mm:SS'),
      dateTimeAlerts: new Date(new Date() - 86400000).format('Y-MM-dd'),
      open: false,
      anchorEl: null,
      mobileOpen: true,
      door_alert: [],
      fire_alert: [],
      time_frame: [],
      alertsHistoryList: [],
      systemHistoryList: [],
      cards_order: []


    }
  }

  handlePickerChange = (event) => {
    const value = event.target.value;
    const id = event.target.id;

    this.setState({ dateTimeAlerts: value, dateTimeBegin: new Date(value).format('Y-MM-dd') + 'T00:00:00', dateTimeEnd: new Date(value).format('Y-MM-dd') + 'T23:59:59' });
    this.renderHistoricalData(value);
    //dateAddAction({ [id]: value });
  };

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  async    load_stations() {
    let params = {};
    // 0 - all stations, 1- all sensors of the station, 2 - selected sensors
    //3 - macs table

    let data = await (this.props.queryEvent(params));
    //console.log(data);
    return data;
  };

  async    load_data(params) {


    let data = await (this.props.queryDashBoardDataOperativeEvent(params));
    //console.log(data);
    return data;
  };

  async    load_history_data(params) {


    let data = await (this.props.queryDashBoardAlertsHistory(params));
    //console.log(data);
    return data;
  };

  onClose = indx => () => {
    const { systemList } = this.props;
    if (!isEmpty(systemList)) {
      systemList[indx].is_visible = false;
      //this.setState({ systemList });
      addLogsList(systemList);
    }
  };
  renderData(_date) {

    if (!isEmpty(this.props.username)) {
      let params = {};

      if (isEmpty(_date)) {
        params.period_from = this.state.dateTimeBegin;
        params.period_to = this.state.dateTimeEnd;
      } else {
        params.period_from = new Date(_date).format('Y-MM-dd') + 'T00:00:00';
        params.period_to = new Date(_date).format('Y-MM-dd') + 'T23:59:59';
      }

      this.load_stations().then(stations => {
        this.setState({ stationsList: stations });
        this.load_data(params).then(data => {
          if (data) {
            //console.log("Time entry = ", Date.parse(new Date()));
            let dataList = data.dataTable;
            let sensorsList = data.sensorsTable;
            let macsList = data.macsTable;
            let alertsList = data.alertsTable;
            let systemList = data.systemTable;
            if (isEmpty(_date)) {
              var today = new Date(this.state.dateTimeEnd);
            } else {
              var today = new Date(params.period_to);
            }
            let _door_alert = false;
            let _fire_alert = false;
            var door_alert = [];
            var fire_alert = [];
            let { stationsList } = this.state;
            today -= 1200000;

            stationsList.map((_item, _ind) => {
              var door_alert_tmp = [];
              var fire_alert_tmp = [];

              dataList.map((item, ind) => {
                if (_item.id == item.id) {
                  if (item.typemeasure.includes('Дверь')) {
                    item.is_alert ? _door_alert = true : _door_alert = false
                    let obj = {};
                    obj[item.id] = _door_alert;
                    door_alert_tmp.push(obj);
                  }
                  if (item.typemeasure.includes('Пожар')) {
                    item.is_alert ? _fire_alert = true : _fire_alert = false;
                    let obj = {};
                    obj[item.id] = _fire_alert;
                    fire_alert_tmp.push(obj);
                  }
                  //door_alert[_item.id] = _door_alert;
                  //fire_alert[_item.id] = _fire_alert;

                }
              });


              if (fire_alert_tmp.length > 0)
                fire_alert.push(fire_alert_tmp[0]);
              if (door_alert_tmp.length > 0)
                door_alert.push(door_alert_tmp[0]);
            });

            //20 min averaging 



            //packing alerts
            //console.log('Date = ', alertsList);

            var _time_frame = [];
            var _date = new Date(params.period_to).format('Y-MM-dd');
            var _array = [];
            var _indx = [];
            var _compressed = [];

            for (var h = 23; h > -1; h--) {
              for (var m = 59; m > -1; m -= 20) {


                _time_frame.push(_date + ' ' + h.toString() + ':' + m.toString() + ':00');

              };
            };
            _time_frame.push(_date + ' 00:00:00');



            for (var _j = 1; _j < _time_frame.length; _j++) {
              let _pack = alertsList.filter((_alerts, _i) => {


                return ((new Date(_alerts.date_time) < new Date(_time_frame[_j - 1])) && (new Date(_alerts.date_time) > new Date(_time_frame[_j])))

              })


              if (_pack.length > 0)
                var _flag = 0;
              while (_flag < _pack.length) {
                _indx = [];
                _pack.map((_test, _i) => {
                  if ((_test.type == _pack[_flag].type) && (_test.id == _pack[_flag].id))
                    _indx.push(_i);
                })
                _array = [];

                if (_indx.length > 1) {
                  _array = [..._pack.slice(0, _indx[0] + 1)];
                  for (var _cnt = _indx[0] + 1; _cnt < _pack.length; _cnt++) {
                    if (_indx.indexOf(_cnt) == -1)
                      _array.push(_pack[_cnt]);

                  }
                  _pack = [];
                  Object.assign(_pack, _array);
                }
                _flag++;
              }
              // _array.push([..._pack]);

              if (_pack.length > 0)
                _compressed = [..._compressed, ..._pack];
            };
            //console.log("Time exit = ", Date.parse(new Date()));


            this.setState({
              dataList, sensorsList, macsList, 'alertsList': _compressed, systemList,
              dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm:SS'),
              dateTimeEnd: new Date().format('Y-MM-ddTHH:mm:SS'),
              door_alert,
              fire_alert
            });
            if (isEmpty(this.props.systemList)) {

              addLogsList(systemList);

            }
          };
        });
      });

    };
  }

  map_load() {
    var inMeasure = false;
    var iddMeasure = '';
    this.props.getPoint().then(data => {

      if (data.length > 0) {
        data.forEach((item) => {
          let arr_dt = item.date_time_end.split(' ');
          let arr_d = arr_dt[0].split('-');
          let arr_t = arr_dt[1].split(':');


          let date_time_end = new Date(arr_d[2], arr_d[1] - 1, arr_d[0], arr_t[0], arr_t[1], arr_t[2]).getTime();

          arr_dt = item.date_time_begin.split(' ');
          arr_d = arr_dt[0].split('-');
          arr_t = arr_dt[1].split(':');

          let date_time_begin = new Date(arr_d[2], arr_d[1] - 1, arr_d[0], arr_t[0], arr_t[1], arr_t[2]).getTime();

          if ((date_time_end < date_time_begin) || (item.in_measure)) {
            inMeasure = true;
            iddMeasure = item.idd;

          } else {

          }

        })

      }
    }).then(out => {
      this.props.getActivePoint().then(_data => {
        if ((_data.length > 0)) {
          pointDeleteAction();
          pointAddAction({ iddMeasure: _data[0].idd, inMeasure: inMeasure, place: _data[0].place, descr: '', begin_measure_time: _data[0].date_time_in  });

          //this.setState({ iddMeasure: _data[0].idd, lat: _data[0].latitude, lon: _data[0].longitude, point_actual: _data[0].idd })
        }
      })
    })
  }
  //historical data rendering

  ///historical data rendering 
  renderHistoricalData(_date) {
    if (!isEmpty(this.props.username)) {
      let params = {};


      params.period_from = new Date(_date).format('Y-MM-dd') + 'T00:00:00';
      params.period_to = new Date(_date).format('Y-MM-dd') + 'T23:59:59';


      this.load_history_data(params).then(data => {
        if (data) {
          //console.log("Time entry = ", Date.parse(new Date()));
          //let dataList = data.dataTable;
          //let sensorsList = data.sensorsTable;
          //let macsList = data.macsTable;
          let alertsList = data.alertsTable;
          let systemList = data.systemTable;

          var today = new Date(params.period_to);

          let _door_alert = false;
          let _fire_alert = false;
          var door_alert = [];
          var fire_alert = [];
          let { stationsList } = this.state;
          today -= 1200000;


          //20 min averaging 



          //packing alerts
          //console.log('Date = ', alertsList);

          var _time_frame = [];
          var _date = new Date(params.period_to).format('Y-MM-dd');
          var _array = [];
          var _indx = [];
          var _compressed = [];

          for (var h = 23; h > -1; h--) {
            for (var m = 59; m > -1; m -= 20) {


              _time_frame.push(_date + ' ' + h.toString() + ':' + m.toString() + ':00');

            };
          };
          _time_frame.push(_date + ' 00:00:00');



          for (var _j = 1; _j < _time_frame.length; _j++) {
            let _pack = alertsList.filter((_alerts, _i) => {


              return ((new Date(_alerts.date_time) < new Date(_time_frame[_j - 1])) && (new Date(_alerts.date_time) > new Date(_time_frame[_j])))

            })


            if (_pack.length > 0)
              var _flag = 0;
            while (_flag < _pack.length) {
              _indx = [];
              _pack.map((_test, _i) => {
                if ((_test.type == _pack[_flag].type) && (_test.id == _pack[_flag].id))
                  _indx.push(_i);
              })
              _array = [];

              if (_indx.length > 1) {
                _array = [..._pack.slice(0, _indx[0] + 1)];
                for (var _cnt = _indx[0] + 1; _cnt < _pack.length; _cnt++) {
                  if (_indx.indexOf(_cnt) == -1)
                    _array.push(_pack[_cnt]);

                }
                _pack = [];
                Object.assign(_pack, _array);
              }
              _flag++;
            }
            // _array.push([..._pack]);

            if (_pack.length > 0)
              _compressed = [..._compressed, ..._pack];
          };
          //console.log("Time exit = ", Date.parse(new Date()));


          this.setState({
            alertsHistoryList: _compressed, systemHistoryList: systemList
          });

        };
      });


    };
  }

  componentWillMount() {
    this.props.getSettings('dashboard', 'card').then(data => {
      this.setState({ cards_order: data });
    });
    if (isEmpty(this.stationsList)) this.map_load();
    this.renderData();
    this.renderHistoricalData(this.state.dateTimeAlerts);
    this.interval = setInterval(this.renderData.bind(this), 10000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    //var { isAuthenticated } = false;

    const { username, is_admin } = this.props;

    const { classes } = this.props;
    const { stationsList, macsList, dataList, sensorsList, open, anchorEl,
      mobileOpen, alertsList, door_alert, fire_alert, systemList, alertsHistoryList, systemHistoryList, cards_order } = this.state;
    var tabs = [];
    var filter = '';
    var _filter = '';
    var element = [];
    var _type_measure = '';
    var measure = 0;
    var door_alert_filter = '';
    var fire_alert_filter = '';
    var voltage;
    var weatherList = '';
    var _cards_order = [];

    for (var i in cards_order) {
      _cards_order.push(cards_order[i]);
    }


    if (is_admin) {
      if (stationsList) {// if not empty

        stationsList.map((item, i) => (

          macsList.map((element, j) => {

            weatherList = dataList.filter((opt, k, arr) => {
              _type_measure = sensorsList.filter((_tm_item, _indx) => {
                return (_tm_item.typemeasure == opt.typemeasure);
              })
              return ((opt.typemeasure != element.chemical) && (opt.id == item.id) && (_type_measure[0].measure_class != 'data'));
            })
          }),

          door_alert_filter = door_alert.filter((_itm, _in, arr) => {
            return ((_itm[item.id]));
          }),
          fire_alert_filter = fire_alert.filter((_itm, _in, arr) => {
            return ((_itm[item.id]));
          }),

          tabs.push({
            tabName: item.namestation,
            tabIcon: StationIcon,
            tabContent: (
              < GridContainer style={{ padding: "2px" }} >
                {(_cards_order.length > 0) &&
                  _cards_order.map((_element, j) => (
                    (dataList.length > 0) &&
                    (filter = dataList.filter((opt, k, arr) => {
                      return ((opt.typemeasure == _element) && (opt.id == item.id));
                    })), (element = macsList.filter((__item, _i) => {
                      return (__item.chemical == _element);
                    })),
                    ((filter.length > 0) && (measure = filter[filter.length - 1].measure)),
                    (filter.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_' + _element}>
                      <Card>
                        <CardHeader stats icon >
                          <CardIcon color={filter[filter.length - 1].is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                            {filter[0].increase ? <Backup /> : <Backdown />}
                          </CardIcon>
                          <p className={classes.cardCategory}>Среднее (20 мин.) : {(_element == 'CO') ? measure.toFixed(1) : measure.toFixed(3)} мг/м3</p>
                          <p className={classes.cardCategory}> {(_element == 'CO') ? (measure / element[0].max_m).toFixed(1) : ((element[0].max_m > 900) ? 'нет' : (measure / element[0].max_m).toFixed(3))} долей ПДК</p>

                          <h3 className={classes.cardTitle}>{_element}</h3>
                          <p className={classes.cardCategory}>Мгновенное : {(_element == 'CO') ? filter[0].momental_measure.toFixed(3) : filter[0].momental_measure.toFixed(5)} мг/м3</p>

                        </CardHeader>
                        <CardFooter stats>
                          <div className={classes.stats}>
                            <Place />
                            {item.place}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <QueryBuilderIcon />&nbsp;&nbsp; {filter[0].date_time} </div>
                        </CardFooter>
                      </Card>

                    </GridItem>)


                  ))}

                {(_cards_order.length > 0) &&
                  _cards_order.map((_element, j) => (
                    (sensorsList.length > 0) && (
                      filter = sensorsList.filter((opt, k, arr) => {
                        return ((opt.typemeasure == _element) && (opt.id == item.id));
                      })
                    ),
                    (filter.length > 0) && (
                      _filter = dataList.filter((opt, k, arr) => {
                        return ((opt.typemeasure == _element) && (opt.id == item.id));
                      })
                    ),
                    (_filter.length > 0) && (filter = []),
                    (filter.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_' + filter[0].typemeasure}>
                      <Card>
                        <CardHeader stats icon  >
                          <CardIcon color={"info"} style={{ padding: "5px", color: "lightgrey" }}  >
                            <CloudOffIcon />
                          </CardIcon>


                          <h3 className={classes.cardTitle}>{filter[0].typemeasure}</h3>
                          <p className={classes.cardCategory}>Отключен...</p>

                        </CardHeader>
                        <CardFooter stats>
                          <div className={classes.stats}>
                            <Place />
                            {item.place} </div>
                        </CardFooter>
                      </Card>

                    </GridItem>)


                  ))}


                <hr style={{ width: "80%", size: "1" }} />

                {(weatherList) &&
                  weatherList.map((element, j) => (
                    _type_measure = sensorsList.filter((_tm_item, _indx) => {
                      return (_tm_item.typemeasure == element.typemeasure);
                    }),
                    ((weatherList.length > 0) && (measure = element.measure)),
                    (weatherList.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_' + _type_measure[0].typemeasure}>
                      <Card>
                        <CardHeader stats icon >
                          <CardIcon color={element.is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                            <Weather />
                          </CardIcon>
                          <p className={classes.cardCategory}>Среднее (20 мин.) : {measure.toFixed(1)} {_type_measure[0].unit_name}</p>
                          <h3 className={classes.cardTitle}>{_type_measure[0].typemeasure}</h3>
                          <p className={classes.cardCategory}>Мгновенное : {element.momental_measure.toFixed(1)} {_type_measure[0].unit_name}</p>

                        </CardHeader>
                        <CardFooter stats>
                          <div className={classes.stats}>
                            <Place />
                            {item.place} </div>
                        </CardFooter>
                      </Card>

                    </GridItem>)


                  ))}


                <hr style={{ width: "80%", size: "1" }} />

                {(dataList) &&

                  ((filter = dataList.filter((opt, k, arr) => {
                    return ((opt.typemeasure == 'Напряжение мин.') && (opt.id == item.id));
                  }), ((filter.length > 0) && (voltage = filter[filter.length - 1])),
                    (voltage) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_Voltage_min' + item.id}>
                      <Card>
                        <CardHeader stats icon >
                          <CardIcon color={voltage.is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                            <Build />
                          </CardIcon>
                          <p className={classes.cardCategory}>{voltage.measure.toFixed(1)} </p>


                          <h6 className={classes.cardTitle}>{voltage.typemeasure}</h6>

                        </CardHeader>
                        <CardFooter stats>
                          <div className={classes.stats}>
                            <Place />
                            {item.place} </div>
                        </CardFooter>
                      </Card>

                    </GridItem>)


                  ))}
                {(dataList) &&

                  ((filter = dataList.filter((opt, k, arr) => {
                    return ((opt.typemeasure == 'Напряжение макс.') && (opt.id == item.id));
                  }), ((filter.length > 0) && (voltage = filter[filter.length - 1])),
                    (voltage) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_Voltage_max' + item.id}>
                      <Card>
                        <CardHeader stats icon >
                          <CardIcon color={voltage.is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                            <Build />
                          </CardIcon>
                          <p className={classes.cardCategory}>{voltage.measure.toFixed(1)} </p>


                          <h6 className={classes.cardTitle}>{voltage.typemeasure}</h6>

                        </CardHeader>
                        <CardFooter stats>
                          <div className={classes.stats}>
                            <Place />
                            {item.place} </div>
                        </CardFooter>
                      </Card>

                    </GridItem>)


                  ))}


              </GridContainer >

            )
          })
        ))


      }

      tabs.push({
        tabName: 'Тревоги',
        tabIcon: Notifications,
        tabContent: (

          <GridContainer >
            <GridItem xs={12} sm={5} md={5}>
              <h6>Тревоги </h6>

              <Divider />


              <br />
              {(!isEmpty(alertsList)) &&
                alertsList.map((element, ind) => (
                  <SnackbarContent
                    color='danger'
                    key={'alert_' + ind}
                    message1={element.date_time}
                    message2={element.descr}
                    className={classes.message}

                  />))

              }

            </GridItem>

            <GridItem xs={12} sm={5} md={7}>
              <h6>Системные события</h6>
              <Divider />

              <br />
              {(!isEmpty(systemList)) &&
                systemList.map((element, ind) => (

                  <div style={{ display: element.is_visible ? 'block' : 'none' }} key={'sys_' + ind}>
                    <SnackbarContent

                      color={element.type == 200 ? 'info' : 'warning'}
                      message1={element.date_time}
                      message2={element.descr}
                      action={[
                        <IconButton
                          key={ind}
                          aria-label="Close"
                          color="inherit"
                          className={classes.close}
                          onClick={this.onClose(ind)}
                        >
                          <CloseIcon className={classes.icon} />
                        </IconButton>,
                      ]}
                      close
                    />
                  </div>))}
            </GridItem>

          </GridContainer>


        )
      })

      tabs.push({
        tabName: 'История',
        tabIcon: HistoryToggleOffTwoToneIcon,
        tabContent: (

          <GridContainer >
            <GridItem xs={12} sm={5} md={5}>
              <h6>Тревоги </h6>

              <Divider />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  id="dateTimeAlerts"
                  label="за "
                  type="date"
                  defaultValue={this.state.dateTimeAlerts}
                  className={classes.textField}
                  // selectProps={this.state.dateTimeBegin}
                  onChange={(event) => { this.handlePickerChange(event) }}
                  InputLabelProps={{
                    shrink: true,
                  }} />
              </div>

              <br />
              {(!isEmpty(alertsHistoryList)) &&
                alertsHistoryList.map((element, ind) => (
                  <SnackbarContent
                    color='danger'
                    key={'alert_' + ind}
                    message1={element.date_time}
                    message2={element.descr}
                    className={classes.message}
                  />))
              }
            </GridItem>
            <GridItem xs={12} sm={5} md={7}>
              <h6>Системные события</h6>
              <Divider />

              <br />
              {(!isEmpty(systemHistoryList)) &&
                systemHistoryList.map((element, ind) => (

                  <div style={{ display: element.is_visible ? 'block' : 'none' }} key={'sys_' + ind}>
                    <SnackbarContent
                      color={element.type == 200 ? 'info' : 'warning'}
                      message1={element.date_time}
                      message2={element.descr}
                      action={[
                        <IconButton
                          key={ind}
                          aria-label="Close"
                          color="inherit"
                          className={classes.close}
                          onClick={this.onClose(ind)}
                        >
                          <CloseIcon className={classes.icon} />
                        </IconButton>,
                      ]}
                      close
                    />
                  </div>))}
            </GridItem>
          </GridContainer>
        )
      })
    } else {
      if (stationsList) {// if not empty
        stationsList.map((item, i) => (
          macsList.map((element, j) => {

            weatherList = dataList.filter((opt, k, arr) => {
              _type_measure = sensorsList.filter((_tm_item, _indx) => {
                return (_tm_item.typemeasure == opt.typemeasure);
              })
              return ((opt.typemeasure != element.chemical) && (opt.id == item.id) && (_type_measure[0].measure_class != 'data'));
            })
          }),
          tabs.push({
            tabName: item.namestation,
            tabIcon: Backup,
            tabContent: (
              < GridContainer style={{ padding: "2px" }} >
              {(_cards_order.length > 0) &&
                _cards_order.map((_element, j) => (
                  (dataList.length > 0) &&
                  (filter = dataList.filter((opt, k, arr) => {
                    return ((opt.typemeasure == _element) && (opt.id == item.id));
                  })), (element = macsList.filter((__item, _i) => {
                    return (__item.chemical == _element);
                  })),
                  ((filter.length > 0) && (measure = filter[filter.length - 1].measure)),
                  (filter.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_' + _element}>
                    <Card>
                      <CardHeader stats icon >
                        <CardIcon color={filter[filter.length - 1].is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                          {filter[0].increase ? <Backup /> : <Backdown />}
                        </CardIcon>
                        <p className={classes.cardCategory}>Среднее (20 мин.) : {(_element == 'CO') ? measure.toFixed(1) : measure.toFixed(3)} мг/м3</p>
                        <p className={classes.cardCategory}> {(_element == 'CO') ? (measure / element[0].max_m).toFixed(1) : ((element[0].max_m > 900) ? 'нет' : (measure / element[0].max_m).toFixed(3))} долей ПДК</p>

                        <h3 className={classes.cardTitle}>{_element}</h3>
                        <p className={classes.cardCategory}>Мгновенное : {(_element == 'CO') ? filter[0].momental_measure.toFixed(3) : filter[0].momental_measure.toFixed(5)} мг/м3</p>

                      </CardHeader>
                      <CardFooter stats>
                        <div className={classes.stats}>
                          <Place />
                          {item.place}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <QueryBuilderIcon />&nbsp;&nbsp; {filter[0].date_time} </div>
                      </CardFooter>
                    </Card>

                  </GridItem>)


                ))}

              {(_cards_order.length > 0) &&
                _cards_order.map((_element, j) => (
                  (sensorsList.length > 0) && (
                    filter = sensorsList.filter((opt, k, arr) => {
                      return ((opt.typemeasure == _element) && (opt.id == item.id));
                    })
                  ),
                  (filter.length > 0) && (
                    _filter = dataList.filter((opt, k, arr) => {
                      return ((opt.typemeasure == _element) && (opt.id == item.id));
                    })
                  ),
                  (_filter.length > 0) && (filter = []),
                  (filter.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_' + filter[0].typemeasure}>
                    <Card>
                      <CardHeader stats icon  >
                        <CardIcon color={"info"} style={{ padding: "5px", color: "lightgrey" }}  >
                          <CloudOffIcon />
                        </CardIcon>


                        <h3 className={classes.cardTitle}>{filter[0].typemeasure}</h3>
                        <p className={classes.cardCategory}>Отключен...</p>

                      </CardHeader>
                      <CardFooter stats>
                        <div className={classes.stats}>
                          <Place />
                          {item.place} </div>
                      </CardFooter>
                    </Card>

                  </GridItem>)


                ))}


              <hr style={{ width: "80%", size: "1" }} />

              {(weatherList) &&
                weatherList.map((element, j) => (
                  _type_measure = sensorsList.filter((_tm_item, _indx) => {
                    return (_tm_item.typemeasure == element.typemeasure);
                  }),
                  ((weatherList.length > 0) && (measure = element.measure)),
                  (weatherList.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_' + _type_measure[0].typemeasure}>
                    <Card>
                      <CardHeader stats icon >
                        <CardIcon color={element.is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                          <Weather />
                        </CardIcon>
                        <p className={classes.cardCategory}>Среднее (20 мин.) : {measure.toFixed(1)} {_type_measure[0].unit_name}</p>
                        <h3 className={classes.cardTitle}>{_type_measure[0].typemeasure}</h3>
                        <p className={classes.cardCategory}>Мгновенное : {element.momental_measure.toFixed(1)} {_type_measure[0].unit_name}</p>

                      </CardHeader>
                      <CardFooter stats>
                        <div className={classes.stats}>
                          <Place />
                          {item.place} </div>
                      </CardFooter>
                    </Card>

                  </GridItem>)


                ))}


              <hr style={{ width: "80%", size: "1" }} />

              {(dataList) &&

                ((filter = dataList.filter((opt, k, arr) => {
                  return ((opt.typemeasure == 'Напряжение мин.') && (opt.id == item.id));
                }), ((filter.length > 0) && (voltage = filter[filter.length - 1])),
                  (voltage) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_Voltage_min' + item.id}>
                    <Card>
                      <CardHeader stats icon >
                        <CardIcon color={voltage.is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                          <Build />
                        </CardIcon>
                        <p className={classes.cardCategory}>{voltage.measure.toFixed(1)} </p>


                        <h6 className={classes.cardTitle}>{voltage.typemeasure}</h6>

                      </CardHeader>
                      <CardFooter stats>
                        <div className={classes.stats}>
                          <Place />
                          {item.place} </div>
                      </CardFooter>
                    </Card>

                  </GridItem>)


                ))}
              {(dataList) &&

                ((filter = dataList.filter((opt, k, arr) => {
                  return ((opt.typemeasure == 'Напряжение макс.') && (opt.id == item.id));
                }), ((filter.length > 0) && (voltage = filter[filter.length - 1])),
                  (voltage) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_Voltage_max' + item.id}>
                    <Card>
                      <CardHeader stats icon >
                        <CardIcon color={voltage.is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                          <Build />
                        </CardIcon>
                        <p className={classes.cardCategory}>{voltage.measure.toFixed(1)} </p>


                        <h6 className={classes.cardTitle}>{voltage.typemeasure}</h6>

                      </CardHeader>
                      <CardFooter stats>
                        <div className={classes.stats}>
                          <Place />
                          {item.place} </div>
                      </CardFooter>
                    </Card>

                  </GridItem>)


                ))}


            </GridContainer >

            )
          })
        ))


      }

      tabs.push({
        tabName: 'Тревоги',
        tabIcon: Notifications,
        tabContent: (

          <GridContainer >
            <GridItem xs={12} sm={5} md={3}>
            </GridItem>

            <GridItem xs={12} sm={5} md={5}>
              <h6>Тревоги</h6>
              <Divider />

              <br />
              {(alertsList) &&
                alertsList.map((element, ind) => (
                  <SnackbarContent
                    color='danger'
                    key={'alert_' + ind}
                    message1={element.date_time}
                    message2={element.descr} />))
              }

            </GridItem>
            <GridItem xs={12} sm={5} md={3}>
            </GridItem>
          </GridContainer>


        )
      })
    }
    return (

      <div>


        <Tabs
          title="Станции наблюдения:"
          headerColor="info"

          tabs={tabs} />
      </div >

    );
  }
}

function mapStateToProps(state) {

  return {
    username: state.auth[0].user.username,
    is_admin: state.auth[0].user.full,
    systemList: state.logsList
  };
}

DashBoard.propTypes = {

  classes: PropTypes.object.isRequired
}



export default connect(mapStateToProps, {
  pointAddAction, pointDeleteAction, getPoint, getActivePoint, addLogsList, deleteLogsList, queryDashBoardDataOperativeEvent,
  queryDashBoardAlertsHistory, queryAllDataOperativeEvent, queryEvent, queryMeteoEvent, getSettings
})(withStyles(styles)(DashBoard));

