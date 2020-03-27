//interface elements
const calculatorSection = document.querySelector('.calculator');
const numberButtons = document.querySelectorAll('.number-button');
const clearButton = document.getElementById('clear-button');
const clearAllButton = document.getElementById('clear-all-button');
const displayDiv = document.getElementById('display');
const operationButtons = document.querySelectorAll('.operation-button');
const equalButton = document.getElementById('equal-button');
const toOperationsRecordSectionButton = document.getElementById('history-button');
const operationsRecordSection = document.querySelector('.operations-history-container');
const toCalcButton = document.getElementById('to-calc-button');
const operationsContainer = document.getElementById('operations-container');

//classes
class Calculator {
	constructor(displayElement, maxCharacters, calculatorSection, operationsRecordSection, operationsContainer) {
		this.possibleOperations = [ '+', '-', 'x', '/' ];
		this.display = displayElement;
		this.maxCharacters = maxCharacters;
		this.calculatorSection = calculatorSection;
		this.operationsRecordSection = operationsRecordSection;
		this.operationsContainer = operationsContainer;
	}
	get itsPossibleToAddOperation() {
		let lastTermComponent = this.display.lastElementChild.lastElementChild.textContent;
		let lastCharacterIsAnOperation = this.possibleOperations.includes(
			lastTermComponent[lastTermComponent.length - 1]
		);
		let firstCharacterDoesntExist = this.display.firstElementChild.firstElementChild.textContent.length == 0;
		if (lastCharacterIsAnOperation || firstCharacterDoesntExist) {
			return false;
		} else {
			return true;
		}
	}
	get displayTotalCharacters() {
		let total = 0;
		let components = [ ...document.querySelectorAll('.componente') ];
		components.forEach((component) => {
			total += component.textContent.length;
		});
		return total;
	}
	eraseAllCharacters() {
		this.display.innerHTML = `<div class="termino">
		<div class="componente"></div>
		</div>`;
	}
	eraseLastCharacter() {
		let lastTermChar = 0;
		[ ...this.display.lastElementChild.children ].forEach((component) => {
			lastTermChar += component.textContent.length;
		});

		//distintos casos
		if (lastTermChar == 1) {
			//si el último término tiene un caracter...
			if (this.display.lastElementChild == this.display.firstElementChild) {
				//si el último termino es el primer término...
				// entonces se borra el caracter y no el termino
				this.display.lastElementChild.lastElementChild.innerHTML = '';
				return;
			}
			//si el termino termino que tiene un caracter no es el primero, remuevo el termino
			this.display.lastElementChild.remove();
		} else if (this.display.lastElementChild.lastElementChild.textContent.length == 1) {
			//si tengo que borrar el ultimo char de un componente, borro el componente
			this.display.lastElementChild.lastElementChild.remove();
		} else {
			//si el ult termino no tiene un solo caracter, se borra el último caracter del último componente del último termino
			let splitedContent = this.display.lastElementChild.lastElementChild.textContent.split('');
			splitedContent.pop();
			let stringContent = splitedContent.join(''); //lo junta para que sea sin comas != toString();
			this.display.lastElementChild.lastElementChild.textContent = stringContent;
		}
	}
	addCharacter(character) {
		//se añade character y se define componente del termino si el mismo es una operación
		if (character == '+' || character == '-') {
			//se define un nuevo término y un componente dentro
			let term = document.createElement('div');
			term.className = 'termino';
			term.innerHTML = ` <div class="componente"></div>`;
			this.display.appendChild(term);
		} else if (character == 'x' || character == '/') {
			//se define un componente
			let component = document.createElement('div');
			component.className = 'componente';
			this.display.lastElementChild.appendChild(component);
		}
		//el caracter se añade al final del ultimo componente  del último término en el display
		this.display.lastElementChild.lastElementChild.textContent = `${this.display.lastElementChild.lastElementChild
			.textContent}${character}`;
	}
	get operation() {
		//devuelve array compuesto por arrays que representan los términos y dentro suyo los componentes
		//implica que haya en el display una operación estructurada en terminos(divs) y componentes(hijos de esos divs)
		let operation = [];
		let terminos = [ ...document.querySelectorAll('.termino') ];

		terminos.forEach((term) => {
			let termComponent = [ ...term.querySelectorAll('.componente') ];
			let termComponentText = [];
			for (let i = 0; i < termComponent.length; i++) {
				termComponentText.push(termComponent[i].textContent);
			}
			operation.push(termComponentText);
		});
		return operation;
	}
	get reducedOperation() {
		//devuelve array compuesto de nros que representan los terminos resueltos
		//implica poder acceder a this.operation
		let reducedOperation = [];
		this.operation.forEach((term) => {
			let reducedTerm;
			if (term.length == 1) {
				//si el termino tiene un componente...
				reducedTerm = parseInt(term.join(''));
			} else {
				reducedTerm = term.reduce((prev, current) => {
					let prevNum = parseInt(prev);
					if (current.includes('x')) {
						let splitted = current.split('x'); //devuelve array así que hay que pasar a str con .join
						let currentNum = parseInt(splitted.join(''));
						return prevNum * currentNum;
					} else if (current.includes('/')) {
						let splitted = current.split('/');
						let currentNum = parseInt(splitted.join(''));
						return prevNum / currentNum;
					}
				});
			}
			reducedOperation.push(reducedTerm);
		});
		return reducedOperation;
	}
	get result() {
		//implica tener acceso a la operación reducida
		let result = this.reducedOperation.reduce((total, current) => {
			return total + current;
		});
		if (Calculator.numberLength(result) >= this.maxCharacters) {
			result = 'error';
		}
		return result;
	}
	showResultInDisplay() {
		let result = this.result; //lo llamo antes de borrar los caracteres del display ya que hace uso de los mismos
		this.eraseAllCharacters();
		this.display.firstElementChild.firstElementChild.textContent = `${result}`;
	}
	static numberLength(number) {
		let numberLength = number.toString().length - 1;
		return numberLength;
	}
	changeSection(from, to) {
		from.classList.add('fade-out-bottom');
		from.addEventListener('animationend', () => {
			to.classList.remove('hide');
			from.classList.replace('fade-out-bottom', 'hide');
		});
	}
	saveOperationAndResult() {
		//guardar en sessionStorage operación y resultado con horario de guardado
		//debe llamarse antes de borrar la operación del display
		let dateInstance = new Date();
		let hours = dateInstance.getHours();
		let minutes = dateInstance.getMinutes();
		let seconds = dateInstance.getSeconds();
		let time = `${hours}${minutes}.${seconds}`;
		let result = this.result.toString();
		let operation = '';
		this.operation.forEach((term) => {
			operation += term.join('');
		});
		sessionStorage.setItem(`${operation}`, JSON.stringify({ result, time }));
	}
	showSavedDataInOperationsRecordSection() {
		//mostrar en el operations-container las últimas 11 operaciones
		this.operationsContainer.innerHTML = '';
		let elements = [];
		for (let i = 0; i < sessionStorage.length; i++) {
			let operation = sessionStorage.key(i);
			let data = JSON.parse(sessionStorage.getItem(operation));
			let div = document.createElement('div');
			div.className = 'operation';
			div.innerHTML = `<p>${operation}</p><p>${data.result}</p>`;
			div.id = `${data.time}`;
			elements.push(div);
		}
		elements.sort((a, b) => {
			//se ordenan de mayor a menor según su tiempo de guardado(seteado en el id de cada elemento)
			return parseFloat(b.id) - parseFloat(a.id);
		});

		while (elements.length >= 12) {
			//elimino las operaciones más viejas hasta quedarme con las 11 más recientes
			elements.pop();
		}
		elements.forEach((element) => {
			this.operationsContainer.appendChild(element);
		});
	}
	get existOperationSaved() {
		if (sessionStorage.length >= 1) {
			return true;
		} else {
			return false;
		}
	}
}

//class instance
const calculator = new Calculator(displayDiv, 10, calculatorSection, operationsRecordSection, operationsContainer);

//DOM Events

clearAllButton.addEventListener('click', () => {
	calculator.eraseAllCharacters();
});
clearButton.addEventListener('click', () => {
	calculator.eraseLastCharacter();
});

numberButtons.forEach((numberButton) => {
	numberButton.addEventListener('click', (ev) => {
		if (calculator.maxCharacters == calculator.displayTotalCharacters) {
			return;
		}
		calculator.addCharacter(ev.target.textContent);
	});
});

operationButtons.forEach((operationButton) => {
	operationButton.addEventListener('click', (ev) => {
		if (calculator.maxCharacters == calculator.displayTotalCharacters) {
			return;
		}
		if (calculator.itsPossibleToAddOperation == true) {
			calculator.addCharacter(ev.target.textContent);
		}
	});
});

equalButton.addEventListener('click', () => {
	if (calculator.itsPossibleToAddOperation == false) {
		return;
	} else {
		calculator.saveOperationAndResult();
		calculator.showResultInDisplay(); //implica borrar la operación del display, por eso se llama después de guardar la operación
	}
});

toOperationsRecordSectionButton.addEventListener('click', () => {
	if (calculator.existOperationSaved) {
		calculator.showSavedDataInOperationsRecordSection();
		calculator.changeSection(calculator.calculatorSection, calculator.operationsRecordSection);
	}
});

toCalcButton.addEventListener('click', () => {
	calculator.changeSection(calculator.operationsRecordSection, calculator.calculatorSection);
});
