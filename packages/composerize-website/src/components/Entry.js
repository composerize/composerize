import React from 'react';
import styled from 'styled-components/macro';

import Section from './Section';
import TextInput from './TextInput';
import Code from './Code';
import CarbonAds from './CarbonAds';

const Blurb = styled.div`
    line-height: 32px;
    margin-top: -10px;
    margin-bottom: 10px;
`;

export default function Entry(props) {
    return (
        <Section topPadding>
            <div
                css={`
                    display: flex;
                `}
            >
                <div
                    css={`
                        flex-grow: 1;
                    `}
                >
                    <Blurb>
                        <p>
                            Say goodbye to sprawling docker commands and say hello to <Code>$ docker-compose up</Code>{' '}
                            :)
                        </p>
                        <p>
                            Want to convert from Docker compose file formats ? Try{' '}
                            <a href="http://composeverter.com" rel="noopener noreferrer" target="_blank">
                                Composeverter
                            </a>
                        </p>
                        <p>
                            Paste your{' '}
                            <a
                                href="https://docs.docker.com/engine/reference/run/"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                docker run
                            </a>{' '}
                            command(s) into the box below!
                        </p>
                        <p>
                            Looking for the reverse (Docker compose to <Code>docker run</Code> command(s)) ? Try{' '}
                            <a href="https://decomposerize.com" rel="noopener noreferrer" target="_blank">
                                Decomposerize
                            </a>
                        </p>
                    </Blurb>
                    <TextInput value={props.command} rows={3} onInputChange={props.onCommandInputChange} />
                    <details
                        css={`
                            margin-bottom: '1em';
                        `}
                    >
                        <summary>
                            Click and paste to append <Code>docker run</Code> commands to an existing Docker compose
                            file
                        </summary>
                        <TextInput value={props.compose} rows={10} onInputChange={props.onComposeInputChange} />
                    </details>
                </div>
                <div
                    css={`
                        padding-left: 22px;
                        padding-bottom: 18px;
                        margin-top: -8px;
                    `}
                >
                    <CarbonAds />
                </div>
            </div>
        </Section>
    );
}
