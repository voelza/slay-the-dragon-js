import { BlockStatement, CallExpression, DotExpression, ExpressionStatement, ExtendStatement, FunctionStatement, Identifier, IfStatement, Node, NodeType, NotExpression, Program, WhileStatement } from "./Ast";
import { Environment } from "./Environment";
import { LangObject, ErrorObject, ObjectType, Instance, NativeFunction, Func, Boolean, Null } from "./Object";


const TRUE = new Boolean(true);
const FALSE = new Boolean(false);
export const NULL = new Null();

export function nativeBoolean(value: boolean): Boolean {
    return value ? TRUE : FALSE;
}

export function evaluate(node: Node, env: Environment): LangObject {
    switch (node.type) {
        case NodeType.PROGRAM:
            return evalProgram(node as Program, env);
        case NodeType.EXPRESSION_STATEMENT:
            return evalExpressionStmt(node as ExpressionStatement, env);
        case NodeType.DOT_EXPRESSION:
            return evalDotExpression(node as DotExpression, env);
        case NodeType.CALL_EXPRESSION:
            return evalCallExpression(node as CallExpression, env);
        case NodeType.IDENTIFIER:
            return evalIdentifier(node as Identifier, env);
        case NodeType.WHILE:
            return evalWhileStmt(node as WhileStatement, env);
        case NodeType.BLOCK:
            return evalBlockStmt(node as BlockStatement, env);
        case NodeType.NOT:
            return evalNotExpression(node as NotExpression, env);
        case NodeType.IF:
            return evalIfStmt(node as IfStatement, env);
        case NodeType.FUNCTION:
            return evalFunction(node as FunctionStatement, env);
        case NodeType.EXTEND:
            return evalExtends(node as ExtendStatement, env);
    }
}

function evalProgram(program: Program, env: Environment): LangObject {
    let object: LangObject = new ErrorObject("Program is empty.");

    for (const statement of program.statements) {
        object = evaluate(statement, env);

        if (isError(object)) {
            return object;
        }
    }

    return object;
}

function evalExpressionStmt(expressionStatement: ExpressionStatement, env: Environment): LangObject {
    return evaluate(expressionStatement.expression, env);
}

function evalDotExpression(dotExpression: DotExpression, env: Environment): LangObject {
    const left = evaluate(dotExpression.left, env);
    if (isError(left)) {
        return left;
    }

    if (ObjectType.INSTANCE !== left.type) {
        return new ErrorObject("'left' in dot expression must be an <Instance>.");
    }

    if (NodeType.IDENTIFIER !== dotExpression.right.type) {
        return new ErrorObject("'right' in dot expression must be an <Identifier>.");
    }
    const instance = left as Instance;
    const property = (dotExpression.right as Identifier).value;
    return instance.get(property);
}

function evalCallExpression(callExpression: CallExpression, env: Environment): LangObject {
    const callee = evaluate(callExpression.func, env);
    if (isError(callee)) {
        return callee;
    }

    if (ObjectType.FUNCTION !== callee.type) {
        return new ErrorObject(`${callee.type} is not a function`);
    }

    const params: LangObject[] = [];
    for (const arg of callExpression.args) {
        const evaluated = evaluate(arg, env);
        if (isError(evaluated)) {
            return evaluated;
        }
        params.push(evaluated);
    }

    if (callee instanceof NativeFunction) {
        return callee.nativeFunc(params);
    }

    const func: Func = callee as Func;
    const closure: Environment = new Environment(func.closure);
    for (let i = 0; i < func.params.length; i++) {
        closure.set(func.params[i], params[i]);
    }
    return evaluate(func.body, closure);
}

function evalIdentifier(identifier: Identifier, env: Environment): LangObject {
    const result: LangObject | undefined = env.get(identifier.value);
    if (result) {
        return result;
    }
    return new ErrorObject(`Identifier not found: ${identifier.value}`);
}

function evalWhileStmt(whileStmt: WhileStatement, env: Environment): LangObject {
    const condition = evaluate(whileStmt.condition, env);
    if (isError(condition)) {
        return condition;
    }

    if (condition === TRUE) {
        const evaluated = evaluate(whileStmt.body, env);
        if (isError(evaluated)) {
            return evaluated;
        }
        evalWhileStmt(whileStmt, env);
    }
    return NULL;
}

function evalIfStmt(ifStatement: IfStatement, env: Environment): LangObject {
    const condition = evaluate(ifStatement.condition, env);
    if (isError(condition)) {
        return condition;
    }

    if (TRUE === condition) {
        return evaluate(ifStatement.consequences, env);
    }
    if (ifStatement.alternative !== null) {
        return evaluate(ifStatement.alternative, env);
    }
    return NULL;
}

function evalNotExpression(notExpression: NotExpression, env: Environment): LangObject {
    const right = evaluate(notExpression.right, env);
    if (isError(right)) {
        return right;
    }

    if (TRUE === right) {
        return FALSE;
    } else if (FALSE === right) {
        return TRUE;
    }
    return FALSE;
}

function evalBlockStmt(blockStmt: BlockStatement, env: Environment): LangObject {
    let object: LangObject = NULL;

    for (const statement of blockStmt.statements) {
        object = evaluate(statement, env);

        if (isError(object)) {
            return object;
        }
    }

    return object;
}

function evalFunction(func: FunctionStatement, env: Environment): LangObject {
    env.set(
        func.name.value,
        new Func(
            func.name.value,
            func.params.map(i => i.value),
            func.body,
            env)
    );
    return NULL;
}

function evalExtends(extendStatement: ExtendStatement, env: Environment): LangObject {
    const whatToExtend = evaluate(extendStatement.whatToExtend, env);
    if (ObjectType.INSTANCE !== whatToExtend.type) {
        return new ErrorObject(`Extends only works on instances! ${whatToExtend.type} is not an instance.`);
    }
    const instance = whatToExtend as Instance;
    for (const extension of extendStatement.extensions) {
        const func = new Func(
            extension.name.value,
            extension.params.map(i => i.value),
            extension.body,
            instance.instanceEnv);
        instance.addFunction(extension.name.value, func);
    }
    return NULL;
}

function isError(object: LangObject): boolean {
    return ObjectType.ERROR === object.type;
}

