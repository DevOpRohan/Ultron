import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Stack,
  Text,
  TextField,
  getTheme,
  mergeStyleSets
} from "@fluentui/react";
import { useBoolean } from "@uifabric/react-hooks";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { FiSend, FiTrash2, FiCopy } from "react-icons/fi";

const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const chatContainerRef = useRef(null);

  const handleUserMessageChange = (event) => {
    setUserMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (userMessage) {
      const botMessage = { message: "Typing...", isBot: true };
      setChatMessages((prevChatMessages) => [
        ...prevChatMessages,
        { message: userMessage, isBot: false },
        botMessage
      ]);
      setIsButtonClicked(true);
    }
  };

  const fetchBotMessage = useCallback(() => {
    fetch(`https://walrus-app-hodhq.ondigitalocean.app/ultron?q=${userMessage}`)
      .then((response) => response.text())
      .then((data) => {
        const botMessage = { message: data, isBot: true };
        setChatMessages((prevChatMessages) => [
          ...prevChatMessages.slice(0, -1),
          botMessage
        ]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [userMessage]);

  useEffect(() => {
    if (isButtonClicked) {
      fetchBotMessage();
      setIsButtonClicked(false);
      setUserMessage("");
    }
  }, [isButtonClicked, fetchBotMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // const formatMessage = (message) => {
  //   return message.split("```").map((snippet, index) => {
  //     if (index % 2 === 1) {
  //       const languageMatch = snippet.match(/^(\w+)\n/);
  //       const language = languageMatch ? languageMatch[1] : null;
  //       const cleanedSnippet = snippet.replace(/^\w+\n/, "");
  //       const highlightedSnippet = hljs.highlightAuto(
  //         cleanedSnippet,
  //         language ? [language] : null
  //       ).value;
  //       return (
  //         <div
  //           key={index}
  //           style={{
  //             position: "relative",
  //             backgroundColor: "#f1f1f1",
  //             border: "1px solid #ccc",
  //             borderRadius: "3px",
  //             padding: "8px",
  //             marginBottom: "8px"
  //           }}
  //         >
  //           <pre
  //             style={{
  //               overflowX: "auto",
  //               whiteSpace: "pre-wrap",
  //               wordWrap: "break-word"
  //             }}
  //             dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
  //           ></pre>
  //           <FiCopy
  //             style={{
  //               cursor: "pointer",
  //               position: "absolute",
  //               right: "8px",
  //               top: "8px",
  //               color: "#0078d4",
  //               fontSize: "1.2rem"
  //             }}
  //             onClick={() => {
  //               navigator.clipboard.writeText(cleanedSnippet);
  //             }}
  //           />
  //         </div>
  //       );
  //     } else {
  //       return <span key={index}>{snippet.replace(/\n/g, <br />)}</span>;
  //     }
  //   });
  // };
  const formatMessage = (message) => {
    return message.split("```").map((snippet, index) => {
      if (index % 2 === 1) {
        const languageMatch = snippet.match(/^(\w+)\n/);
        const language = languageMatch ? languageMatch[1] : null;
        const cleanedSnippet = snippet.replace(/^\w+\n/, "");
        const highlightedSnippet = hljs.highlightAuto(
          cleanedSnippet,
          language ? [language] : null
        ).value;
        return (
          <div
            key={index}
            style={{
              position: "relative",
              backgroundColor: "#f1f1f1",
              border: "1px solid #ccc",
              borderRadius: "3px",
              padding: "8px",
              marginBottom: "8px"
            }}
          >
            <pre
              style={{
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word"
              }}
              dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
            ></pre>
            <FiCopy
              style={{
                cursor: "pointer",
                position: "absolute",
                right: "8px",
                top: "8px",
                color: "#0078d4",
                fontSize: "1.2rem"
              }}
              onClick={() => {
                navigator.clipboard.writeText(cleanedSnippet);
              }}
            />
          </div>
        );
      } else {
        return (
          <span key={index}>
            {snippet.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </span>
        );
      }
    });
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const theme = getTheme();
  const classNames = mergeStyleSets({
    title: {
      fontWeight: "bold",
      fontSize: "2rem",
      color: theme.palette.themePrimary
    },
    inputContainer: {
      width: "100%",
      display: "flex",
      alignItems: "center"
    },
    inputBox: {
      flexGrow: 1,
      marginRight: "8px"
    }
  });

  return (
    <Stack
      horizontalAlign="center"
      verticalAlign="center"
      verticalFill
      styles={{
        root: {
          width: "100%",
          height: "100vh",
          margin: "0 auto",
          textAlign: "left",
          color: "#605e5c",
          background: "#f3f2f1"
        }
      }}
      gap={15}
    >
      <Text className={classNames.title}>Ultron</Text>

      <Stack.Item>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "70vh",
            overflow: "auto"
          }}
          ref={chatContainerRef}
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: message.isBot ? "flex-start" : "flex-end",
                marginBottom: "8px"
              }}
            >
              <Stack
                styles={{
                  root: {
                    backgroundColor: message.isBot ? "#e1dfdd" : "transparrent",
                    padding: "8px",
                    borderRadius: "5px"
                  }
                }}
              >
                <Text>{formatMessage(message.message)}</Text>
              </Stack>
            </div>
          ))}
        </div>
      </Stack.Item>

      <Stack horizontal gap={15} styles={{ root: { width: "100%" } }}>
        <FiTrash2
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            color: theme.palette.redDark,
            alignSelf: "center"
          }}
          onClick={clearChat}
        />
        <TextField
          className={classNames.inputBox}
          value={userMessage}
          onChange={handleUserMessageChange}
          autoComplete="off"
          autoFocus
          multiline
          resizable={false}
          underlined
          placeholder="Type..."
        />
        <FiSend
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            color: theme.palette.themePrimary,
            alignSelf: "center"
          }}
          onClick={handleSendMessage}
        />
      </Stack>
    </Stack>
  );
};

export default Chat;
