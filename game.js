'use strict';

class Vector {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }
    plus(vector) {
        if(vector instanceof Vector) {
            return new Vector(this.x + vector.x, this.y + vector.y);
        } else {
            trow('Аргумент функции не является вектором.');
        }
    }
    times(n) {
        return new Vector(this.x * n, this.y * n);
    }
}

class Actor {
    constructor(position=new Vector(), size=new Vector(1, 1), speed=new Vector()) {

        if(position instanceof Vector
            && size instanceof Vector
            && speed instanceof Vector) {

            this.pos = position;
            this.size = size;
            this.speed = speed;

        } else {
            trow('Переданный аргумент не является вектором');
        }

        Object.defineProperty(this, 'type', {
            value: 'actor',
            writable: false
        });

        this.left = this.pos.x;
        this.right = this.pos.x + this.size.x;
        this.top = this.pos.y;
        this.bottom = this.pos.y + this.size.y;

    }
    act() {

    }
    isIntersect(actor) {
        if(actor instanceof Actor) {
            switch (true) {
                case actor === this:
                    return false;
                // case (this.right > actor.left && (actor.right - this.right - actor.size.x) > 0) || (actor.right > this.left && (actor.right - this.left - actor.left) > 0):
                case (this.left < actor.left && this.right < actor.left)
                || (this.left > actor.right && this.right > actor.right):
                    return false;
                case (this.right == actor.left || this.left == actor.right
                    || this.top == actor.bottom || this.bottom == actor.top):
                    return false;
                default:
                    return true;
            }
        } else {
            trow('Переданный аргумент не является объектом Actor');
        }
    }

}

class Level {

}

const grid = [
    new Array(3),
    ['wall', 'wall', 'lava']
];
const level = new Level(grid);
runLevel(level, DOMDisplay);