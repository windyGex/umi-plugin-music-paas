import { defineConfig } from 'umi';

export default defineConfig({
  paas: {
    isSubApp: true,
    needModifyRoutes: true,
  },
  plugins: [require.resolve('../lib')],
});
