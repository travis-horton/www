let doc = document;
let root = doc.getElementById('root');
let startNewGameButton = doc.getElementById('new');
let joinGameButton = doc.getElementById('join');
let joinOrNewGameButtons = doc.getElementById('join_or_start');
let chooseSettingsDiv = doc.getElementById('chooseSettings');
let settingsDiv = doc.getElementById('settings');
let gameIdElement = doc.getElementById('game_id');
let userNameElement = doc.getElementById('user_name');
let numberOfPlayersElement = doc.getElementById('num_players');
let chooseSettingsForm = doc.getElementById('chooseSettings');
let statusDiv = doc.getElementById('currentStatus');

let statusStrs = [
	'<b>instructions:</b>\nnow you will place your ships.\nyou will place:\n5 \"a\"s -- these a\'s will be your aircraft carrier.\n4 \"b\"s -- these b\'s will be your battleship.\n3 \"c\"s -- these c\'s will be your cruiser.\n3 \"s\"s -- these s\'s will be your submarine.\n2 \"d\"s -- these d\'s will be your destroyer.\n\neach ship must be in a line horizontally, vertically, or diagonally. in general, your ships are not allowed to cross one another. however, your submarine is allowed to cross other ships on the diagonal. no ships may share a cell.',
	'waiting on other players'
]

startNewGameButton.onclick = chooseNewGame;
joinGameButton.onclick = chooseJoinGame;
chooseSettingsForm.onSubmit = createGame;

function chooseJoinGame() {
	let gameId = window.prompt('Enter game ID:');
	if (gameId === null) return;
	if (gameId) {
		//checks for gameID, but there is no data just now...
		gameId = prompt('Invalid game ID, try again');
	} else {
		gameId = prompt('Invalid game ID, try again');
	}
}

function chooseNewGame() {
	hide(joinOrNewGameButtons);
	unhide(chooseSettingsDiv);
	doc.getElementById('choose_ID').focus();
}

function createGame(e) {
	let id = e.form.choose_ID.value;
	let nP = e.form.choose_num_of_players.value;
	let bSize = e.form.choose_size.value;
	let gameID = e.form.choose_game_name.value;

	if (id.length === 0 || nP < 2 || nP > 4 || bSize < 10 || bSize > 20 || gameID.length === 0) {
		window.alert('fail')
		return false;
	}

	hide(chooseSettingsDiv);
	unhide(settingsDiv);
	unhide(statusDiv);
	statusDiv.innerHTML = statusStrs[0];
	setSettings(id, nP, bSize, gameID, e.form);

	ReactDOM.render(< Game state={ state }/>, root);

	return false;
};

function hide(element) {
	element.classList.add('hidden');
}

function unhide(element) {
	element.classList.remove('hidden');
}

function setSettings(id, nP, bSize, gameID, form) {
	if (id.length === 0 || nP < 2 || nP > 4 || bSize < 10 || bSize > 20) {
		window.alert('fail')
		return false;
	}

	let settings = state.settings;

	settings.thisUser = id;
	userNameElement.innerHTML = id;
	form.choose_ID.value = '';

	settings.numberOfPlayers = nP;
	numberOfPlayersElement.innerHTML = nP;
	form.choose_num_of_players.value = '';

	settings.gameId = gameID;
	gameIdElement.innerHTML = gameID;
	form.choose_game_name.value = '';

	settings.boardSize = parseFloat(bSize);
	form.choose_size.value = '';
}

class Cell extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.props.handleChange(e.target);
	}

	render() {
		let className = 'cell';
		className = addClass(className, this.props.col, this.props.row);
		return (
			<input
				className={ className }
				col={ this.props.col }
				row={ this.props.row }
				onChange={ this.handleChange }
			/>
		)
	}
}

class HeaderCell extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let className = 'headerCell ';
		if (this.props.className) className += this.props.className;

		return (
			<span key={ this.props.label } className={ className }>{ this.props.label }</span>
		)
	}
}

class Row extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(target) {
		this.props.handleInput(target);
	}

	render() {
		let row = [];
		for (let i = 0; i < state.settings.boardSize; i++) {
			row.push(String.fromCharCode(i + 65))
		}
		return (
			<div className = 'row'>
				<HeaderCell label={ this.props.row } className='rowHeaderCell'/>
				{ row.map((cell) =>
					<Cell
						key={ cell }
						col={ cell }
						row={ this.props.row }
						handleChange={ this.handleChange }
					/>
				) }
				<HeaderCell label={ this.props.row } className='rowHeaderCell'/>
			</div>
		)
	}
}

class HeaderRow extends Row {
	render() {
		let row = [];
		for (let i = 0; i < state.settings.boardSize; i++) {
			row.push(String.fromCharCode(i + 65))
		}
		return (
			<div className = 'row'>
				<HeaderCell label='' className='rowHeaderCell'/>
				{ row.map((cell) =>
					<HeaderCell key={ cell } label={ cell }/>
				) }
				<HeaderCell label='' className='rowHeaderCell'/>
			</div>
		)
	}
}

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.handleInput = this.handleInput.bind(this);
		this.state = {
			ships: this.props.ships,
			shots: this.props.shots
		}
	}

	handleInput(target) {
		this.props.handleInput(target);
	}

	render() {
		let rows = [];
		for (let i = 0; i < state.settings.boardSize; i++) {
			rows.push( i )
		}
		let className='board';
		if (this.props.className) {
			className += " "+this.props.className;
		}
		return (
			<div>
				<div className={ className }>
					<p>{ this.props.player }'s board</p>
					<HeaderRow/>
					{ rows.map((row) =>
						<Row
							key={ row }
							row={ row + 1 }
							handleInput={ this.handleInput }
						/>
					) }
					<HeaderRow/>
				</div>
			</div>
		)
	}
}

class SubmitButton extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.props.handleClick();
	}

	render() {
		return (
			<button onClick={ this.handleClick }>Submit</button>
		)
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.state = props.state;
	}

	handleSubmit() {
		if (state.completion !== 1) {
			alert('you have more ships to place!')
		} else {
			let confirm = window.confirm('are you happy with your ship placement?');
			if (confirm) {
				statusDiv.innerHTML = statusStrs[1];
				showBoards();
			}
		}
	}

	handleInput(target) {
		let ships = state.ships;
		let col = target.attributes.col.nodeValue;
		let row = parseFloat(target.attributes.row.nodeValue);
		let ship = target.value.toLowerCase();

		if (target.value.length === 0) {
			removeLoc(col, row);
			state.completion = numShipsPlaced()/5;
			return false
		};

		if (!(target.value in ships)) {
			alert('must be a ship letter (a, b, c, s, or d)');
			removeLoc(col, row);
			state.completion = numShipsPlaced()/5;
			target.value = "";
			return false;
		}

		ship = ships[ship];

		if (!(goodPlacement(ship, col, row))) {
			target.value = "";
			state.completion = numShipsPlaced()/5;
			return false;
		}

		ship.locs.push([col, row]);
		state.completion = numShipsPlaced()/5;
	}

	render() {
		let otherBoards = [];
		for (let i = 0; i < state.settings.numberOfPlayers - 1; i++) {
			otherBoards.push({key: i + 1})
		}
		let className;
		if (state.completion < 1) className='hidden'
		return (
			<div>
				< Board
					handleInput={ this.handleInput }
					key='0'
					player={ state.settings.thisUser }
					ships={ state.ships }
					shots={ state.shots }
				/>
				{ otherBoards.map((board) =>
					< Board
						handleInput={ this.handleInput }
						key={ board.key }
						className={ className }
						player='unknown'
						ships={ state.ships }
						shots={ state.shots }
					/>
				) }
				< SubmitButton
					handleClick={ this.handleSubmit }
				/>
			</div>
		)
	}
}

function addClass(className, col, row) {
	if (col === String.fromCharCode(parseFloat(state.settings.boardSize) + 64)) className += ' rightColumnCell';
	if (row == state.settings.boardSize) className += ' bottomRowCell';
	return className;
}

function goodPlacement(ship, col, row) {
	if (ship.locs.length === 0) return true;
	if (ship.locs.length === ship.max) {
		alert('too many of this ship')
		return false;
	}

	let col0 = col.charCodeAt(0) - 65;
	let row0 = row - 1;
	let index = col0 + (row0 * state.settings.boardSize);

	if (ship.locs.length === 1) {
		//check adjacency
		return checkPWOneShip(ship, index);
	}

	if (ship.locs.length > 1) {
		return checkPWMOneShip(ship, index);
	}

	return true;
}

function isAdjacent(i1, i2) {
	let colDif = Math.abs(i1 - i2);
	let bSize = state.settings.boardSize
	let adj = [1, bSize - 1, bSize, bSize + 1];
	let o = ['h', 'db', 'v', 'df'][adj.indexOf(colDif)];
	return o;
}

function removeLoc(col, row) {
	let ships = state.ships;
	for (let ship in ships) {
		ships[ship].locs.forEach(function(loc, i) {
			if (loc[0] === col && loc[1] === row) {
				ships[ship].locs.splice(i, 1);
			}
		})
	}
}

function numShipsPlaced() {
	let num = 0;
	for (let ship in state.ships) {
		if (state.ships[ship].max === state.ships[ship].locs.length) {
			num ++;
		}
	}
	return num;
}

function checkPWOneShip(ship, index) {
	let col1 = ship.locs[0][0].charCodeAt(0) - 65;
	let row1 = ship.locs[0][1] - 1;
	let index1 = col1 + (row1 * state.settings.boardSize);
	let o = isAdjacent(index, index1);

	if (o === undefined) {
		alert('ship is not adjacent')
		return false;
	} else {
		ship.o = o;
		return true;
	}
}

function checkPWMOneShip(ship, index) {
	let o = undefined;
	for (let i = 0; i < ship.locs.length; i++) {
		let loc = ship.locs[i];
		let col1 = loc[0].charCodeAt(0) - 65;
		let row1 = loc[1] - 1;
		let index1 = col1 + (row1 * state.settings.boardSize);
		o = isAdjacent(index, index1);
		if (o !== undefined) {
			if (o === ship.o) {
				break;
			} else {
				alert('ship is not in line');
				return false;
			}

		}
		if (i === ship.locs.length - 1) {
			alert('ship is not adjacent')
			return false;
		}
	}
	return true;
}

function showBoards() {
	ReactDOM.render(< Game state={ state }/>, root);
}

let state = {
	settings: {
		gameId: 'someGameID',
		thisUser: '',
		numberOfPlayers: 0,
		boardSize: 0
	},
	ships: {
		a: {max: 5, locs: [], o: ""},
		b: {max: 4, locs: [], o: ""},
		c: {max: 3, locs: [], o: ""},
		s: {max: 3, locs: [], o: ""},
		d: {max: 2, locs: [], o: ""}
	},
	shots: [],
	completion: 0
}
