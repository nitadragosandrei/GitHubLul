import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import Home from './components/home/Home';

class App extends Component {
  render() {
    var pathname = window.location.pathname;

		return (
			<Router basename={pathname}>
				<Switch>
					<Route exact path="/" render={() => <Home />} />
				</Switch>
			</Router>
		);
  }
}

export default App;
