const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const yargs = require('yargs');

export default api => {
  // 增加导入入口
  api.addEntryImports(() => {
    return {
      source: '@ice/stark-app',
      specifier:
        '{ isInIcestark, getMountNode, registerAppEnter, registerAppLeave }',
    };
  });

  api.addEntryImports(() => {
    return {
      source: 'react-dom',
      specifier: 'ReactDOM',
    };
  });

  // 增加运行时
  api.addRuntimePlugin(() => '@@/plugin-paas/runtime');


  // 增加依赖
  api.addDepInfo(() => {
    return [{
        name: '@ice/stark-app',
        range: '1.x',
        alias: [require.resolve('@ice/stark-app')],
    }]
  })

  // 增加入口代码
  api.addEntryCode(() => {
    return `
    if (isInIcestark()) {
      registerAppEnter(() => {
        getClientRender()();
      });
      registerAppLeave(() => {
        ReactDOM.unmountComponentAtNode(getMountNode());
      });
    }
    `;
  });

  // 修改webpack配置打包为umd的格式
  api.chainWebpack((config, { webpack }) => {
    config.output.libraryTarget('umd').library(`${api.pkg.name}`);
    const usingWebpack5 = webpack.version?.startsWith('5');
    if (!usingWebpack5) {
      config.output.jsonpFunction(`webpackJsonp_${api.pkg.name}`);
    }
    return config;
  });

  let tempRoutes;
  // 修改base routes 为pkg name
  // 同时输出扁平的路径给paas平台消费
  const flattern = (arr = []) => {
    return arr.reduce((newArr, currentElement) => {
      const { routes, ...others } = currentElement;
      newArr.push(others);
      newArr = newArr.concat(flattern(routes));
      return newArr;
    }, []);
  };
  // 修改路由，为路由默认加上前缀
  api.modifyRoutes(routes => {
    const base = api.pkg.name;
    if (!base) {
      throw new Error('package.json中name字段为空');
    }
    const modifyRoute = routes => {
      return routes.map(route => {
        if (route.path === '/') {
          route.path = `/${base}`;
        } else if (route.path.startsWith('/')) {
          route.path = `/${base}${route.path}`;
        }
        if (route.routes) {
          route.routes = modifyRoute(route.routes);
        }
        return route;
      });
    };
    const modifiedRoutes = modifyRoute(routes);
    tempRoutes = flattern(modifiedRoutes);
    return modifiedRoutes;
  });

  // 写入路由文件
  api.onGenerateFiles(() => {
    fs.writeFileSync(
      path.join(api.cwd, '.routes.json'),
      JSON.stringify(tempRoutes),
    );
    // 写入运行时文件
    api.writeTmpFile({
      path: 'plugin-paas/runtime.js',
      content: fs.readFileSync(
        path.join(__dirname, './runtime.js.tpl'),
        'utf-8',
      ),
    });
  });

  api.modifyConfig(memo => {
    return {
      ...memo,
      ...{
        devtool: 'source-map',
        hash: true,
        manifest: {},
        outputPath: 'build',
      },
    };
  });

  // 构建完成后
  api.onBuildComplete(({ err }) => {
    if (!err) {
      const args = yargs(process.argv).argv;
      const id = (args.env || {}).id;
      const buildPath = path.join(api.cwd, 'build');
      const appJsonPath = path.join(api.cwd, 'appJson.json');

      fse.copyFileSync(path.join(buildPath, 'asset-manifest.json'), appJsonPath);

      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
      // write new app.json
      const newAppJson = {};
      newAppJson.files = appJson;
      newAppJson.entrypoints = Object.keys(appJson)
        .filter(name => /\.js$|\.css$/.test(name))
        .map(name => appJson[name].replace(/^\//, ''));
      newAppJson.id = id;

      function getRoutes(filePath) {
        const routes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return routes.map(route => {
          return {
            path: route.path,
            name: route.name,
            component: route.component,
          };
        });
      }
      const umiPaaSRoutesPath = path.join(api.cwd, '.routes.json');
      newAppJson.routes = getRoutes(umiPaaSRoutesPath);
      fs.writeFileSync(appJsonPath, JSON.stringify(newAppJson, null, 2));
    }
  });
};
