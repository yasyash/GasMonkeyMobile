import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconMenu from 'material-ui/IconMenu';
import RaisedButton from 'material-ui/RaisedButton';
import Settings from 'material-ui/svg-icons/action/settings';
import ContentFilter from 'material-ui/svg-icons/content/filter-list';
import FileFileDownload from 'material-ui/svg-icons/file/file-download';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

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

import CheckBox from '@material-ui/icons/CheckBox';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

import canvas2pdf from 'canvas2pdf/src/canvas2pdf';

import { connect } from 'react-redux';



const ITEM_HEIGHT = 48;


const styles = theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    icon: {
        margin: theme.spacing.unit * 2,
        color: blue[600],
   
    },
    icon_mnu: {
        margin: theme.spacing.unit * 2,
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
        width: 42,
        height: 26,
        marginTop: -13,
        marginLeft: -21,
        border: 'solid 1px',
        borderColor: theme.palette.grey[400],
        backgroundColor: theme.palette.grey[50],
        opacity: 1,
        transition: theme.transitions.create(['background-color', 'border']),
    },
    iOSIcon: {
        width: 24,
        height: 24,
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




class MenuChart extends Component {

    constructor(props) {
        let isNll = false;
        super(props);

        const { fixedHeader,

            isStation,
            isLoading,
            snack_msg,
            value,
            options,
            meteoOptions
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
            checked: []
        };




        //this.handleClose = this.handleClose.bind (this);
        //this.handleClick = this.handleClick.bind (this);
        // this.handleChange = this.handleChange.bind (this);

    }
    handleLocalChangeToggle = name => event =>{
       // const{meteoOptions} = this.props;
       // const{options} = this.props;

        this.props.handleChangeToggle (name, event);
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
        if (this.props.checkedMeteo){
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
        
         // if (this.props.report_type == 'line_chart'){
                    var _html =  document.getElementById('line_chart');
                    var dom = document.createElement('line_chart');
         // };
        var cnvs =  document.getElementById("chartjs-render-monitor ");
        dom.operative_report = _html;
        //let pdfHTML = _html.childNodes[0];
        let canvas = doc.canvas;
        canvas.height = 210;
        canvas.width= 290;
        canvas.style= {width: 290, height: 210};
        
        const {dateTimeEnd} = this.state;
        //canvas.pdf = doc;
        
       // html2canvas(_html).then(function(_canvas) {
                   
        
        //});
        var opt = {
            margin:       15,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 5 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
          };

          var worker = html2pdf().from(_html.innerHTML).set(opt).save('Chart_'+new Date(dateTimeEnd).format('dd-MM-Y_H:mm')+'.pdf');
        
         

            
        }
   

    render() {

        const { classes } = this.props;
        const { anchorEl } = this.state;
        const { options } = this.state;
        const { meteoOptions } = this.state;

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
                                            maxHeight: ITEM_HEIGHT * ((this.props.checkedMeteo && options.length)
                                            + (!this.props.checkedMeteo && 5) + 1),
                                            width: (this.props.checkedMeteo && 250)+(!this.props.checkedMeteo && 300),
                                        },
                                    }}
                                >

                                   {(options)&&
                                        options.map((option, i) => (this.props.checkedMeteo && 


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
                                    { (meteoOptions)&&// if not empty
                                        meteoOptions.map((option, i) => (!this.props.checkedMeteo && 


                                        //<MenuItem key={option.chemical} onClick={this.handleClose.bind(this)}>
                                        <Tooltip key ={'tooltip_' + option.id} title={option.header}>

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

                        <div className={classes.root}>


                            <Tooltip id="tooltip-charts-view3" title="Метеоданные">
                            <SvgIcon className={classes.icon}>
                                    <path  d="M6,6L6.69,6.06C7.32,3.72 9.46,2 12,2A5.5,5.5 0 0,1 
                                    17.5,7.5L17.42,8.45C17.88,8.16 18.42,8 19,8A3,3 0 0,1 22,11A3,3
                                     0 0,1 19,14H6A4,4 0 0,1 2,10A4,4 0 0,1 6,6M6,8A2,2 0 0,0
                                      4,10A2,2 0 0,0 6,12H19A1,1 0 0,0 20,11A1,1 0 0,0 
                                      19,10H15.5V7.5A3.5,3.5 0 0,0 12,4A3.5,3.5 0 0,0 8.5,7.5V8H6M18,
                                      18H4A1,1 0 0,1 3,17A1,1 0 0,1 4,16H18A3,3 0 0,1 21,19A3,3 0 0,1
                                       18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1
                                        15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89
                                         17.72,20 18,20A1,1 0 0,0 19,19A1,1 0 0,0 18,18Z"/>
                                </SvgIcon>
                            </Tooltip>

                            <Switch

                                classes={{
                                    switchBase: classes.iOSSwitchBase,
                                    bar: classes.iOSBar,
                                    icon: classes.iOSIcon,
                                    iconChecked: classes.iOSIconChecked,
                                    checked: classes.iOSChecked,
                                }}
                                disableRipple
                                checked={this.props.checkedMeteo}
                                onChange={this.handleLocalChangeToggle('checkedMeteo')}
                                value={this.props.valueMeteo}
                            />


                            <Tooltip id="tooltip-charts-view4" title="Газоаналитические данные">
                                <SvgIcon className={classes.icon}>
                                    <path d="M5,19A1,1 0 0,0 6,20H18A1,1 0 0,0 19,19C19,18.79 18.93,18.59
                                     18.82,18.43L13,8.35V4H11V8.35L5.18,18.43C5.07,18.59 5,18.79 5,19M6,22A3,3
                                      0 0,1 3,19C3,18.4 3.18,17.84 3.5,17.37L9,7.81V6A1,1 0 0,1 8,5V4A2,2 0 0,1 
                                      10,2H14A2,2 0 0,1 16,4V5A1,1 0 0,1 15,6V7.81L20.5,17.37C20.82,17.84 21,18.4 
                                      21,19A3,3 0 0,1 18,22H6M13,16L14.34,14.66L16.27,18H7.73L10.39,13.39L13,16M12.5,
                                      12A0.5,0.5 0 0,1 13,12.5A0.5,0.5 0 0,1 12.5,13A0.5,0.5 0 0,1 12,12.5A0.5,0.5 0 0,1 12.5,12Z" />
                                </SvgIcon>
                            </Tooltip>






                            <Tooltip id="tooltip-charts-view1" title="Столбчатый график">

                                <SvgIcon className={classes.icon}>
                                    <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
                                </SvgIcon>
                            </Tooltip>
                            <Switch

                                classes={{
                                    switchBase: classes.iOSSwitchBase,
                                    bar: classes.iOSBar,
                                    icon: classes.iOSIcon,
                                    iconChecked: classes.iOSIconChecked,
                                    checked: classes.iOSChecked,
                                }}
                                disableRipple
                                checked={this.props.checkedLine}
                                onChange={this.handleLocalChangeToggle('checkedLine')}
                                value={this.props.value}
                            />
                            <Tooltip id="tooltip-charts-view2" title="Линейный график">


                                <SvgIcon className={classes.icon}>
                                    <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
                                </SvgIcon>

                            </Tooltip>


                        </div>



                        <Snackbar
                            open={this.props.isLoading}
                            // TransitionComponent={<Slider direction="up" />}
                            autoHideDuration={4000}
                            onClose={this.props.handleClose}

                            message={<span id="message-id">{this.props.snack_msg}</span>}

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

MenuChart.propTypes = {

    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(MenuChart);