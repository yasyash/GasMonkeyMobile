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

import { getPoint, getActivePoint } from './actions/adminActions';
import { pointAddAction, pointDeleteAction } from './actions/dataAddActions';
import CloudDoneIcon from '@material-ui/icons/CloudQueue';
import CloudOffIcon from '@material-ui/icons/CloudOff';
//import Notifier from './stuff/Notifier';



class NavigationBar extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      point_descr: ''
    }
  }


  logout(e) {
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
          pointAddAction({ iddMeasure: _data[0].idd, inMeasure: inMeasure, place: _data[0].place, descr: '' });

          //this.setState({ iddMeasure: _data[0].idd, lat: _data[0].latitude, lon: _data[0].longitude, point_actual: _data[0].idd })
        }
      })
    })
  }

  componentWillMount() {
    this.map_load();
    //doc.addEventListener('contextmenu', function () {
    // alert('sds')
    //});
  }
  componentDidMount() {
    // var doc = ReactDOM.findDOMNode(this.refs.status);

  }

  render() {
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

        <li><Link to="/admin">Администрирование  &nbsp; &nbsp;</Link>
          <Link to="/points">Точки отбора &nbsp; &nbsp;</Link>

          <Link to="/reports">Отчеты  &nbsp; &nbsp;</Link>
          <Link to="/charts">Графики  &nbsp; &nbsp;</Link>
          <Link to="/stats">Статистика  &nbsp; &nbsp;</Link>
          <Link to="/tables">Таблицы  &nbsp; &nbsp;</Link>
          <Link to="/maps">Карты  &nbsp; &nbsp;</Link>
          <a href="https://map.gpshome.ru/main/index.php?login=mosoblecomon&password=mosoblecomon" target="_blank">GPS кабинет</a>

          <a href="#" onClick={this.logout.bind(this)}>   Выход</a></li>
      </ul>
    );
    //         <Link to="/meteo">Метеоданные  &nbsp; &nbsp;</Link>

    const userLinks = (
      <ul className="nav navbar-nav navbar-right">
        <Link to="/points">Точки отбора &nbsp; &nbsp;</Link>

        <li><Link to="/reports">Отчеты  &nbsp; &nbsp;</Link>
          <Link to="/charts">Графики  &nbsp; &nbsp;</Link>
          <Link to="/stats">Статистика  &nbsp; &nbsp;</Link>
          <Link to="/tables">Таблицы  &nbsp; &nbsp;</Link>
          <Link to="/maps">Карты  &nbsp; &nbsp;</Link>


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

              <Link to="/" className="navbar-text">{isAuthenticated ? ("Пользователь: " + username) : "Не авторизовано"}
              </Link>&nbsp;&nbsp;&nbsp;&nbsp;
              {isAuthenticated && (this.props.inMeasure) && (<CloudDoneIcon fontSize="small" color="primary" style={{ verticalAlign: 'middle', paddingTop: '1px' }} />)}
              {(isAuthenticated && !this.props.inMeasure) && (<CloudOffIcon fontSize="small" color="secondary" style={{ verticalAlign: 'middle', paddingTop: '1px' }} />)}&nbsp;&nbsp;
              {isAuthenticated && (<Link to="/points" className="navbar-text" style={{ color: this.props.inMeasure ? "indigo" : "grey" }}><b >точка отбора:</b>&nbsp;&nbsp; {this.props.point_descr.substr(0, 25)} &nbsp;&nbsp;
                <b > измерения: </b> {this.props.inMeasure ? "проводятся" : "отключены"}</Link>)}
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
    inMeasure: state.points[0].active_point.inMeasure
  };
}



export default connect(mapStateToProps, { pointAddAction, pointDeleteAction, getPoint, getActivePoint, logout })(NavigationBar);
//export default (NavigationBar);           <Link to="/maps">Карты  &nbsp; &nbsp;</Link>
