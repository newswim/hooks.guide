import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useRef,
  useLayoutEffect
} from "react";
import { Link } from "react-router-dom";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet";
import throttle from "lodash.throttle";
import { createCache, createResource } from "react-cache";
import { execute } from "./utils/executor";
import { fetchDoc } from "./utils/fetcher";
import { parse } from "./utils/md-parser";
import Editor from "./editor";
import Contributors from "./contributors";
import TabFrame from "./tab-frame";
import { highlightColor } from "./theme";
import LogoComp from "./logo";

window.React = React;
const cache = createCache();
const docsResource = createResource(fetchDoc);

const Container = styled.div`
  max-width: 900px;
  flex-direction: column;
  flex: 1 1 auto;
  padding-left: 70px;
  @media (max-width: 700px) {
    padding-left: 10px;
  }
`;

const Reference = styled.a`
  font-size: 15px;
  text-decoration: none;
  color: ${highlightColor};
`;

const ImproveThisDoc = styled.a`
  text-decoration: none;
  color: ${highlightColor};
  font-size: 14px;
`;

const Footer = styled.div`
  display: flex;

  justify-content: flex-end;
  margin-bottom: 30px;
`;

const Console = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #002240;
  padding: 7px;
  border-radius: 0 5px 5px 5px;
  color: white;
  max-width: 900px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  font-size: 25px;
  a {
    color: black;
    text-decoration: none;
  }
  display: none;
  @media (max-width: 700px) {
    display: block;
    margin-bottom: 10px;
  }
`;

const RepoUrl =
  "https://github.com/Raathigesh/hooks.guide/tree/master/public/docs/";

export default function Preview(props) {
  const doc = docsResource.read(cache, props.item.path);
  const {
    name,
    reference,
    hook = null,
    usage,
    contributors,
    description
  } = parse(doc);

  const [nameValue /*, setName */] = useState(name);
  const [hookValue, setHook] = useState(hook);
  const [usageValue, setUsage] = useState(usage);

  useEffect(() => window.scrollTo(0, 0), [props.item]);

  useEffect(
    () => {
      const codeToExecute = `${hookValue ? hookValue : ""}${usageValue}`;

      execute(codeToExecute, {
        useState,
        ReactDOM,
        useCallback,
        useEffect,
        useReducer,
        useRef,
        useLayoutEffect,
        throttle
      });
    },
    [hookValue, usageValue]
  );

  return (
    <Container>
      <Helmet>
        <meta property="og:title" content={`hooke.guide - ${name}`} />
        <meta
          property="og:url"
          content={`https://hooks.guide/${props.item.path}`}
        />
        <meta property="og:description" content={description} />
      </Helmet>
      <Logo>
        <Link to="/">
          <LogoComp size={25} />
        </Link>
      </Logo>
      <Header>
        <h1>{nameValue}</h1>
        <Reference href={reference} target="_blank">
          {reference}
        </Reference>
      </Header>
      <div dangerouslySetInnerHTML={{ __html: description }} />
      {hookValue && (
        <React.Fragment>
          <Editor
            code={hookValue}
            onChange={setHook}
            title="💡 Implementation"
          />
        </React.Fragment>
      )}
      <Editor code={usageValue} onChange={setUsage} title="🚀 Usage" />

      <TabFrame title="⚡Preview">
        <div id="preview-root" />
      </TabFrame>

      <TabFrame title="🚨 console">
        <Console id="console-container" />
      </TabFrame>
      <Footer>
        <ImproveThisDoc href={`${RepoUrl}${props.item.path}`} target="_blank">
          <span role="img" aria-label="lipstick">💄</span> Improve this hook
        </ImproveThisDoc>
      </Footer>
      <Contributors contributors={contributors} />
    </Container>
  );
}
