"use strict";

import { connect } from 'react-redux';
import * as components from './components'

let Cars = connect(state => ({ cars: state.app.cars, carsLoading: state.app.carsLoading }))(components.Cars);
let Login = connect(state => ({ loginLoading: state.app.loginLoading }))(components.Login);

export { Cars, Login };