export type Token = {
    line: number,
    type: TokenType,
    literal: string
}

export enum TokenType {
    ILLEGAL,
    EOF,
    IDENTIFIER,
    DOT,
    LEFT_PAREN,
    RIGHT_PAREN,
    SEMICOLON,
    COMMA,
    LEFT_BRACE,
    RIGHT_BRACE,
    WHILE,
    NOT,
    IF,
    ELSE,
    FUNCTION,
    EXTEND
}

export function lookupIdentifier(id: string): TokenType {
    switch (id) {
        case "while":
            return TokenType.WHILE;
        case "not":
            return TokenType.NOT;
        case "if":
            return TokenType.IF;
        case "else":
            return TokenType.ELSE;
        case "function":
            return TokenType.FUNCTION;
        case "extend":
            return TokenType.EXTEND;
        default:
            return TokenType.IDENTIFIER;
    }
}