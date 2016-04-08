"use strict";

import "whatwg-fetch";

import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'
import { push } from 'react-router-redux'

// Domain of local drive-now.com API proxy. Change to suit your local setup, e.g. 192.168.99.100:8080
var siteDomain = 'http://docker.dev:8080';

function* loadGpsSaga() {
	yield* takeEvery('LOAD_GPS', function*() {
		let gps = yield new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		});
		yield put({ type: 'GPS_RECEIVED', payload: gps });
	});
}

function* loginSaga(getState) {
	yield* takeEvery('SUBMIT_LOGIN', function* (action) {
		yield put({ type: 'LOAD_GPS' });

		let postData = {
			current_tenant: 'DK',
			user: action.payload.username,
			password: action.payload.password,
		}

		let postBody = Object.keys(postData).map(keyName => {
			return encodeURIComponent(keyName) + '=' + encodeURIComponent(postData[keyName])
		}).join('&');

		let [chargers, login] = yield [
			call(fetch, siteDomain + '/eon-chargers'),
			call(fetch, siteDomain + '/login?language=da', {
				method: 'post',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
				body: postBody
			})
		];

		chargers = yield chargers.json();
		login = yield login.json();

		yield put({ type: 'CHARGERS_RECEIVED', payload: { chargers } });
		yield put({ type: 'LOGIN_RECEIVED', payload: { login } });
		yield put(push('/cars'));
		yield put({ type: 'LOAD_CARS' });
	});
}

function* loadCarsSaga(getState) {
	yield* takeEvery(['LOAD_CARS', 'RELOAD'], function*(action) {
		if(action.type == 'RELOAD')
			yield put({ type: 'LOAD_GPS' });

		let authToken = getState().app.authToken;

		let req = yield call(fetch, siteDomain + '/cities?authToken='+authToken+'&expand=full', {
			headers: { 'X-Api-Key': 'adf51226795afbc4e7575ccc124face7' } // API key is not tied to a specific account
		});
		let cars = (yield req.json()).cars.items;

		yield put({ type: 'CARS_RECEIVED', payload: { cars } });
	});
}

export default [ loginSaga, loadGpsSaga, loadCarsSaga ];
