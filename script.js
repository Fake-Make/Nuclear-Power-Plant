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

const reactors = [1, 2, 3, 4].map(reactor => {
	return {
		index: reactor,
		power: 500,
		auto: true,
		pressure: ko.computed(() => getPressure(500)),
		temperature: ko.computed(() => getTemperature(500))
	}
});

(function() {
	// $('input').on('input', function() {
	// 	updateValue(this);
	// });

	ko.applyBindings(ko.mapping.fromJS(reactors));
})();