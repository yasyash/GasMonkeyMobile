import React, { Component } from 'react';
import './App.css';
import NavigationBar from './NavigationBar';

import {connect} from 'react-redux';
import signUp from './signUp';

//import fCharts from './reducers/fusion';

class App extends Component {
  render() {
    return (
      <div className="App">
      {this.props.children}

      </div>
    );
  }
}

/*function mapStateToProps(state){
  return {
    user: state.meteoInfo[0].ID
  }
}*/

//export default connect(mapStateToProps)(App);
export default App;