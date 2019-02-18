# wp-readme-to-markdown
> Converts WP readme.txt file to markdown (readme.md)

This package is the node port of [stephenharris/wp-readme-to-markdown](https://github.com/stephenharris/wp-readme-to-markdown/tree/2.0.1) Grunt plugin.

## Install

```sh
npm install wp-readme-to-markdown --save-dev
```

## Add npm scripts command

```js
...
"scripts": {
  ...
  "generate-md": "wp-readme-to-md --screenshot-url=https://ps.w.org/dokan-lite/assets/{screenshot}.png"
},
...
```

## Generate README.md file
```sh
npm run generate-md
```
