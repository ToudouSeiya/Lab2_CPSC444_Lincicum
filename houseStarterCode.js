"use strict";

var canvas;
var gl;



var points = [

    vec4(0.0, 0.0, 1.0, 1.0), //rectangle
    vec4(-1, 0.0, 1.0, 1.0),
    vec4(-1, 1, 1.0, 1.0),
    vec4(0.0, 1, 1.0, 1.0),

    vec4(0.0, 0.0, 0.5, 1.0), //triangle
    vec4(-1, 0, 0.5, 1.0),
    vec4(-1, 1, 0.5, 1.0),

    vec4(0.0, 0.0, 0.5, 1.0), //window
    vec4(-1, 0.0, 0.5, 1.0),
    vec4(-1, 1, 0.5, 1.0),
    vec4(0.0, 1, 0.5, 1.0),

    vec4(0.0, 0.0, 0.5, 1.0), //entrance
    vec4(-1, 0.0, 0.5, 1.0),
    vec4(-1, 1, 0.5, 1.0),
    vec4(0.0, 1, 0.5, 1.0),

    vec4(0.0, 1, 0.4, 1.0), //diamond
    vec4(0.5, 0, 0.4, 1.0),
    vec4(0, -1, 0.4, 1.0),
    vec4(-0.5, 0, 0.4, 1.0),
];

var colors = [

    vec4(0.9, 0.5, 0.2, 1.0), //brown
    vec4(0.9, 0.5, 0.2, 1.0), 
    vec4(0.9, 0.5, 0.2, 1.0),  
    vec4(0.9, 0.5, 0.2, 1.0),
    
    vec4(0.7, 0.2, 0.0, 1.0), //darker brown
    vec4(0.7, 0.2, 0.0, 1.0),  
    vec4(0.7, 0.2, 0.0, 1.0),

    vec4(0.7, 0.9, 1.0, 1.0), //light blue
    vec4(0.7, 0.9, 1.0, 1.0), 
    vec4(0.7, 0.9, 1.0, 1.0),  
    vec4(1, 1, 1.0, 1.0), //white highlight

    vec4(0, 0, 0, 1), //black
    vec4(0, 0, 0, 1),
    vec4(0, 0, 0, 1),
    vec4(0, 0, 0, 1),

    vec4(1, 1, 0, 1), //yellow
    vec4(1, 1, 0, 1),
    vec4(1, 1, 0, 1),
    vec4(1, 1, 0, 1),

];

var numVertices  = points.length;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye, at, up;

var number=1;

var theta=0;
var theta2=0;

var down=true;
var ty=0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
	
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    eye = vec3(0.0, 0.0, 1.5);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	//Create your color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

	//Create your vertex buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//Model and Projection Buffers
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

	//Set up Ortho Projections
    projectionMatrix = ortho(-4, 4, 0, 4, 3, -3);
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );


    render();
}

function resetTransformations(){
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
}

function drawHouse(){
    let model = mult(translate(2, 0, 0), scalem(4, 2, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); //house body

    model = mult(
        scalem(4, 2, 1), 
        rotateZ(135)
    );
    model = mult(
        model,
        translate(-0.1, -1.1, 0)
    )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));

    gl.drawArrays(gl.TRIANGLES, 4, 3); //roof
}

function drawWindows(){
    resetTransformations();

    let model = mult(
        scalem(1, 0.5, 1), 
        rotateZ(0)
    );
    model = mult(
        model,
        translate(-0.5, 2, 0)
    )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));

    gl.drawArrays(gl.TRIANGLE_FAN, 7, 4); //two smaller square windows

    model = mult(model, translate(2, 0, 0)
    )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));

    gl.drawArrays(gl.TRIANGLE_FAN, 7, 4);

    //then the larger ones
    resetTransformations();
    model = mult(
        scalem(1, 0.75, 1), 
        rotateZ(0)
    );
    model = mult(
        model,
        translate(-0.7, 0.1, 0)
    )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));

    gl.drawArrays(gl.TRIANGLE_FAN, 7, 4);

    model = mult(model, translate(2.4, 0, 0))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));

    gl.drawArrays(gl.TRIANGLE_FAN, 7, 4);
}

function drawEntrance(){
    resetTransformations();

    let model = mult(
        scalem(1, 0.8, 1), 
        rotateZ(0)
    );
    model = mult(
        model,
        translate(0.5, 0, 0)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));

    gl.drawArrays(gl.TRIANGLE_FAN, 11, 4);
}

function drawDiamond(){
    resetTransformations();

    let model = mult(
        translate(0, 2.5, 0), 
        rotateZ(0)
    );
    model = mult(model, scalem(0.5, 0.5, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));


    gl.drawArrays(gl.TRIANGLE_FAN, 15, 4);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    resetTransformations();
    drawHouse();
    drawWindows();
    drawEntrance();
    drawDiamond();

    window.requestAnimationFrame(render);
}
