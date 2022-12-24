import { LangObject } from "./Object";

export class Environment {
    env: Map<string, LangObject>;
    outer: Environment | null;

    constructor(outer: Environment | null = null) {
        this.env = new Map();
        this.outer = outer;
    }

    get(name: string): LangObject | undefined {
        const obj = this.env.get(name);
        if (obj === undefined && this.outer !== null) {
            return this.outer.get(name);
        }
        return obj;
    }

    set(name: string, value: LangObject): void {
        this.env.set(name, value);
    }
}