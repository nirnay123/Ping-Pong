var database, gamestate, playerCount;
var player, score1=0, score2=0;
var player1, player2, ball,spdX,spdY, ballPos, winner;
var ballSpeed=[spdX,spdY];
var topw, bottomw, leftw, rightw;
var bounceSound, winSound, loseSound;

function preload(){
    //LOADING SOUNDS
    bounceSound=loadSound("sounds/bounce.wav");
    winSound=loadSound("sounds/victory.wav");
    loseSound=loadSound("sounds/lost.wav");
}

function setup(){
    createCanvas(windowWidth, windowHeight);
    database=firebase.database();

    //WINNER
    //resetting to 0
    database.ref('winner').set("undefined");
    //putting value into a variable
    var winnerRef=database.ref('winner');
    winnerRef.on("value", data=>{
        winr=data.val();
        winner=winr;
    })

    //GAMESTATE
    database.ref('players/gamestate').set(0);
    var gsRef= database.ref('players/gamestate');
    gsRef.on("value", data=>{
        gs=data.val();
        gamestate=gs;
    })
    
    //PLAYERCOUNT
    database.ref('players/playerCount').set(0);
    var pcRef= database.ref('players/playerCount');
    pcRef.on("value", data=>{
        pc=data.val();
        playerCount=pc;
    })

    //SCORE
    database.ref('player1/score').set(0);
    var score1ref=database.ref('player1/score');
    score1ref.on("value", data=>{
        sco1=data.val();
        score1=sco1;
    })
    database.ref('player2/score').set(0);
    var score2ref=database.ref('player2/score');
    score2ref.on("value", data=>{
        sco2=data.val();
        score2=sco2;
    })

    //BALL
    ball= createSprite(width/2, height/2, 30,30);
    ball.shapeColor="white";
    database.ref('ball/position').set({
        ballx:640,
        bally:304.5
    });
    var ballRef=database.ref('ball/position');
    ballRef.on("value", data=>{
        ballPos=data.val();
        ball.x=ballPos.ballx;
        ball.y=ballPos.bally;
    });
    //speed
    database.ref('ball/speed').set({
        spdx:0,
        spdy:0
    });
    var bsRef= database.ref('ball/speed');
    bsRef.on("value", data=>{
        bs=data.val();
        ballSpeed[0]=bs.spdx;
        ballSpeed[1]=bs.spdy;
    })

    //PLAYER1
    database.ref('player1').set({
        height:304.5,
        score:0
    });
    player1= createSprite(4, height/2, 6,50);
    player1.shapeColor="green";
    var p1Ref=database.ref('player1/height');
    p1Ref.on("value", data=>{
        p1Pos=data.val();
        player1.y=p1Pos;
    });

    //PLAYER2
    database.ref('player2').set({
        height:304.5,
        score:0
    });
    player2= createSprite(width-4, height/2, 6,50);
    player2.shapeColor="blue";
    var p2Ref=database.ref('player2/height');
    p2Ref.on("value", data=>{
        p2Pos=data.val();
        player2.y=p2Pos;
    });

    //WALLS
    topw=createSprite(width/2, 1, width, 2);
    bottomw=createSprite(width/2, height-1, width, 2);
    leftw=createSprite(1, height/2, 2, height);
    rightw=createSprite(width-1, height/2, 2, height);
}

function draw(){
    background(1);

    //WAITING
    if(gamestate===0){
        if(playerCount===0){
            text("Click space to start (as green)", width/2-60, height/2-50);
            if(keyDown("space")){
                database.ref('players/playerCount').set(1);
                player=1;
            }
        }
        else if(playerCount===1){
            if(player===1){
                text("Waiting for other player to join", width/2-70, height/2-50);
            }
            else{
            text("Click space to join (as blue)", width/2-60, height/2-50);
            if(keyDown("space")){
                database.ref('players/playerCount').set(2);
                player=2;
                database.ref('players/gamestate').set(1);
                database.ref('ball/speed').set({
                    spdx:-3,
                    spdy:4
                })
            }}
        }
    }

    //PLAYING
    if(gamestate===1){
        text("Score: "+score1, 40, 40);
        text("Score: "+score2, width-140, 40);
        ballMove();
        ballBounce();
        playerMove();
        if(score1>=5){
            endGame();
            database.ref('winner').set("player 1(green)");
            if(player===1){
                winSound.play();
            }
            else{
                loseSound.play();
            }
        }
        else if(score2>=5){
            endGame("player 2(blue)");
            database.ref('winner').set("player 2(blue)");
            if(player===2){
                winSound.play();
            }
            else{
                loseSound.play();
            }
        }
    }

    if(gamestate===2){
        text(winner + " wins!!!! click q to play again.", width/2-100, height/2-50);
        if(keyDown("q")){
            location.reload();
        }
    }

    drawSprites();
}

function ballMove(){
    database.ref('ball/position').set({
        ballx: ball.x+ballSpeed[0],
        bally: ball.y+ballSpeed[1]
    });
}
function ballBounce(){
    if(ball.isTouching(bottomw)){
        database.ref('ball/speed/spdy').set(ballSpeed[1]*-1);
        bounceSound.play();
    }
    if(ball.isTouching(topw)){
        database.ref('ball/speed/spdy').set(ballSpeed[1]*-1);
        bounceSound.play();
    }

    if(ball.isTouching(player1)){
        database.ref('ball/speed/spdx').set(ballSpeed[0]*-1.5);
        database.ref('ball/speed/spdy').set(ballSpeed[1]*1.5);
        bounceSound.play();
    }
    if(ball.isTouching(player2)){
        database.ref('ball/speed/spdx').set(ballSpeed[0]*-1.5);
        database.ref('ball/speed/spdy').set(ballSpeed[1]*1.5);
        bounceSound.play();
    }
    
    if(ball.isTouching(leftw)){
        resetBall(3,-4);
        database.ref('player2/score').set(score2+1);
        bounceSound.play();
    }
    if(ball.isTouching(rightw)){
        resetBall(-3,-4);
        database.ref('player1/score').set(score1+1);
        bounceSound.play();
    }
}

function playerMove(){
    if(player===1){
        if(keyDown("UP_ARROW")){
            database.ref('player1/height').set(player1.y-3);
        }
        if(keyDown("DOWN_ARROW")){
            database.ref('player1/height').set(player1.y+3);
        }
    }
    else if(player === 2){
        if(keyDown("UP_ARROW")){
            database.ref('player2/height').set(player2.y-3);
        }
        if(keyDown("DOWN_ARROW")){
            database.ref('player2/height').set(player2.y+3);
        }
    }
    player1.collide(topw);
    player1.collide(bottomw);
    player2.collide(topw);
    player2.collide(bottomw);
}

function resetBall(spx,spy){
    database.ref('ball/position').set({
        ballx:640,
        bally:304.5
    })
    database.ref('ball/speed').set({
        spdx:spx,
        spdy:spy
    })
}

function endGame(){
    database.ref('players/gamestate').set(2);
    resetBall(0,0);
}