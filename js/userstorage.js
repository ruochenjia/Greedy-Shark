
function setCookie(cname, cvalue, exdays = 30) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 86400000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	let name = cname + "=";
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

function optCookie(name, defVal) {
	let c = getCookie(name);
	if (c == null) {
		setCookie(name, defVal);
		return defVal;
	} else return c;
}

class UserData {
	constructor() {
		this.name = optCookie("name", "\u98fa");
		this.id = optCookie("id", 0);
		this.level = optCookie("level", 0);
		this.money = optCookie("money", 0);
		this.bestScore = optCookie("best_score", 0);
	}

	update() {
		setCookie("name", this.name);
		setCookie("id", this.id);
		setCookie("level", this.level);
		setCookie("money", this.money);
		setCookie("best_score", this.bestScore);
	}
}

let userData = new UserData();
