
import React, { Component, PropTypes } from 'react';
import { createArr, snakeInCell } from './utils';

const foodInCell = ( x, y, food ) => {
    const { position } = food;
    return position[0] === x && position[1]=== y;
};

const BOARD_CELL = {};
const SNAKE_CELL = { background: '#1abc9c' };
const FOOD_CELL = { background: '#bd28e1'};

const createCell = (style) =>
    class extends Component {
        shouldComponentUpdate() {
            return false;
        }
        render() {
            return <span className={'board'} style={style}></span>;
        }
    };

const SnakeCell = createCell(SNAKE_CELL);
const FoodCell = createCell(FOOD_CELL);
const BoardCell = createCell(BOARD_CELL);

const Cell = ({ snake, food, x, y}) => {
    if ( snakeInCell(x, y, snake) ) {
        return <SnakeCell />;
    } else if ( food &&  foodInCell(x, y, food) ) {
        return <FoodCell />;
    }
    return <BoardCell />;

};
const Row = ({snake, food, y, rows}) => {
    return (
        <div style={{height: 20}}>
            { rows.map( (idx) => <Cell x={idx} y={y} food={food} snake={snake} key={idx}/> ) }
        </div>
    );
};

export const Score = ( {score}) => {
    return (
        <div style={{ float: 'right', color: '#95A5A6', padding: '6px 0px'}}>
            <span style={{fontWeight: 'bold', fontSize: 30}}>Score:</span> <span style={{fontSize: 40, letterSpacing: 2}}>{score}</span>
        </div>
    );
};

export const Board = React.createClass({

    propTypes: {
        x: PropTypes.number,
        y: PropTypes.number,
        score: PropTypes.number,
        snake: PropTypes.object,
        food: PropTypes.object,
        gameOver: PropTypes.bool
    },

    getInitialState() {
        const xarr = createArr(this.props.x);
        const yarr = createArr(this.props.y);
        return { xarr, yarr };
    },

    shouldComponentUpdate(nextProps) {
        const { props } = this;
        return nextProps.score !== props.score ||
            nextProps.snake !== props.snake ||
            nextProps.food !== props.food ||
            nextProps.gameOver !== props.gameOver
    },

    render() {
        const { gameOver, score, snake, food } = this.props;

        return (
            <div>
                <div style={{overflow: 'auto', position: 'relative'}}>
                    <div style={{float: 'left'}}><span style={{fontSize: 40, color: '#E74C3C'}}>{ gameOver ? ' Game Over ' : '' }</span></div>
                    <Score score={score} />
                </div>
                <div >
                { this.state.yarr.map( (idx) => {
                    return <Row food={food} snake={snake} y={idx} rows={this.state.xarr} key={idx} />;
                })}
                </div>
            </div>
        );
    }
});
