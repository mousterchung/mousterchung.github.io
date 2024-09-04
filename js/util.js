(function(){
	var requestAnimationFrame=window.requestAnimationFrame||
									 window.mozRequestAnimationFrame||
									 window.webkitRequestAnimationFrame||
									 function(callback){
										return window.setTimeout(callback,1000/24);
									 };
	var cancelAnimationFrame=window.cancelAnimationFrame||
									window.webkitCancelAnimationFrame||
									window.mozCancelAnimationFrame||
									window.clearTimeout;
	window.requestAnimationFrame=requestAnimationFrame;
	window.cancelAnimationFrame=cancelAnimationFrame;
})()