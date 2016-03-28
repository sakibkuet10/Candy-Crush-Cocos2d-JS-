var matchSize = 3;
var fieldSize = 7;
var tileSize = 60;
var tileArray = [];
var tileImage=[];
var tileImageBack = "res/tile.png";
var tileTypes = ["red", "green", "blue", "pink", "sky", "white"];
//var tileTypes = ["red", "green", "blue", "pink"];

var layer_posX, layer_posY;

var globezLayer, tileImageBacklayer;

var visitedTiles = [];
var startColor = null;
var tolerance = 400;

var matchHorizontalTile = [];
var matchVerticalTile = [];
var matchResultTile = [];
var resultFlag = true;
var currentMatchResultTile;

var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;
        layer_posX = size.width/2 - tileSize*fieldSize/2;
        layer_posY = size.height/2 - tileSize*fieldSize/2;

        var background;
        if(size.width < size.height)
            background = new cc.Sprite.create("res/Background1.png");
        else
            background = new cc.Sprite.create("res/Background2.png");
        
        background.setPosition(size.width/2, size.height/2);
        background.setOpacity(200);
        this.addChild(background, 0);

        // candy image process
        var x1 = 0, x2=90, y1=0, y2=85;
        for (var i=0; i<6; i++){
            tileImage.push(cc.rect(x1,y1,x2,y2));
            if( i >= 3)
                x1 += x2+5;
            else
                x1 += x2+15;
        }

        tileImageBacklayer = cc.Layer.create();
        tileImageBacklayer.setPosition(layer_posX, layer_posY);
        this.addChild(tileImageBacklayer);

        globezLayer = cc.Layer.create();
        globezLayer.setPosition(layer_posX, layer_posY);
        this.addChild(globezLayer);

        this.createLevel();

        cc.eventManager.addListener(touchListener, this);

        return true;
    },

    createLevel: function(){
        for(var i = 0; i < fieldSize; i ++){
            tileArray[i] = [];
            for(var j = 0;j < fieldSize; j ++){
                this.addTile(i, j);
            }
        }
    },

    addTile:function(row,col){
        var randomTile = Math.floor(Math.random()*tileTypes.length);
        //var sprite = cc.Sprite.createWithSpriteFrame(tileImage[randomTile]);
        var sprite = cc.Sprite.createWithSpriteFrame( "res/candy.png" ,tileImage[randomTile]);
        sprite.val = randomTile;
        sprite.picked = false;
        sprite.setScale(0.55);
        globezLayer.addChild(sprite,1);
        sprite.setPosition(col*tileSize+tileSize/2,row*tileSize+tileSize/2);
        //sprite.setPosition((col*tileSize+tileSize/2)+2 , (row*tileSize+tileSize/2)+4);    
        tileArray[row][col] = sprite;

        var sprite = new cc.Sprite.create(tileImageBack);
        sprite.setPosition(col*tileSize+tileSize/2,row*tileSize+tileSize/2);
        tileImageBacklayer.addChild(sprite,0);
    },
});

var pickedRow;
var pickedCol;

var touchListener = cc.EventListener.create({
    event: cc.EventListener.MOUSE,

    swapCandyAnimation: function(){
        //cc.log("swapCandyAnimation");

        var sprite1 = tileArray[visitedTiles[0].row][visitedTiles[0].col];
        var sprite2 = tileArray[visitedTiles[1].row][visitedTiles[1].col];

        var actionMove = new cc.MoveBy.create(0.3, cc.p(visitedTiles[1].col*tileSize - visitedTiles[0].col*tileSize, visitedTiles[1].row*tileSize - visitedTiles[0].row*tileSize))
        tileArray[visitedTiles[0].row][visitedTiles[0].col].runAction(actionMove);

        var actionMove = new cc.MoveBy.create(0.3, cc.p(visitedTiles[0].col*tileSize - visitedTiles[1].col*tileSize, visitedTiles[0].row*tileSize - visitedTiles[1].row*tileSize));
        tileArray[visitedTiles[1].row][visitedTiles[1].col].runAction(actionMove);

        setTimeout(function(){

            for(var i=0; i<visitedTiles.length; i++){
                globezLayer.removeChild(tileArray[visitedTiles[i].row][visitedTiles[i].col]);
                tileArray[visitedTiles[i].row][visitedTiles[i].col]=null;
            }

            tileArray[visitedTiles[0].row][visitedTiles[0].col] = sprite2;
            tileArray[visitedTiles[1].row][visitedTiles[1].col] = sprite1;

            for(i = 0; i < visitedTiles.length; i ++){
                globezLayer.addChild(tileArray[visitedTiles[i].row][visitedTiles[i].col],0);
                tileArray[visitedTiles[i].row][visitedTiles[i].col].setPosition(visitedTiles[i].col*tileSize+tileSize/2,visitedTiles[i].row*tileSize+tileSize/2);
                tileArray[visitedTiles[i].row][visitedTiles[i].col].setOpacity(255);
                tileArray[visitedTiles[i].row][visitedTiles[i].col].picked=false;
            }
        },300);
    },

    notInMatchResultTile:function(r,c){
        for(var i=0; i<matchResultTile.length; i++){
            if(matchResultTile[i].row == r && matchResultTile[i].col == c)
                return false;
        }

        return true;
    },

    searchMatchTile: function(currentRow, currentCol){

        // Horizontal Search
        matchHorizontalTile.push({
                row: currentRow,
                col: currentCol,
                val: tileArray[currentRow][currentCol].val
            });

        for(var i=1; (currentRow+i<fieldSize && currentRow+i>=0) && tileArray[currentRow+i][currentCol].val == tileArray[currentRow][currentCol].val && this.notInMatchResultTile(currentRow+i,currentCol); i++){
            matchHorizontalTile.push({
                row: currentRow+i,
                col: currentCol,
                val: tileArray[currentRow+i][currentCol].val
            });
        }

        for(var i=-1; (currentRow+i<fieldSize && currentRow+i>=0) && (tileArray[currentRow+i][currentCol].val == tileArray[currentRow][currentCol].val && this.notInMatchResultTile(currentRow+i,currentCol) ); i--){
            matchHorizontalTile.push({
                row: currentRow+i,
                col: currentCol,
                val: tileArray[currentRow+i][currentCol].val
            });
        }

        // Vertical Search
        matchVerticalTile.push({
                row: currentRow,
                col: currentCol,
                val: tileArray[currentRow][currentCol].val
            });

        for(var i=1; (currentCol+i<fieldSize && currentCol+i>=0) && tileArray[currentRow][currentCol+i].val == tileArray[currentRow][currentCol].val && this.notInMatchResultTile(currentRow,currentCol+i); i++){
            matchVerticalTile.push({
                row: currentRow,
                col: currentCol+i,
                val: tileArray[currentRow][currentCol+i].val
            });
        }

        for(var i=-1; (currentCol+i<fieldSize && currentCol+i>=0) && tileArray[currentRow][currentCol+i].val == tileArray[currentRow][currentCol].val && this.notInMatchResultTile(currentRow,currentCol+i); i--){
            matchVerticalTile.push({
                row: currentRow,
                col: currentCol+i,
                val: tileArray[currentRow][currentCol+i].val
            });
        }
    },

    process_matchResultTile:function(){
        if(matchHorizontalTile.length >= matchSize && matchVerticalTile.length >= matchSize){
            for(var i=0; i<matchHorizontalTile.length; i++)
                matchResultTile.push(matchHorizontalTile[i]);

            for(var i=1; i<matchVerticalTile.length; i++)
                matchResultTile.push(matchVerticalTile[i]);
        }
        else if(matchHorizontalTile.length >= matchSize)
            for(var i=0; i<matchHorizontalTile.length; i++)
                matchResultTile.push(matchHorizontalTile[i]);

        else if(matchVerticalTile.length >= matchSize)
            for(var i=0; i<matchVerticalTile.length; i++)
                matchResultTile.push(matchVerticalTile[i]);
    },

    fallTile:function(row,col,height){
        var randomTile = Math.floor(Math.random()*tileTypes.length);
        //var sprite = cc.Sprite.createWithSpriteFrame(tileImage[randomTile]);
        var sprite = cc.Sprite.createWithSpriteFrame( "res/candy.png" ,tileImage[randomTile]);
        sprite.val = randomTile;
        sprite.picked = false;
        sprite.setScale(0.55);
        globezLayer.addChild(sprite,0);
        sprite.setPosition(col*tileSize+tileSize/2,(fieldSize+height)*tileSize);
        var moveAction = cc.MoveTo.create(1.0, new cc.Point(col*tileSize+tileSize/2,row*tileSize+tileSize/2));
        sprite.runAction(moveAction);
        tileArray[row][col] = sprite;
    },

    fallTileAnimation: function(){
        for(i = 1; i < fieldSize; i ++){
            for(j = 0; j < fieldSize; j ++){
                if(tileArray[i][j] != null){
                    var holesBelow = 0;
                    for(var k = i - 1; k >= 0; k --){
                        if(tileArray[k][j] == null){
                            holesBelow++;
                        }
                    }
                    if(holesBelow>0){
                        var moveAction = cc.MoveTo.create(1.0, new cc.Point(tileArray[i][j].x,tileArray[i][j].y-holesBelow*tileSize));
                        // cc.moveTo() can also be used
                        tileArray[i][j].runAction(moveAction);
                        tileArray[i - holesBelow][j] = tileArray[i][j];
                        tileArray[i][j] = null;
                    }
                }
            }
        }
    },

    deleteMatchTile:function(){
        resultFlag = false;
        for(var i=0; i<matchResultTile.length; i++){
            globezLayer.removeChild(tileArray[matchResultTile[i].row][matchResultTile[i].col]);
            tileArray[matchResultTile[i].row][matchResultTile[i].col]=null;
        }

        this.fallTileAnimation();
    },

    searchSameTile:function(){
        this.searchMatchTile(visitedTiles[1].row, visitedTiles[1].col);
        this.process_matchResultTile();

        matchHorizontalTile = [];
        matchVerticalTile = [];

        this.searchMatchTile(visitedTiles[0].row, visitedTiles[0].col);
        this.process_matchResultTile();

        // Delete Match Tile
        if(matchResultTile.length>=matchSize)
            this.deleteMatchTile();

        //cc.log(matchResultTile);
    },

    fallTileCreate: function(){
        for(var i = 0; i < fieldSize; i ++){
            for(j = fieldSize-1; j>=0; j --){
                if(tileArray[j][i] != null){
                    break;
                }
            }
            var missingGlobes = fieldSize-1-j;
            if(missingGlobes>0){
                for(var j=0;j<missingGlobes;j++){
                    if(tileArray[fieldSize-j-1][i] == null){
                    //var target = event.getCurrentTarget();
                    //target.fallTile(fieldSize-j-1,i,missingGlobes-j);   
                    this.fallTile(fieldSize-j-1,i,missingGlobes-j);   
                    }
                }
            }
        }
    },

    checkCollision:function(){
        for(var i=0; i<currentMatchResultTile.length; i++){
            for(var j=currentMatchResultTile[i].row; j<fieldSize; j++){
                matchHorizontalTile = [];
                matchVerticalTile = [];
                this.searchMatchTile(j, currentMatchResultTile[i].col);
            //    this.searchMatchTile(currentMatchResultTile[i].row, currentMatchResultTile[i].col);
                this.process_matchResultTile();
            }
        }

        // Delete Match Tile
        if(matchResultTile.length>=matchSize){
            //this.deleteMatchTile();
            //cc.log("checkCollision");
            //cc.log(matchResultTile);
            return true;
        }


        return false;
            //cc.log("checkCollision");

        //cc.log(matchResultTile);
    },

    UpdateFunction: function(){
        var that = this;
        //cc.log("Guti Baj Talha");
        currentMatchResultTile = [];
        currentMatchResultTile = matchResultTile;
        //cc.log(currentMatchResultTile);
        matchResultTile = [];
        matchHorizontalTile = [];
        matchVerticalTile = [];

        if(this.checkCollision()){
            this.deleteMatchTile();
            this.fallTileCreate();
            setTimeout(function(){
                that.UpdateFunction();
            }, 1000);
        }        
    },

    onMouseDown: function (event) {
        pickedRow = Math.floor( (event._y - layer_posY) / tileSize);
        pickedCol = Math.floor( (event._x - layer_posX) / tileSize);

        if( (pickedRow >= 0 && pickedRow < fieldSize) && (pickedCol >= 0 && pickedCol < fieldSize) ){
            tileArray[pickedRow][pickedCol].setOpacity(128);
            tileArray[pickedRow][pickedCol].picked = true;
            startColor = tileArray[pickedRow][pickedCol].val;
            visitedTiles.push({
                row: pickedRow,
                col: pickedCol
            });   
        }
    },

    onMouseUp: function(event){
        startColor=null;
        if (visitedTiles.length == 2){ 
            this.swapCandyAnimation();

            var that = this;

            setTimeout(function(){
                // matchResultTile Array process
                if (visitedTiles.length == 2){
                    that.searchSameTile();
                    if(resultFlag)
                    that.swapCandyAnimation();
                }
                // New tile create after remove
                that.fallTileCreate(); // 1.0 second
                
                setTimeout(function(){
                    that.UpdateFunction();
                },1000);

                setTimeout(function(){
                    resultFlag = true;
                    visitedTiles = [];
                },1010);

            },300);
        }
        else{
            if( (pickedRow >= 0 && pickedRow < fieldSize) && (pickedCol >= 0 && pickedCol < fieldSize) ){
                tileArray[visitedTiles[0].row][visitedTiles[0].col].setOpacity(255);
                tileArray[visitedTiles[0].row][visitedTiles[0].col].picked=false;
                visitedTiles = [];
            }
        }

           
    },

    onMouseMove: function(event){
        if(startColor!=null && visitedTiles.length <= 1){
            var currentRow = Math.floor( (event._y - layer_posY) / tileSize);
            var currentCol = Math.floor( (event._x - layer_posX) / tileSize);

            if( (currentRow >= 0 && currentRow < fieldSize) && (currentCol >= 0 && currentCol < fieldSize) ){
                if( (visitedTiles[0].row - currentRow) == 0 || (visitedTiles[0].col - currentCol) == 0 ){
                    if(!tileArray[currentRow][currentCol].picked){
                        if(Math.abs(currentRow - visitedTiles[visitedTiles.length - 1].row) <= 1 && Math.abs(currentCol - visitedTiles[visitedTiles.length -1].col) <= 1){
                            tileArray[currentRow][currentCol].setOpacity(128);
                            tileArray[currentRow][currentCol].picked=true;
                            visitedTiles.push({
                                row:currentRow,
                                col:currentCol
                            });
                        }
                    }
                }
            }
        }
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

