"use strict";

import React from 'react';
import { Link } from 'react-router'

let Cars = ({dispatch, cars, carsLoading}) => {
	let carNodes = cars.map(item => (<Car key={item.licensePlate} data={item}></Car>));
	let loading = (
		<tr style={{ display: carsLoading ? '' : 'none' }}>
			<td>Loading cars...</td>
		</tr>
	);
	return (
		<div className="carList">			
			<a href="javascript:void(0)" onClick={() => dispatch({ type: 'RELOAD' })} className="carList-reload">Reload</a>
			<h2>Cars</h2>
			<table style={{ opacity: carsLoading ? 0.5 : 1 }}>
				<thead>
					<tr>
						<th className="car-fuelStatus">Fuel</th>
						<th className="car-address">Address</th>
						<th className="car-distanceToMe">Walk</th>
						<th className="car-nearestCharger">Plug</th>
					</tr>
				</thead>
				<tbody>
					{carNodes.length > 0 ? carNodes : loading}
				</tbody>
			</table>
		</div>
	)
};

let Car = ({data}) => {
	const inKm = m => (m >= 1000 ? Math.round(m*10/1000)/10 + ' km' : Math.round(m) + ' m')
	return (
		<tr>
			<td className="car-fuelStatus">
				<b>{data.estimatedRange} km</b><br/>
				{data.fuelLevelInPercent}%<br/>
			</td>
			<td className="car-address">
				<a href={'maps://?address='+data.address.join(',')}>
					<div>{data.address[0]}</div>
					{data.address[1].replace(/^\d+ /g,'')}
				</a>
			</td>
			<td className="car-distanceToMe">
				{ data.distance !== null ? inKm(data.distanceToMe) : '?' }
			</td>
			<td className={'car-nearestCharger ' + (data.atCharger ? 'car-atCharger' : '')}>
				<span className="car-atCharger-label">
					{inKm(data.nearestChargerDistance)}
				</span>
			</td>
		</tr>
	);
};

let Login = ({dispatch, loginLoading}) => {
	let username, password;
	// 
	return (
		<form onSubmit={ e => { e.preventDefault(); dispatch({ type: 'SUBMIT_LOGIN' }); } }>
			<input type="submit" value="Load chargers" />

			<div style={{ display: loginLoading ? '' : 'none' }}>
				Loading chargers...
			</div>
		</form>
	);
};

let App = (({children}) => 
	<div>
		<nav>
			<Link to="/login" activeClassName="active">ChargeNow</Link>
			<Link to="/cars" activeClassName="active">[Cars]</Link>
		</nav>
		{children}
	</div>
);

export { Car, Cars, Login, App };