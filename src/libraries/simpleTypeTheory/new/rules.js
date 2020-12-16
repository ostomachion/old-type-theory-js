import {makeContext, isContext} from "./context";
import {makeJudgement, isJudgement, isContextJudgement, isTypeFormationJudgement, isMembershipJudgement} from "./judgement";
import {makeVariable, makeBaseType, makeProductType, makePairTerm, makeSumType,
    makeFunctionType} from "./expressionFactories";
import {equalityDeclaration, makeMembershipDeclaration, makeTypeFormingDeclaration} from "./declarationFactories";
import symbols from "./symbols";
const symbolsExp = symbols.expression;

const argumentFail = function (args, length) {
    if (args.length === length) {
        return false;
    } else {
        return true;
    }
}


// CONTEXT RULES

//Rule 1 in pdf
export const emptyContext = function () {
    if (argumentFail(arguments, 0)) {
        return;
    };
    return makeJudgement(makeContext());
}
emptyContext.displayName = "Empty Context";


//Rule 8 in pdf
export const contextExtension = function (typeFormationJudgement) {
    if (argumentFail(arguments, 1)) {
        return;
    };
    if (isTypeFormationJudgement(typeFormationJudgement)) {
        const typeDeclaration = typeFormationJudgement.declaration;

        const membershipDeclaration = makeMembershipDeclaration(makeVariable(), typeDeclaration);

        const extendedContext =  typeFormationJudgement.context.add(membershipDeclaration);

        return  makeJudgement(extendedContext);
    }

}
contextExtension.displayName = "Context Extension"

//END OF CONTEXT RULES

//Rule 2 in pdf
export const genericTypeFormation = function (contextJudgement) {
    if (argumentFail(arguments, 1)) {
        return;
    };

    if (
        isContextJudgement(contextJudgement)
        && contextJudgement[symbolsExp.key] === symbolsExp.context) {
        const T =  makeBaseType();
        const typeFormingDeclaration = makeTypeFormingDeclaration(T);
        return makeJudgement(contextJudgement.context, typeFormingDeclaration);
    }
}

genericTypeFormation.displayName = "Generic Type"

const unitTypeExpression = {
    name: "Unit Type",
    [symbols.expression.key]: symbols.expression.type.unit,
    toString: () => "1"
}
const unitTypeFormingDeclaration = makeTypeFormingDeclaration(unitTypeExpression);

//Rule 3 in pdf
export const unitFormation = function (contextJudgement) {
    if (argumentFail(arguments, 1)) {
        return;
    };
    if (isContextJudgement(contextJudgement)) {

        return makeJudgement(contextJudgement.context, unitTypeFormingDeclaration);
    }
}
unitFormation.displayName = "Unit Type"

const emptyTypeExpression = {
    name: "Empty Type",
    [symbols.expression.key]: symbols.expression.type.empty,
    toString: () => "0"
}

//Rule 5 in pdf
export const emptyFormation = function (contextJudgement) {
    if (argumentFail(arguments, 1)) {
        return;
    };
    if (isContextJudgement(contextJudgement)) {
        const typeFormingDeclaration = makeTypeFormingDeclaration(emptyTypeExpression);
        return makeJudgement(contextJudgement.context, typeFormingDeclaration);
    }
}
emptyFormation.displayName = "Empty Type"


//Common functionality for product type, sum type, and function type formation
const twoTypeCombination = combinedTypeExpressionFunction => ( function ( typeFormationJudgement1, typeFormationJudgement2) {
    //Takes one or two arguments
    if (argumentFail(arguments, 1) && argumentFail(arguments, 2)) {
        return;
    };

    //If there is only one argument, use the first type formation judgement twice.
    if (!typeFormationJudgement2) {
        typeFormationJudgement2 = typeFormationJudgement1;
    }

    const bothAreTFJudgements = isTypeFormationJudgement(typeFormationJudgement1) && isTypeFormationJudgement(typeFormationJudgement2);

    if (!bothAreTFJudgements) {
        return;
    }

    const contextsMatch = typeFormationJudgement1.context.eq(typeFormationJudgement2.context);

    if (contextsMatch) {

        //Use provided function to make a combined type expression (e.g., makeProductType)
        const combinedTypeExpression = combinedTypeExpressionFunction(typeFormationJudgement1.declaration.expression, typeFormationJudgement2.declaration.expression)

        const combinedTypeDeclaration = makeTypeFormingDeclaration(combinedTypeExpression);

        return makeJudgement(typeFormationJudgement1.context, combinedTypeDeclaration);
    }
})

//Rule 4 in pdf
export const productFormation = twoTypeCombination(makeProductType);
productFormation.displayName = "Product Type";
productFormation.description = "Get a product type from two entailment judgements with the same context on the left side, and a type declaration on the right side."

//Rule 6 in pdf
export const sumFormation = twoTypeCombination(makeSumType);
sumFormation.displayName = "Sum Type";

//Rule 7 in pdf
export const functionFormation = twoTypeCombination(makeFunctionType);
functionFormation.displayName = "Function Type";


// Term Construction Rules

//Rule 9 in PDF -> Modified to take three context judgement arguments, since the context must be partitioned. The middle context judgement must contain only a single member
export const reiteration = function (gammaContextJ, singletonContextJ, deltaContextJ) {
    if (argumentFail(arguments, 3) || [...arguments].map(isContextJudgement).includes(false)) {//All arguments are contextJudgements
        return;
    };
    if (singletonContextJ.context.list.length === 1) {
        const combinedContext =   gammaContextJ.context
            .concat(singletonContextJ.context)
            .concat(deltaContextJ.context)

        const [membershipDeclaration] =  singletonContextJ.context.list;

        return makeJudgement(combinedContext, membershipDeclaration);
    }
}
reiteration.displayName = "Reiteration"

const unitTermEpression = {
    [symbols.expression.term.key]: symbols.expression.term.concrete,
    name: "Singleton value",
    toString() {
        return "*"
    }
}

const unitMembershipDeclaration = makeMembershipDeclaration(unitTermEpression, unitTypeFormingDeclaration )

//Rule 14
export const unitIntro = function (contextJudgement) {
    if (argumentFail(arguments, 1)) {
        return;
    }
    if (isContextJudgement(contextJudgement)) {
        return makeJudgement(contextJudgement, unitMembershipDeclaration  )
    }
}

unitIntro.displayName = "Unit Intro";

//Rule 15
export const productIntro = function (membershipJudgement1, membershipJudgement2) {
    if (argumentFail(arguments, 2) && argumentFail(arguments, 1) ) {
        return;
    }
    const bothMembershipJudgements = isMembershipJudgement(membershipJudgement1) && isMembershipJudgement(membershipJudgement2);

    if (!bothMembershipJudgements) {
        return;
    }

    const contextMatch = membershipJudgement1.context.eq(membershipJudgement2.context);
    if (contextMatch) {
        const newTerm = makePairTerm(membershipJudgement1.declaration.termExpression, membershipJudgement2.declaration.termExpression );

        const productType = makeProductType(membershipJudgement1.typeExpression, membershipJudgement2.typeExpression);

        //Change makeMembershipDeclaration to take typeExpression
        // const makeMembershipDeclaration(  )

        // return makeJudgement(membershipJudgement1.context, )
    }

}
productIntro.displayName = "Product Intro"
// export const rule = function () {

// }
// rule.displayName = ""
// export const rule = function () {

// }
// rule.displayName = ""


//Rule 15

export const rules = {
    context: [emptyContext, contextExtension],
    typeFormation: [
        genericTypeFormation,
        unitFormation,
        emptyFormation,
        productFormation,
        sumFormation,
        functionFormation,
    ],
    termConstruction: [
        reiteration,
        unitIntro
    ]
}

