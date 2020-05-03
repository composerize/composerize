import React, { Component } from 'react';
import Composerize from 'composerize';
import 'normalize.css';
import 'html5-boilerplate/dist/css/main.css';
import './App.css';

import Header from './components/Header';
import Entry from './components/Entry';
import Output from './components/Output';
import Footer from './components/Footer';

const defaultCommand =
    'docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx';

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: defaultCommand,
            output: Composerize(defaultCommand),
        };
        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(value) {
        this.setState({
            input: value,
            output: Composerize(value),
        });
    }

    render() {
        return (
            <div>
                <Header />
                <Entry command={this.state.input} onInputChange={this.onInputChange} />
                <Output output={this.state.output} />
                <Footer />
            </div>
        );
    }
}
