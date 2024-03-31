import * as THREE from 'three';
import Ammo from './js/ammo';


//variable declaration section
let physicsWorld, scene, camera, renderer, rigidBodies = [];
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4
let tmpTrans, clock, deltaTime = null



//Ammojs Initialization
Ammo().then((Ammo) => {
    start(Ammo);
})

function start(Ammo){
    try{
        tmpTrans = new Ammo.btTransform();
    
        setupPhysicsWorld(Ammo);
    
        setupGraphics();

        createBlock(Ammo);
        createBall(Ammo);
        createMaskBall(Ammo);
        createJointObjects(Ammo);
        createHemisphere(Ammo);
        createTable(Ammo);
        createFloor(Ammo);
    
        renderFrame(Ammo);
    }
    catch(err) {
        console.error(err)
    }
}

function setupPhysicsWorld(Ammo){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));

}


function setupGraphics(){

    //create clock for timing
    clock = new THREE.Clock();

    //create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xbfd1e5 ); // azul claro

    //create camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
    camera.position.set( 50, 50, 80 );
    camera.lookAt(new THREE.Vector3(20, 0, -20));

    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    //Add directional light
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 100 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    //Setup the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

}


function renderFrame(Ammo){

    let deltaTime = clock.getDelta();

    updatePhysics( deltaTime, Ammo );

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}



function createBlock(Ammo){
    
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 50, y: 2, z: 50};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({color: 0xa0afa4})); //cinza

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body, colGroupPlane, colGroupRedBall );
}


function createBall(Ammo){
    
    let pos = {x: 0, y: 20, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505})); // vermelho

    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body, colGroupRedBall, colGroupPlane | colGroupGreenBall );
    
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}



function createMaskBall(Ammo){
    
    let pos = {x: 1, y: 30, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({color: 0x00ff08}));

    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body, colGroupGreenBall, colGroupRedBall);
    
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}



function createJointObjects(Ammo){
    
    let pos1 = {x: -1, y: 15, z: 0};
    let pos2 = {x: -1, y: 10, z: 0};

    let radius = 2;
    let scale = {x: 5, y: 2, z: 2};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass1 = 0;
    let mass2 = 1;

    let transform = new Ammo.btTransform();

    //Sphere Graphics
    let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({color: 0xb846db}));

    ball.position.set(pos1.x, pos1.y, pos1.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Sphere Physics
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos1.x, pos1.y, pos1.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let sphereColShape = new Ammo.btSphereShape( radius );
    sphereColShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    sphereColShape.calculateLocalInertia( mass1, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass1, motionState, sphereColShape, localInertia );
    let sphereBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( sphereBody, colGroupGreenBall, colGroupRedBall );

    ball.userData.physicsBody = sphereBody;
    rigidBodies.push(ball);
    

    //Block Graphics
    let block = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({color: 0xf78a1d}));

    block.position.set(pos2.x, pos2.y, pos2.z);
    block.scale.set(scale.x, scale.y, scale.z);

    block.castShadow = true;
    block.receiveShadow = true;

    scene.add(block);


    //Block Physics
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos2.x, pos2.y, pos2.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    motionState = new Ammo.btDefaultMotionState( transform );

    let blockColShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    blockColShape.setMargin( 0.05 );

    localInertia = new Ammo.btVector3( 0, 0, 0 );
    blockColShape.calculateLocalInertia( mass2, localInertia );

    rbInfo = new Ammo.btRigidBodyConstructionInfo( mass2, motionState, blockColShape, localInertia );
    let blockBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( blockBody, colGroupGreenBall, colGroupRedBall );
    
    block.userData.physicsBody = blockBody;
    rigidBodies.push(block);



    //Create Joints
    let spherePivot = new Ammo.btVector3( 0, - radius, 0 );
    let blockPivot = new Ammo.btVector3( - scale.x * 0.5, 1, 1 );

    let p2p = new Ammo.btPoint2PointConstraint( sphereBody, blockBody, spherePivot, blockPivot);
    physicsWorld.addConstraint( p2p, false );

}

function createHemisphere(Ammo){

    let pos = {x: 0, y: 0, z: 0};
    let radius = 5; // Radius of the hemisphere
    let widthSegments = 32; // Increase for smoother curvature
    let heightSegments = 16; // Adjust to control the detail level
    let phiStart = 0; // Start angle for the hemisphere
    let phiLength = Math.PI; // Only half of the sphere (hemisphere) 
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 5;

    //threeJS Section
    let hemisphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength); //amarelo
    let hemisphereMaterial = new THREE.MeshBasicMaterial({color: 0xf6f02c, wireframe: true})
    let hemisphere = new THREE.Mesh(hemisphereGeometry, hemisphereMaterial);
    hemisphere.rotateZ(Math.PI); // Rotate to align the hemisphere properly
    hemisphere.position.set(pos.x, pos.y, pos.z);
    
    hemisphere.castShadow = true;
    hemisphere.receiveShadow = true;

    scene.add(hemisphere);

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius, widthSegments, heightSegments, phiStart, phiLength );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body, colGroupRedBall, colGroupPlane | colGroupGreenBall );
    
    hemisphere.userData.physicsBody = body;
    rigidBodies.push(hemisphere);
}

function createTable(Ammo){

    let pos = {x: 50, y: 0, z: 0};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let tableTopDimensions = {x: 50, y: 2, z: 30};
    let tableColumnDimensions = {x: 2, y: 25, z: 2};
    let mass = 5

    // Create the table top
    let tableTopGeometry = new THREE.BoxGeometry(tableTopDimensions.x, tableTopDimensions.y, tableTopDimensions.z);
    let tableMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Marrom escuro
    let tableTopMesh = new THREE.Mesh(tableTopGeometry, tableMaterial);    

    tableTopMesh.position.y = pos.y; // Ajuste da posição para que o topo da mesa fique na altura desejada
    tableTopMesh.position.x = pos.x; // colocando a mesa ao lado do plano
    scene.add(tableTopMesh);

    // Create the table columns
    let tableColumnGeometry = new THREE.BoxGeometry(tableColumnDimensions.x, tableColumnDimensions.y, tableColumnDimensions.z);
    
    let tableColumnMesh1 = new THREE.Mesh(tableColumnGeometry, tableMaterial);
    tableColumnMesh1.position.set(-22 + pos.x, -13, -13); // Ajuste a posição da perna 1
    scene.add(tableColumnMesh1);

    let tableColumnMesh2 = new THREE.Mesh(tableColumnGeometry, tableMaterial);
    tableColumnMesh2.position.set(22 + pos.x, -13, -13); // Ajuste a posição da perna 2
    scene.add(tableColumnMesh2);

    let tableColumnMesh3 = new THREE.Mesh(tableColumnGeometry, tableMaterial);
    tableColumnMesh3.position.set(-22 + pos.x, -13, 13); // Ajuste a posição da perna 3
    scene.add(tableColumnMesh3);

    let tableColumnMesh4 = new THREE.Mesh(tableColumnGeometry, tableMaterial);
    tableColumnMesh4.position.set(22 + pos.x, -13, 13); // Ajuste a posição da perna 4
    scene.add(tableColumnMesh4);

    // Physics of the table top
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );   

    let tableTopColShape = new Ammo.btBoxShape( new Ammo.btVector3( tableTopDimensions.x, tableTopDimensions.y, tableTopDimensions.z) );
    tableTopColShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    tableTopColShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, tableTopColShape, localInertia );
    let blockBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( blockBody, colGroupRedBall, colGroupPlane | colGroupGreenBall );
    
    tableTopMesh.userData.physicsBody = blockBody;
    rigidBodies.push(tableTopMesh);


    // Physics of tableColumns
    let transform1 = new Ammo.btTransform();
    let transform2 = new Ammo.btTransform();
    let transform3 = new Ammo.btTransform();
    let transform4 = new Ammo.btTransform();

    transform1.setIdentity();
    transform2.setIdentity();
    transform3.setIdentity();
    transform4.setIdentity();

    transform1.setOrigin( new Ammo.btVector3( -22 + pos.x, -13, -13) );
    transform2.setOrigin( new Ammo.btVector3( 22 + pos.x, -13, -13) );
    transform3.setOrigin( new Ammo.btVector3( -22 + pos.x, -13, 13) );
    transform4.setOrigin( new Ammo.btVector3( 22 + pos.x, -13, 13) );

    transform1.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    transform2.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    transform3.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    transform4.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );

    let motionState1 = new Ammo.btDefaultMotionState( transform1);   
    let motionState2 = new Ammo.btDefaultMotionState( transform2); 
    let motionState3 = new Ammo.btDefaultMotionState( transform3); 
    let motionState4 = new Ammo.btDefaultMotionState( transform4); 

    let tableColumnMesh1Shape = new Ammo.btBoxShape( new Ammo.btVector3( tableColumnDimensions.x, tableColumnDimensions.y, tableColumnDimensions.z) );
    tableColumnMesh1Shape.setMargin( 0.05 );
    let tableColumnMesh2Shape = new Ammo.btBoxShape( new Ammo.btVector3( tableColumnDimensions.x, tableColumnDimensions.y, tableColumnDimensions.z) );
    tableColumnMesh2Shape.setMargin( 0.05 );
    let tableColumnMesh3Shape = new Ammo.btBoxShape( new Ammo.btVector3( tableColumnDimensions.x, tableColumnDimensions.y, tableColumnDimensions.z) );
    tableColumnMesh3Shape.setMargin( 0.05 );
    let tableColumnMesh4Shape = new Ammo.btBoxShape( new Ammo.btVector3( tableColumnDimensions.x, tableColumnDimensions.y, tableColumnDimensions.z) );
    tableColumnMesh4Shape.setMargin( 0.05 );

    let localInertia1 = new Ammo.btVector3( 0, 0, 0 );
    tableColumnMesh1Shape.calculateLocalInertia( mass, localInertia1 );
    tableColumnMesh2Shape.calculateLocalInertia( mass, localInertia1 );
    tableColumnMesh3Shape.calculateLocalInertia( mass, localInertia1 );
    tableColumnMesh4Shape.calculateLocalInertia( mass, localInertia1 );

    let rbInfo1 = new Ammo.btRigidBodyConstructionInfo( mass, motionState1, tableColumnMesh1Shape, localInertia1 );
    let rbInfo2 = new Ammo.btRigidBodyConstructionInfo( mass, motionState2, tableColumnMesh2Shape, localInertia1 );
    let rbInfo3 = new Ammo.btRigidBodyConstructionInfo( mass, motionState3, tableColumnMesh3Shape, localInertia1 );
    let rbInfo4 = new Ammo.btRigidBodyConstructionInfo( mass, motionState4, tableColumnMesh4Shape, localInertia1 );
    let blockBody1 = new Ammo.btRigidBody( rbInfo1 );
    let blockBody2 = new Ammo.btRigidBody( rbInfo2 );
    let blockBody3 = new Ammo.btRigidBody( rbInfo3 );
    let blockBody4 = new Ammo.btRigidBody( rbInfo4 );

    physicsWorld.addRigidBody( blockBody1, colGroupRedBall, colGroupPlane | colGroupGreenBall );
    physicsWorld.addRigidBody( blockBody2, colGroupRedBall, colGroupPlane | colGroupGreenBall );
    physicsWorld.addRigidBody( blockBody3, colGroupRedBall, colGroupPlane | colGroupGreenBall );
    physicsWorld.addRigidBody( blockBody4, colGroupRedBall, colGroupPlane | colGroupGreenBall );

    tableColumnMesh1.userData.physicsBody = blockBody1;
    tableColumnMesh2.userData.physicsBody = blockBody2;
    tableColumnMesh3.userData.physicsBody = blockBody3;
    tableColumnMesh4.userData.physicsBody = blockBody4;
    rigidBodies.push(tableColumnMesh1);
    rigidBodies.push(tableColumnMesh2);
    rigidBodies.push(tableColumnMesh3);
    rigidBodies.push(tableColumnMesh4);


}

function createFloor(Ammo){
    
    let pos = {x: 40, y: -40, z: -40};
    let scale = {x: 200, y: 2, z: 200};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({color: 0xFAFAFA})); //cinza

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body, colGroupPlane, colGroupRedBall | colGroupGreenBall);
}

function createText(Ammo){
    // Crie a geometria de texto
    const textGeometry = new THREE.TextGeometry('Hello, Three.js!', {
        font: 'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json', // Caminho para o arquivo de fonte
        size: 1,
        height: 0.1
    });

    // Crie um material básico para o texto
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Crie uma malha com a geometria de texto e o material
    const textMesh = new THREE.Mesh(textGeometry, material);

    // Adicione a malha à cena
    scene.add(textMesh);
}


function updatePhysics( deltaTime, Ammo ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }

}