export enum NodeType {
    PROGRAM,
    WHILE,
    BLOCK,
    IDENTIFIER,
    CALL_EXPRESSION,
    DOT_EXPRESSION,
    EXPRESSION_STATEMENT,
    EXTEND,
    FUNCTION,
    NOT,
    IF
}

export interface Node {
    type: NodeType,
}
export interface Expression extends Node { }
export interface Statement extends Node { }

export class Program implements Node {
    type: NodeType = NodeType.PROGRAM;
    statements: Statement[];

    constructor(statements: Statement[]) {
        this.statements = statements;
    }
}

export class ExpressionStatement implements Statement {
    type: NodeType = NodeType.EXPRESSION_STATEMENT;
    expression: Expression;

    constructor(expression: Expression) {
        this.expression = expression;
    }
}

export class Identifier implements Expression {
    type: NodeType = NodeType.IDENTIFIER;
    value: string;

    constructor(value: string) {
        this.value = value;
    }
}

export class CallExpression implements Expression {
    type: NodeType = NodeType.CALL_EXPRESSION;
    func: Expression;
    args: Expression[];

    constructor(func: Expression, args: Expression[]) {
        this.func = func;
        this.args = args;
    }
}

export class DotExpression implements Expression {
    type: NodeType = NodeType.DOT_EXPRESSION;
    left: Expression;
    right: Expression;

    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }
}

export class NotExpression implements Expression {
    type: NodeType = NodeType.NOT;
    right: Expression;

    constructor(right: Expression) {
        this.right = right;
    }
}

export class BlockStatement implements Statement {
    type: NodeType = NodeType.BLOCK;
    statements: Statement[];

    constructor(statements: Statement[]) {
        this.statements = statements;
    }
}

export class IfStatement implements Statement {
    type: NodeType = NodeType.IF;
    condition: Expression;
    consequences: BlockStatement;
    alternative: BlockStatement | null;

    constructor(condition: Expression, consequences: BlockStatement, alternative: BlockStatement | null) {
        this.condition = condition;
        this.consequences = consequences;
        this.alternative = alternative;
    }
}

export class WhileStatement implements Statement {
    type: NodeType = NodeType.WHILE;
    condition: Expression;
    body: BlockStatement;

    constructor(condition: Expression, body: BlockStatement) {
        this.condition = condition;
        this.body = body;
    }
}

export class ExtendStatement implements Statement {
    type: NodeType = NodeType.EXTEND;
    whatToExtend: Identifier;
    extensions: FunctionStatement[];

    constructor(whatToExtend: Identifier, extensions: FunctionStatement[]) {
        this.whatToExtend = whatToExtend;
        this.extensions = extensions;
    }

}

export class FunctionStatement implements Statement {
    type: NodeType = NodeType.FUNCTION;
    name: Identifier;
    params: Identifier[];
    body: BlockStatement;

    constructor(name: Identifier, params: Identifier[], body: BlockStatement) {
        this.name = name;
        this.params = params;
        this.body = body;
    }
}
