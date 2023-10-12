import type { ScopeName, TextMateGrammar, ScopeNameInfo } from './providers';

// #region monaco imports
// import 'monaco-editor/esm/vs/editor/browser/coreCommands.js';
// import 'monaco-editor/esm/vs/editor/browser/editorExtensions.js';
// import 'monaco-editor/esm/vs/editor/contrib/anchorSelect/browser/anchorSelect.js';
// import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js';
// import 'monaco-editor/esm/vs/editor/contrib/caretOperations/browser/caretOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/caretOperations/browser/transpose.js';
// import 'monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js';
// import 'monaco-editor/esm/vs/editor/contrib/codeAction/browser/codeActionContributions.js';
// import 'monaco-editor/esm/vs/editor/contrib/codelens/browser/codelensController.js';
// import 'monaco-editor/esm/vs/editor/contrib/colorPicker/browser/colorContributions.js';
// import 'monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js';
// import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js';
// import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/browser/cursorUndo.js';
// import 'monaco-editor/esm/vs/editor/contrib/dnd/browser/dnd.js';
// import 'monaco-editor/esm/vs/editor/contrib/documentSymbols/browser/documentSymbols.js';
// import 'monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js';
// import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js';
// import 'monaco-editor/esm/vs/editor/contrib/fontZoom/browser/fontZoom.js';
// import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js';
// import 'monaco-editor/esm/vs/editor/contrib/gotoError/browser/gotoError.js';
// import 'monaco-editor/esm/vs/editor/contrib/gotoSymbol/browser/goToCommands.js';
// import 'monaco-editor/esm/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.js';
// import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hover.js';
// import 'monaco-editor/esm/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.js';
// import 'monaco-editor/esm/vs/editor/contrib/indentation/browser/indentation.js';
// import 'monaco-editor/esm/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/inlineProgress/browser/inlineProgress.js';
// import 'monaco-editor/esm/vs/editor/contrib/lineSelection/browser/lineSelection.js';
// import 'monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/';
// import 'monaco-editor/esm/vs/editor/contrib/';
// import 'monaco-editor/esm/vs/editor/contrib/';
// #endregion
import 'monaco-editor/esm/vs/editor/editor.all';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';
import 'monaco-editor/esm/vs/language/html/monaco.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js';

import {
  createOnigScanner,
  createOnigString,
  loadWASM,
} from 'vscode-oniguruma';
import { SimpleLanguageInfoProvider } from './providers';
import { registerLanguages } from './register';
import { rehydrateRegexps } from './configuration';
import ColorTheme from '../themes/gleam-color-theme';

import wasmUrl from 'vscode-oniguruma/release/onig.wasm?url';

interface DemoScopeNameInfo extends ScopeNameInfo {
  path: string;
}

const config_map: Record<string, string> = import.meta.glob(
  './configurations/*.json',
  { as: 'raw', eager: true }
);

const grammar_map: Record<string, string> = import.meta.glob(
  './grammar/*.tmLanguage.json',
  { as: 'raw', eager: true }
);

const languages: monaco.languages.ILanguageExtensionPoint[] = [
  {
    id: 'gleam',
    extensions: ['.gleam'],
    aliases: ['Gleam'],
  },
  {
    id: 'javascript',
    extensions: ['.js', '.mjs'],
    aliases: ['js'],
  },
  {
    id: 'toml',
    extensions: ['toml'],
  },
];
const grammars: { [scopeName: string]: DemoScopeNameInfo } = {
  'source.gleam': {
    language: 'gleam',
    path: 'gleam.tmLanguage.json',
  },
  'source.js': {
    language: 'javascript',
    path: 'javascript.tmLanguage.json',
  },
  'source.toml': {
    language: 'toml',
    path: 'toml.tmLanguage.json',
  },
};

async function fetchGrammar(scopeName: ScopeName): Promise<TextMateGrammar> {
  const { language } = grammars[scopeName]!;
  const grammar = grammar_map[`./grammar/${language}.tmLanguage.json`]!;
  return { type: 'json', grammar };
}

async function fetchConfiguration(
  language: string
): Promise<monaco.languages.LanguageConfiguration> {
  const data = config_map[`./configurations/${language}.json`]!;
  return rehydrateRegexps(data);
}

export async function createEditor(
  element: HTMLElement,
  options: monaco.editor.IStandaloneEditorConstructionOptions = {}
) {
  const data: ArrayBuffer | Response = await loadVSCodeOnigurumWASM();
  loadWASM(data);
  const onigLib = Promise.resolve({
    createOnigScanner,
    createOnigString,
  });
  const provider = new SimpleLanguageInfoProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map((language) => language.id),
    fetchConfiguration,
    theme: ColorTheme,
    onigLib,
  });

  registerLanguages(languages, (language: string) =>
    provider.fetchLanguageInfo(language)
  );

  const editor = monaco.editor.create(element, {
    value: 'pub fn main() {\n    42\n}\n',
    theme: 'vs-dark',
    minimap: {
      enabled: true,
    },
    fontLigatures: true,
    ...options,
  });

  return { editor, provider };
}

// Taken from https://github.com/microsoft/vscode/blob/829230a5a83768a3494ebbc61144e7cde9105c73/src/vs/workbench/services/textMate/browser/textMateService.ts#L33-L40
async function loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer> {
  const response = await fetch(wasmUrl);

  const contentType = response.headers.get('content-type');
  if (contentType === 'application/wasm') {
    return response;
  }

  // Using the response directly only works if the server sets the MIME type 'application/wasm'.
  // Otherwise, a TypeError is thrown when using the streaming compiler.
  // We therefore use the non-streaming compiler :(.
  return await response.arrayBuffer();
}
