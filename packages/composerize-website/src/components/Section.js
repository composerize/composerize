import React from 'react';
import styled from 'styled-components';

const Section = styled.div`
    margin: 0px 50px;
    width: 100%;
    font-family: 'Raleway', sans-serif;
`;

const Spacer = styled.div`
    display: flex;
    padding-top: ${props => (props.topPadding ? '30' : '0')}px;
    border-top: ${props => (props.border ? '1' : '0')}px solid #dcd4d8;
`;

export default ({ children, topPadding, border }) => (
    <Spacer topPadding={topPadding} border={border}>
        <Section>{children}</Section>
    </Spacer>
);
