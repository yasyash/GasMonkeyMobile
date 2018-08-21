import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import Grid from "@material-ui/core/Grid";
// @material-ui/icons
import Language from "@material-ui/icons/Language";
import DateRange from "@material-ui/icons/DateRange";
import Backup from '@material-ui/icons/Backup';
import Place from '@material-ui/icons/Place';

// core components
import GridItem from "material-dashboard-react/components/Grid/GridItem";
import Card from "material-dashboard-react/components/Card/Card";
import CardBody from "material-dashboard-react/components/Card/CardBody";
import CardHeader from "material-dashboard-react/components/Card/CardHeader";
import CardIcon from "material-dashboard-react/components/Card/CardIcon";
import CardFooter from 'material-dashboard-react/components/Card/CardFooter';
import GridContainer from "material-dashboard-react/components/Grid/GridContainer";
import Tabs from "material-dashboard-react/components/CustomTabs/CustomTabs";

import Dashboard from 'material-dashboard-react/views/Dashboard/Dashboard';
import dashboardStyle from "material-dashboard-react/assets/jss/material-dashboard-react/views/dashboardStyle";
import * as _materialDashboardReact from "material-dashboard-react/assets/jss/material-dashboard-react";

import { queryAllDataOperativeEvent, queryEvent, queryMeteoEvent } from './actions/queryActions';

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
  roseCardHeader: _materialDashboardReact.roseCardHeader

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
      dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm'),
      dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),
    }
  }

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

  componentWillMount() {
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
          this.setState({ dataList, sensorsList, macsList });


        }
      });
    })
  }

  render() {
    const { classes } = this.props;
    const { stationsList, macsList, dataList } = this.state;
    var tabs = [];
    var filter = '';
    var measure = 0;
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
                          {item.namestation} </div>
                      </CardFooter>
                    </Card>

                  </GridItem>)


                ))}
            </GridContainer >
          )
        })
      ))
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

DashBoard.propTypes = {

  classes: PropTypes.object.isRequired
}


export default connect(null, { queryAllDataOperativeEvent, queryEvent, queryMeteoEvent })(withStyles(styles)(DashBoard));