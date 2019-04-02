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
    }

    get type() {
        return 'actor';
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

        for (let actor of this.actors) {
            if (actor.type === 'player') {
                this.player = actor;
                break;
            }
        }

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

    removeActor(actor) {
        for (let i in this.actors) {
            if(this.actors[i] === actor) { this.actors.splice(i, 1); }
        }
    }

    noMoreActors(type) {
        if (!type) {
            if (this.actors.length === 0) {
                return true;
            }
        }

        return this.actors.every(
            function (actor) {
                return actor.type !== type;
            }
        );
    }

    playerTouched(type, obj=undefined) {
        if(type === 'lava' || type === 'fireball') {
            this.status = 'lost';
        }

        if (type === 'coin') {
            this.removeActor(obj);
            if(this.noMoreActors(type)) {
                this.status = 'won';
            }
        }
    }
}

class LevelParser {
    constructor(dict) {
        this.dict = dict;
    }

    actorFromSymbol(sym) {
        if (!sym) {
            return undefined;
        }

        if (sym in this.dict) {
            return this.dict[sym]
        }
    }

    obstacleFromSymbol(sym) {
        if (sym === 'x') {
            return 'wall';
        }
        if (sym === '!') {
            return 'lava';
        }
    }

    createGrid(plan) {
        if (plan.length === 0) {
            return [];
        }

        for (let i = 0; i < plan.length; i++) {
            plan[i] = plan[i].split('');
            for (let j = 0; j < plan[i].length; j++) {
                plan[i][j] = this.obstacleFromSymbol(plan[i][j]);
            }
        }
        return plan;
    }

    createActors(plan) {
        let result = [];
        if (plan.length === 0) {
            return [];
        }
        if (this.dict === undefined) {
            return [];
        }

        for (let i = 0; i < plan.length; i++) {
            plan[i] = plan[i].split('');
            for (let j = 0; j < plan[i].length; j++) {
                try {
                    if (this.actorFromSymbol(plan[i][j]) !== undefined) {
                        plan[i][j] = this.actorFromSymbol(plan[i][j]);
                        plan[i][j] = new plan[i][j](new Vector(j, i))
                    }
                } catch (err) {
                    continue;
                }
            }
        }

        for (let string of plan) {
            for (let simbol of string) {
                if (!(typeof(simbol) === 'string') && Actor.prototype.isPrototypeOf(simbol)) {
                    result.push(simbol);
                }
            }
        }

        return result;
    }

    parse(plan) {
        let gridPlan = plan.slice();
        let actorPlan = plan.slice();

        return new Level(this.createGrid(gridPlan), this.createActors(actorPlan));
    }

}


class Fireball  extends Actor {
    constructor(pos=new Vector (0,0), speed=new Vector (0,0)) {
        super(pos, new Vector (1, 1), speed)
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time=1) {
        if(this.speed.x === 0 && this.speed.y === 0) {
            return this.pos;
        }
        return this.pos.plus(this.speed.times(time))
    }

    handleObstacle() {
        this.speed.x *= -1;
        this.speed.y *= -1;
    }

    act(time, level) {

        if(level.obstacleAt(this.getNextPosition(time), this.size) === undefined) {
            this.pos = this.getNextPosition(time);
        } else {
            this.handleObstacle();
        }

    }

}


class HorizontalFireball extends Fireball {
    constructor(pos){
        super(pos, new Vector (2, 0));
    }
}


class VerticalFireball extends Fireball {
    constructor(pos){
        super(pos, new Vector (0, 2));
    }
}


class FireRain extends Fireball {
    constructor(pos){
        super(pos, new Vector (0, 3));
        this.startPos = pos
    }

    handleObstacle() {
        this.pos = this.startPos
    }
}


class Coin extends Actor {
    constructor(pos=new Vector()) {
        super(pos.plus(new Vector(0.2, 0.1)), new Vector (0.6, 0.6));
        this.base = this.pos;
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random() * 2 * Math.PI;
    }

    get type() {
        return 'coin';
    }

    updateSpring(time=1) {
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector (0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);
        let springVector = this.getSpringVector();
        return this.base.plus(this.getSpringVector());
    }

    act(time) {
        this.pos = this.getNextPosition(time);
    }
}


class Player extends Actor {
    constructor (pos = new Vector()){
        super(pos.plus(new Vector(0, -0.5)), new Vector (0.8, 1.5));
    }

    get type() {
        return 'player';
    }
}

const level =     [

    '                                           ',
    '                                           ',
    ' xxxxxxxxx xx xx    x xx xxx   xxxxxxxxxxx ',
    '          o	                            ',
    '          o	                            ',
    '          o 	            v               ',
    '          x 	      ooo      ooo          ',
    '           	  |                   ====  ',
    'o           	  |    xxxx     xxxx   |    ',
    '    x==      	x                 o     |   ',
    '       o    	   x      o              |  ',
    '         	x         =     x  x  x x       ',
    ' @    x   	x	      x  xxx                 o',
    'xxxxxx                                    x',
    '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
];
const newLevel = [];
for(let string of level){
    string = string.split('');
    string = string.reverse();
    string = string.join('');
    newLevel.push(string)
}

const levels = [
    level, newLevel
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
};
const parser = new LevelParser(actorDict);
runGame(levels, parser, DOMDisplay)
    .then(() => alert('Congratulations!'));