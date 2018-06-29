# csv2json

a scaffold to manage app configs with csv.

## Why

For many reasons we want to seperate some config files and let others to manage them.  
And many of them wish to use table edit softwares like Excel or Numbers.  
Binaries like `xls` an `xlsx` is a good choice, but under git, the commits with binaries may overwrite each other.  
`csv` is a text-based format, but can be managed well with table softwares, so we use `csv`.

## How

- clone the project.
- edit `csv` file under `./csv/`.
- generate `json` files with `node index.js`, they are under `./json/`.
- use this project as a submodule of your app.

Multi folders under `./csv/` are supported.

## About

We use node-xlsx which is based on [js-xlsx](https://github.com/SheetJS/js-xlsx).  
There're some issues:

- `csv` generated with Numbers is encoded with `UTF-8`, but `js-xlsx` only support `UTF-8 with BOM`,  
by setting `codepage` option to 650001, [check this issue](https://github.com/SheetJS/js-xlsx/issues/1060). 
All `csv` files will be add a header `u/FEFF` after running ` node index.js`.
- `csv` generated from Numbers and Excel are in different standard.
