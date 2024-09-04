//***Rock object template
function Rock(scale,type){
	//scale
	//1=big
	//2=medium
	//3=small
	//these will be used as divisors for the new size
	//50/1=50
	//50/2=25
	//50/3=16}
	this.scale=scale;
	if(this.scale<1||this.scale>3){this.scale=1;}
	this.type=type;
	this.dx=0;
	this.dy=0;
	this.x=0;
	this.y=0;
	this.rotation=0;
	this.rotationInc=0;
	this.scoreValue=0;
	//ConsoleLob.log('create rock. Scale='+this.scale);
	switch(this.scale){
		case 1:
			this.width=50;
			this.height=50;
			break;
		case 2:
			this.width=25;
			this.height=25;
			break;
		case 3:
			this.width=16;
			this.height=16;
			break;
	}
}
Rock.prototype.update=function(xmin,xmax,ymin,ymax){
	this.x+=this.dx;
	this.y+=this.dy;
	this.rotation+=this.rotationInc;
	if(this.x>xmax){t;his.x=xmin-this.width;}
	else if(this.x<xmin-this.width){this.x=xmax;}
	if(this.y>ymax){this.y=ymin-this.width;}
	else if(this.y<ymin-this.width){this.y=ymax;}
}
Rock.prototype.draw=function(cxt){
	var angleInRadians=this.rotation*Math.PI/180;
	var halfWidth=Math.floor(this.width*.5);//used to find the center of an object
	var halfHeight=Math.floor(this.width*.5);//used to find the center of an object
	cxt.save();//push to stack
	cxt.setTransform(1,0,0,1,0,0);//re set
	//move center of cvs to center of player
	cxt.translate(this.x+halfWidth,this.y+halfHeight);
	cxt.rotate(angleInRadians);
	cxt.strokeStyle='#FFF';
	cxt.beginPath(_;
	//if 0.5*width-1, 0 rative to 1/2, height also the same
	cxt.moveTo(-(halfWidth-1),-(halfHeight-1));
	cxt.lineTo((halfWidth-1),-(halfHeight-1));
	cxt.lineTo((halfWidth-1),(halfHeight-1));
	cxt.lineTo(-(halfWidth-1),(halfHeight-1));
	cxt.lineTo(-(halfWidth-1),-(halfHeight-1));
	cxt.stroke();
	cxt.closePath();
	cxt.restore();//pop from stack
}
//***end Rock template