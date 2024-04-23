import React from 'react';
import styled from 'styled-components';

import Section from './Section';

const Container = styled.ul`
    line-height: 36px;
    list-style-type: none;
    font-family: 'Raleway', sans-serif;
    font-size: 12px;
    padding: 0;
    margin: 0;
`;

const Item = styled.li`
    float: left;

    &:not(:first-child):before {
        content: '-';
        margin-left: 9px;
        margin-right: 9px;
    }
`;

export default () => (
    <Section border>
        <Container>
        </Container>
    </Section>
);
