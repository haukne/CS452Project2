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

// table top
var numVerticesPrism;
var numTrianglesPrism;

var eye, at, vup;
var n, u, v;
var left, right, top, bottom, near, far;

function initGL(){
  var canvas = document.getElementById( "gl-canvas" );
  gl = WebGLUtils.setupWebGL( canvas );
    
  if ( !gl ) { alert( "WebGL isn't available" ); }

  gl.enable( gl.DEPTH_TEST );
  gl.viewport( 0, 0, 512, 512);
  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
  myShaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( myShaderProgram );

  numVerticesPrism = 24;
  numTrianglesPrism = 12;

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

  eye = vec3(60.0, 80.0, 100.0);
    // Define at point (use vec3 in MV.js)
  at = vec3(0.0, 0.0, 0.0);
    // Define vup vector (use vec3 in MV.js)
  vup = vec3(0.0, 1.0, 0.0); 
    var d = subtract(eye, at);
  n = normalize(d);
    var k = cross(vup, n);
  u = normalize(k);
    var l = cross(n, u);
  v = normalize(l);
    // Set up Model-View matrix M and send M as uniform to shader
    var modelviewMatrix = [u[0], v[0], n[0], 0.0,
                 u[1], v[1], n[1], 0.0,
                 u[2], v[2], n[2], 0.0,
                -u[0]*eye[0]-u[1]*eye[1]-u[2]*eye[2], 
                -v[0]*eye[0]-v[1]*eye[1]-v[2]*eye[2], 
                -n[0]*eye[0]-n[1]*eye[1]-n[2]*eye[2], 1.0];  

    var modelviewMatrixInverseTranspose = [u[0], v[0], n[0], eye[0],
                         u[1], v[1], n[1], eye[1],
                         u[2], v[2], n[2], eye[2],
                         0.0, 0.0, 0.0, 1.0];
    
    var MLocation = gl.getUniformLocation(myShaderProgram, "modelView");
    gl.uniformMatrix4fv(MLocation, false, modelviewMatrix);
    var MinvtransLocation = gl.getUniformLocation(myShaderProgram, "M_invtranspose");
    gl.uniformMatrix4fv(MinvtransLocation, false, modelviewMatrixInverseTranspose);

    // Define left plane
    left = -50.0;
    // Define right plane
    right = 50.0;
    // Define top plane
    top = 50.0;
    // Define bottom plane
    bottom = -50.0;
    // Define near plane
    near = 50.0;
    // Define far plane
    far = 180.0;
    // Set up perspective projection matrix P_persp using above planes
    var P_persp = [(2.0*near)/(right-left), 0.0, 0.0, 0.0,
                       0.0, (2.0*near)/(top-bottom), 0.0, 0.0,
                       (right+left)/(right-left), (top+bottom)/(top-bottom), -(far+near)/(far-near), -1,
                       0.0, 0.0, -(2.0*far*near)/(far-near), 0.0];
    var perspMatrixLocation = gl.getUniformLocation(myShaderProgram, "perspProj");
    gl.uniformMatrix4fv(perspMatrixLocation, false, P_persp);

    setupPrism();
    render();
}

function getFaceNormals( vertices, indexList, numTriangles ) {
    // array of face normals
    var faceNormals = [];
    // faceNormal = [];
    
    // Following lines iterate over triangles
    for (var i = 0; i < numTriangles; i++) {
        // Following lines give you three vertices for each face of the triangle
        var p0 = vec3( vertices[indexList[3*i]][0],
                      vertices[indexList[3*i]][1],
                      vertices[indexList[3*i]][2]);
        
        var p1 = vec3( vertices[indexList[3*i+1]][0],
                      vertices[indexList[3*i+1]][1],
                      vertices[indexList[3*i+1]][2]);
        
        var p2 = vec3( vertices[indexList[3*i+2]][0],
                      vertices[indexList[3*i+2]][1],
                      vertices[indexList[3*i+2]][2]);
        
        // Calculate vector from p0 to p1 ( use subtract function in MV.js, NEEDS CODE )
        var p1Minusp0 = vec3(p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]);
        // Calculate vector from p0 to p2 ( use subtract function, NEEDS CODE )
        var p2Minusp0 = vec3(p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]);
        // Calculate face normal as the cross product of the above two vectors
        // (use cross function in MV.js, NEEDS CODE )
        var faceNormal = cross(p1Minusp0, p2Minusp0);
        faceNormal = normalize(faceNormal);
        faceNormals.push( faceNormal );
    }
    // Following line returns the array of face normals
    return faceNormals;
}

function getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles ) {
    var vertexNormals = [];
    
    // Iterate over all vertices
    for ( var j = 0; j < numVertices; j++) {
        
        // Initialize the vertex normal for the j-th vertex
        var vertexNormal = vec3( 0.0, 0.0, 0.0 );
        
        // Iterate over all the faces to find if this vertex belongs to
        // a particular face
        for ( var i = 0; i < numTriangles; i++ ) {
            
            // The condition of the following if statement should check
            // if the j-th vertex belongs to the i-th face
            if (indexList[3*i] == j | indexList[3*i+1] == j | indexList[3*i+2] == j) {
                vertexNormal[0] = vertexNormal[0] + faceNormals[i][0];
                vertexNormal[1] = vertexNormal[1] + faceNormals[i][1];
                vertexNormal[2] = vertexNormal[2] + faceNormals[i][2];
            }   
        } 
        // Normalize the vertex normal here (NEEDS CODE)
        vertexNormal = normalize(vertexNormal);
        // Following line pushes the vertex normal into the vertexNormals array
        vertexNormals.push( vertexNormal );
    }
    return vertexNormals;
}

function setupPrism() {
  var prismVertices = getPrismVertices();

    var prismIndexList = getPrismFaces();

    var textureCoordinates = getPrismTexture();

    var faceNormals = getFaceNormals( prismVertices, prismIndexList, numTrianglesPrism );
    var vertexNormals = getVertexNormals( prismVertices, prismIndexList, faceNormals, numVerticesPrism, numTrianglesPrism );

    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(myShaderProgram,"nv");
    gl.vertexAttribPointer( vertexNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(prismIndexList), gl.STATIC_DRAW);

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