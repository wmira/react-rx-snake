import React from 'react';
import { render } from 'react-dom';
const { interval, zip, fromEvent, merge } = Rx.Observable;
import Rx from 'rx';
import { Board } from './Board';

import { snakeInCell, keyMapper,
        UP, RIGHT, DOWN, LEFT
} from './utils';

const X_SIZE = 60;
const Y_SIZE = 30;
const INTERVAL = 1000/30;
const SNAKE_VELOCITY = 30;

const MOVE_MAPPER = {
    [UP]: ([x,y]) => [x, y - 1],
    [RIGHT]: ([x,y]) => [ x + 1, y ],
    [DOWN]: ([x,y]) => [x, y + 1],
    [LEFT]: ([x,y]) => [ x - 1, y ]
};

const createReducer = (body) => (acc) => {
    return acc.concat([body[acc.length - 1]]);
};
const isOppositeDirection = ( newDirection, currentDirection ) => {
    return newDirection === RIGHT && currentDirection === LEFT  ||
        newDirection === LEFT && currentDirection === RIGHT ||
        newDirection === UP && currentDirection === DOWN ||
        newDirection === DOWN && currentDirection === UP ;
};
const moveSnake = ( snake, newDirection, incrementSnake ) => {
    const { body, direction: currentDirection } = snake;
    var directionToUse = newDirection;
    if ( isOppositeDirection(newDirection, currentDirection ) )  {
        directionToUse = currentDirection;
    }
    const newBody = body.slice(incrementSnake).reduce( createReducer(body), [MOVE_MAPPER[directionToUse](body[0])]);

    return { ...snake, direction: directionToUse, body: newBody };
};


const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createNewFoodPosition = (snake) => {
    const possibleLocation = [];
    for ( var y=0; y < Y_SIZE; y++ ) {
        for ( var x = 0; x < X_SIZE; x++ ) {
            if ( !snakeInCell(x,y,snake) ) {
                possibleLocation.push([x,y]);
            }
        }
    }
    const index = getRandomInt(0, possibleLocation.length - 1);
    return { position: possibleLocation[index] };
};

const createSnake = () => {
    return { direction: RIGHT, body: [[3,0], [2,0], [1,0], [0,0]] };
};

const snakeHasEatenFood = ( snake, foodPosition ) => {

    const { body } = snake;
    const [ head ] = body;
    return head[0] === foodPosition[0] && head[1] === foodPosition[1];
};

const headHitsBody = ([x,y], body ) => {
    for (var i=1; i< body.length; i++ ) {
        const [nx, ny] = body[i];
        if ( nx === x && ny === y ) {
            return true;
        }
    }
    return false;
};
export const createGame = (node) => {

    const tick$ = interval(INTERVAL).timeInterval();

    const keyInput$ = merge(fromEvent(window, 'keydown'))
        .distinctUntilChanged().map(keyMapper).buffer(tick$).map(arr => arr[0]);

    const initialSnake = createSnake([X_SIZE, Y_SIZE]);

    const snakeV$ = interval(SNAKE_VELOCITY).timeInterval().buffer(tick$);

    const snakeAndfood$ = zip(snakeV$, keyInput$)  //snake velocity..
        .scan( (snakeAndFood, [snakeV, keyInput]) => {

            const { snake: currentSnake, food: currentFood, gameOver: isGameOver, score: currentScore } = snakeAndFood;
            if ( isGameOver ) {
                return snakeAndFood;
            }
            const [snakeVOut] = snakeV;
            var newSnake = currentSnake;
            var newFood = currentFood;
            var gameOver = false;
            var newScore = currentScore;

            if ( keyInput !== undefined ) {
                newSnake = moveSnake(currentSnake, keyInput, 1);
            } else if ( snakeVOut ) {
                newSnake = moveSnake(currentSnake, currentSnake.direction, 1);
            }
            if ( currentFood && snakeHasEatenFood(currentSnake, currentFood.position) ) {
                newSnake =  moveSnake(newSnake, newSnake.direction, 0);
                newFood = createNewFoodPosition(newSnake);
                newScore += 5;
            }
            //
            const [x,y] = newSnake.body[0];
            console.log( headHitsBody([x,y], newSnake.body ));
            if ( x > X_SIZE || y > Y_SIZE || x < 0 || y < 0 || headHitsBody([x,y], newSnake.body)) {
                return { ...snakeAndFood, gameOver: true }; //return previous
            }
            return { snake: newSnake, food: newFood, gameOver, score: newScore };

        }, {snake: initialSnake, food: createNewFoodPosition(initialSnake), score: 0 } );

    const snakeSubsription = snakeAndfood$.subscribe( ({score, gameOver, snake, food}) => {
        if ( gameOver ) {
            snakeSubsription.dispose();
        }
        render(<Board gameOver={gameOver} score={score} food={food} snake={snake} x={X_SIZE} y={Y_SIZE} />, node);

    });

};
