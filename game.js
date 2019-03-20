'use strict';

class Vector {

}

class Actor {

}

class Level {

}

const grid = [
    new Array(3),
    ['wall', 'wall', 'lava']
];
const level = new Level(grid);
runLevel(level, DOMDisplay);