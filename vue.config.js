module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'),
      },
    },
  },
};