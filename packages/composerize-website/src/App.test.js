/**
 * @jest-environment jsdom
 */

/* eslint-env jest */

import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

jest.mock('normalize.css', () => ({}));
jest.mock('html5-boilerplate/dist/css/main.css', () => ({}));
jest.mock('./App.css', () => ({}));

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
});
