//Get a random number from 0 to size
var getRandomNumber=function(size){
	return Math.floor(Math.random()*size);
};
//Calculate distance between click event and target
var getDistance=function(event,target){
	var diffX=event.offsetX-target.x;
	var diffY=event.offsetY-target.y;
	return Math.sqrt((diffX*diffX)+(diffY*diffY));
};
//Get a string representing the distance
var getDistanceHint=function(distance){
	if(distance<10){
		return "Really hot";
	}else if(distance<20){
		return "Hot";
	}else if(distance<80){
		return "Warm";
	}else if(distance<160){
		return "Cold";
	}else if(distance<320){
		return "Really cold";
	}else{
		return "Freezing!";
	}
};
//Set up our variables
var width=400;
var height=400;
var clicks=0;
//Crate a random target location
var target={
	x:getRandomNumber(width),
	y:getRandomNumber(height)
};
//Add a click handler to the img element
$("#map").click(function(event){
	clicks++;
	//Get distance between click event and target
	var distance=getDistance(event,target);
	//Convert distance to a hint
	var distanceHint=getDistanceHint(distance);
	//Update the #distance element with the new hint
	$("#distance").text(distanceHint);
	//If the clicks was close enough,tell them they won
	if(distance<8){
		alert("Found the treasure in "+clicks+"clicks!");
	}
});