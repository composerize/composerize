import React from 'react';
import styled from 'styled-components/macro';

import Section from './Section';
import TextInput from './TextInput';
import Code from './Code';

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
                            Paste your{' '}
                            <a
                                href="https://docs.docker.com/engine/reference/run/"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                docker run
                            </a>{' '}
                            command into the box below!
                        </p>
                    </Blurb>
                    <TextInput command={props.command} onInputChange={props.onInputChange} />
                </div>
                {/* <div
                    css={`
                        padding-left: 22px;
                        padding-bottom: 18px;
                        margin-top: -8px;
                    `}
                >
                    <CarbonAds />
                </div> */}
            </div>
        </Section>
    );
}
