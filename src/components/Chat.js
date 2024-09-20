import { useRef, useState, useEffect } from "react";

const ChatBox = ({
  chatMessages,
  displayNamesForChat,
  collapsed,
  setCollapsed,
}) => {
  const messageBoxRef = useRef();
  const textInputRef = useRef();
  const displayNameInputRef = useRef();
  const [displayNameIsSet, setDisplayNameIsSet] = useState(false);
  const [groupedMessages, setGroupedMessages] = useState([]);

  const [setNameButtonEnabled, setSetNameButtonEnabled] = useState(false);

  const [newMsg, setNewMsg] = useState(false);

  useEffect(() => {
    if (displayNamesForChat[window.socket.id]) {
      setDisplayNameIsSet(true);
    }
  }, [displayNamesForChat]);

  useEffect(() => {
    let displayNamesAndMessages = "";
    chatMessages.sort((a, b) => a.timestamp - b.timestamp);
    let grouped = [];
    for (let i = 0; i < chatMessages.length; i++) {
      const chatMsg = chatMessages[i];
      const displayName = displayNamesForChat[chatMsg.from] || chatMsg.from;
      displayNamesAndMessages += displayName + " :  " + chatMsg.message + "\n";
      grouped = [...grouped, { displayName, message: chatMsg.message }];
    }

    setNewMsg(true);
    setGroupedMessages(grouped);
    setTimeout(() => {
      setNewMsg(false);
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }, 100);
  }, [chatMessages, displayNamesForChat]);
  return (
    <>
      <link rel="icon" href="/favicon.png" sizes="any" />
      <div
        style={{
          zIndex: 1000,
          color: 0xfff,
          position: "absolute",
          bottom: "0px",
          right: "0px",
          width: "100vw",

          height: "40px",
          backgroundColor: "rgba(50,50,50,1)",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            zIndex: 1000,
            color: 0xfff,
            position: "absolute",
            marginRight: "50px",
            width: "400px",
            bottom: collapsed ? "0px" : "40px",
            height: collapsed ? "40px" : "220px",
            transition: "all 0.01s",
            backgroundColor: "rgba(100,100,100,1)",

            display: "flex",
            flexDirection: "column",
            padding: "0px",
          }}
        >
          <button
            onClick={() => {
              setCollapsed(!collapsed);
            }}
            style={{
              background: "none",
              color: "inherit",
              border: "none",
              padding: "0",
              height: "40px",
              font: "inherit",
              cursor: "pointer",
              outline: "inherit",
            }}
          >
            <div
              style={{
                width: "100%",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  color: newMsg ? "rgba(255,255,255,1)" : "rgba(200,200,200,1)",
                  fontSize: "1.25em",
                  position: "absolute",
                  left: "50%",
                  transform: "translate(-50%,0)",
                }}
              >
                Chat
              </h3>
              <div
                style={{
                  float: "right",
                  backgroundColor: "transparent",
                  color: "rgba(220,220,220,1)",
                  border: 0,
                  width: "50px",
                  height: "100%",
                  fontSize: "1.25em",
                }}
              >
                {collapsed ? "^" : "X"}
              </div>
            </div>
          </button>

          <div
            ref={messageBoxRef}
            style={{
              display: collapsed || !displayNameIsSet ? "none" : "flex",
              flex: 1,
              overflow: "auto",
              color: 0xddd,
              flexDirection: "column",
              marginTop: "5px",
              marginBottom: "5px",
            }}
          >
            {groupedMessages &&
              groupedMessages.map((msg, i) => {
                return (
                  <div key={i} style={{ color: 0xfff, marginTop: "3px" }}>
                    <strong>{msg.displayName}</strong> : {msg.message}
                  </div>
                );
              })}
          </div>
          {!displayNameIsSet && !collapsed && (
            <div
              style={{
                display: collapsed ? "none" : "flex",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "30px",
                alignItems: "center",
                justifyItems: "center",
                marginTop: "2em",
              }}
            >
              <h3
                style={{
                  marginBottom: "2em",
                }}
              >
                What is your name?
              </h3>
              <div>
                <input
                  ref={displayNameInputRef}
                  onChange={(e) => {
                    setSetNameButtonEnabled(true);
                  }}
                  type={"text"}
                  placeholder="Your Name..."
                  style={{
                    flexGrow: 1,
                    margin: "2px",
                    backgroundColor: "rgba(50,50,50,0.5)",
                    color: "rgba(255,255,255,1)",
                    padding: "5px",
                  }}
                ></input>
                <button
                  onClick={() => {
                    window.socket.emit(
                      "setDisplayNameForChat",
                      displayNameInputRef.current.value,
                    );
                  }}
                  style={{
                    backgroundColor: setNameButtonEnabled
                      ? "rgba(200,100,200,1)"
                      : "grey",
                    color: "black",
                    padding: "5px",
                    border: 0,
                    margin: "2px",
                  }}
                  disabled={!setNameButtonEnabled}
                >
                  <strong>Join Chat</strong>
                </button>
              </div>
            </div>
          )}

          {displayNameIsSet && (
            <div
              style={{
                display: collapsed ? "none" : "flex",
                height: "30px",
              }}
            >
              <input
                ref={textInputRef}
                type={"text"}
                style={{
                  flexGrow: 1,
                  backgroundColor: "rgba(50,50,50,0.5)",
                  color: "rgba(255,255,255,1)",
                  margin: "2px",
                }}
              ></input>
              <button
                onClick={() => {
                  window.socket.emit("chat", textInputRef.current.value);
                  textInputRef.current.value = "";
                }}
                style={{
                  backgroundColor: "rgba(200,100,200,1)",
                  color: "black",
                  padding: "5px",
                  margin: "2px",
                  border: 0,
                }}
              >
                <strong>Send</strong>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export { ChatBox };
