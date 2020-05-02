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
            <Item>
                Composerize (built with{' '}
                <a
                    rel="noopener noreferrer"
                    href="https://www.npmjs.com/package/composerize"
                    target="_blank"
                >
                    v{process.env.REACT_APP_COMPOSERIZE_VERSION}
                </a>
                )
            </Item>
            <Item>
                <a
                    rel="noopener noreferrer"
                    href="http://twitter.com/mark_larah"
                    target="_blank"
                >
                    @mark_larah
                </a>
            </Item>
            <Item>
                Want to help improve composerize? Open an{' '}
                <a
                    rel="noopener noreferrer"
                    href="https://github.com/magicmark/composerize/issues"
                    target="_blank"
                >
                    issue on Github
                </a>
                !
            </Item>
        </Container>
    </Section>
);
