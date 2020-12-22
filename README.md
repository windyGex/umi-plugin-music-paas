# umi-plugin-music-paas

[![NPM version](https://img.shields.io/npm/v/umi-plugin-music-paas.svg?style=flat)](https://npmjs.org/package/umi-plugin-music-paas)
[![NPM downloads](http://img.shields.io/npm/dm/umi-plugin-music-paas.svg?style=flat)](https://npmjs.org/package/umi-plugin-music-paas)



## Install

```bash
# or yarn
$ npm install
```

```bash
$ npm run build --watch
$ npm run start
```

## Usage

Configure in `.umirc.js`,

```js
export default {
  plugins: [
    ['umi-plugin-music-paas'],
  ],
}
```

## Options

```js
export default {
  paas: {
    isSubApp: true, // 是否是子应用， 如果是子应用将会注入ice stark的代码
    needModifyRoutes: true, // 是否需要修改基准路由路径(basename)
  },
  plugins: [
    ['umi-plugin-music-paas'],
  ],
}
```

## LICENSE

MIT
