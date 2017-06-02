// 1. Wait for the onload even
window.addEventListener("load", function () {

    var Q = window.Q = Quintus({ development: true })
            .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
            .setup({ maximize: true }).controls().touch()

    Q.input.keyboardControls();
    Q.input.joypadControls();

    Q.SPRITE_SHIP = 1;
    Q.SPRITE_BULLET = 2;
    Q.SPRITE_ASTEROID = 4;
    Q.SPRITE_PLANET = 6;
    Q.GAME_PLAYER_INITIAL_SPRITE_ANGLE = 90;
    Q.UNIVERSE = {
        PLAYER: null,
        SECTOR: {
            SIZE: 5000,
            CURRENT: 1            
        },        
        QUADRANT: {
            SIZE: 5000,
            CURRENT: 1
        },
        OBJECTS: [[],[]], //Sector x Quadrant
        ISNEW: function () {
            if (this.OBJECTS[this.SECTOR.CURRENT] && this.OBJECTS[this.SECTOR.CURRENT][this.QUADRANT.CURRENT])
                return false;

            return true;
        },
        INSERT: function (objectToInsert) {
            if (objectToInsert instanceof Q.bship)
                this.PLAYER = objectToInsert
            else {

                if (!this.OBJECTS[this.SECTOR.CURRENT])
                    this.OBJECTS[this.SECTOR.CURRENT] = [];

                if (!this.OBJECTS[this.SECTOR.CURRENT][this.QUADRANT.CURRENT])
                    this.OBJECTS[this.SECTOR.CURRENT][this.QUADRANT.CURRENT] = [];

                this.OBJECTS[this.SECTOR.CURRENT][this.QUADRANT.CURRENT].push(objectToInsert);
            }
            return Q.stage(0).insert(objectToInsert);
        }
    };


    function drawMap(ctx, options) {
        var x = Q.width - 350,
            y = Q.height - 650,
            size = 200;

        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size, y - size);
        ctx.lineTo(x, y - size);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "#FFF";        

        for (var i in Q.UNIVERSE.OBJECTS[Q.UNIVERSE.SECTOR.CURRENT][Q.UNIVERSE.QUADRANT.CURRENT]) {
            var gameObject = Q.UNIVERSE.OBJECTS[Q.UNIVERSE.SECTOR.CURRENT][Q.UNIVERSE.QUADRANT.CURRENT][i];

            if (gameObject.isA("Planet"))
                ctx.fillStyle = "#0F0";
            else if (gameObject.isA("Asteroid"))
                continue;
            else if (gameObject.isA("BlackHole"))
                ctx.fillStyle = "#00F";

            drawMapItem(ctx, gameObject);
        }
        ctx.fillStyle = "#FFF";
        drawMapItem(ctx, Q.UNIVERSE.PLAYER);

        ctx.fillRect(x, y, 7, 7);
    }

    function drawMapItem(ctx, gameObject) {
        var ny, nx;
        var x = Q.width - 350,
            y = Q.height - 500,
            size = 200;

        var currentQuadrant = Q.UNIVERSE.QUADRANT.CURRENT;
        var currentSector = Q.UNIVERSE.SECTOR.CURRENT;
        var quadrantSize = Q.UNIVERSE.QUADRANT.SIZE;
        var sectorSize = Q.UNIVERSE.SECTOR.SIZE;

        nx = Math.abs(gameObject.p.x);
        nx = nx - ((currentQuadrant - 1) * quadrantSize);

        x = (Q.width - 350) + ((nx / (quadrantSize) * 100) * size / 100);

        ny = Math.abs(gameObject.p.y);
        ny = ny - ((currentSector - 1) * sectorSize);

        y = (Q.height - 500) - ((ny / (sectorSize) * 100) * size / 100);

        ctx.fillRect(x, y, 7, 7);
    }

    Q.component("reposition", {

        added: function () {
            this.entity.on("step", this, "step");
        },

        step: function (dt) {
            var p = this.entity.p;
            var maxSide = Math.sqrt(p.h * p.h + p.w + p.w);
            if (p.x > Q.width + maxSide) { p.x -= Q.width + maxSide }
            if (p.x < -maxSide) { p.x += Q.width + maxSide }

            if (p.y > Q.height + maxSide) { p.y -= Q.height + maxSide }
            if (p.y < -maxSide) { p.y += Q.height + maxSide }
        }

    });

    Q.Sprite.extend("VectorSprite", {

        draw: function (ctx) {
            var p = this.p;
            ctx.fillStyle = "#FFF";

            ctx.beginPath();
            ctx.moveTo(p.points[0][0], p.points[0][1]);
            for (var i = 1, max = p.points.length; i < max; i++) {
                ctx.lineTo(p.points[i][0], p.points[i][1]);
            }
            ctx.fill();
        }
    });

    Q.Sprite.extend("BlackHoleSprite", {

        draw: function (ctx) {
            var p = this.p;
            ctx.fillStyle = "#333";

            ctx.beginPath();
            ctx.moveTo(p.points[0][0], p.points[0][1]);
            for (var i = 1, max = p.points.length; i < max; i++) {
                ctx.lineTo(p.points[i][0], p.points[i][1]);
            }
            ctx.fill();
        }
    });
  
    
    Q.Sprite.extend("Planet", {
        init: function (p) {

            this._super(p, {
                asset: "planet.png",
                type: Q.SPRITE_PLANET,
                collisionMask: Q.SPRITE_ASTEROID
            });

            this.add("2d");
            this.on("hit.sprite", this, "collision");
        },

        collision: function (col) {
            if (col.obj instanceof Q.Ship) {
                Q.clearStages();
                Q.stageScene("level2");

            }
        }

    });


    Q.Sprite.extend("Bullet", {
        init: function (p) {

            p.OriginalX = p.x;
            p.OriginalY = p.y;

            this._super(p, {
                w: 2,
                h: 2,
                type: Q.SPRITE_BULLET,
                collisionMask: Q.SPRITE_ASTEROID
            });

            this.add("2d");
            this.on("hit.sprite", this, "collision");
        },

        collision: function (col) {
            if (col.obj.isA("BlackHole"))
                return;

            var objP = col.obj.p;
            if (objP.SIZE > 20) {
                this.stage.insert(new Q.Asteroid({
                    x: objP.x,
                    y: objP.y,
                    SIZE: objP.SIZE * 2 / 3,
                    startAngle: objP.startAngle + 90
                }));
                this.stage.insert(new Q.Asteroid({
                    x: objP.x,
                    y: objP.y,
                    SIZE: objP.SIZE * 2 / 3,
                    startAngle: objP.startAngle - 90
                }));
            }


            col.obj.destroy();
            this.destroy();
        },

        draw: function (ctx) {
            ctx.fillStyle = "#FFF";
            ctx.fillRect(-this.p.cx, -this.p.cy, this.p.w, this.p.h);
        },

        step: function (dt) {
            if (!this.p || !this.p)
                return;

            var p = this.p;
            var deltaX = p.x - p.OriginalX;
            var deltaY = p.y - p.OriginalY;

            distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))

            if (distance > Q.UNIVERSE.SECTOR.SIZE)
                this.destroy();
        }
    });

    Q.VectorSprite.extend("Asteroid", {

        init: function (p) {
            p = this.createShape(p);

            if (!p.vx) {
                p.startAngle = p.startAngle || Math.random() * 360;
                var speed = Math.random() * 100 + 50;
                p.vx = Math.cos(p.startAngle) * speed;
                p.vy = Math.sin(p.startAngle) * speed;
            }

            this._super(p, {
                type: Q.SPRITE_ASTEROID,
                collisionMask: Q.SPRITE_SHIP,
                omega: Math.random() * 100,
                skipCollide: true
            });
            this.add("2d");

            this.on("hit.sprite", this, "collision");
        },

        collision: function (col) {
            if (col.obj instanceof Q.Ship) {
                col.obj.reset();
            }
        },

        step: function (dt) {
            this.p.angle += this.p.omega * dt;
        },

        createShape: function (p) {
            var angle = Math.random() * 2 * Math.PI,
                numPoints = 7 + Math.floor(Math.random() * 5),
                minX = 0, maxX = 0,
                minY = 0, maxY = 0,
                curX, curY;

            p = p || {};

            p.points = [];

            var startAmount = p.SIZE;

            for (var i = 0; i < numPoints; i++) {
                curX = Math.floor(Math.cos(angle) * startAmount);
                curY = Math.floor(Math.sin(angle) * startAmount);

                if (curX < minX) minX = curX;
                if (curX > maxX) maxX = curX;

                if (curY < minY) minY = curY;
                if (curY > maxY) maxY = curY;

                p.points.push([curX, curY]);

                startAmount += Math.floor(Math.random() * 3);
                angle += (Math.PI * 2) / (numPoints + 1);
            };

            maxX += 30;
            minX -= 30;
            maxY += 30;
            minY -= 30;

            p.w = maxX - minX;
            p.h = maxY - minY;

            for (var i = 0; i < numPoints; i++) {
                p.points[i][0] -= minX + p.w / 2;
                p.points[i][1] -= minY + p.h / 2;
            }


            p.x = p.x || Math.random() * Q.width;
            p.y = p.y || Math.random() * Q.height;
            p.cx = p.w / 2;
            p.cy = p.h / 2;
            p.angle = angle;
            return p;
        },
    });

    Q.BlackHoleSprite.extend("BlackHole", {
        init: function (p) {
            p = this.createShape(p);

            this._super(p, {
                type: Q.SPRITE_ASTEROID,
                collisionMask: Q.SPRITE_SHIP,
                omega: Math.random() * 100,
                skipCollide: true
            });
            this.add("2d");

            this.on("hit.sprite", this, "collision");
        },

        collision: function (col) {
            var np = Math.random() * Q.UNIVERSE.SECTOR.SIZE;
            col.obj.p.y = np * -1;
        },

        step: function (dt) {
            this.p.angle += this.p.omega * dt;
        },

        createShape: function (p) {
            var angle = Math.random() * 2 * Math.PI,
                numPoints = 7 + Math.floor(Math.random() * 5),
                minX = 0, maxX = 0,
                minY = 0, maxY = 0,
                curX, curY;

            p = p || {};

            p.points = [];

            var startAmount = p.SIZE;

            for (var i = 0; i < numPoints; i++) {
                curX = Math.floor(Math.cos(angle) * startAmount);
                curY = Math.floor(Math.sin(angle) * startAmount);

                if (curX < minX) minX = curX;
                if (curX > maxX) maxX = curX;

                if (curY < minY) minY = curY;
                if (curY > maxY) maxY = curY;

                p.points.push([curX, curY]);

                startAmount += Math.floor(Math.random() * 3);
                angle += (Math.PI * 2) / (numPoints + 1);
            };

            maxX += 30;
            minX -= 30;
            maxY += 30;
            minY -= 30;

            p.w = maxX - minX;
            p.h = maxY - minY;

            for (var i = 0; i < numPoints; i++) {
                p.points[i][0] -= minX + p.w / 2;
                p.points[i][1] -= minY + p.h / 2;
            }

            minX = Q.UNIVERSE.QUADRANT.SIZE * (Q.UNIVERSE.QUADRANT.CURRENT -1);
            minY = Q.UNIVERSE.SECTOR.SIZE * (Q.UNIVERSE.SECTOR.CURRENT - 1) * -1;

            maxX = Q.UNIVERSE.QUADRANT.SIZE * Q.UNIVERSE.QUADRANT.CURRENT;
            maxY = Q.UNIVERSE.SECTOR.SIZE * Q.UNIVERSE.SECTOR.CURRENT * -1;

            p.x = Math.random() * (maxX - minX) + minX;
            p.y = Math.random() * (maxY - minY) + minY;
            p.cx = p.w / 2;
            p.cy = p.h / 2;
            p.angle = angle;
            return p;
        },
    });


    Q.scene("level1", function (stage) {

        Q.stageScene("hud", 2);

        Q.gravityX = 0;
        Q.gravityY = 0;

        stage.insert(new Q.Repeater({ asset: "ceu.png", speedX: 0.5, speedY: 0.5, type: 0 }));

        var ship = new Q.bship({ x: Q.width / 2, y: Q.height / 2 });

        var eship = new Q.blueship({ x: (Q.width / 2) + 500, y: Q.height / 2 });

        var player = Q.UNIVERSE.INSERT(ship);


      //  stage.insert(new Q.fire(), ship);

       //Q.UNIVERSE.INSERT(eship);
        
        Q.UNIVERSE.INSERT(new Q.Planet({ x: 500, y: -1000 }));


        stage.add("viewport").follow(player);


        stage.on("step", function () {
            if (Q("Asteroid").length == 0 && !Q.stage(1)) {
                Q.stageScene("endGame", 1, { label: "You Win!" });
            }
            var p = Q.UNIVERSE.PLAYER.p;

            if (p.y < (Q.UNIVERSE.SECTOR.CURRENT * Q.UNIVERSE.SECTOR.SIZE * -1))
                Q.UNIVERSE.SECTOR.CURRENT++;
            else if (p.y > ((Q.UNIVERSE.SECTOR.CURRENT * Q.UNIVERSE.SECTOR.SIZE - Q.UNIVERSE.SECTOR.SIZE) * -1))
                Q.UNIVERSE.SECTOR.CURRENT--;

            if (Q.UNIVERSE.ISNEW()) {
                for (var i = 0; i < 2; i++) {
                 //   Q.UNIVERSE.INSERT(new Q.BlackHole({ SIZE: Math.floor(Math.random() * 140) + 10 }));
                  //  Q.UNIVERSE.INSERT(new Q.Asteroid({ SIZE: 60 }));
                }
            }

            if (p.x > (Q.UNIVERSE.QUADRANT.CURRENT * Q.UNIVERSE.QUADRANT.SIZE))
                Q.UNIVERSE.QUADRANT.CURRENT++;
            else if (p.x < ((Q.UNIVERSE.QUADRANT.CURRENT - 1) * Q.UNIVERSE.QUADRANT.SIZE) && Q.UNIVERSE.QUADRANT.CURRENT > 1)
                Q.UNIVERSE.QUADRANT.CURRENT--;

            Q.stageScene("hud", 2, p);

        });

    });

    Q.scene('hud', function (stage) {
        var container = stage.insert(new Q.UI.Container({
            x: 50, y: 50, fill: "rgba(255,255,255,0.5)"
        }));

        var label = container.insert(new Q.UI.Text({
            x: 100, y: 100, color: "#FFFFFF",
            label: "X: " + Math.round(stage.options.x) +
                   "\nY: " + Math.round(stage.options.y) +
                   "\nS: " + Q.UNIVERSE.SECTOR.CURRENT +
                   "\nQ: " + Q.UNIVERSE.QUADRANT.CURRENT
        }));

        // Expand the container to visibily fit it's contents
        container.fit(20);


        var container2 = stage.insert(new Q.UI.Container({
            fill: "rgba(255,255,255,0.2)",
            y: 300,
            x: Q.width - 300,
            h: 200
        }));

        container2.insert(new Q.UI.Text({
            x: 50, y: -10,
            label: "Setor " + Q.UNIVERSE.SECTOR.CURRENT + " Quad " + Q.UNIVERSE.QUADRANT.CURRENT
        }));

        container2.fit(10);

        stage.on('postrender', function (ctx) {
            drawMap(ctx, stage.options);
        });

    });



    // ## Asset Loading and Game Launch
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded
    Q.load("sprites.png, sprites.json, level.json, tiles.png, background-wall.png, ceu.png, planet.png, bgbattleship.png, bgspeedship.png, fogo1.png, beam.png, mini-canon.png", function () {
        // Sprites sheets can be created manually
        Q.sheet("tiles", "tiles.png", { tilew: 32, tileh: 32 });

        // Or from a .json asset that defines sprite locations
        Q.compileSheets("sprites.png", "sprites.json");

        

        Q.stageScene("level1");

        //Q.debug = true;
        //Q.debugFill = true;
       
    });
    
});
