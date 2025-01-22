function get_scrollbar_width() {
	const userAgent = navigator.userAgent;
	
	if (userAgent.indexOf("Win") > -1) {
		if ((userAgent.indexOf("Chrome") > -1) || (userAgent.indexOf("Firefox") > -1)) {
			return 17;
		} else if (userAgent.indexOf("Edge") > -1) {
			return 12;
		}
	} else if (userAgent.indexOf("Mac") > -1) {
		return 15; 
	}
	return 17; 
}

scrollbar_width = get_scrollbar_width(); 
console.log(scrollbar_width); 
document.documentElement.style.setProperty('scrollbar-width', scrollbar_width); 