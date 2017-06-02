window.addEventListener("load", function () {

    Q.component("playercontrol", {

        added: function () {
            this.entity.on("step", this, "step");
        },

        step: function (dt) {
            var p = this.entity.p;

            if (Q.inputs["right"]) {

                this.entity.turnRight(dt);

            } else if (Q.inputs["left"]) {
                this.entity.turnLeft(dt);
            }

            if (Q.inputs["up"]) {
                this.entity.accelerate(dt);
            }

            if (Q.inputs["down"]) {
                this.entity.desaccelerate(dt);
            }
        }

    });


    Q.component("enemycontrol", {

        added: function () {
            this.entity.on("step", this, "step");
        },

        step: function (dt) {
            var p = this.entity.p;
            var deltaY, deltaX, newAngleR, positioned;
            var oldAngleR = p.angle * Math.PI / 180;
            var player = Q.UNIVERSE.PLAYER.p;
            var ENEMY_STATE_ATTACK = "ATTACK";
            var ENEMY_STATE_ESCAPE = "ESCAPE";

            if (!p.enemyState)
                p.enemyState = ENEMY_STATE_ATTACK;

            deltaY = player.y - p.y;
            deltaX = player.x - p.x;

            angleInDegrees = (Math.atan2(deltaY, deltaX) * 180 / Math.PI) + Q.GAME_PLAYER_INITIAL_SPRITE_ANGLE;
            newAngleR = angleInDegrees * Math.PI / 180

            distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
            positioned = (newAngleR > oldAngleR - 0.3 || newAngleR < oldAngleR + 0.3);

            if (p.enemyState == ENEMY_STATE_ESCAPE && distance < 500) {
                p.angle = angleInDegrees + 180
                this.entity.accelerate(dt);
            } else {

                p.angle = angleInDegrees;

                if (distance > 500 && distance < 5000 && positioned)
                    this.entity.accelerate(dt);

                if (distance < 500 && positioned)
                    this.entity.fire();

                if (distance < 500)
                    this.entity.desaccelerate(dt);

            }

            p.enemyState = (p.lastPlayerDistance > distance) ? ENEMY_STATE_ESCAPE : ENEMY_STATE_ATTACK;
            p.lastPlayerDistance = distance;

        }

    });


    Q.Sprite.extend("Ship", {

        components: [],

        componentsPosition: [],

        init: function (p, val) {
            p.WEAPON_MAX_CAPACITY = 50;
            p.WeaponRechargeSpeed = 500;
            p.BulletMagazine = p.WEAPON_MAX_CAPACITY;
            p.WeaponStatus = "LOADED";

            this._super(p, val);

            this.add("2d");

            Q.input.on("fire", this, "fire");

            this.activationObject = new Q.Sprite({ x: Q.width / 2, y: Q.height / 2, w: 300, h: 300 });

        },
        fire: function () {
            var p = this.p;
            /*if (p.BulletMagazine > 0) {              

                if (this.stage == null)
                    return;
                if (this.p.gun != null) {
                    this.p.gun.shoot();
                }
                
                p.BulletMagazine--;
                p.WeaponStatus = "EMPTY";
            } else {
                if (p.WeaponStatus == "EMPTY") {
                    setTimeout(function () {
                        p.BulletMagazine = p.WEAPON_MAX_CAPACITY;
                        p.WeaponStatus = "LOADED";
                    }, p.WeaponRechargeSpeed);
                    p.WeaponStatus = "CHARGING";
                }
            }*/

            for (var x = 0; x < this.children.length; x++) {
             
                if (this.children[x] instanceof Q.GunComponent)
                    this.children[x].shoot();

           }

        },

        checkActivation: function () {
            if (!this.stage.search(this.activationObject, Q.SPRITE_ASTEROID)) {
                this.p.activated = true;
            }
        },

        turnLeft: function (dt) {
            var p = this.p;
            p.omega -= p.omegaDelta * dt;
            if (p.omega < -p.maxOmega) { p.omega = -p.maxOmega; }
        },

        turnRight: function (dt) {
            var p = this.p;
            p.omega += p.omegaDelta * dt;
            if (p.omega > p.maxOmega) { p.omega = p.maxOmega; }
        },

        desaccelerate: function (dt) {
            var p = this.p;


            velX = p.vx + (p.vx < 0 ? p.acceleration : -p.acceleration);
            velY = p.vy + (p.vy < 0 ? p.acceleration : -p.acceleration);

            if (Math.abs(velX) < 10)
                p.vx = 0;

            if (Math.abs(velY) < 10)
                p.vy = 0;

            if (p.vx != 0)
                p.vx = velX;

            if (p.vy != 0)
                p.vy = velY;
        },

        accelerate: function (dt) {
            var p = this.p;

            var thrustX = Math.sin(p.angle * Math.PI / 180),
                       thrustY = -Math.cos(p.angle * Math.PI / 180);


            var maxSpeed = (p.acceleration * 40), velX, velY;

            velX = p.vx + (thrustX * p.acceleration);

            velY = p.vy + thrustY * p.acceleration;


            if (velX > maxSpeed)
                velx = maxSpeed;
            else if (velX < (-maxSpeed))
                velX = -maxSpeed;
            if (velY > maxSpeed)
                velY = maxSpeed;
            else if (velX < (-maxSpeed))
                velY = -maxSpeed

            p.vx = velX;
            p.vy = velY;
        },

        step: function (dt) {

            if (this.componentsAdded == null) {

                for (var x = 0; x < this.components.length; x++)
                    this.stage.insert(new this.components[x](this.componentsPosition[x]), this);

                this.componentsAdded = "ok";
            }

            if (!this.p.activated) {
                return this.checkActivation();
            }


            var p = this.p;

            p.angle += p.omega * dt;
            p.omega *= 1 - 1 * dt;

           
            if (p.angle > 360) { p.angle -= 360; }
            if (p.angle < 0) { p.angle += 360; }
        },

        draw: function (ctx) {
            // Q.sheet("").
            if (this.p.activated) { this._super(ctx); }
        },

        reset: function () {
            Q._extend(this.p, {
                x: Q.width / 2,
                y: Q.height / 2,
                vx: 0,
                vy: 0,
                angle: 0,
                omega: 0,
                activated: false
            });

        }
    });

    Q.Ship.extend("bship", {


        components: [Q.fire, Q.minicannonBasic, Q.minicannonBasic],

        componentsPosition: [{ x: 0, y: 60 }, { x: -25, y: 0 }, {x :25, y:0}],

        init: function (p) {

            this._super(p, {
                type: Q.SPRITE_NONE,
                collisionMask: Q.SPRITE_ASTEROID,
                omega: 0,
                omegaDelta: 300,
                maxOmega: 400,
                acceleration: 8,
                //gun: new Q.LaserBasic({ ship: this }),                
                asset: "bgspeedship.png",
                bulletSpeed: 500,
                activated: false
            })           

            this.add("playercontrol");

        }       

    });

    Q.Ship.extend("eship", {
        init: function (p) {

            this._super(p, {
                type: Q.SPRITE_NONE,
                collisionMask: Q.SPRITE_ASTEROID,
                omega: 0,
                omegaDelta: 300,
                maxOmega: 400,
                acceleration: 8,
                asset: "spshipsprite.png",
                bulletSpeed: 500,
                activated: false
            });

        }
    });


    Q.Ship.extend("blueship", {
        init: function (p) {

            this._super(p, {
                type: Q.SPRITE_NONE,
                collisionMask: Q.SPRITE_ASTEROID,
                omega: 0,
                omegaDelta: 100,                
                maxOmega: 400,
                acceleration: 8,
                asset: "bgbattleship.png",
                bulletSpeed: 500,
                activated: false
            });

            this.add("enemycontrol");
        }
    });

});

