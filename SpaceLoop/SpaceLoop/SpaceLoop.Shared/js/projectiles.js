window.addEventListener("load", function () {

    Q.Sprite.extend("Bullet", {
        init: function (p) {

            p.OriginalX = p.x;
            p.OriginalY = p.y;

            this._super(p, {
                asset: "beam.png",
                type: Q.SPRITE_BULLET,
                collisionMask: Q.SPRITE_ASTEROID
            });

            this.add("2d");
            this.on("hit.sprite", this, "collision");

        },
        step: function (dt) {

            if (!this.p || !this.p)
                return;

            // this.p.vx = this.container.p.vx;
            // this.p.vy = this.container.p.vy;

            var p = this.p;
            var deltaX = p.x - p.OriginalX;
            var deltaY = p.y - p.OriginalY;

            distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))

            if (distance > Q.UNIVERSE.SECTOR.SIZE)
                this.destroy();
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
        }

    });

    
    Q.Bullet.extend("LaserProjectile", {

        init: function (p) {

            this._super(p, {
                asset: "beam.png"
            });
        }

    });

});