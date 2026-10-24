# Ruby Parser Visualizer — From Syntax to Structure

A modern, interactive developer-tool and educational web application demonstrating how source code is transformed into tokens, parsed into an Abstract Syntax Tree (AST), checked for semantic correctness, and evaluated in real time.

Built 100% in TypeScript and React to run entirely inside the browser without requiring external APIs, LLMs, or backend services.

---

## 🚀 Key Features

1. **Pure Browser Language Engine**
   - **Lexer**: Tokenizes Ruby-like source code into typed tokens with exact source line, column, and byte offsets.
   - **Recursive-Descent Parser**: Top-down predictive parsing enforcing operator precedence (`*` before `+`), parenthesized groupings, method definitions, and conditional branching (`if / elsif / else / end`).
   - **AST Generator**: Strongly typed AST node representations with unique IDs and source coordinate ranges.
   - **Semantic Analyzer**: Multi-level scoped symbol tables (`global`, `method:name`) detecting undefined variable references, duplicate method parameters, static zero division, and unread variable warnings.
   - **Safe Expression Evaluator**: Tree-walking runtime evaluating arithmetic, comparisons, variable environments, user methods, and standard output (`puts`) without insecure `eval`.

2. **5-Stage Pipeline Workflow**
   - Matches the *Parser Building Overview* presentation:
     1. **Grammar & Syntax Rules**
     2. **Lexical Analysis**
     3. **Parsing (Recursive Descent)**
     4. **Semantic Analysis**
     5. **Testing & Refinement (Evaluation)**
   - Visual step indicators with live status badges (`Waiting`, `Processing`, `Passed`, `Failed`) and sub-millisecond execution timings.

3. **Multi-Modal AST Inspection**
   - **Interactive Tree View**: Expand/collapse nodes, search filters, node type color badges, and attribute summaries.
   - **Visual Node-and-Edge Graph**: Directed SVG diagram with hierarchical levels, bezier curves, directional arrowheads, pan & zoom controls (+ / - / fit / reset), and click-to-inspect.
   - **Formatted JSON View**: Serialized AST with syntax-highlighted keys and values, one-click clipboard copy, and `.json` file download.

4. **Curated Example Programs & Live Test Suite**
   - **8 Standard Examples**:
     - Hello World (`puts "Hello, World!"`)
     - Arithmetic Expressions & Precedence (`a + b * 2`)
     - Conditional Statements (`if / else / end`)
     - Method Definition (`def add(a, b) ... end`)
     - Nested Expressions (`(2 + 3) * (4 + 1)`)
     - Missing `end` Keyword (Syntax Error Detection)
     - Undefined Variable (Semantic Scope Diagnostic)
     - Invalid Syntax / Dangling Operator (`result = 10 +`)
   - **Live In-Browser Test Suite**: Runs real assertions in the UI with pass/fail counts, execution duration, and assertion logs.
   - **Vitest CLI Suite**: Run via `npm test` with 16 automated tests.

5. **Visual Identity & Design System**
   - Premium developer-dashboard aesthetic inspired by the presentation:
     - **Main Background**: `#0B1120`
     - **Secondary Background**: `#111827`
     - **Panel Background**: `#182235`
     - **Elevated Cards**: `#202C40`
     - **Primary Accent**: `#F04452` (Ruby Red)
     - **Secondary Accent**: `#F87171`
     - **Main Text**: `#F8FAFC`
     - **Muted Text**: `#A7B2C5`
     - **Success**: `#34D399`
     - **Warning**: `#FBBF24`
     - **Error**: `#FB7185`

---

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Unit Testing**: Vitest
- **Code Highlighting & Editor**: Custom multi-line synchronized code editor with line numbers, error indicators, and active selection highlights.

---

## 📦 Installation & Startup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup Commands
```bash
# Clone or navigate to the workspace
cd RUBY_parser

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit the local URL displayed in the terminal (typically `http://localhost:5173`).

### Run Automated Tests
```bash
# Run unit tests via Vitest CLI
npm test
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📐 Supported Grammar (EBNF)

```ebnf
Program         ::= StatementList
StatementList   ::= (Statement (Newline | ';')*)*
Statement       ::= MethodDefinition | IfStatement | Assignment | PutsStatement | ExpressionStatement
MethodDefinition::= 'def' IDENTIFIER ('(' ParameterList? ')')? Newline StatementList 'end'
ParameterList   ::= IDENTIFIER (',' IDENTIFIER)*
IfStatement     ::= 'if' Expression Newline StatementList (ElsifBranch)* (ElseBranch)? 'end'
ElsifBranch     ::= 'elsif' Expression Newline StatementList
ElseBranch      ::= 'else' Newline StatementList
Assignment      ::= IDENTIFIER '=' Expression
PutsStatement   ::= 'puts' (Expression (',' Expression)*)?
ExpressionStatement ::= Expression
Expression      ::= Comparison
Comparison      ::= Additive (('==' | '!=' | '<' | '<=' | '>' | '>=') Additive)*
Additive        ::= Multiplicative (('+' | '-') Multiplicative)*
Multiplicative  ::= Unary (('*' | '/' | '%') Unary)*
Unary           ::= ('+' | '-') Unary | Primary
Primary         ::= NumberLiteral | StringLiteral | BooleanLiteral | NilLiteral | MethodCall | Identifier | '(' Expression ')'
MethodCall      ::= IDENTIFIER '(' (Expression (',' Expression)*)? ')'
```

---

## 📂 Project Structure

```
src/
├── parser/
│   ├── tokenTypes.ts          # Token definitions, positions, and keywords
│   ├── lexer.ts               # Lexical scanner with line/col offset tracking
│   ├── astTypes.ts            # Typed AST node structures
│   ├── grammar.ts             # Documented EBNF grammar rules & unsupported syntax map
│   ├── parser.ts              # Recursive-descent parser with operator precedence
│   ├── symbolTable.ts         # Scopes and symbol table tracking
│   ├── semanticAnalyzer.ts    # Scope validation and static diagnostics
│   ├── evaluator.ts           # Safe expression evaluator & execution trace
│   └── diagnostics.ts         # Diagnostic formatting & stage mapping
├── components/
│   ├── Navbar.tsx             # Top navigation, status indicator & quick parse CTA
│   ├── CodeEditor.tsx         # Multi-line code editor with line numbers & toolbar
│   ├── WorkflowStepper.tsx    # 5-stage compilation pipeline stepper
│   ├── TokenTable.tsx         # Interactive token inspector table with category filters
│   ├── ASTTree.tsx            # Expandable/collapsible AST hierarchy tree
│   ├── ASTGraph.tsx           # Interactive SVG node-and-edge visual graph
│   ├── ASTJsonView.tsx        # Syntax-highlighted JSON viewer with download/copy
│   ├── DiagnosticsPanel.tsx   # Actionable diagnostics with correction hints
│   ├── SymbolTableView.tsx    # Scoped symbol tables and registered methods view
│   └── EvaluatorConsole.tsx   # Standard output terminal & step-by-step trace
├── pages/
│   ├── Home.tsx               # Product overview, pipeline diagram & feature cards
│   ├── Workspace.tsx          # 3-panel interactive IDE workspace
│   ├── ASTExplorer.tsx        # Dedicated AST exploration workbench with node inspector
│   ├── Examples.tsx           # Curated example programs gallery & live test runner
│   └── Architecture.tsx       # System architecture, module responsibilities & future scope
├── context/
│   └── ParserContext.tsx      # React state provider with local storage persistence
├── data/
│   └── defaultExamples.ts     # Default program and 8+ test cases
├── tests/
│   ├── lexer.test.ts          # Vitest suite for tokenizer
│   ├── parser.test.ts         # Vitest suite for recursive-descent parser
│   ├── semanticAnalyzer.test.ts# Vitest suite for symbol table & semantic checks
│   ├── evaluator.test.ts      # Vitest suite for evaluator runtime
│   └── testSuite.ts           # In-browser test runner engine
├── App.tsx                    # Main application router
├── main.tsx                   # React root entrypoint
└── index.css                  # Tailwind styles and custom scrollbars
```

---

## 🔒 Security & Safe Execution
- **No `eval()`**: The evaluator uses an AST tree-walk interpreter.
- **No arbitrary shell execution**: Runs exclusively in client-side WebAssembly/JavaScript sandboxes.
- **Infinite Loop Safeguards**: Bounded execution steps limit runaway recursions or computations.
