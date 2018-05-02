// Nathan Hauk, Joshua Lopez
var gl;
var myShaderProgram;

var alpha, beta, gamma;
var alphaLoc, betaLoc, gammaLoc;
var tx, ty;
var txLoc, tyLoc;
var sx, sy;
var sxLoc, syLoc;

var iBuffer;
var textureImage;


function initGL(){
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, 512, 512);
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
	myShaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgram );
 	gl.enable( gl.DEPTH_TEST );

    alpha = 0.0;
    beta = 0.0;
    gamma = 0.0;
 	tx = 0.0;
 	ty = 0.0;
 	sx = 1.0;
 	sy = 1.0;
 	sxLoc = gl.getUniformLocation(myShaderProgram, "sx");
	gl.uniform1f(sxLoc, sx);
	syLoc = gl.getUniformLocation(myShaderProgram, "sy");
	gl.uniform1f(syLoc, sy);

   	setupPrism();
   	render();
}

function setupPrism() {
	var prismVertices = [//front
                       -0.7, -0.5, 0.1,
                       0.7, -0.5, 0.1,
                       0.7, 0.5, 0.1,
                       -0.7, 0.5, 0.1,
                       //back
                       -0.7, -0.5, 0.0,
                       -0.7, 0.5, 0.0,
                       0.7, 0.5, 0.0,
                       0.7, -0.5, 0.0,
                       //top
                       -0.7, 0.5, 0.0,
                       -0.7, 0.5, 0.1,
                       0.7, 0.5, 0.1,
                       0.7, 0.5, 0.0,
                       //bottom
                       -0.7, -0.5, 0.0,
                       0.7, -0.5, 0.0,
                       0.7, -0.5, 0.1,
                       -0.7, -0.5, 0.1,
                      //right
                      0.7, -0.5, 0.0,
                      0.7, 0.5, 0.0,
                      0.7, 0.5, 0.1,
                      0.7, -0.5, 0.1,
                      //left
                      -0.7, -0.5, 0.0,
                      -0.7, -0.5, 0.1,
                      -0.7, 0.5, 0.1,
                      -0.7, 0.5, 0.0];

   	var prismIndexList = [//front
                          0, 1, 2,
                          0, 2, 3,
                          //back
                          4, 5, 6,
                          4, 6, 7,
                          //top 
                          8, 9, 10, 
                          8, 10, 11,
                          //bottom 
                          12, 13, 14, 
                          12, 14, 15,
                          //right 
                          16, 17, 18, 
                          16, 18, 19,
                          //left 
                          20, 21, 22, 
                          20, 22, 23];

   	var textureCoordinates = [//front
                              0.0, 0.0,
                              1.0, 0.0,
                              1.0, 1.0,
                              0.0, 1.0,
                              //back
                              0.0, 0.0,
                              1.0, 0.0,
                              1.0, 1.0,
                              0.0, 1.0,
                              //top
                              0.0, 0.0,
                              1.0, 0.0,
                              1.0, 1.0,
                              0.0, 1.0,
                              //bottom
                              0.0, 0.0,
                              1.0, 0.0,
                              1.0, 1.0,
                              0.0, 1.0,
                              //right
                              0.0, 0.0,
                              1.0, 0.0,
                              1.0, 1.0,
                              0.0, 1.0,
                              //left
                              0.0, 0.0,
                              1.0, 0.0,
                              1.0, 1.0,
                              0.0, 1.0];

    var myImage = document.getElementById("wood");

  	textureImage = gl.createTexture();
  	gl.bindTexture(gl.TEXTURE_2D, textureImage);
  	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

  	iBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(prismIndexList), gl.STATIC_DRAW);

   	var vertexBuffer = gl.createBuffer();
   	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
   	gl.bufferData( gl.ARRAY_BUFFER, flatten(prismVertices), gl.STATIC_DRAW );

   	var vertexPosition = gl.getAttribLocation( myShaderProgram, "vertexPosition");
   	gl.vertexAttribPointer( vertexPosition, 3, gl.FLOAT, false, 0, 0 );
   	gl.enableVertexAttribArray( vertexPosition );

   	var textureVertexBuffer = gl.createBuffer();
   	gl.bindBuffer( gl.ARRAY_BUFFER, textureVertexBuffer );
   	gl.bufferData( gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW );

   	var textureCoordinate = gl.getAttribLocation(myShaderProgram, "textureCoordinate");
   	gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
   	gl.enableVertexAttribArray(textureCoordinate);
}

function render() {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureImage);
	gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);


	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	var numVertices = 36;
	gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0);
	requestAnimFrame(render);
}

function transformShape( event ) {
	var theKeyCode = event.keyCode;
	// rotate
	if( theKeyCode == 90 ) { //z
		rotateAroundX();
	} else if( theKeyCode == 88 ) { //x
		rotateAroundY();
	} else if( theKeyCode == 67 ) { //c
		rotateAroundZ();
	} // translate
	  else if( theKeyCode == 87 ) { //w
		translatePosY();
	} else if( theKeyCode == 65 ) { //a
		translateNegX();
	} else if( theKeyCode == 83 ) { //s 
		translateNegY();
	} else if( theKeyCode == 68 ) { //d  
		translatePosX();
	} // scale
      else if( theKeyCode == 38 ) { //up
      	scalePosY();
    } else if( theKeyCode == 37 ) { //left
    	scaleNegX();
    } else if( theKeyCode == 40 ) { //down
    	scaleNegY();
    } else if( theKeyCode == 39 ) { //right
    	scalePosX();
    }
}

// rotation
function rotateAroundX() {
	alpha = alpha + 0.02;
	alphaLoc = gl.getUniformLocation(myShaderProgram, "alpha");
	gl.uniform1f(alphaLoc, alpha);
}

function rotateAroundY() {
	beta = beta + 0.02;
	betaLoc = gl.getUniformLocation(myShaderProgram, "beta");
	gl.uniform1f(betaLoc, beta);
}

function rotateAroundZ() {
	gamma = gamma + 0.02;
	gammaLoc = gl.getUniformLocation(myShaderProgram, "gamma");
	gl.uniform1f(gammaLoc, gamma);
}

// translation
function translatePosX() {
	tx = tx + 0.02;
	txLoc = gl.getUniformLocation(myShaderProgram, "tx");
	gl.uniform1f(txLoc, tx);
}

function translateNegX() {
	tx = tx - 0.02;
	txLoc = gl.getUniformLocation(myShaderProgram, "tx");
	gl.uniform1f(txLoc, tx);
}

function translatePosY() {
	ty = ty + 0.02;
	tyLoc = gl.getUniformLocation(myShaderProgram, "ty");
	gl.uniform1f(tyLoc, ty);
}

function translateNegY() {
	ty = ty - 0.02;
	tyLoc = gl.getUniformLocation(myShaderProgram, "ty");
	gl.uniform1f(tyLoc, ty);
}

// scale
function scalePosX() {
	sx = sx * 1.02;
	sxLoc = gl.getUniformLocation(myShaderProgram, "sx");
	gl.uniform1f(sxLoc, sx);
}

function scaleNegX() {
	sx = sx / 1.02;
	sxLoc = gl.getUniformLocation(myShaderProgram, "sx");
	gl.uniform1f(sxLoc, sx);
}

function scalePosY() {
	sy = sy * 1.02;
	syLoc = gl.getUniformLocation(myShaderProgram, "sy");
	gl.uniform1f(syLoc, sy);
}

function scaleNegY() {
	sy = sy / 1.02;
	syLoc = gl.getUniformLocation(myShaderProgram, "sy");
	gl.uniform1f(syLoc, sy);
}