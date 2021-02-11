import React, { Component } from 'react';
import './App.css';
import NavigationBar from './NavigationBar';
import FlashMessagesList from './flash/FlashMessagesList';
import routes from './routes';
import auth from './reducers/auth';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Link } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';

class MainApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            snack_msg: ''
        }
    }
    click_menu(e) {
        this.setState({ isLoading: true, snack_msg: "Разработка:  Шкляр  Ярослав,  ИЛИТ.РУ. Тел.  +7  495  5068070, support@cleenair.ru Регистрационный номер ПО: 8717, Приказ Минцифры РФ от 30.12.2020 №805. Патент: RU 2020614607  от 16.04.2020" });

    }
    handleSnackClose() {
        this.setState({ isLoading: false });

    };
    render() {
        return (
            <MuiThemeProvider>

                < div className="container " style={{ minWidth: '97%' }}>
                    <div >
                        <NavigationBar auth={auth} />
                        <FlashMessagesList />
                    </div>
                    {routes}

                    <div className="form-control" style={{ textAlign: 'center' }}> <Link to="/" onClick={this.click_menu.bind(this)}>О Программе</Link>
                        <footer className="App-footer"></footer>
                        <p className="App App-intro">
                            Developed by Yaroslav Shkliar & ILIT.RU, 2017-2021. (version 3.02)
                              </p>
                    </div>
                    <Snackbar
                        open={this.state.isLoading}
                        snack_msg={this.state.snack_msg}
                        // TransitionComponent={<Slider direction="up" />}
                        autoHideDuration={100000}
                        onClose={this.handleSnackClose.bind(this)}

                        message={<span id="message-id">{this.state.snack_msg}</span>}

                    />
                </div >

            </MuiThemeProvider>


        );
    }
}

export default MainApp;