"use strict";

require('es6-promise').polyfill();

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer, routerMiddleware, push } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'
import * as storage from 'redux-storage'
import createEngine from 'redux-storage-engine-localstorage';

import { appReducer, initialState } from './reducers'
import { App } from './components'
import { Cars, Login } from './containers'
import rootSaga from './sagas'

let reducer = storage.reducer(combineReducers({
	app: appReducer,
	routing: routerReducer
}));

const storageEngine = createEngine('applicationState');

var history = hashHistory;
let sagaMiddleware = createSagaMiddleware();

let middlewares = [
	routerMiddleware(history),
	sagaMiddleware,
	storage.createMiddleware(storageEngine)
];

let store = compose(
	applyMiddleware(...middlewares),
	window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)(reducer);

sagaMiddleware.run(rootSaga);

// Note: We cannot use JSX for routes due to this bug:
// https://github.com/reactjs/react-router/issues/2704
const routes = [
	{
		path: '/',
		component: App,
		indexRoute: { component: Login },
		childRoutes: [
			{ path: 'login', component: Login, onEnter: () => { store.dispatch({type:'LOGIN_ENTER'}) } },
			{ path: 'cars', component: Cars },
		]
	},
];

const loadApp = () => {
	// Restore URL based on router state (which can be modified using redux-storage)
	// FIXME: If user reloads a page then state and URL is already in sync 
	//        but syncHistory will try to change the URL to the same value
	//        causing a 'Warning: You cannot PUSH the same path using hash history'
	history = syncHistoryWithStore(history, store);

	const renderReact = () => {
		ReactDOM.render(
			<Provider store={store}>
				<Router history={history} routes={routes}/>
			</Provider>,
			document.getElementById('content')
		);
	}

	renderReact();
	store.subscribe(renderReact);
}

const load = storage.createLoader(storageEngine);
load(store).then(loadApp).catch(loadApp);
