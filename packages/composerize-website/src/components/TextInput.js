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
        const { value, rows } = this.props;

        return (
            <StyledInput
                rows={rows ?? 1}
                value={value}
                onChange={e => {
                    this.handleChange(e);
                }}
            />
        );
    }
}
