export function calculatePace(
	projection,
	closesSoFar,
	daysSoFar,
	totalDaysInMonth,
) {
	const pacingRate = closesSoFar / daysSoFar;

	const projectedCloses = pacingRate * totalDaysInMonth;

	const pacingPercentage = ((projection - projectedCloses) / projection) * 100;

	return {
		pacingRate,
		pacingPercentage,
	};
}
