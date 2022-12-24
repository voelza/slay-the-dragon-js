import { BlockStatement, CallExpression, DotExpression, Expression, ExpressionStatement, ExtendStatement, FunctionStatement, Identifier, IfStatement, Node, NotExpression, Program, Statement, WhileStatement } from "./Ast";
import { Lexer } from "./Lexer";
import { Token, TokenType } from "./Token";

enum Precedence {
    LOWEST,
    NOT,
    CALL,
    DOT
}

const precedences = new Map<TokenType, Precedence>();
precedences.set(TokenType.DOT, Precedence.DOT);
precedences.set(TokenType.LEFT_PAREN, Precedence.CALL);
precedences.set(TokenType.NOT, Precedence.NOT);

export class Parser {
    lexer: Lexer;
    errors: string[];
    curToken: Token | undefined;
    peekToken: Token | undefined;
    prefixParser: Map<TokenType, () => Expression | null>;
    infixParser: Map<TokenType, (left: Expression) => Expression | null>;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.errors = [];
        this.prefixParser = new Map();
        this.prefixParser.set(TokenType.IDENTIFIER, this.parseIdentifier);
        this.prefixParser.set(TokenType.NOT, this.parseNotExpression);

        this.infixParser = new Map();
        this.infixParser.set(TokenType.DOT, this.parseDotExpression);
        this.infixParser.set(TokenType.LEFT_PAREN, this.parseCallExpression);

        this.nextToken();
        this.nextToken();
    }

    parseProgram(): Node {
        const stmts: Statement[] = [];
        while (!this.curTokenIs(TokenType.EOF)) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                stmts.push(stmt);
            }
            this.nextToken();
        }
        return new Program(stmts);
    }

    parseStatement(): Statement | null {
        switch (this.curToken?.type) {
            case TokenType.WHILE:
                return this.parseWhileStatement();
            case TokenType.IF:
                return this.parseIfStatement();
            case TokenType.EXTEND:
                return this.praseExtendsStatement();
            case TokenType.FUNCTION:
                return this.parseFunctionStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    parseWhileStatement(): Statement | null {
        if (!this.peekTokenIsAndNextToken(TokenType.LEFT_PAREN)) {
            return null;
        }
        this.nextToken();
        const condition = this.parseExpression(Precedence.LOWEST);
        if (condition === null) {
            return null;
        }
        if (!this.peekTokenIsAndNextToken(TokenType.RIGHT_PAREN)) {
            return null;
        }
        if (!this.peekTokenIsAndNextToken(TokenType.LEFT_BRACE)) {
            return null;
        }
        const body = this.parseBlockStatement();
        return new WhileStatement(condition, body);
    }

    parseIfStatement(): Statement | null {
        if (!this.peekTokenIsAndNextToken(TokenType.LEFT_PAREN)) {
            return null;
        }
        this.nextToken();
        const condition = this.parseExpression(Precedence.LOWEST);
        if (condition === null) {
            return null;
        }

        if (!this.peekTokenIsAndNextToken(TokenType.RIGHT_PAREN)) {
            return null;
        }
        if (!this.peekTokenIsAndNextToken(TokenType.LEFT_BRACE)) {
            return null;
        }
        const body = this.parseBlockStatement();
        let alternative: BlockStatement | null = null;
        if (this.peekTokenIs(TokenType.ELSE)) {
            this.nextToken();
            if (!this.peekTokenIsAndNextToken(TokenType.LEFT_BRACE)) {
                return null;
            }
            alternative = this.parseBlockStatement();
        }

        return new IfStatement(condition, body, alternative);
    }

    praseExtendsStatement(): Statement | null {
        if (!this.peekTokenIsAndNextToken(TokenType.IDENTIFIER)) {
            return null;
        }
        const whatToExtend = new Identifier(this.curToken!.literal);
        if (!this.peekTokenIsAndNextToken(TokenType.LEFT_BRACE)) {
            return null;
        }
        const functions: FunctionStatement[] = [];
        while (!this.peekTokenIs(TokenType.RIGHT_BRACE)) {
            if (!this.peekTokenIsAndNextToken(TokenType.FUNCTION)) {
                return null;
            }
            functions.push(this.parseFunctionStatement() as FunctionStatement);
        }
        if (!this.peekTokenIsAndNextToken(TokenType.RIGHT_BRACE)) {
            return null;
        }
        return new ExtendStatement(whatToExtend, functions);
    }

    parseFunctionStatement(): Statement | null {
        if (!this.peekTokenIsAndNextToken(TokenType.IDENTIFIER)) {
            return null;
        }
        const name = new Identifier(this.curToken!.literal);
        if (!this.peekTokenIsAndNextToken(TokenType.LEFT_PAREN)) {
            return null;
        }

        const parameters = this.parseFunctionParameters();
        if (!this.peekTokenIsAndNextToken(TokenType.LEFT_BRACE)) {
            return null;
        }
        const body = this.parseBlockStatement();
        return new FunctionStatement(name, parameters, body);
    }

    parseFunctionParameters(): Identifier[] {
        if (this.peekTokenIs(TokenType.RIGHT_PAREN)) {
            this.nextToken();
            return [];
        }
        this.nextToken();
        const parameters = [];
        parameters.push(new Identifier(this.curToken!.literal));
        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            parameters.push(new Identifier(this.curToken!.literal));
        }

        if (!this.peekTokenIsAndNextToken(TokenType.RIGHT_PAREN)) {
            return [];
        }
        return parameters;
    }

    parseExpressionStatement(): Statement | null {
        const expression = this.parseExpression(Precedence.LOWEST);
        if (expression === null) {
            return null;
        }

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return new ExpressionStatement(expression);
    }

    parseBlockStatement(): BlockStatement {
        const statements: Statement[] = [];
        this.nextToken();
        while (!this.curTokenIs(TokenType.RIGHT_BRACE) && !this.curTokenIs(TokenType.EOF)) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                statements.push(stmt);
            }
            this.nextToken();
        }
        return new BlockStatement(statements);
    }

    parseExpression(precedence: Precedence): Expression | null {
        const prefixParser = this.prefixParser.get(this.curToken!.type);
        if (prefixParser == null) {
            this.addPrefixParseError(this.curToken!.type);
            return null;
        }

        let left: Expression | null = prefixParser.apply(this);
        if (left === null) {
            return null;
        }
        while (!this.curTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
            const infixParser = this.infixParser.get(this.peekToken!.type);
            if (infixParser == null) {
                return left;
            }
            this.nextToken();
            left = infixParser.apply(this, [left]);
            if (left === null) {
                return null;
            }
        }

        return left;
    }

    parseIdentifier(): Expression {
        return new Identifier(this.curToken!.literal);
    }

    parseNotExpression(): Expression | null {
        this.nextToken();
        const right = this.parseExpression(Precedence.NOT);
        if (right === null) {
            return null;
        }
        return new NotExpression(right);
    }

    parseDotExpression(left: Expression): Expression | null {
        this.nextToken();
        const right = this.parseExpression(Precedence.DOT);
        if (right === null) {
            return null;
        }
        return new DotExpression(left, right);
    }

    parseCallExpression(func: Expression): Expression {
        return new CallExpression(func, this.parseExpressionList(TokenType.RIGHT_PAREN));
    }

    parseExpressionList(end: TokenType): Expression[] {
        const args: Expression[] = [];
        if (this.peekTokenIs(end)) {
            this.nextToken();
            return args;
        }

        this.nextToken();
        const firstArg = this.parseExpression(Precedence.LOWEST);
        if (firstArg === null) {
            return args;
        }
        args.push(firstArg);
        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            const arg = this.parseExpression(Precedence.LOWEST);
            if (arg === null) {
                return [];
            }
            args.push(arg);
        }

        if (!this.peekTokenIsAndNextToken(end)) {
            return [];
        }

        return args;
    }
    nextToken(): void {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    peekTokenIsAndNextToken(type: TokenType): boolean {
        if (this.peekTokenIs(type)) {
            this.nextToken();
            return true;
        }
        this.addPeekError(type);
        return false;
    }

    curTokenIs(type: TokenType): boolean {
        return this.curToken?.type === type;
    }

    peekTokenIs(type: TokenType): boolean {
        return this.peekToken?.type === type;
    }

    peekPrecedence(): Precedence {
        const precedence = precedences.get(this.peekToken!.type);
        return precedence ?? Precedence.LOWEST;
    }

    addPeekError(type: TokenType): void {
        this.errors.push(`Line[${this.peekToken?.line}]: Expected next token to be ${type}, got ${this.peekToken?.type} instead.`);
    }

    addPrefixParseError(type: TokenType): void {
        this.errors.push(`Line[${this.curToken?.line}]: No prefix parser for ${type} found.`);
    }
}