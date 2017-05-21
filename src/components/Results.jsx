import React, { Component } from "react";
import styled from "styled-components";
import CBox from "./CBox";
import Copy from "./Copy";

const ResultsBox = styled.div`
    ${CBox}
`;

const Contents = styled.div`
    white-space: pre;
`;

export default class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveringOverResults: false
        };
    }

    mouseOverResults() {
        this.setState({ hoveringOverResults: true });
    }

    mouseLeaveResults() {
        this.setState({ hoveringOverResults: false });
    }

    render() {
        return (
            <ResultsBox
                onMouseEnter={() => {
                    this.mouseOverResults();
                }}
                onMouseLeave={() => {
                    this.mouseLeaveResults();
                }}
            >
                {this.state.hoveringOverResults &&
                    <Copy output={this.props.output} />}
                <Contents>{this.props.output}</Contents>
            </ResultsBox>
        );
    }
}
