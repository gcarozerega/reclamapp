import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from "react-dom";
import RouterContainer from './components/RouterContainer.jsx';

main();
function main() {
    const app = document.createElement('div');
    document.body.appendChild(app);

    ReactDOM.render(
      <AppContainer><RouterContainer /></AppContainer>, app
    )

    if (module.hot) {
        module.hot.accept('./components/RouterContainer.jsx', () => {
            ReactDOM.render(
                <AppContainer component={require('./components/RouterContainer.jsx').default} />,
                app
            );
        });
    }
}
