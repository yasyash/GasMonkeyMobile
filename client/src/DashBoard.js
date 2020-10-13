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

//import Sidebar from 'material-dashboard-react/components/Sidebar/Sidebar';
//import appRoutes from 'material-dashboard-react/routes/index';

import dashboardStyle from "material-dashboard-react/assets/jss/material-dashboard-react/views/dashboardStyle";

import * as _materialDashboardReact from "material-dashboard-react/assets/jss/material-dashboard-react";

import { queryAllDataOperativeEvent, queryEvent, queryMeteoEvent } from './actions/queryActions';
import { addLogsList, deleteLogsList } from './actions/logsAddActions';
import { filter } from 'ramda';
//import auth from './reducers/auth';


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
  message: {
    textAlign: 'justify',
    fontSize: 10
  },


});

class DashBoard extends Component {

  constructor(props) {
    super(props);

    let today = new Date();
    today -= 600000;

    this.state = {
      stationsList: [],
      dataList: [],
      sensorsList: [],
      macsList: [],
      alertsList: [],
      systemList: [],
      dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm'),
      dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),
      open: false,
      anchorEl: null,
      mobileOpen: true,
      door_alert: [],
      fire_alert: [],
      dataSumList: []


    }
  }

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


    let data = await (this.props.queryAllDataOperativeEvent(params));
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
  renderData() {
    if (!isEmpty(this.props.username)) {
      let params = {};


      params.period_from = this.state.dateTimeBegin;
      params.period_to = this.state.dateTimeEnd;

      this.load_stations().then(stations => {
        this.setState({ stationsList: stations });
        this.load_data(params).then(data => {
          if (data) {
            let dataList = data.dataTable;
            let sensorsList = data.sensorsTable;
            let macsList = data.macsTable;
            let alertsList = data.alertsTable;
            let systemList = data.systemTable;
            let today = new Date();
            let _door_alert = false;
            let _fire_alert = false;
            var door_alert = [];
            var fire_alert = [];
            let { stationsList } = this.state;
            var dataSumList = [];
            today -= 600000;

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

            sensorsList.map((element, j) => {
              var _measure = 0;

              if (dataList.length > 0) {
                var _data = dataList.filter((opt, k, arr) => {
                  return ((opt.serialnum == element.serialnum));
                })


                if (_data.length > 0) {

                  _data.map((opt, j) => {

                    measure += opt.measure;

                  });

                  let _macs = macsList.filter((opt, k, arr) => {
                    return ((opt.chemical == element.typemeasure));
                  })

                  dataSumList.push({
                    'id': _data[_data.length - 1].id, 'typemeasure': _data[_data.length - 1].typemeasure, 'serialnum': _data[_data.length - 1].serialnum,
                    'date_time': _data[_data.length - 1].date_time, 'unit_name': _data[_data.length - 1].unit_name, 'measure': measure / _data.length,
                    'is_alert': ((measure / _data.length > _macs.max_m) ? true : false)
                  });
                }
              }
            })

            this.setState({
              dataList, dataSumList, sensorsList, macsList, alertsList, systemList,
              dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm'),
              dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),
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
  componentWillMount() {
    this.renderData();
    this.interval = setInterval(this.renderData.bind(this), 10000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    //var { isAuthenticated } = false;

    const { username, is_admin } = this.props;

    const { classes, systemList } = this.props;
    const { stationsList, macsList, dataList, dataSumList, open, anchorEl, mobileOpen, alertsList, door_alert, fire_alert } = this.state;
    var tabs = [];
    var filter = '';
    var measure = 0;
    var door_alert_filter = '';
    var fire_alert_filter = '';
    var voltage;

    if (is_admin) {
      if (stationsList) {// if not empty

        stationsList.map((item, i) => (

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
                {(macsList) &&
                  macsList.map((element, j) => (
                    (dataSumList.length > 0) &&
                    (filter = dataSumList.filter((opt, k, arr) => {
                      return ((opt.typemeasure == element.chemical) && (opt.id == item.id));
                    })),
                    ((filter.length > 0) && (measure = filter[filter.length - 1].measure)),
                    (filter.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_' + element.chemical}>
                      <Card>
                        <CardHeader stats icon >
                          <CardIcon color={filter[filter.length - 1].is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                            <Backup />
                          </CardIcon>
                          <p className={classes.cardCategory}>{measure.toFixed(6)} мг/м3</p>
                          <p className={classes.cardCategory}>{(measure / element.max_m * 100).toFixed(1)} % ПДК</p>

                          <h3 className={classes.cardTitle}>{element.chemical}</h3>

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
                {(dataList.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_door'}>
                  <Card>
                    <CardHeader stats icon >
                      <CardIcon color={((door_alert_filter.length > 0) && (door_alert_filter)) ? "danger" : "info"} style={{ padding: "5px" }} >
                        <Build />
                      </CardIcon>
                      <p className={classes.cardCategory}>{((door_alert_filter.length > 0) && (door_alert_filter)) ? "Взлом" : "Норма"}</p>


                      <h6 className={classes.cardTitle}>Датчик двери</h6>

                    </CardHeader>
                    <CardFooter stats>
                      <div className={classes.stats}>
                        <Place />
                        {item.place} </div>
                    </CardFooter>
                  </Card>

                </GridItem>)}

                {(dataList.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_fire'}>
                  <Card>
                    <CardHeader stats icon >
                      <CardIcon color={((fire_alert_filter.length > 0) && (fire_alert_filter)) ? "danger" : "info"} style={{ padding: "5px" }} >
                        <Build />
                      </CardIcon>
                      <p className={classes.cardCategory}>{((fire_alert_filter.length > 0) && (fire_alert_filter)) ? "Тревога" : "Норма"}</p>


                      <h6 className={classes.cardTitle}>Сигнал пожара</h6>

                    </CardHeader>
                    <CardFooter stats>
                      <div className={classes.stats}>
                        <Place />
                        {item.place} </div>
                    </CardFooter>
                  </Card>

                </GridItem>)}
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
              <h6>Тревоги</h6>
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
    } else {
      if (stationsList) {// if not empty
        stationsList.map((item, i) => (
          tabs.push({
            tabName: item.namestation,
            tabIcon: Backup,
            tabContent: (
              < GridContainer style={{ padding: "2px" }} >
                {(macsList) &&
                  macsList.map((element, j) => (
                    (dataList.length > 0) &&
                    (filter = dataList.filter((opt, k, arr) => {
                      return ((opt.typemeasure == element.chemical) && (opt.id == item.id));
                    })),
                    ((filter.length > 0) && (measure = filter[filter.length - 1].measure)),
                    (filter.length > 0) && (<GridItem xs={3} sm={3} md={3} key={item.namestation + '_' + element.chemical}>
                      <Card>
                        <CardHeader stats icon >
                          <CardIcon color={filter[filter.length - 1].is_alert ? "danger" : "info"} style={{ padding: "5px" }} >
                            <Backup />
                          </CardIcon>
                          <p className={classes.cardCategory}>{measure.toFixed(6)} мг/м3</p>
                          <p className={classes.cardCategory}>{(measure / element.max_m * 100).toFixed(1)} % ПДК</p>

                          <h3 className={classes.cardTitle}>{element.chemical}</h3>

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



export default connect(mapStateToProps, { addLogsList, deleteLogsList, queryAllDataOperativeEvent, queryEvent, queryMeteoEvent })(withStyles(styles)(DashBoard));

