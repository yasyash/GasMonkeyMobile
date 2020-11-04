import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconMenu from 'material-ui/IconMenu';
import RaisedButton from 'material-ui/RaisedButton';
import Settings from 'material-ui/svg-icons/action/settings';
import ContentFilter from 'material-ui/svg-icons/content/filter-list';
import FileFileDownload from 'material-ui/svg-icons/file/file-download';
import TextField from '@material-ui/core/TextField';
import Toggle from 'material-ui/Toggle';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';

import SvgIcon from '@material-ui/core/SvgIcon';

import WbCloudy from '@material-ui/icons/WbCloudy'
import BarChart from '@material-ui/icons/Equalizer';
import TimeLine from '@material-ui/icons/Timeline';
import Switch from '@material-ui/core/Switch';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Tooltip from '@material-ui/core/Tooltip';
import PagesIcon from '@material-ui/icons/Pages';

import CheckBox from '@material-ui/icons/CheckBox';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

import canvas2pdf from 'canvas2pdf/src/canvas2pdf';

import { connect } from 'react-redux';


import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';

import isEmpty from 'lodash.isempty';

const ITEM_HEIGHT = 48;


const styles = theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    icon: {
        margin: theme.spacing.unit / 2,
        color: blue[600],

    },
    icon_mnu: {
        margin: theme.spacing.unit,
        color: blue[600],
        margin: 0

    },
    iOSSwitchBase: {
        '&$iOSChecked': {
            color: theme.palette.common.white,
            '& + $iOSBar': {
                backgroundColor: blue[600],
            },
        },
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.sharp,
        }),
    },
    iOSChecked: {
        transform: 'translateX(15px)',
        '& + $iOSBar': {
            opacity: 1,
            border: 'none',
        },
    },
    iOSBar: {
        borderRadius: 13,
        width: 38,
        height: 23,
        marginTop: -12,
        marginLeft: -20,
        border: 'solid 1px',
        borderColor: theme.palette.grey[400],
        backgroundColor: theme.palette.grey[50],
        opacity: 1,
        transition: theme.transitions.create(['background-color', 'border']),
    },
    iOSIcon: {
        width: 20,
        height: 20,
    },
    iOSIconChecked: {
        boxShadow: theme.shadows[1],
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 250,
    },
});




class MenuStats extends Component {

    constructor(props) {
        let isNll = false;
        super(props);

        const { fixedHeader,

            isStation,
            isLoading,
            snack_msg,
            value,
            options,
            meteoOptions,
            stationsList,
            dateTimeBegin,
            dateTimeEnd,
            checkedMeteo
        } = props;

        if (isStation) { isNll = true }

        this.state = {

            isStation: isNll,
            isLoading,
            snack_msg,
            value,
            anchorEl: null,
            options,
            meteoOptions,
            checked: [],
            consentration: '',
            chemical_list: ['Направление ветра', 'NO', 'NO2', 'NH3', 'SO2', 'H2S', 'O3', 'CO', 'CH2O', 'PM1', 'PM2.5', 'PM10', 'Пыль общая',
                'бензол', 'толуол', 'этилбензол', 'м,п-ксилол', 'о-ксилол', 'хлорбензол', 'стирол', 'фенол'],
            chemical: '',
            station_actual: '',
            station_id: '',
            stationsList,
            sensorsList: '',
            sensors_actual: '',
            dateTimeBegin,
            dateTimeEnd,
            dataList: {},
            dateTime: new Date().format('Y-MM-dd'),
            checkedMeteo

        };




        //this.handleClose = this.handleClose.bind (this);
        //this.handleClick = this.handleClick.bind (this);
        // this.handleChange = this.handleChange.bind (this);

    }

    handleSelectChemicalChange = event => {

        this.setState({ [event.target.name]: event.target.value });
        const { sensorsList } = this.state;
        if (sensorsList) {
            let filter = sensorsList.filter((item, i, arr) => {
                return item.typemeasure == event.target.value;
            });

            this.setState({ sensors_actual: filter[0].serialnum });
            this.props.handleChangeParent('sensors_actual', [filter[0].serialnum]);
            this.loadData(2, filter[0].id, filter[0].serialnum).then(_data => {
                if (_data.length > 0) {
                    this.setState({ dataList: _data, isLoading: true, snack_msg: 'Данные загружены. Выберите диаграмму...' });
                    this.props.getChartData(this.props.checkedMeteo, this.props.whatsRange);
                } else {
                    this.setState({ dataList: [], isLoading: true, snack_msg: 'Данные отстутствуют...' });
                    this.props.getChartData(this.props.checkedMeteo, this.props.whatsRange);
                }
            })
        }
    };
    handleSelectChange = event => {
        if (event.target.name == 'station_actual') {

            const { stationsList } = this.props;
            let filter = stationsList.filter((item, i, arr) => {
                return item.namestation == event.target.value;
            });
            this.setState({ [event.target.name]: event.target.value });

            this.setState({ station_id: filter[0].id });

            this.loadData(1, filter[0].id).then(_data => {
                if (_data)
                    this.setState({ sensorsList: _data });

                if (this.state.sensors_actual) { //if we have sensors already
                    let filter = _data.filter((item, i, arr) => {
                        return item.typemeasure == this.state.chemical;
                    });

                    this.setState({ sensors_actual: filter[0].serialnum });

                    this.loadData(2, filter[0].id, filter[0].serialnum).then(_data => {
                        if (this.props.dataList.length > 0) {
                            this.setState({ dataList: _data, isLoading: true, snack_msg: 'Данные загружены. Выберите диаграмму...' });
                            this.props.getChartData(this.props.checkedMeteo, this.props.whatsRange);
                        } else {
                            this.setState({ dataList: [], isLoading: true, snack_msg: 'Данные отстутствуют...' });
                            this.props.getChartData(this.props.checkedMeteo, this.props.whatsRange);
                        }
                    })
                }
            })

        }


    };
    handleSnkClose() {
        this.setState({ isLoading: false });
        // this.setState({ isUpdated: false });

    };

    handlePickerChange = (event) => {
        const value = event.target.value;
        const id = event.target.id;
        var __timein = '';
        var __timeout = '';
        var __time = '';

        if (id == 'dateTimeBegin') {
            __time = event.target.value + 'T' + '00:00:00';
            __timein = __time;
            __timeout = this.state.dateTimeEnd;
        }
        if (id == 'dateTimeEnd') {
            __time = event.target.value + 'T' + '23:59:59';
            __timein = this.state.dateTimeBegin;
            __timeout = __time;

        }
        this.setState({ [id]: __time });

        if (this.state.sensors_actual && this.state.station_actual) {

            this.loadData(2, this.state.station_id, this.state.sensors_actual, __timein, __timeout).then(_data => {
                if (_data.length > 0) {
                    this.setState({ dataList: _data, isLoading: true, snack_msg: 'Данные загружены. Выберите диаграмму...' });
                    this.props.getChartData(this.props.checkedMeteo, this.props.whatsRange);
                }
                else {
                    this.setState({ dataList: [], isLoading: true, snack_msg: 'Данные отстутствуют...' });
                    this.props.getChartData(this.props.checkedMeteo, this.props.whatsRange);
                }

            })

        }
        //  dateAddAction({ [id]: value });
    };
    handleLocalChangeExhaust = name => event => {
        // const{meteoOptions} = this.props;
        // const{options} = this.props;
        //if (isNumber(Number(event.target.value)))
        //{
        this.setState({ [name]: event.target.value });

        this.props.handleChangeExhaust(name, event);
        // } else
        // {
        //  this.setState({ [name]: 'цифровое значение' });

        //}
        // this.setState({meteoOptions});
        // this.setState({options});

    };
    handleLocalChangeToggle = name => event => {
        // const{meteoOptions} = this.props;
        // const{options} = this.props;

        this.props.handleChangeToggle(name, event);
        // this.setState({meteoOptions});
        // this.setState({options});

    };

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
        this.setState({ meteoOptions: this.props.meteoOptions });
        this.setState({ options: this.props.options });

    };

    handleClose = () => {
        this.setState({ anchorEl: null });

    };
    handleChange = name => event => {
        if (this.props.checkedMeteo) {
            const { options } = this.state;

            // indx = options.chemical.indexOf(name);
            for (var key in options) {
                if (options[key].chemical === name) {
                    options[key]['visible'] = event.target.checked;

                };
            };

            this.setState({ options });
            this.props.hideLine({ options });

        } else {
            const { meteoOptions } = this.state;
            // indx = options.chemical.indexOf(name);
            for (var key in meteoOptions) {
                if (meteoOptions[key].header === name) {
                    meteoOptions[key]['visible'] = event.target.checked;

                };
            };

            this.setState({ meteoOptions });
            this.props.hideLine({ meteoOptions });

        };
    };

    handlePdfClick = (name) => {

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        })

        //var _html =  document.getElementById('line_chart');
        //var dom = document.createElement('line_chart');
        //   var cnvs =  document.getElementById("chartjs-render-monitor ");
        var cnvs = document.getElementById("chrts");
        console.log(this.refs.chart.chrts);
        var img = cnvs.toDataURL("image/png");


        dom.operative_report = _html;
        //let pdfHTML = _html.childNodes[0];
        let canvas = doc.canvas;
        canvas.height = 210;
        canvas.width = 290;
        canvas.style = { width: 290, height: 210 };

        const { dateTimeEnd } = this.state;
        //canvas.pdf = doc;

        // html2canvas(_html).then(function(_canvas) {


        //});
        var opt = {
            margin: 15,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 5 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        //   var worker = html2pdf().from(_html.innerHTML).set(opt).save('Chart_'+new Date(dateTimeEnd).format('dd-MM-Y_H:mm')+'.pdf');




    }

    handleLocalAverage = (name) => {
        const { sensors_actual, sensorsList } = this.state;
        if (sensorsList) {
            var filter = sensorsList.filter((item, i, arr) => {
                return item.typemeasure == 'Направление ветра';
            });
        }
        if (!isEmpty(filter))
            this.loadWindData(2,filter[0].id ,filter[0].serialnum, this.state.dateTimeBegin, this.state.dateTimeEnd).then(_windData => {
                if (_windData.length > 0) {
                    this.props.getRadarData(false, _windData);
                }
            })
    }

    async    loadWindData(qtype, _params_stations, _params_sensors, _dtBegin, _dtEnd) {
        var params = {};
        // 0 - all stations, 1- all sensors of the station, 2 - selected sensors
        //console.log('loaddata111')            
        if (isEmpty(_dtBegin)) {
            params.period_from = this.state.dateTimeBegin;
            params.period_to = this.state.dateTimeEnd;
        } else {
            params.period_from = _dtBegin;
            params.period_to = _dtEnd;
        }

        if (qtype > 0) {

            params.station = _params_stations;
        }
        if (qtype > 1) {
            params.sensors = [_params_sensors];
            params.averaging = 1;
        };

        var data = await (this.props.queryLocalEvent(params));
        //console.log(data);
        if ((data.length > 0) && (qtype > 1)) {
            if (data[0].typemeasure) {
                if (data[0].typemeasure == 'Направление ветра') {
                    this.props.handleChangeParent('isMeteo', true);
                    this.props.handleChangeParent('whatsRange', true);

                } else {
                    this.props.handleChangeParent('isMeteo', false);
                    this.props.handleChangeParent('whatsRange', false);


                }
            }
        }
        return data;
    };

    async    loadData(qtype, _params_stations, _params_sensors, _dtBegin, _dtEnd) {
        var params = {};
        // 0 - all stations, 1- all sensors of the station, 2 - selected sensors
        //console.log('loaddata111')            
        if (isEmpty(_dtBegin)) {
            params.period_from = this.state.dateTimeBegin;
            params.period_to = this.state.dateTimeEnd;
        } else {
            params.period_from = _dtBegin;
            params.period_to = _dtEnd;
        }

        if (qtype > 0) {

            params.station = _params_stations;
        }
        if (qtype > 1) {
            params.sensors = [_params_sensors];
            params.averaging = 1;
        };

        var data = await (this.props.queryFullEvent(params));
        //console.log(data);
        if ((data.length > 0) && (qtype > 1)) {
            if (data[0].typemeasure) {
                if (data[0].typemeasure == 'Направление ветра') {
                    this.props.handleChangeParent('isMeteo', true);
                    this.props.handleChangeParent('whatsRange', true);

                } else {
                    this.props.handleChangeParent('isMeteo', false);
                    this.props.handleChangeParent('whatsRange', false);


                }
            }
        }
        return data;
    };

    render() {

        const { classes } = this.props;
        const { anchorEl } = this.state;
        const { options, chemical_list } = this.state;
        const { meteoOptions } = this.state;
        const { checkedMeteo, stationsList, isMeteo } = this.props;

        /*let { fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height
        } = this.props;*/
        return (
            <div>


                <Paper >

                    <nav className="navbar form-control">


                        <div className="navbar-header">
                            <div>
                                <Tooltip id="tooltip-charts-view" title="Отключение отображения графиков">

                                    <IconButton
                                        //menu begin
                                        color="primary"
                                        aria-label="Выбор графиков"
                                        aria-owns={anchorEl ? 'long-menu' : null}
                                        aria-haspopup="false"
                                        onClick={this.handleClick}
                                    >
                                        <MoreVertIcon className={classes.icon_mnu} />
                                    </IconButton></Tooltip>
                                <Menu
                                    id="long-menu"
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={this.handleClose}
                                    PaperProps={{
                                        style: {
                                            maxHeight: ITEM_HEIGHT * ((this.props.isMeteo && options.length)
                                                + (!this.props.isMeteo && 5) + 1),
                                            width: (this.props.isMeteo && 250) + (!this.props.isMeteo && 300),
                                        },
                                    }}
                                >

                                    {(options) &&
                                        options.map((option, i) => (


                                            //<MenuItem key={option.chemical} onClick={this.handleClose.bind(this)}>
                                            <MenuItem key={'chart_menu_' + option.chemical}>

                                                <Checkbox
                                                    key={option.chemical}
                                                    checked={option.visible}
                                                    color='primary'
                                                    onChange={this.handleChange(option.chemical)}
                                                    value={option.chemical}

                                                />{'график ' + option.chemical}
                                            </MenuItem>


                                            // 
                                        ))}
                                    {(meteoOptions) &&// if not empty
                                        meteoOptions.map((option, i) => (!this.props.isMeteo &&


                                            //<MenuItem key={option.chemical} onClick={this.handleClose.bind(this)}>
                                            <Tooltip key={'tooltip_' + option.id} title={option.header}>

                                                <MenuItem key={'chart_meteo_' + option.id}>

                                                    <Checkbox
                                                        key={option.id}
                                                        checked={option.visible}
                                                        color='primary'
                                                        onChange={this.handleChange(option.header)}
                                                        value={option.header}

                                                    />{'график ' + option.header}
                                                </MenuItem>
                                            </Tooltip  >

                                            // 
                                        ))
                                    }

                                </Menu>


                            </div>
                        </div>
                        <div className={classes.root} style={{ width: 130 }}>
                            <FormControl className={classes.formControl}>

                                <InputLabel htmlFor="station_actual" >пост</InputLabel>

                                <Select
                                    value={this.state.station_actual}
                                    onChange={this.handleSelectChange}
                                    inputProps={{
                                        name: 'station_actual',
                                        id: 'station_actual',
                                    }}
                                    style={{ width: 120 }}>
                                    {(stationsList) &&// if not empty
                                        stationsList.map((option, i) => (
                                            <MenuItem key={option.namestation} value={option.namestation}>
                                                {option.namestation}
                                            </MenuItem>
                                        ))
                                    }

                                </Select>


                            </FormControl></div>
                        <div className={classes.root}>


                            <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="chemical" >компонент</InputLabel>
                                <Select
                                    value={this.state.chemical}
                                    onChange={this.handleSelectChemicalChange}
                                    inputProps={{
                                        name: 'chemical',
                                        id: 'chemical',
                                    }}
                                    style={{ width: 130 }}
                                >
                                    {chemical_list.map((option, i) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))
                                    }
                                </Select>
                            </FormControl>


                        </div>
                        <div className={classes.root}>

                            <TextField
                                id="dateTimeBegin"
                                label="выборка c"
                                type="date"
                                defaultValue={this.state.dateTime}
                                className={classes.textField}
                                //selectProps={this.state.dateTime}
                                onChange={(event) => { this.handlePickerChange(event) }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                style={{ width: 135 }}

                            />
                            <TextField
                                id="dateTimeEnd"
                                label="по"
                                type="date"
                                defaultValue={new Date(this.state.dateTimeEnd).format('Y-MM-dd')}
                                className={classes.textField}
                                //selectProps={this.state.dateTime}
                                onChange={(event) => { this.handlePickerChange(event) }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                style={{ width: 135 }}

                            />
                        </div>
                        <div className={classes.root}>

                            {!isMeteo &&
                                <Tooltip id="tooltip-charts-rangePrcnt" title="Отображение в долях ПДК">
                                    <span className={classes.icon}> отображение в долях</span>
                                </Tooltip>}



                            {!isMeteo && <Switch classes={{
                                switchBase: classes.iOSSwitchBase,
                                bar: classes.iOSBar,
                                icon: classes.iOSIcon,
                                iconChecked: classes.iOSIconChecked,
                                checked: classes.iOSChecked,
                            }}
                                disableRipple
                                checked={this.props.whatsRange}
                                onChange={this.handleLocalChangeToggle('whatsRange')}
                            //value={this.props.valueMeteo}
                            />}


                            {!isMeteo && <Tooltip id="tooltip-charts-rangeMg" title="Отображение в мг/м3">
                                <span className={classes.icon}>в  мг/м3</span>
                            </Tooltip>
                            }

                            <Tooltip id="tooltip-charts-view4" title="Роза ветров">
                                <IconButton className={classes.icon_mnu} id="roze-bt" onClick={this.props.handleRose} aria-label="Роза ветров">
                                    <PagesIcon className={classes.icon_mnu} style={{ width: 30, height: 30 }} />

                                </IconButton>
                            </Tooltip>

                            <Tooltip id="tooltip-charts-view5" title="Средняя концентрация">
                                <IconButton className={classes.icon_mnu} id="consentration-bt" onClick={this.handleLocalAverage} aria-label="Средняя концентрация">
                                    <TrackChangesIcon className={classes.icon_mnu} style={{ width: 30, height: 30 }} />

                                </IconButton>
                            </Tooltip>

                            <Tooltip id="tooltip-charts-view3" title="Сохранить">
                                <IconButton className={classes.icon_mnu} id="sv-bt" onClick={this.props.handleClickPdf} aria-label="Сохранить">

                                    <SvgIcon className={classes.icon_mnu} style={{ width: 30, height: 30 }}>
                                        <path d="M15,8V4H5V8H15M12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18M17,2L21,6V18A2,2 0 0,1 19,20H5C3.89,20 3,19.1 3,18V4A2,2 0 0,1 5,2H17M11,22H13V24H11V22M7,22H9V24H7V22M15,22H17V24H15V22Z" />
                                    </SvgIcon>

                                </IconButton>
                            </Tooltip>



                        </div>



                        <Snackbar
                            open={this.props.isLoading}
                            // TransitionComponent={<Slider direction="up" />}
                            autoHideDuration={4000}
                            onClose={this.props.handleClose}

                            message={<span id="message-id">{this.props.snack_msg}</span>}

                        />
                        <Snackbar
                            open={this.state.isLoading}
                            // TransitionComponent={<Slider direction="up" />}
                            autoHideDuration={4000}
                            onClose={this.handleSnkClose.bind(this)}

                            message={<span id="message-id-mnu">{this.state.snack_msg}</span>}

                        />
                    </nav>
                </Paper> <br /></div >
        );
    }
}
//<MenuItem key={option} selected={option === 'Pyxis'} onClick={this.handleClose}>
//   {option}
// </MenuItem>



function mapStateToProps(state) {
    return {
        /*  fixedHeader: state.fixedHeader,
          fixedFooter: state.fixedFooter,
          stripedRows: state.stripedRows,
          showRowHover: state.showRowHover,
          selectable: state.selectable,
          multiSelectable: state.multiSelectable,
          enableSelectAll: state.enableSelectAll,
          deselectOnClickaway: state.deselectOnClickaway,
          showCheckboxes: state.showCheckboxes,
          height: state.height*/


    };
}

MenuStats.propTypes = {

    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(MenuStats);