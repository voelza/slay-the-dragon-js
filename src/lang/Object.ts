import { ActionCharacter, createStandardEnv, Knight, Mage } from "../game/Game";
import { BlockStatement } from "./Ast";
import { Environment } from "./Environment";

export enum ObjectType {
    NULL,
    ERROR,
    INSTANCE,
    FUNCTION,
    GAME_OBJECT,
    BOOLEAN
}

export interface LangObject {
    type: ObjectType;
    inspect(): string;
}

export class ErrorObject implements LangObject {
    type: ObjectType = ObjectType.ERROR;
    error: string;

    constructor(error: string) {
        this.error = error;
    }

    inspect(): string {
        return this.error;
    }
}

export class Boolean implements LangObject {
    type: ObjectType = ObjectType.BOOLEAN;
    value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    inspect(): string {
        return String(this.value);
    }
}

export class Null implements LangObject {
    type: ObjectType = ObjectType.NULL;
    inspect(): string {
        return "null";
    }
}

export class Func implements LangObject {
    type: ObjectType = ObjectType.FUNCTION;
    name: string;
    params: string[];
    body: BlockStatement;
    closure: Environment;

    constructor(name: string, params: string[], body: BlockStatement, closure: Environment) {
        this.name = name;
        this.params = params;
        this.body = body;
        this.closure = closure;
    }

    inspect(): string {
        return `function ${this.name} (${this.params.join(", ")}) {}`;
    }
}

export class NativeFunction implements LangObject {
    type: ObjectType = ObjectType.FUNCTION;
    nativeFunc: (args: LangObject[]) => LangObject;

    constructor(nativeFunc: (args: LangObject[]) => LangObject) {
        this.nativeFunc = nativeFunc;
    }

    inspect(): string {
        return "<native function>";
    }
}

export class GameObject implements LangObject {
    type: ObjectType = ObjectType.GAME_OBJECT;
    content: any;

    constructor(content: any) {
        this.content = content;
    }

    inspect(): string {
        return String(this.content);
    }
}

export class Instance implements LangObject {
    type: ObjectType = ObjectType.INSTANCE;
    move: NativeFunction;
    attack: NativeFunction | undefined;
    isNextTo: NativeFunction;
    support: NativeFunction | undefined;

    userDefinedFunctions: Map<string, Func>;
    instanceEnv: Environment;

    constructor(character: ActionCharacter) {
        this.move = new NativeFunction(character.nativeMove.bind(character));
        this.isNextTo = new NativeFunction(character.nativeIsNextTo.bind(character));

        if (character instanceof Knight) {
            this.attack = new NativeFunction(character.nativeAttack.bind(character));
        }

        if (character instanceof Mage) {
            this.support = new NativeFunction(character.nativeSupport.bind(character));
        }

        this.userDefinedFunctions = new Map();
        this.instanceEnv = createStandardEnv();
        this.instanceEnv.set("this", this);
    }

    get(property: string): LangObject {
        if ("move" === property) {
            return this.move;
        } else if (this.attack && "attack" === property) {
            return this.attack;
        } else if ("isNextTo" === property) {
            return this.isNextTo;
        } else if (this.support && "support" === property) {
            return this.support;
        }

        const userFunction: Func | undefined = this.userDefinedFunctions.get(property);
        if (userFunction !== undefined) {
            return userFunction;
        }

        return new ErrorObject(`${property} is not implemented yet`);
    }

    addFunction(name: string, func: Func) {
        this.userDefinedFunctions.set(name, func);
    }

    inspect(): string {
        return "<Instance>";
    }

}