export const debounce = (func, wait) => {
	let timeout;
	return function() {
		const context = this;
		const args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			func.apply(context, args);
		}, wait);
	};
}