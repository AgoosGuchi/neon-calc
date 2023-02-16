class Calculator {
    constructor(input){
        this.display = input;
        this.inputHistory = [];
    }

    clearAll(full = false){
        this.inputHistory = [];
        if (full) {
            this.updateDisplay();
        }
    }

    extractKey({ key }) {
        if (validKeys.includes(key)) {
            switch(key) {
                case "+":
                case "/":
                case "-":
                case "*":
                    this.insertOperation(key);
                    break;
                case "Backspace":
                    this.backspace();
                    break;
                case ".":
                    this.insertDecimalPoint();
                    break;
                case "Enter":
                    this.generateResult();
                    break;
                default:
                    this.insertNumber(key);
            }
        }
    }

    backspace(){
        switch(this.getLastInputType()){
            case "number":
                if(this.getAllInputValues()-length > 1){
                    this.editLastInput(this.getLastInputValue().slice(0, -1), "number");
                } else {
                    this.deleteLastInput();
                }
                break
            case "operator":
                this.deleteLastInput();
                break;
            default:
                return;
        }
    }

    insertNumber(value){
        if(this.getLastInputType() === "number") {
            this.appendToLastInput(value);
        } else if (this.getLastInputType() === "operator" || this.getLastInputType() === null){
            this.addNewInput(value,"number");
        }
    }

    insertOperation(value){
        switch(this.getLastInputType()) {
            case "number":
                this.addNewInput(value, "operator");
                break;
            case "operator":
                this.editLastInput(value, "operator");
                break;
            default:
                return;
        }
    }

    insertDecimalPoint() {
        if(this.getLastInputType() === "number" && !this.getLastInputValue().includes(".")){
            this.appendToLastInput(".");
        } else if(this.getLastInputType() === "operator" || this.getLastInputType() === null) {
            this.addNewInput("0.", "number")
        }
    }

    generateResult(){
        if(this.getLastInputType() === "number") {
            const self = this;
            const simplifyExpression = function (currentExpression, operator){
                if (currentExpression.indexOf(operator) === -1){
                    return currentExpression;
                } else {
                    let operatorIdx = currentExpression.indexOf(operator);
                    let leftOperandIdx = operatorIdx - 1;
                    let rightOperandIdx = operatorIdx + 1;

                    let partialSolution = self.performOperation(...currentExpression.slice(leftOperandIdx, rightOperandIdx +1));

                    currentExpression.splice(leftOperandIdx, 3, partialSolution.toString());

                    return simplifyExpression(currentExpression, operator)
                }
            }
            let result = ["*", "÷", "/", "-", "+"].reduce(simplifyExpression,this.getAllInputValues());

            this.clearAll();
            this.addNewInput(result, "number");
        }
    }

    //
    getLastInputType(){
        return(this.inputHistory.length === 0) ? null : this.inputHistory[this.inputHistory.length - 1].type;
    }

    getLastInputValue(){
        return(this.inputHistory.length === 0) ? null : this.inputHistory[this.inputHistory.length - 1].value;
    }

    getAllInputValues(){
        return this.inputHistory.map(entry => entry.value);
    }

    addNewInput(value, type){
        if(this.getAllInputValues().join("").length >= 16) {
            return;
        }
        this.inputHistory.push({ "type": type, "value": value.toString() });
        this.updateDisplay();
    }

    appendToLastInput(value){
        const lastItem = this.inputHistory[this.inputHistory.length - 1];
        if(lastItem.value.length <= 8) {
            lastItem.value += value.toString();
            this.updateDisplay();
        }
    }

    editLastInput(value, type){
        this.inputHistory.pop();
        this.addNewInput(value, type);
    }

    deleteLastInput(){
        this.inputHistory.pop();
        this.updateDisplay();
    }

    updateDisplay(){
        this.display.innerHTML = this.getAllInputValues().join("") || "0";
    }

    performOperation(leftOperand, operation, rightOperand){
        leftOperand = parseFloat(leftOperand);
        rightOperand = parseFloat(rightOperand);

        if(Number.isNaN(leftOperand) || Number.isNaN(rightOperand)){
            return;
        }

        switch(operation){
            case "÷":
            case "/":
                return leftOperand / rightOperand
            case "*":
                return leftOperand * rightOperand
            case "+":
                return leftOperand + rightOperand
            case "-":
                return leftOperand - rightOperand
            default:
                return;
        }
    }
}
//

const display = document.querySelector('#display')
const numberBtns = document.querySelectorAll('[data-number]');
const operationBtns = document.querySelectorAll('[data-operator]');
const backspaceBtn = document.querySelector('[data-backspace]');
const allClearBtn = document.querySelector('[data-all-clear]');
const decimalBtn = document.querySelector("[data-decimal]")
const equalsBtn = document.querySelector('[data-equals]');
const validKeys = ["1","2","3","4","5","6","7","8","9","0","*", "/", "-", "+", "÷", ".", "Enter", "Backspace"];

//

const calculator = new Calculator(display);

allClearBtn.addEventListener("click", () => {
    calculator.clearAll(true);
})

backspaceBtn.addEventListener("click", () => {
    calculator.backspace();
})

operationBtns.forEach(button => {
    button.addEventListener("click", (event) => {
        let {currentTarget} = event;
        calculator.insertOperation(currentTarget.dataset.operator);
    })
});

numberBtns.forEach(button => {
    button.addEventListener("click", (event) => {
        const {currentTarget} = event;
        calculator.insertNumber(currentTarget.dataset.number);
    })

});

decimalBtn.addEventListener("click", () => {
    calculator.insertDecimalPoint();
})

equalsBtn.addEventListener("click", () => {
    calculator.generateResult();
})

document.addEventListener('keydown', (e) => {
    calculator.extractKey(e)
})
