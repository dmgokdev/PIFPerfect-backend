export function calculateMetricValue(field1Value, operator, field2Value) {
	switch (operator) {
		case '+':
			return field1Value + field2Value;
		case '-':
			return field1Value - field2Value;
		case '*':
			return field1Value * field2Value;
		case '/':
			return field1Value / field2Value;
		default:
			return field1Value;
	}
}
