"use strict";

export const initialState = {
	cars: [],
	// cars: [{"address":["Bygmestervej 6-12","2400 København NV"],"carImageBaseUrl":"https://prod.drive-now-content.com/fileadmin/user_upload_global/assets/cars/{model}/{color}/{density}/car.png","carImageUrl":"https://prod.drive-now-content.com/fileadmin/user_upload_global/assets/cars/bmw_i3/ionic_silver_metallic/{density}/car.png","color":"capparis_white","equipment":[],"estimatedRange":30,"fuelLevel":0.28,"fuelLevelInPercent":28,"fuelType":"E","group":"BMW","id":"WBY1Z21050V308013","innerCleanliness":"CLEAN","isCharging":false,"isInParkingSpace":false,"isPreheatable":false,"latitude":55.705324,"licensePlate":"AV74937","longitude":12.535489,"make":"BMW","modelIdentifier":"bmw_i3","modelName":"BMW i3","name":"Bil 203","parkingSpaceId":null,"rentalPrice":{"drivePrice":{"amount":400,"currencyUnit":"Øre/min","formattedPrice":"4,00 kr/min"},"offerDrivePrice":{"amount":395,"currencyUnit":"Øre/min","formattedPrice":"3,95 kr/min"},"parkPrice":{"amount":250,"currencyUnit":"Øre/min","formattedPrice":"2,50 kr/min"},"paidReservationPrice":{"amount":125,"currencyUnit":"Øre/min","formattedPrice":"1,25 kr/min"},"isOfferDrivePriceActive":false},"routingModelName":"bmw-i3","series":"i3","transmission":"A","variant":"","nearestCharger":{"Id":4289,"Identifier":"45.0.0.2200.15","Sockets":"2","Outlets":"4","StreetName":"Ole Jørgensens Gade","StreetNumber":"3","Zip":"2200","City":"København N","Latitude":"12.540662","Longtitude":"55.700368","MarkerImage":"/media/1469/icon_emobility_car-25.png","distanceFromCar":8.360525836914931},"nearestChargerDistance":639.3333542278741,"atCharger":false}],
	chargers: [],
	atChargerSensitivity: 30,
	loading: false,
	carsLoading: false,
	loginLoading: false,
	authToken: null,
	gps: null
};

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	const deg2rad = (deg) => (deg * Math.PI/180);

	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
		Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
}

function updateCarsGps(state) {
	state.cars.forEach(function(car, index, arr) {
		let newCar = Object.assign({}, car);
		let distance = null;
		if(state.gps !== null) // geolocation may be rejected or not acquired yet
			distance = getDistanceFromLatLonInKm(car.latitude, car.longitude, state.gps.latitude, state.gps.longitude) * 1000;
		newCar.distanceToMe = distance;
		arr[index] = newCar;
	});
	state.cars.sort(function(a, b) {
		if(a.distanceToMe < b.distanceToMe)
			return -1;
		else if(a.distanceToMe > b.distanceToMe)
			return 1;
		else
			return 0;
	});

	return state;
}

export function appReducer(state = initialState, action) {
	// REMEMBER: Object.assign is only shallow copy
	let newState = Object.assign({}, state);
	switch(action.type) {
		case 'SUBMIT_LOGIN':
			newState.loginLoading = true;
			return newState;

		case 'RELOAD':
		case 'LOAD_CARS':
			newState.carsLoading = true;
			return newState;

		case 'CHARGERS_RECEIVED':
			newState.chargers = action.payload.chargers;
			return newState;

		case 'LOGIN_RECEIVED':
			newState.authToken = action.payload.login.auth;
			newState.loginLoading = false;
			return newState;

		case 'CARS_RECEIVED':
			let cars = action.payload.cars;

			cars.forEach(function(car) {
				// car.atCharger = newState.chargers.findIndex(function(charger) { return car.address[0].toLowerCase().startsWith(charger.StreetName.toLowerCase())}) > -1;
				newState.chargers.forEach(function(charger){
					charger.distanceFromCar = getDistanceFromLatLonInKm(car.latitude, car.longitude, charger.Longtitude, charger.Latitude);
				});
				newState.chargers.sort(function(a, b) {
					if(a.distanceFromCar < b.distanceFromCar)
						return -1;
					else if(a.distanceFromCar > b.distanceFromCar)
						return 1;
					else
						return 0;
				});
				car.nearestCharger = newState.chargers[0];
				car.nearestChargerDistance = newState.chargers[0].distanceFromCar * 1000; // Save this value, as subsequent cars will re-calculate distance to the newState.chargers as well (and override the value)
				car.atCharger = car.nearestChargerDistance < newState.atChargerSensitivity;
			});

			// TODO: We should have UI to control filtering
			cars = cars.filter(function(car, index) {
				return car.fuelLevelInPercent <= 35 && car.estimatedRange <= 35 && car.isCharging === false
			})

			newState.cars = cars;
			newState.carsLoading = false;

			return updateCarsGps(newState);

		case 'GPS_RECEIVED':
			// Copy specific values from Coordinates object so we can serialize it to localStorage
			newState.gps = {
				latitude: action.payload.coords.latitude,
				longitude: action.payload.coords.longitude
			};
			newState.cars = [...state.cars];
			return updateCarsGps(newState);

		default:
			return state;
	}
}
