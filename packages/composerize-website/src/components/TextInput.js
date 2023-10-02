import React, { Component } from 'react';
import styled from 'styled-components';

import CBox from './CBox';

const StyledInput = styled.textarea`
    ${CBox}
`;

export default class TextInput extends Component {
    handleChange(e) {
        this.props.onInputChange(e.target.value);
    }

    render() {
        const { command } = this.props;

        return (
            <StyledInput
                rows={3}
                value={command}
                onChange={e => {
                    this.handleChange(e);
                }}
            />
        );
    }
}
