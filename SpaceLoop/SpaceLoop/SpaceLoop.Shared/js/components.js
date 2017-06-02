window.addEventListener("load", function () {

    Q.Sprite.extend("ShipComponent", {
        init: function (p, val) {

            this._super(p, val);
        }
    });


    Q.ShipComponent.extend("GunComponent", {

        guns: [],

        shoot: function() {
        
            for (var x = 0; x < this.guns.length; x++) {

                this.guns[x].shoot();
            }

        },

        init: function (p, val) {

            this._super(p, val);
        }
    });

    Q.ShipComponent.extend("fire", {
        init: function (p) {

            this._super(p, {
                type: Q.SPRITE_NONE,
                asset: "fogo1.png",
                y: 60,
                x: 0
            });
        }
    });


    Q.GunComponent.extend("minicannonBasic", {

      

        init: function (p) {

            this.guns = [new Q.LaserBasic({ ship: this })];

            this._super(p, {
                type: Q.SPRITE_NONE,
                asset: "mini-canon.png",
                y: 60,
                x: 0
            });
        }
    });


});
