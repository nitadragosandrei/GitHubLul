import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import apiClient from './ApiClient';

const queryParams = new URLSearchParams(window.location.search);
var token = queryParams.get('authorization_token');

if(token != null) {
    apiClient.setAccessToken(token);
}

ReactDOM.render(<App />, document.getElementById('root'));
