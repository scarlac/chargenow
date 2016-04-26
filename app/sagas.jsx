"use strict";

import "whatwg-fetch";

import { takeEvery } from 'redux-saga'
import { put, call, fork } from 'redux-saga/effects'
import { push } from 'react-router-redux'

// Domain of local drive-now.com API proxy. Change to suit your local setup, e.g. 'http://example.com'
var siteDomain = '';
var apiKey = 'adf51226795afbc4e7575ccc124face7'; // Can be scraped from https://dk.drive-now.com/#!/carsharing/copenhagen

function* loadGpsSaga(action) {
	let gps = yield new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});
	yield put({ type: 'GPS_RECEIVED', payload: gps });
}

function* loginSaga(action) {
	yield put({ type: 'LOAD_GPS' });

	let chargers = yield call(fetch, siteDomain + '/eon-chargers');

	chargers = yield chargers.json();

	yield put({ type: 'CHARGERS_RECEIVED', payload: { chargers } });
	yield put(push('/cars'));
	yield put({ type: 'LOAD_CARS' });
}

function* loadCarsSaga(action) {
	if(action.type == 'RELOAD')
		yield put({ type: 'LOAD_GPS' });

	try {
		let req = yield call(fetch, siteDomain + '/cities?expand=full', {
			headers: { 'X-Api-Key': apiKey } // API key is not tied to a specific account
		});
		let cars = (yield req.json()).cars.items;
		yield put({ type: 'CARS_RECEIVED', payload: { cars } });
	} catch(error) {
		alert('Could not load chargers from webservice: ' + error);
	}
}

export default function* rootSaga() {
	yield fork(takeEvery, ['LOAD_CARS', 'RELOAD'], loginSaga);
	yield fork(takeEvery, 'LOAD_GPS', loadGpsSaga);
	yield fork(takeEvery, 'SUBMIT_LOGIN', loadCarsSaga);
}
