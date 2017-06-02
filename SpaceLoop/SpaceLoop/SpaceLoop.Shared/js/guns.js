window.addEventListener("load", function () {


    Q.Class.extend("Gun", {
       
        init: function(p) {
            this.container = p.ship;
        },

        container: null,

        Damage: 0,

        Bullet: null,

        BulletSpeed: 0,

        shoot: function () {

            var ship = this.container;

            var dx = Math.sin(ship.p.angle * Math.PI / 180),
                  dy = -Math.cos(ship.p.angle * Math.PI / 180);

            ship.stage.insert(
                  new this.Bullet({
                      angle: ship.p.angle,
                      x: ship.c.points[0][0],
                      y: ship.c.points[0][1],
                      vx: dx * (this.BulletSpeed),
                      vy: dy * (this.BulletSpeed)
                  })
                );
        }

    });


    Q.Gun.extend("LaserBasic", {

        Damage: 10,
        Bullet: Q.LaserProjectile,
        BulletSpeed: 800
    });

});