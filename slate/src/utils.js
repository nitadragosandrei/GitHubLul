export function showBlocker(message) {
	document
		.querySelector('main')
		.setAttribute('data-ts.blocking', message);
}

export function hideBlocker() {
	document
		.querySelector('main')
		.removeAttribute('data-ts.blocking');
	// workaroud a bug in TS UI which leaves the blocker in place after dismissing the spinner
	// const cover = document.getElementById('ts-spinnercover');
	// if(cover && cover.classList && !cover.classList.contains('_gui-hidden')){
	// 	cover.classList.add('_gui-hidden');
	// }
}