import styled from "styled-components";

const Header = () => {
  const logoIcon = chrome.runtime.getURL("../image/detailez_logo.png");
  const homeIcon = chrome.runtime.getURL("../image/home-icon.svg");
  return (
    <Stack>
      <div>
        <img alt="logo" src={logoIcon} width="96" height="20" />
      </div>
      <div
        onClick={() => {
          alert("detail ez 이동");
        }}
      >
        <img alt="logo" src={homeIcon} />
      </div>
    </Stack>
  );
};
export default Header;

const Stack = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 20px 16px;
  border-bottom: 1px solid #e2e3ec;
  align-items: center;
`;
