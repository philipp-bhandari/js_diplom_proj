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

        let level = new Level(this.createGrid(gridPlan), this.createActors(actorPlan));
        return level;
    }

}