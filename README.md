# Sercolex

TODO: Write readme.

Small boilerplate for React + Redux + Webpack + ReactHMR + SemanticUI + Koa.

Based on [this tutorial](http://blog.joanboixados.com/building-a-boilerplate-for-a-koa-redux-react-application-including-webpack-mocha-and-sass/), updated for working as Sep 2016.

## TODO:

- Add redux example

## Requirements

- NodeJS >= v6.6.0
- npm >= 30.10.7

## Installation

For development:

First:
```
npm install
```
When being asked by `semantic-ui`'s install script to give location, enter `app/semantic`.

Then, we should build `semantic-ui` dist files:

```
cd app/semantic
../../node_modules/gulp/bin/gulp.js build
```

To check if everything builds correctly, go back to project root directory, and run

```
npm run build
```

## Usage

For running a webpack development server just

```
npm start
```
and point your browser to `localhost:8080`.