module.exports = {
    babel: {
        plugins: [
            ...(process.env.NODE_ENV === 'production'
                ? [
                      [
                          "babel-plugin-transform-remove-console",
                          { exclude: ["error", "warn"] }, // error と warn は残す場合
                      ],
                  ]
                : []),
        ],
    },
};
