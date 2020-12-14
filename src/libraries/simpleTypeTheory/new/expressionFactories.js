import symbols from "./symbols";
import {bracketedExpressionString} from "./util";

const {expression: expressionSym} = symbols;

let  variableCounter = 1;
export const makeVariable = () => {
    let name =  "v_" + variableCounter;
    //Increment the variable counter
    variableCounter++;

    return {
        name: name,
        [expressionSym.key]: expressionSym.term.variable,
        toString: () => name
    }
}


//This won't be used
// let  termCounter = 0;
// export const makeConcreteTerm = ( ) => {
//     const termLetters = ["a","b","c", "d", "e"];
//     let name;

//     if (termCounter < termLetters.length) {
//         name = termLetters[termCounter];
//     } else {
//         name = "term_" + (termCounter + 1);
//     }
//     //Increment the term counter
//     termCounter++;

//     return {
//         name: name,
//         [expressionSym.key]: expressionSym.term.concrete,
//         toString: () => name
//     }
// }


let  typeCounter = 0;
export const makeBaseType = ( ) => {
    const name = "T" + (typeCounter + 1);

    //Increment the type counter
    typeCounter++;

    return {
        name: name,
        [expressionSym.key]: expressionSym.type.base,
        toString: () => name
    }
}


export const makeProductType = (typeExpression1, typeExpression2) => {
    return {
        [expressionSym.key]: expressionSym.type.product,
        first: typeExpression1,
        second: typeExpression2,
        toString () {
            return `${bracketedExpressionString(this.first)} x ${bracketedExpressionString(this.second)}`
        }
    }
}



export const resetExpressionFactoryCounters = () => {
    variableCounter = 0
    typeCounter = 0
}

