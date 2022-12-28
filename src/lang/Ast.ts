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
    string(): string
}
export interface Expression extends Node {
}
export interface Statement extends Node {
}

export class Program implements Node {
    type: NodeType = NodeType.PROGRAM;
    statements: Statement[];

    constructor(statements: Statement[]) {
        this.statements = statements;
    }
    string(): string {
        throw new Error("Method not implemented.");
    }
}

export class ExpressionStatement implements Statement {
    type: NodeType = NodeType.EXPRESSION_STATEMENT;
    expression: Expression;

    constructor(expression: Expression) {
        this.expression = expression;
    }

    string(): string {
        return this.expression.string();
    }
}

export class Identifier implements Expression {
    type: NodeType = NodeType.IDENTIFIER;
    value: string;

    constructor(value: string) {
        this.value = value;
    }
    string(): string {
        return this.value;
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
    string(): string {
        return `${this.func.string()}(${this.args.map(a => a.string()).join(", ")});`
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
    string(): string {
        return `${this.left.string()}.${this.right.string()}`
    }
}

export class NotExpression implements Expression {
    type: NodeType = NodeType.NOT;
    right: Expression;

    constructor(right: Expression) {
        this.right = right;
    }
    string(): string {
        return `not ${this.right.string()}`;
    }
}

export class BlockStatement implements Statement {
    type: NodeType = NodeType.BLOCK;
    statements: Statement[];

    constructor(statements: Statement[]) {
        this.statements = statements;
    }
    string(): string {
        return `{${this.statements.map(s => s.string()).join("\n")}}`
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
    string(): string {
        return `if(${this.condition.string().replaceAll(";", "")}) ${this.consequences.string()}${this.alternative ? `else ${this.alternative.string()}` : ""}`
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
    string(): string {
        return `while(${this.condition.string().replaceAll(";", "")})${this.body.string()}`
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
    string(): string {
        return this.extensions.map(e => e.string()).join("\n");
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
    string(): string {
        return `function ${this.name.string()} (${this.params.map(p => p.string()).join(",")}) ${this.body.string()}`;
    }
}
