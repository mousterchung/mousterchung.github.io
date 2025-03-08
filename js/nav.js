function get_scrollbar_width() {
	return window.innerWidth - document.documentElement.clientWidth; 
}

scrollbar_width = get_scrollbar_width(); 
console.log("Scroll Bar Width: ", scrollbar_width); 
document.documentElement.style.setProperty('--scrollbar-width', scrollbar_width); 