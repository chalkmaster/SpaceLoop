
window.addEventListener("load", function () {
    Q.Sprite.extend("Player", {

        // the init constructor is called on creation
        init: function (p) {

            // You can call the parent's constructor with this._super(..)
            this._super(p, {
                sheet: "player",  // Setting a sprite sheet sets sprite width and height
                x: 410,           // You can also set additional properties that can
                y: 90             // be overridden on object creation
            });

            // Add in pre-made components to get up and running quickly
            // The `2d` component adds in default 2d collision detection
            // and kinetics (velocity, gravity)
            // The `platformerControls` makes the player controllable by the
            // default input actions (left, right to move,  up or action to jump)
            // It also checks to make sure the player is on a horizontal surface before
            // letting them jump.
            this.add('2d, platformerControls');

            // Write event handlers to respond hook into behaviors.
            // hit.sprite is called everytime the player collides with a sprite
            this.on("hit.sprite", function (collision) {

                // Check the collision, if it's the Tower, you win!
                if (collision.obj.isA("Tower")) {
                    Q.stageScene("level1");
                    this.destroy();
                }
            });

        }

    });


    // ## Tower Sprite
    // Sprites can be simple, the Tower sprite just sets a custom sprite sheet
    Q.Sprite.extend("Tower", {
        init: function (p) {
            this._super(p, { sheet: 'tower' });
        }
    });

    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Enemy", {
        init: function (p) {
            this._super(p, { sheet: 'enemy', vx: 100 });

            // Enemies use the Bounce AI to change direction 
            // whenver they run into something.
            this.add('2d, aiBounce');

            // Listen for a sprite collision, if it's the player,
            // end the game unless the enemy is hit on top
            this.on("bump.left,bump.right,bump.bottom", function (collision) {
                if (collision.obj.isA("Player")) {
                    Q.stageScene("endGame", 1, { label: "You Died" });
                    collision.obj.destroy();
                }
            });

            // If the enemy gets hit on the top, destroy it
            // and give the user a "hop"
            this.on("bump.top", function (collision) {
                if (collision.obj.isA("Player")) {
                    this.destroy();
                    collision.obj.p.vy = -300;
                }
            });
        }
    });

    // ## Level1 scene
    // Create a new scene called level 1
    Q.scene("level2", function (stage) {

        // Add in a repeater for a little parallax action
        stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

        // Add in a tile layer, and make it the collision layer
        stage.collisionLayer(new Q.TileLayer({
            dataAsset: 'level.json',
            sheet: 'tiles'
        }));

        Q.gravityY = 980;

        // Create the player and add them to the stage
        var player = stage.insert(new Q.Player());

        // Give the stage a moveable viewport and tell it
        // to follow the player.
        stage.add("viewport").follow(player);

        // Add in a couple of enemies
        //stage.insert(new Q.Enemy({ x: 700, y: 0 }));
        stage.insert(new Q.Tower({ x: 800, y: 200 }));

        // Finally add in the tower goal
       // stage.insert(new Q.Tower({ x: 180, y: 50 }));
    });

    // To display a game over / game won popup box, 
    // create a endGame scene that takes in a `label` option
    // to control the displayed message.   
});