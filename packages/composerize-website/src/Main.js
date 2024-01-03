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
            command: defaultCommand,
            compose: '',
            version: 'latest',
            output: Composerize(defaultCommand),
            error: '',
        };
        this.onCommandInputChange = this.onCommandInputChange.bind(this);
        this.onComposeInputChange = this.onComposeInputChange.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
    }

    onComposeInputChange(value) {
        this.setState(() => ({
            compose: value,
        }));
        this.updateConversion();
    }

    onCommandInputChange(value) {
        this.setState(() => ({
            command: value,
        }));
        this.updateConversion();
    }

    onSelectChange(value) {
        this.setState(() => ({
            version: value.value,
        }));
        this.updateConversion();
    }

    updateConversion() {
        this.setState((state) => {
            try {
                return {
                    output: Composerize(state.command, state.compose, state.version),
                    error: '',
                };
            } catch (e) {
                return {
                    error: e.toString(),
                };
            }
        });
    }

    render() {
        return (
            <div>
                <Header />
                <Entry
                    command={this.state.command}
                    compose={this.state.compose}
                    version={this.state.version}
                    onSelectChange={this.onSelectChange}
                    onCommandInputChange={this.onCommandInputChange}
                    onComposeInputChange={this.onComposeInputChange}
                />
                <Output output={this.state.output} error={this.state.error} />
                <Footer />
            </div>
        );
    }
}
