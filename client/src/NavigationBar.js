import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import logo from './logo.svg';

import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';

//import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import { logout } from './actions/loginActions';

import isEmpty from 'lodash.isempty';

import Divider from 'material-ui/Divider';
import { withStyles } from '@material-ui/core/styles';

import { getPoint, getActivePoint } from './actions/adminActions';
import { pointAddAction, pointDeleteAction } from './actions/dataAddActions';
import CloudDoneIcon from '@material-ui/icons/CloudQueue';
import CloudOffIcon from '@material-ui/icons/CloudOff';
//import Notifier from './stuff/Notifier';
import Tooltip from '@material-ui/core/Tooltip';

export const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },

  cardIcon: {

    borderRadius: "3px",
    backgroundColor: "#999",
    padding: "5px",
    marginTop: "-20px",
    marginRight: "15px",
    float: "left"
  },

  icon: {
    fontSize: 20,
  },
  inactiveicon:
  {
    backgroundColor: 'grey'
  },
  message: {
    maxWidth: 50,
    backgroundColor: 'blue',

  },
  tooltip: {
    backgroundColor: 'blue',

    padding: '4px 8px',

    maxWidth: 300,
    wordWrap: 'break-word',
    fontWeight: '40',
  },
  selected:
  {
    fontWeight: "bold",
    textDecorationLine: 'overline',
    textDecorationColor: 'red',
    textDecorationThickness: '105px !important'
  },

});

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);

    this.reportRef = React.createRef();

    this.state = {
      point_descr: '',
      class_report: { 'admin': false, 'points': false, 'reports': false, 'charts': false, 'stats': false, 'tables': false, 'maps': false }
    }
  }


  logout(e) {
    this.setState({ class_report: { 'admin': false, 'points': false, 'reports': false, 'charts': false, 'stats': false, 'tables': false, 'maps': false } });
    e.preventDefault();
    this.props.logout();
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
          pointAddAction({ iddMeasure: _data[0].idd, inMeasure: inMeasure, place: _data[0].place, descr: '', begin_measure_time: _data[0].date_time_in });

          //this.setState({ iddMeasure: _data[0].idd, lat: _data[0].latitude, lon: _data[0].longitude, point_actual: _data[0].idd })
        }
      })
    })
  }

  click_menu(e) {
    //console.log("navigator test", e.target.id);

    this.setState({ class_report: { [e.target.id]: !this.state.class_report[e.target.id] } });
  }

  componentWillMount() {
    this.map_load();
    this.setState({ class_report: { 'admin': false, 'points': false, 'reports': false, 'charts': false, 'stats': false, 'tables': false, 'maps': false } });

    //doc.addEventListener('contextmenu', function () {
    // alert('sds')
    //});
  }
  componentDidMount() {
    // var doc = ReactDOM.findDOMNode(this.refs.status);

  }

  render() {
    const { classes } = this.props;
    let { isAuthenticated } = false;
    let { username } = '';
    if (!isEmpty(sessionStorage.jwToken)) {
      let { auth } = this.props;
      isAuthenticated = auth[0];
      username = auth[0].user.username;
    } else {
      isAuthenticated = false;
      username = '';
    }

    const AdminLinks = (
      <ul className="nav navbar-nav navbar-right">

        <li><Link to="/admin" id="admin" className={this.state.class_report.admin ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Администрирование </Link>&nbsp; &nbsp;
          <Link to="/points" id="points" className={this.state.class_report.points ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Точки отбора </Link>&nbsp; &nbsp;
          <Link to="/reports" id="reports" className={this.state.class_report.reports ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Отчеты  </Link>&nbsp; &nbsp;
          <Link to="/charts" id="charts" className={this.state.class_report.charts ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Графики  </Link>&nbsp; &nbsp;
          <Link to="/stats" id="stats" className={this.state.class_report.stats ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Статистика </Link> &nbsp; &nbsp;
          <Link to="/tables" id="tables" className={this.state.class_report.tables ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Таблицы  </Link>&nbsp; &nbsp;
          <Link to="/maps" id="maps" className={this.state.class_report.maps ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Карты  </Link>&nbsp; &nbsp;
          <a href="https://map.gpshome.ru/main/index.php?login=mosoblecomon&password=mosoblecomon" target="_blank">GPS кабинет</a>

          <a href="#" onClick={this.logout.bind(this)}>   Выход</a></li>
      </ul>
    );
    //         <Link to="/meteo">Метеоданные  &nbsp; &nbsp;</Link>

    const userLinks = (
      <ul className="nav navbar-nav navbar-right">
        <li>  <Link to="/points" id="points" className={this.state.class_report.points ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Точки отбора </Link>&nbsp; &nbsp;
          <Link to="/reports" id="reports" className={this.state.class_report.reports ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Отчеты  </Link>&nbsp; &nbsp;
          <Link to="/charts" id="charts" className={this.state.class_report.charts ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Графики  </Link>&nbsp; &nbsp;
          <Link to="/stats" id="stats" className={this.state.class_report.stats ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Статистика </Link> &nbsp; &nbsp;
          <Link to="/tables" id="tables" className={this.state.class_report.tables ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Таблицы  </Link>&nbsp; &nbsp;
          <Link to="/maps" id="maps" className={this.state.class_report.maps ? classes.selected : ''} onClick={this.click_menu.bind(this)}>Карты  </Link>&nbsp; &nbsp;

          <a href="#" onClick={this.logout.bind(this)}>   Выход</a></li>
      </ul>
    );
    //<Link to="/meteo">Метеоданные  &nbsp; &nbsp;</Link>
    const guestLinks = (
      <ul className="nav navbar-nav navbar-right">
        <li><Link to="/signup">Регистрация</Link>{"           "}
          <Link to="/login">Войти</Link></li>
      </ul>
    );
    return (
      <div>
        <CssBaseline />
        <div className="App App-header">
          <img src={logo} className="App-logo" alt="Data visualizer" />
          <h3 className="">Визуализация газоаналитических данных </h3>
        </div>
        <nav className="navbar App-navbar">

          <div className="container-fluid">
            <div className="navbar-header">

              <Link to="/" className="navbar-text" id ='main' onClick={this.click_menu.bind(this)}>{isAuthenticated ? ("Пользователь: " + username) : "Не авторизовано"}
              </Link>&nbsp;&nbsp;&nbsp;&nbsp;
              {isAuthenticated && (this.props.inMeasure) && (<CloudDoneIcon fontSize="small" color="primary" style={{ verticalAlign: 'middle', paddingTop: '1px' }} />)}
              {(isAuthenticated && !this.props.inMeasure) && (<CloudOffIcon fontSize="small" color="secondary" style={{ verticalAlign: 'middle', paddingTop: '1px' }} />)}&nbsp;&nbsp;
              {isAuthenticated && (<Tooltip title={"Время начала наблюдения: " + this.props.begin_measure_time}  ><Link to="/points" className="navbar-text" style={{ color: this.props.inMeasure ? "indigo" : "grey" }}><b >точка отбора:</b>&nbsp;&nbsp; {this.props.point_descr.substr(0, 25)} &nbsp;&nbsp;
                <b > измерения: </b> {this.props.inMeasure ? "проводятся с " + new Date(this.props.begin_measure_time).format('HH:mm:SS') : "отключены"}</Link></Tooltip>)}
            </div>

            <div className="navbar-text">

              {isAuthenticated && (username == 'admin') ? AdminLinks : (isAuthenticated ? userLinks : guestLinks)}



            </div>
          </div>

        </nav>

        <Divider />

      </div >

    );
  }
}

NavigationBar.propTypes = {

  logout: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    point_descr: state.points[0].active_point.place + ' - ' + state.points[0].active_point.descr,
    inMeasure: state.points[0].active_point.inMeasure,
    begin_measure_time: state.points[0].active_point.begin_measure_time
  };
}



export default connect(mapStateToProps, { pointAddAction, pointDeleteAction, getPoint, getActivePoint, logout })(withStyles(styles)(NavigationBar));
//export default (NavigationBar);           <Link to="/maps">Карты  &nbsp; &nbsp;</Link>
