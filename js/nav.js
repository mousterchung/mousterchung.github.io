function getOS() {
	const userAgent = navigator.userAgent;
	
	if (userAgent.indexOf("Win") > -1) {
		if (userAgent.indexOf("Chrome") > -1) || (userAgent.indexOf("Firefox") > -1) {
			return 17;
		} else if (userAgent.indexOf("Edge") > -1) {
			return 12;
		}
	} else if (userAgent.indexOf("Mac") > -1) {
		return 15; 
	}