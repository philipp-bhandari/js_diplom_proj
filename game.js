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
            throw Error('Аргумент функции не является вектором.');
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

            this.size = size;
            this.speed = speed;

            this.pos = position;
            this.left = this.pos.x;
            this.right = this.pos.x + this.size.x;
            this.top = this.pos.y;
            this.bottom = this.pos.y + this.size.y;

        } else {
            throw Error('Переданный аргумент не является вектором');
        }

        Object.defineProperty(this, 'type', {
            value: 'actor',
            writable: false
        });
    }

    get pos(){ return this._pos }

    set pos(value){
        this._pos = value;
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
                case (this.left < actor.left && this.right > actor.left && this.top <= actor.top && this.bottom > actor.top) ||
                    (actor.left < this.left && actor.right > this.left && actor.top <= this.top && actor.bottom > this.top) ||
                    (this.left <= actor.left && this.right > actor.left && this.top > actor.top && this.top < actor.bottom) ||
                    (actor.left <= this.left && actor.right > this.left && actor.top > this.top && actor.top < this.bottom) ||
                    (this.left === actor.left && this.right === actor.right && this.top === actor.top && this.bottom === actor.bottom):
                    return true;
                default:
                    return false;
            }
        } else {
            throw Error('Переданный аргумент не является объектом Actor');
        }
    }
}


class Level {
    constructor(grid=[], actors=[]) {
        this.height = grid.length || 0;
        this.width = 0;
        this.grid = grid;
        this.actors = actors;

        if(this.grid[0]) { // Вычисление максимальной ширины уровня
            let cellsLen = this.grid.map(function (cell) {
                return cell.length;
            });
            cellsLen = Math.max.apply(null, cellsLen);

            this.width = cellsLen;
        }

        this.status = null;
        this.finishDelay = 1;
        this.player = new Actor();

    }

    isFinished() {
        switch (true) {
            case this.status != null && this.finishDelay < 0:
                return true;
            case this.status != null && this.finishDelay > 0:
                return false;
            default:
                return false;
        }
    }

    actorAt(actor) {
        if(actor instanceof Actor) {
            if(this.actors === [] || this.actors.length === 1){return undefined;}

            for (let item of this.actors) {
                if (actor.isIntersect(item)) {
                    return item;
                }
            }
        } else {
            throw Error('Переданный аргумент не является объектом Actor');
        }
    }

    obstacleAt(vector, size) {
        if(vector instanceof Vector && size instanceof Vector) {
            let left = Math.floor(vector.x);
            let right = Math.ceil(vector.x + size.x);
            let top = Math.floor(vector.y);
            let bottom = Math.ceil(vector.y + size.y);

            switch (true) {
                case left < 0 || right > this.width || top < 0:
                    return 'wall';
                case bottom > this.height:
                    return 'lava';
            }

            for (let i = top; i < bottom; i++) {
                for (let j = left; j < right; j++) {
                    if (this.grid[i][j]) {
                        return this.grid[i][j];
                    }
                }
            }
        } else {
            throw Error('Переданный аргумент не является объектом Actor');
        }
    }



}

const grid = [
    [undefined, undefined],
    ['wall', 'wall']
];

function MyCoin(title) {
    this.type = 'coin';
    this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);


// const grid = [
//     new Array(3),
//     ['wall', 'wall', 'lava']
// ];
// const level = new Level(grid);
// runLevel(level, DOMDisplay);
