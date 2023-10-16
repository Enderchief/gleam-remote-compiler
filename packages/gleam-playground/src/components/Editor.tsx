import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import {
  For,
  createEffect,
  createSignal,
  type Setter,
  type Accessor,
  type JSXElement,
} from 'solid-js';

import '../loadWorkers.js';
import CompilerWorker from '../worker.js?worker';

import { createEditor } from '../textmate/app.js';
import { registerGleam } from 'src/gleam.js';
import Split from './Split.jsx';
import { KeyCode, KeyMod } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { bundle, compileCode, type CompileResult } from 'src/build.jsx';
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

export function createFilesystem() {
  const [get, set] = createSignal<Record<string, Content>>({});
  const [current, setCurrent] = createSignal<string>('');

  return {
    current,
    setCurrent,
    render: (setFile: Setter<string>) => (
      <For each={Object.entries(get())}>
        {([name, context]) => (
          <li
            onclick={() => setFile(name)}
            class='hover:bg-dark pl-0.5 pr-4 py-0.5 cursor-pointer first-children:hover:opacity-60'
          >
            <span
              class='text-size-4 px-2 opacity-0 c-red-4'
              onclick={() => {
                set(
                  Object.fromEntries(
                    Object.entries(get()).filter(([k, v]) => k !== name)
                  )
                );
              }}
            >
              
            </span>
            <span class='text-size-4'>
              {context.type === 'file' ? ' ' : ' '}
            </span>
            {name}
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

async function initEditor(
  parent: HTMLElement,
  file: ReturnType<typeof createFilesystem>,
  result: Accessor<CompileResult | undefined>,
  setOutput: Setter<JSXElement>
): Promise<monaco.editor.IStandaloneCodeEditor> {
  const { editor, provider } = await createEditor(parent, {
    model: null,
    fontFamily: 'FiraCode',
    padding: {
      top: 16,
    },
  });
  editor.addAction({
    id: 'compile',
    label: 'Compile Gleam',
    async run(_editor, ..._args) {
      await compileCode(file, compiler, setOutput);
    },
    keybindings: [KeyMod.CtrlCmd | KeyCode.KeyR],
  });
  editor.addAction({
    id: 'view-source',
    label: 'View Compiled Source',
    run(_editor, ..._args) {
      swapLanguage!(editor, file, result);
    },
    keybindings: [KeyMod.CtrlCmd | KeyCode.KeyE],
  });

  provider.injectCSS();

  file.push({
    '/src/main.gleam': monaco.editor.createModel(
      `import foo
import gleam/float
import gleam/io

const pi = 3.141592653589793

pub fn main() {
    foo.div(pi, 2.)
    |> foo.sin
    |> float.to_string
    |> io.println
}
`,
      'gleam'
    ),
    '/src/foo.gleam': monaco.editor.createModel(
      `pub fn div(x: Float, y: Float) -> Float {
    x /. y
}

@external(javascript, "./ffi.mjs", "sin")
pub fn sin(theta: Float) -> Float
`,
      'gleam'
    ),
    '/src/ffi.mjs': monaco.editor.createModel(
      'export function sin(theta) {\n    return Math.sin(theta)\n}\n',
      'javascript'
    ),
    'gleam.toml': monaco.editor.createModel(
      '# gleam.toml is only used for dependencies\n\n# version have to be exact (no \'foo = "~> 0.1.3"\')\n[dependencies]\ngleam_stdlib = "0.31.0"',
      'toml'
    ),
    //   'index.html': monaco.editor.createModel(
    //     '<html>\n    <body>\n        <h1>hello world</h1>\n    </body>\n</html>',
    //     'html'
    //   ),
  });

  editor.setModel(file.model('/src/main.gleam')!);
  file.setCurrent('/src/main.gleam');

  return editor;
}

function swapLanguage(
  editor: monaco.editor.IStandaloneCodeEditor,
  file: ReturnType<typeof createFilesystem>,
  result: Accessor<CompileResult | undefined>
) {
  const res = result()?.Ok;

  if (!res) return;

  let name = file.current();

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
  file.setCurrent(path);

  if (path.endsWith('.mjs') && path.startsWith('/build/dev')) {
    const content = res.get(path);
    if (!content) return;
    editor.setModel(monaco.editor.createModel(content, 'javascript'));
    editor.updateOptions({ readOnly: true });
  } else {
    editor.setModel(file.model(path)!);
    editor.updateOptions({ readOnly: false });
  }
}

const compiler = new CompilerWorker();

export default function () {
  const parent = (<div class='w-[100%]'></div>) as HTMLDivElement;
  const task: VoidFunction[] = [];

  const [output, setOutput] = createSignal(<pre>{'// run your code'}</pre>);

  const outputArea = (
    <div class='h-75 c-white bg-[#1e1e1e] py-4 px-8 text-4 font-[FiraCode] of-scroll'>
      {output()}
    </div>
  );

  let [editor, setEditor] = createSignal<monaco.editor.IStandaloneCodeEditor>();
  const file = createFilesystem();

  createEffect(async () => {
    if (editor()) return;

    setEditor(await initEditor(parent, file, result, setOutput));
  });

  const [result, setResult] = createSignal<CompileResult>();

  const [currentFile, setFile] = createSignal('/src/main.gleam');

  createEffect(() => {
    const model = file.model(currentFile());
    if (model) editor()?.setModel(model);
    editor()?.updateOptions({ readOnly: false });
  });

  compiler.addEventListener(
    'message',
    (ev: MessageEvent<ReturnType<typeof result>>) => {
      const data = ev.data!;

      const contents = file.get();
      if (data.Ok) {
        for (const path in contents) {
          if (Object.prototype.hasOwnProperty.call(contents, path)) {
            const v = contents[path];

            if (v && v.type === 'file' && !path.endsWith('.gleam')) {
              if (path.startsWith('/src')) {
                data.Ok.set(
                  path.replace(
                    /\/src\/(.+)/,
                    '/build/dev/javascript/gleam-wasm/$1'
                  ),
                  v.editor.getValue()
                );
              }
            }
          }
        }
        for (const [path, value] of (
          data.Ok as Map<string, string>
        ).entries()) {
          if (path.startsWith('/build/packages')) {
            const key = path.replace(
              /\/build\/packages\/([\w_\-\d]+)\/src\/(.+)/,
              '/build/dev/javascript/$1/$2'
            );
            data.Ok.delete(key);
            data.Ok.set(key, value);
          }
        }
      }

      setResult(data);

      if (data.error) {
        setOutput(<pre class='c-red-5'>{data.error}</pre>);
      } else {
        task.forEach((t) => t());
        task.length = 0;
      }
    }
  );

  /*#TODO: iframe browser output.
  const url = () =>
    URL.createObjectURL(
      new Blob(['<h1>hello world</h1>'], { type: 'text/html' })
    );

  const frame = (
    <iframe src={url()} sandbox='allow-scripts'></iframe>
  ) as HTMLIFrameElement;
  consider import maps in a module worker + blob urls
  */

  return (
    <>
      <main class='h-screen w-screen flex flex-col b-amber'>
        <div class='children:(b b-coolGray min-w-fit mx-4 px-2)'>
          <button onclick={() => compileCode(file, compiler, setOutput)}>
            Compile
          </button>
          <button
            onclick={() => {
              swapLanguage(editor()!, file, result);
            }}
          >
            View JS Source
          </button>
          <button
            onclick={() =>
              compileCode(file, compiler, setOutput).then(() =>
                task.push(() => bundle(result()!, setOutput, output))
              )
            }
          >
            Run Code
          </button>
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
      {/* {frame} */}
    </>
  );
}

function FileTree(props: {
  files: ReturnType<typeof createFilesystem>;
  setFile: Setter<string>;
}) {
  function newFile() {
    const name = prompt('Enter a file path (ex: /src/bar.gleam)')!;
    if (!name) return;
    console.log(name);

    props.files.push({
      [name]: monaco.editor.createModel(
        '// hello there',
        undefined,
        monaco.Uri.file(name)
      ),
    });
  }

  return (
    <div class='h-100% m-0 p-0 color-white bg-[#1e1e1e] min-w-50 of-scroll font-[FiraCode]'>
      <div class='flex justify-evenly w-32 text-6'>
        <button aria-label='new file' onclick={newFile}>
          
        </button>
        {/* <button aria-label='new folder'></button> */}
      </div>
      <ul class='py-4 text-3 list-none'>{props.files.render(props.setFile)}</ul>
    </div>
  );
}
