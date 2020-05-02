import React, { Component } from 'react';
import styled from 'styled-components';
import CopyToClipboard from 'react-copy-to-clipboard';
import ToolTip from 'react-portal-tooltip';

const StyledButton = styled.a`
    float: right;
    margin: -10px -13px;
    background: #e0e0e0;
    border-radius: 0px 4px 0px 6px;
    border: 2px solid #cacaca;
    border-top: 0;
    border-right: 0;
    cursor: pointer;

    & i {
        color: #404040;
        padding: 10px 13px;
    }
`;

const toolTipBodyStyle = {
    style: {
        backgroundColor: '#222',
        color: '#eee',
        textAlign: 'center',
        padding: '7px 10px',
        fontSize: '11px',
        borderRadius: '6px',
        boxShadow: 'none',
    },
    arrowStyle: {
        color: '#222',
    },
};

export default class Copy extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isTooltipActive: false,
            copied: false,
        };
    }

    onCopy() {
        this.setState({ copied: true });
    }

    showTooltip() {
        this.setState({ isTooltipActive: true });
    }

    hideTooltip() {
        this.setState({ isTooltipActive: false });
    }

    render() {
        const tipText = this.state.copied ? 'Copied!' : 'Copy';

        return (
            <StyledButton
                data-tip={tipText}
                data-place="top"
                data-effect="solid"
                data-for="copyToClipboard"
            >
                <CopyToClipboard
                    text={this.props.output}
                    onCopy={() => {
                        this.onCopy();
                    }}
                >
                    <i
                        id="copyToClipboard"
                        className="fa fa-clipboard fa-2x"
                        aria-hidden="true"
                        onMouseEnter={() => {
                            this.showTooltip();
                        }}
                        onMouseLeave={() => {
                            this.hideTooltip();
                        }}
                    />
                </CopyToClipboard>
                <ToolTip
                    active={this.state.isTooltipActive}
                    position="top"
                    arrow="center"
                    parent="#copyToClipboard"
                    tooltipTimeout={0}
                    style={toolTipBodyStyle}
                >
                    {tipText}
                </ToolTip>
            </StyledButton>
        );
    }
}
