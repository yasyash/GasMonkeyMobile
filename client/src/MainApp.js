import React, { Component } from 'react';
import './App.css';
import NavigationBar from './NavigationBar';
import FlashMessagesList from './flash/FlashMessagesList';
import routes from './routes';
import auth from './reducers/auth';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class MainApp extends Component {
    render() {
        return (
            <MuiThemeProvider>

            < div className="container ">
                <div >
                    <NavigationBar  auth ={auth}/>
                    <FlashMessagesList />
                </div>
               {routes} 

                <div className = "form-control">
                    <footer className="App-footer"></footer>
                    <p className="App App-intro">
                        Developed by ILIT, 2017-18.
                              </p>
                </div>
            </div >
            </MuiThemeProvider>

        );
    }
}

export default MainApp;