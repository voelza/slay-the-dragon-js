import { lookupIdentifier, Token, TokenType } from "./Token";

type char = string & { length: 1 } | 0;

const letters = "asdfghjklqwertzuiopyxcvbnmQWERTZUIOPASDFGHJKLXCVBNM";

export class Lexer {
    input: string;
    position: number;
    readPosition: number;
    ch: char;
    line: number;

    constructor(input: string) {
        this.input = input;
        this.position = 0;
        this.readPosition = 0;
        this.ch = 0;
        this.line = 0;
        this.nextChar();
    }

    nextToken(): Token {
        this.consumeWhiteSpaces();
        switch (this.ch) {
            case '.':
                return this.newTokenAndNextChar(TokenType.DOT);
            case '(':
                return this.newTokenAndNextChar(TokenType.LEFT_PAREN);
            case ')':
                return this.newTokenAndNextChar(TokenType.RIGHT_PAREN);
            case ';':
                return this.newTokenAndNextChar(TokenType.SEMICOLON);
            case ',':
                return this.newTokenAndNextChar(TokenType.COMMA);
            case '{':
                return this.newTokenAndNextChar(TokenType.LEFT_BRACE);
            case '}':
                return this.newTokenAndNextChar(TokenType.RIGHT_BRACE);
            case 0:
                return this.EOF();
            default:
                if (this.isLetter()) {
                    return this.newIdentifier();
                }
                return this.newTokenAndNextChar(TokenType.ILLEGAL);
        }
    }

    newIdentifier(): Token {
        let start = this.position;
        while (this.isLetter()) {
            this.nextChar();
        }
        const identifier = this.input.substring(start, this.position);
        return this.newToken(lookupIdentifier(identifier), identifier);
    }


    EOF(): Token {
        return { line: this.line, type: TokenType.EOF, literal: "" };
    }

    newTokenAndNextChar(type: TokenType) {
        const token = this.newToken(type, "" + this.ch);
        this.nextChar();
        return token;
    }

    newToken(type: TokenType, literal: string) {
        return { line: this.line, type, literal };
    }

    nextChar(): void {
        if (this.readPosition >= this.input.length) {
            this.ch = 0;
        } else {
            this.ch = this.input[this.readPosition] as char;
        }
        this.position = this.readPosition;
        this.readPosition++;
    }

    consumeWhiteSpaces(): void {
        while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
            if (this.ch === '\n' || this.ch === '\r') {
                this.line++;
            }
            this.nextChar();
        }
    }

    isLetter(): boolean {
        if (this.ch === 0) {
            return false;
        }
        return letters.includes(this.ch as string);
    }

}