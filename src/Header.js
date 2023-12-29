import axios from "axios";
import { useState } from "react";
import styled from "styled-components";
import { Cookies } from "react-cookie";

const HeaderWrapper = styled.header`
  display: flex;
  position: fixed;
  width: 100%;
  z-index: 999;
  height: 15vh;
  justify-content: space-between;
  align-items: center;
  background-color: whitesmoke;
  border-bottom: 1px solid black;
  section {
    margin-right: 2rem;
  }
  input {
    resize: none;
  }
  .title {
    display: block;
    margin-left: 40px;
    align-items: center;
    font-size: 2rem;
    font-weight: 700;
    width: 120px;
  }
  .textWrapper {
    display: flex;
    min-width: 30%;
    height: 100%;
    list-style: none;
    padding: 0;
  }
  .textWrapper_li {
    flex: 1;
    display: flex;
    align-items: center;
    margin: none;
    padding: none;
  }
  .id {
    text-align: center;
    font-size: 1rem;
    width: 5rem;
  }
  .id_text {
    height: 1rem;
    width: 4rem;
    overflow-x: auto;
  }
  .password {
    text-align: center;
    font-size: 1rem;
    width: 5rem;
  }
  .password_text {
    height: 1rem;
    width: 4rem;
  }
  .buttonWrapper {
    flex: 1;
    display: flex;
    justify-content: flex-end;

    padding: 0;
    list-style: none;
    padding: none;
  }
  .liButton {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 1.5rem;
    border: 1px solid black;
    border-radius: 0.2rem;
    width: 5rem;
    margin-right: 0.5rem;
    cursor: pointer;
  }
  .liButton {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 1.5rem;
    border: 1px solid black;
    border-radius: 0.2rem;
    width: 5rem;
    margin-right: 0.5rem;
    cursor: pointer;
  }
`;

export default function Header({ user, setUser, isLogged, setIsLogged }) {
  const cookie = new Cookies();
  const [input, setInput] = useState({
    id: "",
    password: "",
  });

  const onSignup = async () => {
    await axios
      .post(`http://43.203.11.102:3000`, {
        id: input.id,
        password: input.password,
      })
      .then((res) => {
        if (!res) {
          alert("중복되는 아이디가 있습니다!");
        } else {
          alert("아이디가 등록되었습니다!");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onLogin = async () => {
    await axios
      .post(
        `http://43.203.11.102:3000/login`,
        {
          id: input.id,
          password: input.password,
        },
        { withCredentials: true }
      )
      .then((res) => {
        const { username, sign } = res.data;
        setIsLogged(true);
        setUser({
          username,
          sign,
        });
      })
      .catch((err) => {
        alert(err);
      });
    setInput({
      id: "",
      password: "",
    });
  };
  const onLogout = async () => {
    axios
      .post(`http://43.203.11.102:3000/logout`, {}, { withCredentials: true })
      .then((res) => {
        setIsLogged(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <HeaderWrapper>
      <label className="title">
        <span style={{ display: "block" }}>{`CHATS`}</span>
      </label>
      <section>
        <ul className="textWrapper">
          {!isLogged ? (
            <>
              <li className="textWrapper_li">
                <label className="id">아이디: </label>
                <input
                  className="id_text"
                  minLength={6}
                  maxLength={15}
                  value={input.id}
                  name="id"
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setInput({ ...input, [name]: value });
                  }}
                />
              </li>
              <li className="textWrapper_li">
                <label className="password">패스워드: </label>
                <input
                  className="password_text"
                  minLength={6}
                  maxLength={15}
                  value={input.password}
                  name="password"
                  type="password"
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setInput({ ...input, [name]: value });
                  }}
                />
              </li>
            </>
          ) : (
            <li className="textWrapper_li">로그인 되었습니다.</li>
          )}
        </ul>
        <ul className="buttonWrapper">
          {!isLogged ? (
            <>
              <li className="liButton" onClick={() => onLogin()}>
                로그인
              </li>
              <li className="liButton" onClick={() => onSignup()}>
                회원가입
              </li>
            </>
          ) : (
            <li
              className="liButton"
              onClick={() => {
                onLogout();
              }}
            >
              로그아웃
            </li>
          )}
        </ul>
      </section>
    </HeaderWrapper>
  );
}
