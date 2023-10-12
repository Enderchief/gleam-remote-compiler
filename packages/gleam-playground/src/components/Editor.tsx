import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { For, createEffect, createSignal, type Setter } from 'solid-js';

import { parse } from 'smol-toml';

import '../loadWorkers.js';
import CompilerWorker from '../worker.js?worker';

import { createEditor } from '../textmate/app.js';
import { registerGleam } from 'src/gleam.js';
import Split from './Split.jsx';
import { KeyCode, KeyMod } from 'monaco-editor/esm/vs/editor/editor.api.js';
registerGleam();

type Folder = {
  type: 'folder';
  children: Array<string>;
};
type File = {
  type: 'file';
  editor: monaco.editor.ITextModel;
};

type Content = File | Folder;

function createFilesystem() {
  const [get, set] = createSignal<Record<string, Content>>({});

  return {
    render: (setFile: Setter<string>) => (
      <For each={Object.entries(get())}>
        {([name, context]) => (
          <li
            onclick={() => setFile(name)}
            class='hover:bg-dark pl-0.5 pr-4 py-0.5 cursor-pointer first-children:hover:opacity-60'
          >
            <span class='text-size-3 px-2 opacity-0'>\udb80\uddd9</span>
            <span class='text-size-4'>
              {context.type === 'file' ? ' ' : ' '}
            </span>
            {name.replace(/\/src\//, '')}
          </li>
        )}
      </For>
    ),
    contents() {
      return Object.fromEntries(
        Object.entries(get())
          .filter(([_, v]) => v.type === 'file')
          .map(([k, v]) => [k, (v as File).editor.getValue()])
      );
    },
    model(name: string) {
      const f = get()[name];
      return f && f.type === 'file' ? f!.editor : undefined;
    },
    push(obj: Record<string, monaco.editor.ITextModel | Array<string>>) {
      for (const [name, content] of Object.entries(obj)) {
        if (Array.isArray(content))
          set({
            ...get(),
            ...{ [name]: { type: 'folder', children: content } },
          });
        else
          set({ ...get(), ...{ [name]: { type: 'file', editor: content } } });
      }
    },
    set,
    get,
  };
}

const compiler = new CompilerWorker();

export default function () {
  const parent = (<div class='w-[100%]'></div>) as HTMLDivElement;

  const [output, setOutput] = createSignal(<pre>{'// run your code'}</pre>);

  const outputArea = (
    <div class='h-75 b b-[#ccc] b-t-none c-white bg-[#1e1e1e] py-4 px-8 text-4 font-[FiraCode] of-scroll'>
      {output()}
    </div>
  );

  let provider;

  let [editor, setEditor] = createSignal<monaco.editor.IStandaloneCodeEditor>();
  const file = createFilesystem();

  createEffect(async () => {
    if (editor()) return;

    const { editor: e, provider: p } = await createEditor(parent, {
      model: null,
      fontFamily: 'FiraCode',
      padding: {
        top: 16,
      },
    });
    e.addAction({
      id: 'compile',
      label: 'Compile Gleam',
      async run(_editor, ..._args) {
        await compileCode();
      },
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyR],
    });
    e.addAction({
      id: 'view-source',
      label: 'View Compiled Source',
      run(_editor, ..._args) {
        swapLanguage();
      },
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyE],
    });

    setEditor(e);
    p.injectCSS();
    provider = p;
    file.push({
      '/src/main.gleam': monaco.editor.createModel(
        'import foo\n\npub fn main() {\n    foo.add(3, 39)\n}\n',
        'gleam'
      ),
      '/src/foo.gleam': monaco.editor.createModel(
        'pub fn add(x: Int, y: Int) -> Int {\n    x + y\n}\n',
        'gleam'
      ),
      'gleam.toml': monaco.editor.createModel(
        '# gleam.toml is only used for dependencies\n\n# version have to be exact (no \'foo = "~> 0.1.3"\')\n[dependencies]\ngleam_stdlib = "0.31.0"',
        'toml'
      ),
    });

    e.setModel(file.model('/src/main.gleam')!);
  });

  const [result, setResult] = createSignal<
    { Ok: Map<string, string>; Err: undefined } | { Ok: undefined; Err: string }
  >();

  const [currentFile, setFile] = createSignal('/src/main.gleam');

  createEffect(() => {
    const model = file.model(currentFile());
    if (model) editor()?.setModel(model);
    editor()?.updateOptions({ readOnly: false });
  });

  function swapLanguage() {
    const r = result()?.Ok;

    if (!r) return;
    const name = currentFile();

    let path = '';
    if (name.endsWith('.mjs') && name.startsWith('/build/dev')) {
      path = name.replace(
        /\/build\/dev\/javascript\/gleam-wasm\/([\w\d_]+)\.mjs/,
        '/src/$1.gleam'
      );
    } else if (name.endsWith('.gleam') && name.startsWith('/src')) {
      path = name.replace(
        /\/src\/([\w\d_]+)\.gleam/,
        '/build/dev/javascript/gleam-wasm/$1.mjs'
      );
    } else return;
    setFile(path);

    if (path.endsWith('.mjs') && path.startsWith('/build/dev')) {
      const content = r.get(path);
      if (!content) return;
      editor()?.setModel(monaco.editor.createModel(content, 'javascript'));
      editor()?.updateOptions({ readOnly: true });
    } else {
      editor()?.setModel(file.model(path)!);
      editor()?.updateOptions({ readOnly: false });
    }

    provider!.injectCSS();
  }

  async function compileCode(): Promise<void> {
    const body = file.contents();

    const rawToml = body['gleam.toml'] || '';
    const parsedToml = parse(rawToml);
    const dependencies = parsedToml.dependencies;

    console.log(dependencies);

    const res = await fetch('/api/hex', {
      body: JSON.stringify(dependencies),
      headers: { 'content-type': 'application/json' },
      method: 'post',
    });
    console.log(res);

    if (!res.ok) return void setOutput(<pre class='c-red-5'>{res.status}</pre>);

    const deps = await res.json();

    Object.assign(body, deps);
    console.log(body);

    compiler.postMessage({ files: body, dependencies });
  }

  compiler.addEventListener('message', (ev) => {
    const data = ev.data;
    setResult(data);

    if (data.error) {
      setOutput(<pre class='c-red-5'>{data.error}</pre>);
    }
  });

  return (
    <main class='h-screen w-screen flex flex-col b-amber'>
      <div class='children:(b b-coolGray min-w-fit mx-4 px-2)'>
        <button class='' onclick={compileCode}>
          Compile
        </button>
        <button onclick={swapLanguage}>View JS Source</button>
      </div>
      <Split
        class='h-100%'
        orientation='vertical'
        onresize={(size) => {
          editor()?.layout(size);
        }}
      >
        <FileTree files={file} setFile={setFile} />
        {parent}
      </Split>
      {outputArea}
    </main>
  );
}

function FileTree(props: {
  files: ReturnType<typeof createFilesystem>;
  setFile: Setter<string>;
}) {
  function newFile() {
    const name = prompt('Enter a file path (ex: /src/bar.gleam)')!;
    if (!name) return;
    props.files.push({
      [name]: monaco.editor.createModel(
        '// hello there',
        name.split('.').at(-1)!
      ),
    });
  }

  return (
    <div class='h-100% m-0 p-0 color-white bg-[#1e1e1e] min-w-50 of-scroll font-[FiraCode]'>
      <div class='flex justify-evenly w-32 text-6'>
        <button aria-label='new file' onclick={newFile}>
          
        </button>
        <button aria-label='new folder'></button>
      </div>
      <ul class='py-4 text-3 list-none'>{props.files.render(props.setFile)}</ul>
    </div>
  );
}
