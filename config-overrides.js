const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { override, addWebpackPlugin } = require('customize-cra');

module.exports = {
    webpack: override(
        addWebpackPlugin(
            new CopyPlugin({
                patterns: [
                    { from: path.resolve(__dirname, 'node_modules/@fyrstain/hl7-front-library/public/assets'), to: 'assets' },
                ],
            })
        )
    ),
    jest: (config) => {
        // keycloak-js v26 is published as ESM and must be transpiled by Jest.
        config.transformIgnorePatterns = [
            'node_modules/(?!keycloak-js/)'
        ];

        return config;
    },
};
