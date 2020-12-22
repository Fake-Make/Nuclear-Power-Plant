// function updateValue(field) {
// 	const value = field.value;
// 	const fieldName = field.name;
// 	const fieldsToChange = document.getElementsByName(fieldName);

// 	for (let i = 0; fieldToChange = fieldsToChange[i]; i++) {
// 		fieldToChange.value = value;
// 	}
// }

function getPressure(power, maxPower = 1000) {
	const powerPart = 64 * (power / maxPower);
	const error = Math.random() * .5 - .25;

	return 1 + powerPart + error;
}

function getTemperature(power, maxPower = 1000) {
	const powerPart = 180 * (power / maxPower);
	const error = Math.random() * 1.5 - .75;

	return 100 + powerPart + error;
}

class Station {
	constructor() {
		const reactors = [1, 2, 3, 4].map(reactor => {
			return {
				index: ko.observable(reactor),
				power: ko.observable(500),
				auto: ko.observable(true),
				pressure: getPressure(500),
				temperature: getTemperature(500)
			}
		});

		reactors.forEach(reactor => {
			reactor.pressure = ko.computed(() => getPressure(reactor.power()));
			reactor.temperature = ko.computed(() => getTemperature(reactor.power()));
		})

		this.reactors = reactors;
		this.common = {
			power: ko.observable(2000),
			pressure: ko.computed(() => {
				return reactors
					.map(reactor => reactor.pressure())
					.reduce((cur, acc) => acc += cur)
					/ reactors.length;
			}),
			temperature: ko.computed(() => {
				return reactors
					.map(reactor => reactor.temperature())
					.reduce((cur, acc) => acc += cur)
					/ reactors.length;
			})
		};
	}
}

(function() {
	ko.applyBindings(ko.mapping.fromJS(new Station()));
})();