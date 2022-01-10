
function setCookie(key, value, exdays = 30) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 86400000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = key + "=" + value + ";" + expires + ";path=/";
}

function getCookie(key) {
	let name = key + "=";
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1);
		if (c.indexOf(name) == 0)
			return c.substring(name.length, c.length);
	}
	return null;
}

function optCookie(key, defVal) {
	let c = getCookie(key);
	if (c == null) {
		setCookie(key, defVal);
		return defVal;
	} else return c;
}

let userData = getCookie("user_data");
if (userData == null) {
	userData = {
		name: "",
		id: 0,
		level: 0,
		money: 0,
		bestScore: 0,
		bestDistance: 0,
		arcadeBestScore: 0,
		arcadeBestDistance: 0,
		customPresets: [],
		preferences: {},
		update: () => updateUserData() // deprecated
	};
} else userData = JSON.parse(userData);

function updateUserData() {
	let ud = JSON.stringify(userData);
	setCookie("user_data", ud);
}