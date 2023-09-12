# Gleam Remote Compile API

*Compile Gleam through the web*

## Usage


```ts
// {FILE_PATH: FILE_CONTENT}
const files: Record<string, string> = {
    "/src/main.gleam": 
    `import gleam/io

    pub fn main() {
        io.print("hello gleam!")
    }`
}

// {PACKAGE_NAME: VERSION}
const dependencies: Record<string, string> = {
    gleam_stdlib: "0.30.2"
}

const body: Body = {files, dependencies};

const res = await fetch(
    URL,
    {
        body: JSON.stringify(body),
        method: 'POST'
    }
)

const response: DataResponse = await res.json();

```

```ts
interface Body {
    files: Record<string, string>;
    dependencies: Record<string, string>;
}

type DataResponse = |
  {
    /** File paths and file contents */
    ok: Record<string, string>
  } | 
  { 
    /** Error message */
    error: string,
    /** Source of the error message */
    type: "external" | "gleam",
  }

```

---
## Acknowledgements

Thanks to [JohnDoneth](https://github.com/JohnDoneth) for the original [Gleam playground](https://github.com/JohnDoneth/gleam-playground) for me to learn how to use compiler-wasm, [zebp](https://github.com/zebp) for the [streaming-tar](https://github.com/zebp/streaming-tar) library (the only lib I could find that extracts tarballs on the web), [hex.pm](https://hex.pm) for the package repository and great api, and the [Gleam Community](https://discord.gg/hjgWjH7ktC).
