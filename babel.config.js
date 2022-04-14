module.exports = (api) => {
    const isTest = process.env.NODE_ENV === 'test';
    const babelEnv =
        typeof process.env.BABEL_ENV !== 'undefined' ? process.env.BABEL_ENV : 'commonjs';

    api.cache(false);

    return {
        presets: [
            [
                '@babel/env',
                {
                    modules: !isTest && ['modules'].indexOf(babelEnv) !== -1 ? false : 'commonjs',
                },
            ],
            '@babel/react',
            '@babel/typescript',
        ],
        ignore: [],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['.'],
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            ],
            // '@babel/plugin-transform-modules-commonjs',
            'babel-plugin-styled-components',
            '@babel/plugin-proposal-object-rest-spread',
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            '@babel/plugin-proposal-export-default-from',
            '@babel/plugin-syntax-export-namespace-from',
            '@babel/plugin-transform-react-constant-elements',
            ['@babel/plugin-transform-runtime', { runtime: false }],
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-optional-chaining',
            ['@babel/plugin-proposal-private-methods', { loose: true }],
            ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
        ],
        env: {
            es: {
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: false,
                        },
                    ],
                ],
            },
        },
    };
};
