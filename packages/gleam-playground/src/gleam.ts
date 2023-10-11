import * as monaco from 'monaco-editor';

export function registerGleam() {
  monaco.languages.register({ id: 'gleam' });

  // Register a completion item provider for the new language
  monaco.languages.registerCompletionItemProvider('gleam', {
    provideCompletionItems: (model, position, _context, _token) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        // Keywords
        {
          label: 'import',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'import',
          range,
        },
        {
          label: 'pub',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'pub',
          range,
        },
        {
          label: 'fn',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'fn',
          range,
        },
        {
          label: 'as',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'as',
          range,
        },
        {
          label: 'assert',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'assert',
          range,
        },
        {
          label: 'case',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'case',
          range,
        },
        {
          label: 'const',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'const',
          range,
        },
        {
          label: 'external',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            '@external(${1:target}, "${2:file}", ${3:external_name})\nfn ${4:name}(${5:params}) -> ${6:type}\n',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'if',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'if',
          range,
        },
        {
          label: 'let',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'let',
          range,
        },
        {
          label: 'opaque',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'opaque',
          range,
        },
        {
          label: 'todo',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'todo',
          range,
        },
        {
          label: 'try',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'try',
          range,
        },
        {
          label: 'type',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'type',
          range,
        },

        // Stdlib types
        {
          label: 'Int',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Int',
          range,
        },
        {
          label: 'Float',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Float',
          range,
        },
        {
          label: 'Uri',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Uri',
          range,
        },
        {
          label: 'Order',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Order',
          range,
        },
        {
          label: 'Nil',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Nil',
          range,
        },
        {
          label: 'BitString',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'BitString',
          range,
        },
        {
          label: 'Bool',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Bool',
          range,
        },
        {
          label: 'Dynamic',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Dynamic',
          range,
        },
        {
          label: 'String',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'String',
          range,
        },
        {
          label: 'StringBuilder',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'StringBuilder',
          range,
        },

        // Constructors
        {
          label: 'None',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'None',
          range,
        },
        {
          label: 'True',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'True',
          range,
        },
        {
          label: 'False',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'False',
          range,
        },

        // Generic Types
        {
          label: 'Iterator',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Iterator(${1:type})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'List',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'List(${1:type})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'Some',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Some(${1:type})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'Ok',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Ok(${1:type})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'Err',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Err(${1:type})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'Option',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Option(${1:type})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'Result',
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: 'Result(${1:okType}, ${2:errorType})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'if',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'if ${1:condition} {\n\t${2:body}\n}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'fn0',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'fn ${1:name}() -> ${2:type} {\n\t${3:body}\n}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'pfn0',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'pub fn ${1:name}() -> ${2:type} {\n\t${3:body}\n}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'pfn1',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            'pub fn ${1:name}(${2:param}: ${3:type}) -> ${4:type} {\n\t${5:body}\n}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'fn1',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            'fn ${1:name}(${2:param}: ${3:type}) -> ${4:type} {\n\t${5:body}\n}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        // { label: "Map(", kind: monaco.languages.CompletionItemKind.Snippet },
        // { label: "Result(", kind: monaco.languages.CompletionItemKind.Snippet },
        // { label: "Queue(", kind: monaco.languages.CompletionItemKind.Snippet },
        // { label: "Set(", kind: monaco.languages.CompletionItemKind.Snippet },
      ] satisfies monaco.languages.CompletionItem[];
      return {
        suggestions: suggestions,
      } satisfies monaco.languages.CompletionList;
    },
  });
}
