// get canvas element
const cvs = document.getElementById("canvas-id");
// to allow us to draw to the canvas
const ctx = cvs.getContext("2d");

//Game variables and constants
let frames = 0;
const DEGREE = Math.PI/180;

// displaying the sprite image on canvas
const sprite = new Image();
sprite.src = "images/sprite.png";



// for background music and sounds
const score_sound = new Audio();
score_sound.src = "music/sfx_point.wav";

const flap_sound = new Audio();
flap_sound.src = "music/sfx_wing.wav";

const hit_sound = new Audio();
hit_sound.src = "music/sfx_hit.wav";

const swooshing_sound = new Audio();
swooshing_sound.src = "music/sfx_swooshing.wav";

const die_sound = new Audio();
die_sound.src = "music/sfx_die.wav";


const state= {
    current:0,
    ready:0,
    play:1,
    over:2
}

const startBtn = {
    x : 425,
    y : 321,
    w : 110,
    h : 38
}

const medals  = {
    // blank medal
    bx : 311,
    by : 113,
    bw : 46,
    bh : 43,
    // silver medal
    sx : 359,
    sy : 113,
    sw : 46,
    sh : 43,
    // bronze medal
    cx : 359,
    cy : 159,
    cw : 46,
    ch : 43,
    // gold medal
    gx : 311,
    gy : 159,
    gw : 46,
    gh : 43,
}



// to control game flow
cvs.addEventListener("click",function(evt){
    switch(state.current){
        case state.ready:
            state.current = state.play;
            swooshing_sound.play();
            break;
        case state.play:
            if (bird.y-bird.radius<=0) return;
            bird.flap();
            flap_sound.play();
            break;
        case state.over:
            // return the size and position of canvas
            let rect = cvs.getBoundingClientRect();
            // to get the position of where the user clicked
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            // to check if the user clicked the start game button
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.ready;
            }
            break;
        
    }

});

// background object 
const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,    
    draw : function(){
        let wi = this.w;
        let c=0;
        // to fit the image on screen
        for(let i=0;i<6;i++){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x +  wi*c, this.y, this.w, this.h+70);
            c++;

        }
       
    }

}
// foreground of the game
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112+50,    
    dx : 2, // changing the x position by delta x
    draw : function(){
        let wi = this.w;
        let c=0;
        for(let i=0;i<6;i++){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x+wi*c, this.y, this.w+200, this.h-50); 
            c++;
        }
               
        
    },
    update: function(){
        if (state.current == state.play){
            // we have to make the foreground to the left/backward to make it seem that the bird is moving forward
            this.x = (this.x-this.dx)%(this.w/2);            
        }
    }

    
}


// drawing the bird
const bird = {
   
    animation : [
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,    
    radius : 12,    
    frame : 0,    
    gravity : 0.25, // bird goes down by gravity 
    jump : 4.6,
    speed : 0, // up whenever tapped on screen
    rotation : 0,
    // going up - rotation =  -25 degrees
    // going down- rotation = +90 degrees    
    draw : function(){
        let bird = this.animation[this.frame];
        
        ctx.save(); 
        // translate the origin to the position of the bird
        ctx.translate(this.x, this.y);
        // rotate 
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);        
        ctx.restore();
        
    },
    flap: function(){
        this.speed = -this.jump; // changes the speed of bird           
    },

    update: function(){
        // if game state is ready, the bird should flap slowly, 10 is larger period than 5
        this.period = state.current == state.ready? 10:5;
        // we increment the frame by 1 each time period
        this.frame += frames%this.period == 0?1:0;
        // frame foes from 0 to 4, then again to 0
        this.frame = this.frame%this.animation.length;
        if(state.current == state.ready){
            this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
            this.rotation = 0 * DEGREE;
           
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            
            if(this.y + this.h/2 >= cvs.height - (fg.h-50)){
                this.y = cvs.height - (fg.h -50 )- this.h/2;
                if(state.current == state.play){                    
                    state.current = state.over;
                    die_sound.play();
                    
                }
            }
            if (this.y - this.h/2 <=0){
                this.y= 0 + this.h/2;
                if(state.current == state.play){
                    state.current = state.over;
                    die_sound.play();
                    
                }

            }
             // if the speed is greater than jump that means bird is falling down so it should be rotatated 90 degree downwards
            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                // bird is not flapping while going down so frame=1, stops flapping for the bird
                this.frame = 1;
            }else{
                // bird jump upwards fo rotate 25 degrees anticlockwise (upwards)
                this.rotation = -25 * DEGREE;
            }
            
            
        }

    },
    speedReset : function(){
        this.speed = 0;
    }

}

const pipes = {
    //bottom pipes
    bottom : {
        sX: 502,
        sY: 0
    },
    // top pipes
    top: {
        sX:553,
        sY:0
    },
    // width of the pipes according to sprite image
    w:53,
    // height of pipes
    h:400,
    gap:85,
    //  pipe will go left by 2px
    dx:2,
    radius:12,
    position: [],
    maxY: -150, // we are going to the top
    // two pipes  will have same x position by different y positions, so randomly choose y positions
    // for top pipe , then calculate bottom pipe using gap
    draw: function(){
        for(let i=0;i<this.position.length;i++){
            let p = this.position[i];
            let top_ypos = p.y;
            let bottom_ypos = top_ypos+this.h+this.gap+100;
            // drawing the top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, top_ypos, this.w, this.h);  
            // drawing the bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottom_ypos, this.w, this.h);  
        }
    },

    update: function(){
        if (state.current!=state.play){
            return;
        }
        if (frames%100==0){
            this.position.push({
                x:cvs.width,
                //y:this.maxY * (Math.random()+ 1)
                y: Math.random() * ((this.maxY) - (this.maxY*2)) + (this.maxY*2)
            });
        }
        for(let i=0;i<this.position.length;i++){
            let p = this.position[i];
            let bottomPipeY = p.y+this.h+this.gap+100;

            // Detecting the collision of bird with the pipes
            // checking if bird collided with the top pipe
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                state.current = state.over;
                hit_sound.play();
            }
            // checking if bird collided with the bottom pipe
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeY && bird.y - bird.radius < bottomPipeY + this.h){
                state.current = state.over;
                hit_sound.play();
            }

            // Move the pipes to the left 
            p.x -= this.dx;
            // Moving the pipes to the left and giving score if pipe was not hit by bird
            if (p.x + this.w <=0){
                this.position.shift(); //delete this pipe's position from the list
                score.value +=1;
                score_sound.play();
                
                console.log("score = "+score.best,score.secondBest);
                if (score.best <= score.value){
                    console.log("score inside = "+score.best,score.secondBest);
                    localStorage.setItem("second_score",score.best);
                    score.best = score.value;                    
                }
                localStorage.setItem("best_score", score.best);
                
            }
        }

    },
    reset : function(){
        this.position = [];
    }

}

// SCORE
const score= {
    best : parseInt(localStorage.getItem("best_score")) || 0,// if no value in storage assign best to 0 , gold medal
    secondBest:  parseInt(localStorage.getItem("second_score")) || 0, // silver medal
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.play){

            ctx.lineWidth = 2; // for making the text bold
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
            
        }else if(state.current == state.over){
            // show both best and current score
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 570, 220);
            ctx.strokeText(this.value, 570, 220);
            // BEST SCORE
            ctx.fillText(this.best, 570, 280);
            ctx.strokeText(this.best, 570, 280);
            if (this.value!=0){
                if (this.value == this.best){
                    // display gold medal
                    ctx.drawImage(sprite, medals.gx, medals.gy, medals.gw, medals.gh, 352,205, 75,80);
                }else if (this.value < this.best ||  this.value==this.secondBest){
                    console.log(this.secondBest);
                ctx.drawImage(sprite, medals.sx, medals.sy, medals.sw, medals.sh, 352, 205, 75, 80);
                }
            }
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}




// drawing the GET READY MESSAGE
const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 180,
    
    draw: function(){
        if(state.current == state.ready){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x-60, this.y, this.w+100, this.h+100);
        }
    }
    
}


// drawing the GAME OVER MESSAGE
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,
    
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x-60, this.y, this.w+80, this.h+80);   
        }
    }
    
}

function updateGame(){
    bird.update();
    fg.update();
    pipes.update();

}
// all the drawing to be done on the canvas
function draw(){  
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.draw();
    pipes.draw();    
    fg.draw();   
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();

    
}

// to update the game every second
function loop(){
    // will update the game
    updateGame(); 
    // will draw the game
    draw();
    // to keep track of frames drawn on the canvas
    frames++;
    // loop is the callback function here
    // will call loop function on average 50 times per second
    requestAnimationFrame(loop);
}
// since we have used request animation frame in loop function, we need to call the loop function only once
loop();


