import React, { useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';

const StyledTextareaWrapper = styled.div`
    border: 2px solid #cacaca;
    border-radius: 6px;
    width: 100%;
    margin-bottom: 30px;
`;

const sharedStyle = css`
    margin: 0;
    border-radius: 0;
    resize: none;
    outline: none;
    padding: 10px 0;
    background: #fef4f7;
    color: #28282f;
    height: 200px;
    font-size: 13px;
    font-family: 'Ubuntu Mono', monospace;
    line-height: 1.2;
    &:focus-visible {
        outline: none;
    }
`;

const StyledTextarea = styled.textarea`
    ${sharedStyle}
    padding-left: 3.5rem;
    width: calc(100% - 3.5rem);
    border: none;
    &::placeholder {
        color: grey;
    }
`;

const StyledNumbers = styled.div`
    ${sharedStyle}
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
    text-align: right;
    box-shadow: none;
    position: absolute;
    color: grey;
    border: none;
    background-color: lightgrey;
    padding: 10px;
    width: 1.5rem;
`;

export default ({ value, numOfLines, onValueChange, placeholder = 'Enter Message', name, erroredLines }) => {
    const lineCount = useMemo(() => value.split('\n').length, [value]);
    const linesArr = useMemo(
        () => Array.from({ length: Math.max(numOfLines, lineCount) }, (_, i) => i + 1),
        [lineCount, numOfLines],
    );

    const lineCounterRef = useRef(null);
    const textareaRef = useRef(null);

    const handleTextareaChange = (event) => {
        onValueChange(event.target.value);
    };

    const handleTextareaScroll = () => {
        if (lineCounterRef.current && textareaRef.current) {
            lineCounterRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    return (
        <StyledTextareaWrapper>
            <StyledNumbers ref={lineCounterRef}>
                {linesArr.map((count) => {
                    let color = 'inherit';
                    if (count <= lineCount)
                        if ((erroredLines || []).includes(count)) color = 'red';
                        else color = 'blue';
                    return (
                        <div
                            style={{
                                color,
                            }}
                            key={count}
                            className={'line'}
                        >
                            {count}
                        </div>
                    );
                })}
            </StyledNumbers>
            <StyledTextarea
                name={name}
                onChange={handleTextareaChange}
                onScroll={handleTextareaScroll}
                placeholder={placeholder}
                ref={textareaRef}
                value={value}
                wrap="off"
            />
        </StyledTextareaWrapper>
    );
};
