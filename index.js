class MapTile extends React.Component {
    constructor(props) {
        super(props)
    }
    
    render() {       
        if(this.props.isSnake) {
            return <td className="map-tile snake"></td>;
        }else if(this.props.isFood) {
            return <td className="map-tile food"></td>;
        }else {
            return <td className="map-tile"></td>;
        }
    }
}

class GameMap extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        var mapSize = this.props.mapSize; 
        var tableRowList = [];
        var keyCounter = 0; // added to prevent console warning.
        for(var row=0; row<mapSize; row++) {
            var rowElementList = [];
            for(var column=0; column<mapSize; column++) {
                if (this.props.snake.some(e => e.rowIndex === row && e.columnIndex === column)) {
                    rowElementList.push(<MapTile isSnake="true" key={keyCounter++}/>);
                }else if(this.props.food.rowIndex === row && this.props.food.columnIndex === column) {
                    rowElementList.push(<MapTile isFood="true" key={keyCounter++}/>)
                }else {
                   rowElementList.push(<MapTile key={keyCounter++}/>)
                }
            }
            tableRowList.push(<tr key={keyCounter++}>{rowElementList}</tr>);  
        }
        
        return (
            <table className="map-wall">
                <tbody>
                    {tableRowList}
                </tbody>
            </table>      
        )
    }
}

class Play extends React.Component {
    constructor(props) {
        super(props)
        this.SNAKE_SIZE = 5
        this.MAP_SIZE = 20;
        var snake = this.createSnake();
        var food = this.createFood(snake); 
        this.state = {
            snake: snake, 
            food: food, 
            direction: {row: 0, column: 1},
            score: 0
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
        this.timer = setInterval(this.updateGameMap, 1000 / 15)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
        clearInterval(this.timer);
    }
    
    onKeyDown = (e) => {
        switch (e.keyCode) {
            case 37: /* left */
                if(this.state.direction.column !== 1 && this.state.direction.column !== -1) {
                    this.setState({direction: {row: 0, column: -1}})
                    this.updateGameMap()
                }
                break;
            case 38: /* top */   
                if(this.state.direction.row !== 1 && this.state.direction.row !== -1) {
                    this.setState({direction: {row: -1, column: 0}})
                    this.updateGameMap()
                }
                break;
            case 39: /* right */ 
                if(this.state.direction.column !== -1 && this.state.direction.column !== 1) {  
                    this.setState({direction: {row: 0, column: 1}})
                    this.updateGameMap()
                }
                break;
            case 40: /* bottom */
                if(this.state.direction.row !== -1 && this.state.direction.row !== 1) {
                    this.setState({direction: {row: 1, column: 0}})
                    this.updateGameMap()
                }
                break;                      
            default:
        }
    }

    updateGameMap = () => {
        var snake = this.state.snake;
        var food = this.state.food;
        var direction = this.state.direction;
        
        if(snake[snake.length - 1].rowIndex + direction.row === food.rowIndex && snake[snake.length - 1].columnIndex + direction.column === food.columnIndex){ 
            //Food detected
            snake.push({
                rowIndex : snake[snake.length-1].rowIndex + direction.row, columnIndex: snake[snake.length-1].columnIndex + direction.column
            })
            var food = this.createFood(snake);
            var newScore = this.state.score + 1;
            this.setState(
                {
                    snake: snake,
                    food: food,
                    score: newScore
                }
            )
        }else if(snake.some(e => e.rowIndex === snake[snake.length - 1].rowIndex + direction.row && e.columnIndex === snake[snake.length - 1].columnIndex + direction.column)) {
           // Snake detected
           this.props.gameOverCallback(this.state.score)
        }else if(snake[snake.length - 1].rowIndex + direction.row < 0 || 
            snake[snake.length - 1].rowIndex + direction.row >= this.MAP_SIZE ||
            snake[snake.length - 1].columnIndex + direction.column < 0 ||
            snake[snake.length - 1].columnIndex + direction.column >= this.MAP_SIZE) {
            // Wall detected
            this.props.gameOverCallback(this.state.score)
        }else {
            snake.push({
                rowIndex : snake[snake.length-1].rowIndex + direction.row, columnIndex: snake[snake.length-1].columnIndex + direction.column
            })
            snake.shift()
            this.setState(
                {
                    snake: snake
                }
            )
        }
    }

    createSnake = () => {
        var snake = [];
        snake.push({rowIndex: 5, columnIndex: 1});
        snake.push({rowIndex: 5, columnIndex: 2});
        snake.push({rowIndex: 5, columnIndex: 3});
        snake.push({rowIndex: 5, columnIndex: 4});
        snake.push({rowIndex: 5, columnIndex: 5});
        return snake;
    }

    createFood = (snake) => {
        var rowIndex = Math.floor(Math.random() * this.MAP_SIZE);
        var columnIndex = Math.floor(Math.random() * this.MAP_SIZE);
        if(snake.some(e => e.rowIndex == rowIndex && e.columnIndex == columnIndex)) {
            return this.createFood(snake)
        }else {
            return {rowIndex: rowIndex, columnIndex: columnIndex}
        }
    }

    render() {
        return (
            <div align="center">
                <h3>Score: {this.state.score}</h3>
                <GameMap snake={this.state.snake} food={this.state.food} mapSize={this.MAP_SIZE}/>
            </div>
            )
    }
}

class GameOver extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = () => {
        this.props.restartCallback()
    }

    render() {
        return (
            <div align="center">
                <h1>GAME OVER</h1>
                <h1>Score: {this.props.score}</h1>
                <h1>Press any key to try again.</h1>
            </div>
        )
    }
}

class SnakeGame extends React.Component {
    constructor(props) {
        super(props)
        this.state = {isGameOver: false, score: 0}
    }

    gameOver = (score) => {
        this.setState(
            {
                isGameOver: true, 
                score: score
            }
        )
    }

    restartGame = () => {
        this.setState(
            {
                isGameOver: false
            }
        )
    }

    render() {
        if(this.state.isGameOver){
            return <GameOver score={this.state.score} restartCallback={this.restartGame}/>
        }else {
            return <Play gameOverCallback={this.gameOver}/>
        }
    }
}

ReactDOM.render(
    <SnakeGame />,
    document.getElementById('root')
)