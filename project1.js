var gl;
var myShaderProgram;
var bufferId;


var MVal;

var tValx;
var tValy;
var stepScalex;
var stepScaley;

var coordinatesUniform;
var clipX;
var clipY;

function init() {
    // set up the canvas
    var canvas = document.getElementById("gl-canvas");

    // get the WebGL context
    gl = WebGLUtils.setupWebGL(canvas);

    // set up the viewport
    gl.viewport( 0, 0, 512, 512 );

    // set up the color to refresh the screen
    gl.clearColor( 1.0, 0.0, 0.0, 1.0 );
    
    myShaderProgram = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram( myShaderProgram );

    // initialize variables
    stepScalex = 0.0;
    stepScaley = 0.0;

    tValx = 0.0;
    tValy = 0.0;
    clipX = 0.0;
    clipY = 0.0;

    // 9 identity matrix values taken column-wise from 3x3 identity
    MVal = [1.0,
    		0.0,
    		0.0,
    		0.0,
    		1.0,
    		0.0,
    		0.0,
    		0.0,
    		1.0];
    MUniform = gl.getUniformLocation( myShaderProgram, "M" );

	coordinatesUniform = gl.getUniformLocation( myShaderProgram, "coordinates" );
    gl.uniform2f( coordinatesUniform, 0.0, 0.0 );

    gl.uniformMatrix3fv( MUniform, false, flatten(MVal) );

    drawTriangle();
    render();
}

function drawTriangle() {

	// ---Triangle starts here
	// set up points
	var p0 = vec2( 0.15, -0.75 );
	var p1 = vec2( -0.15, -0.75 );
	var p2 = vec2( 0.0, -0.5 );

	// create array
	var arr = [p0, p1, p2];

	// send array to GPU
	bufferId = gl.createBuffer(); // make buffer variable
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId ); // associate variable with target
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arr), gl.STATIC_DRAW ); // send data to target

	var myPosition = gl.getAttribLocation( myShaderProgram, "myPosition" );
	gl.vertexAttribPointer( myPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( myPosition );

	// ---Triangle ends here

	gl.useProgram( myShaderProgram ); //set up the shader program
	gl.drawArrays( gl.TRIANGLES, 0, 3 ); //draw the triangle
}

function moveTriangleKeys( event ) {
  	var theKeyCode = event.keyCode;
    	if( theKeyCode == 65 ) { //a
    		stepScalex = -0.25;
    		stepScaley = 0.0;
    	} else if( theKeyCode == 68 ) { //d     
        	stepScalex = 0.25;
        	stepScaley = 0.0;
    	} else if( theKeyCode == 83 ) { //s        
    		stepScalex = 0.0;
    		stepScaley = -0.25;
    	} else if( theKeyCode == 87 ) { //w		
			stepScalex = 0.0;
			stepScaley = 0.25;
    	}
    
    gl.uniform2f( coordinatesUniform, clipX, clipY );
}

function render() {
    // refresh the screen
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.useProgram( myShaderProgram );

    tValx = tValx + (0.03) * stepScalex;
    tValy = tValy + (0.03) * stepScaley;

    //translation
    MVal = [1.0,
    		0.0,
    		0.0,
    		0.0,
    		1.0,
    		0.0,
    		tValx,
    		tValy,
    		1.0];

  	MUniform = gl.getUniformLocation( myShaderProgram, "M" );
 	gl.uniformMatrix3fv( MUniform, false, flatten(MVal) );

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 3 );
    
    requestAnimFrame( render );  
}