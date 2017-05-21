import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: block;
  position: relative;
  background: #848850;
  color: #fff;
  border-bottom: 2px solid #5f561b;
`;

const Title = styled.div`
  display: inline-block;
  margin: 14px 20px;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 40px;
`;

const Buttons = styled.div`
  position: absolute;
  bottom: 7px;
  right: 10px;
`;

const GitHubIFrame = styled.iframe`
  overflow: none
  width: 80px;
  height: 20px;
  border: 0;
  margin-right: 5px;
`;

export default () => (
    <Container>
        <Title>$ composerize</Title>
        <Buttons>
            <GitHubIFrame src="https://ghbtns.com/github-btn.html?user=magicmark&repo=composerize&type=star&count=true" />
            <a
                href="https://twitter.com/share"
                className="twitter-share-button"
                data-url="http://composerize.com"
                data-text="Turn arbitrary docker run commands into docker-compose files!"
                data-dnt="true"
            >
                Tweet
            </a>
        </Buttons>
    </Container>
);
