
export const isEqual = (c1, c2 ) => c1[0] === c2[0] && c1[1] === c2[1];
export const createArr = (num) => Array.apply(null, {length: num}).map(Number.call, Number);


export const UP = 0;
export const RIGHT = 1;
export const DOWN = 2;
export const LEFT = 3;

const ARROW_MAP = {
    ArrowRight: RIGHT,
    ArrowLeft: LEFT,
    ArrowDown: DOWN,
    ArrowUp: UP
};

export const keyMapper = ( keyInput ) => {
    if ( keyInput ) {
        const { code } = keyInput;
        return ARROW_MAP[code];
    }
};
export const snakeInCell = ( x, y, snake ) => {

    const { body } = snake;
    for ( var i=0; i < body.length; i++ ) {
        if ( isEqual(body[i], [x,y]) ) {
            return true;
        }
    }
    return false;
};
