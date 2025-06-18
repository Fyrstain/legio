const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { override, addWebpackPlugin } = require("customize-cra");

module.exports = override(
  addWebpackPlugin(
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            "node_modules/@fyrstain/hl7-front-library/public/assets",
          ),
          to: "assets",
        },
      ],
    }),
  ),
);
