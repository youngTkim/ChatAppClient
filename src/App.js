import { io } from "socket.io-client";
import styled from "styled-components";

import Header from "./Header";
import { useState, useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import axios from "axios";

const AppWrapper = styled.main`
  display: flex;
  width: 100vw;
  overflow: auto;
  flex-direction: column;
`;

const ChatsWrapper = styled.ul`
  display: flex;
  margin-top: 15vh;
  margin-bottom: 120px;
  overflow-y: auto;
  justify-content: flex-end;
  flex-direction: column;
  list-style: none;
  background-color: whitesmoke;
  padding: 1rem;
  .chats_li {
    flex: 1;
    display: block;
    border: 1px solid black;
    min-height: 30px;
    width: 100%;
    margin-top: 0.2rem;
  }
  .chats_li_profile {
    display: flex;
    padding: 0.3rem;
    height: 1rem;
    margin: 2px;
    align-items: center;
  }
  .chats_li_profile_username {
    text-align: center;
    margin-left: 1rem;
  }
  .chats_li_value {
    flex: 1;
    display: inline-block;
    max-width: 100%;
    min-height: 20px;
    padding: 0.3rem;
    word-wrap: break-word;
  }
`;

const InputWrapper = styled.section`
  display: flex;
  flex-direction: column;
  position: fixed;
  width: 100%;
  height: 120px;
  border: 1px solid black;
  background-color: white;
  bottom: 0;
  .chat_input {
    margin: 0.3rem;
    resize: none;
    height: 4rem;
  }
  .button_wrapper {
    margin: 0.3rem;
    display: flex;
    position: relative;
    flex: 1;
    .button {
      position: absolute;
      width: 4rem;
      height: 100%;
      right: 0;
    }
  }
`;

function App() {
  const cookies = new Cookies();
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState();
  const [chats, setChats] = useState([]);
  const [chatValue, setChatValue] = useState("");
  const socketRef = useRef(null);
  const chatsRef = useRef(null);

  useEffect(() => {
    const token = cookies.get("jwt");
    if (token) {
      axios
        .get(`http://43.203.11.102:3000`, {
          headers: {
            authorization: token,
          },
        })
        .then((res) => {
          setUser(res.data);
          setIsLogged(true);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setIsLogged(false);
    }
  }, []);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 소켓을 초기화
    socketRef.current = io(`http://43.203.11.102:3131`, {
      extraHeaders: {
        authorization: cookies.get("jwt"), // 원하는 헤더 정보 추가
      },
    });

    socketRef.current.on("connect", () => {
      socketRef.current.on("recentchats", (recentchats) => {
        setChats([...recentchats]);
      });
      socketRef.current.on("chats", (message) => {
        setChats((prevChats) => [
          ...prevChats,
          { date: new Date(), ...message },
        ]);
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("서버와 연결이 끊어졌습니다!");
    });

    // 컴포넌트가 언마운트될 때 소켓 연결 해제
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [cookies.get("jwt")]);

  function send() {
    if (chatValue.length > 0 && socketRef.current) {
      socketRef.current.emit("chat", {
        username: user.username,
        chat: chatValue,
      });
      setChatValue("");
    }
  }
  useEffect(() => {
    if (chats.length > 100) {
      chats.shift();
    }
    window.scrollTo({
      top: chatsRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chats]);

  return (
    <>
      <AppWrapper>
        <Header
          user={user}
          setUser={setUser}
          isLogged={isLogged}
          setIsLogged={setIsLogged}
        />
        <ChatsWrapper ref={chatsRef}>
          {chats.map((info, idx) => {
            const { date, username, chat } = info;
            return (
              <li className="chats_li" key={idx}>
                <div className="chats_li_profile">
                  <span className="chats_li_profile_date">{`${date.toLocaleString()}`}</span>
                  <span className="chats_li_profile_username">{`${username}`}</span>
                </div>
                <div className="chats_li_value">{`${chat}`}</div>
              </li>
            );
          })}
        </ChatsWrapper>
        <InputWrapper>
          <textarea
            className="chat_input"
            value={chatValue}
            onChange={(e) => {
              const { value } = e.target;
              setChatValue(value);
            }}
          ></textarea>
          <div className="button_wrapper">
            <button
              className="button"
              onClick={() => {
                send();
              }}
            >
              입력
            </button>
          </div>
        </InputWrapper>
      </AppWrapper>
    </>
  );
}
export default App;
