import React from 'react';
import styled from 'styled-components/macro';
import Select from 'react-select';

import Section from './Section';
import TextInput from './TextInput';
import LinedTextInput from './LinedTextInput';
import Code from './Code';
import CarbonAds from './CarbonAds';

const Blurb = styled.div`
    line-height: 32px;
    margin-top: -10px;
    margin-bottom: 10px;
`;

export default function Entry(props) {
    const options = [
        { value: 'v2x', label: 'V2 - 2.x' },
        { value: 'v3x', label: 'V2 - 3.x' },
        { value: 'latest', label: 'CommonSpec' },
    ];
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
                            Looking for the reverse (Docker compose to <Code>docker run</Code> command(s)) ? Try{' '}
                            <a href="https://decomposerize.com" rel="noopener noreferrer" target="_blank">
                                Decomposerize
                            </a>
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
                    </Blurb>
                    <TextInput value={props.command} rows={3} onInputChange={props.onCommandInputChange} />
                    <div
                        css={`
                            display: flex;
                            gap: 20px;
                            align-items: center;
                            margin-top: 10px;
                        `}
                    >
                        <div
                            css={`
                                flex: 1;
                            `}
                        >
                            <span>Docker Compose version:</span>
                            <Select
                                onChange={props.onSelectChange}
                                options={options}
                                value={options.filter(({ value }) => value === props.version)}
                            />
                        </div>
                        <div
                            css={`
                                flex: 1;
                            `}
                        >
                            <span>Indentation:</span>
                            <Select
                                onChange={props.onIndentChange}
                                options={[
                                    { value: 2, label: '2 spaces' },
                                    { value: 4, label: '4 spaces' },
                                    { value: 8, label: '8 spaces' },
                                ]}
                                value={[
                                    { value: 2, label: '2 spaces' },
                                    { value: 4, label: '4 spaces' },
                                    { value: 8, label: '8 spaces' },
                                ].filter(({ value }) => value === props.indent)}
                            />
                        </div>
                    </div>
                    <details
                        style={{
                            marginBottom: '1em',
                            marginTop: '1em',
                        }}
                    >
                        <summary>
                            Want to merge with a Docker compose file ? Click here and paste into the box below your
                            existing <Code>compose.yaml</Code> to append <Code>docker run</Code> commands to it
                        </summary>
                        <LinedTextInput
                            value={props.compose}
                            numOfLines={10}
                            placeholder={'Enter compose.yaml content you want to merge with above command(s)'}
                            onValueChange={props.onComposeInputChange}
                            erroredLines={props.erroredLines}
                        />
                    </details>
                    <pre style={{ color: 'red' }}>{props.error}</pre>
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
