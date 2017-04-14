const path = require("path")

const config = {
    entry: "./src_ts/program.ts",
    output: {
	    filename: "bundle.js",
	    path: path.resolve(__dirname, "dist")
    },
    
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader"
            }
        ]
    },

    resolve: {
	    extensions: [".ts", ".tsx", ".js"]
    },

    //devtool: "inline-source-map"
}

module.exports = config