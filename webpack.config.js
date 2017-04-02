const path = require("path")
const webpack = require("webpack")

module.exports = {
    context: path.resolve(__dirname, "./src_js"),
    entry: {
        app: "./program.js"
    },
    output: {
        path: path.resolve(__dirname, "./build"),
        filename: "bundle.js"
    }
}