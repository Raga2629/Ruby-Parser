export type SymbolKind = 'variable' | 'parameter' | 'method';

export interface SymbolEntry {
  name: string;
  kind: SymbolKind;
  line: number;
  column: number;
  scopeName: string;
  scopeLevel: number;
  isAssigned: boolean;
  isRead: boolean;
}

export interface MethodSignature {
  name: string;
  paramCount: number;
  parameters: string[];
  line: number;
  column: number;
}

export class Scope {
  public name: string;
  public level: number;
  public parent?: Scope;
  public symbols: Map<string, SymbolEntry> = new Map();
  public methods: Map<string, MethodSignature> = new Map();

  constructor(name: string, level: number = 0, parent?: Scope) {
    this.name = name;
    this.level = level;
    this.parent = parent;
  }

  public define(
    name: string,
    kind: SymbolKind,
    line: number,
    column: number,
    isAssigned: boolean = true
  ): SymbolEntry {
    const existing = this.symbols.get(name);
    if (existing) {
      if (isAssigned) existing.isAssigned = true;
      return existing;
    }

    const symbol: SymbolEntry = {
      name,
      kind,
      line,
      column,
      scopeName: this.name,
      scopeLevel: this.level,
      isAssigned,
      isRead: false,
    };
    this.symbols.set(name, symbol);
    return symbol;
  }

  public defineMethod(
    name: string,
    parameters: string[],
    line: number,
    column: number
  ): MethodSignature {
    const signature: MethodSignature = {
      name,
      paramCount: parameters.length,
      parameters,
      line,
      column,
    };
    this.methods.set(name, signature);
    return signature;
  }

  public lookup(name: string): SymbolEntry | undefined {
    if (this.symbols.has(name)) {
      return this.symbols.get(name);
    }
    if (this.parent) {
      return this.parent.lookup(name);
    }
    return undefined;
  }

  public lookupMethod(name: string): MethodSignature | undefined {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }
    if (this.parent) {
      return this.parent.lookupMethod(name);
    }
    return undefined;
  }

  public lookupCurrentScope(name: string): SymbolEntry | undefined {
    return this.symbols.get(name);
  }

  public markRead(name: string): boolean {
    const sym = this.lookup(name);
    if (sym) {
      sym.isRead = true;
      return true;
    }
    return false;
  }

  public getAllSymbols(): SymbolEntry[] {
    const list: SymbolEntry[] = Array.from(this.symbols.values());
    return list;
  }
}
