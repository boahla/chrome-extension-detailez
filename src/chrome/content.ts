import axios from "axios";
import html2canvas from "html2canvas";

async function getPresignedUrl({ id }: { id: number }): Promise<any> {
  try {
    const res = await axios.post(
      `https://dapi.detailez.im/api/page`,
      { id },
      {
        headers: {
          Authorization:
            "Bearer 375|ld4aVNDEUKIO1Aa9MnlK4C4HGHa1Mw1MYldlWEHy1adfb6bd",
        },
      }
    );
    console.log({ res });
    return res.data.data;
  } catch (err) {
    console.log("error", { err });
  }
  return undefined;
}

function screenshot({ tcId }: { tcId: number | string }) {
  console.log("screenshot", { tcId });
  let startX = 0;
  let startY = 0;
  let height = window.innerHeight;
  let width = window.innerWidth;

  //배경을 어둡게 깔아주기 위한 div 객체 생성
  let screenBg = document.createElement("div");
  screenBg.id = "screenshot_background";
  screenBg.style.borderWidth = "0 0" + height + "px 0";

  // styling
  screenBg.style.width = "100%";
  screenBg.style.height = "100%";
  screenBg.style.position = "fixed";
  screenBg.style.top = "0";
  screenBg.style.left = "0";
  screenBg.style.bottom = "0";
  screenBg.style.right = "0";
  screenBg.style.display = "block";
  screenBg.style.opacity = "0.4";
  screenBg.style.textAlign = "center";
  screenBg.style.boxSizing = "border-box";
  screenBg.style.zIndex = "99999";
  screenBg.style.border = "1px solid black";

  //마우스 이동하면서 선택한 영역의 크기를 보여주기 위한 div 객체 생성
  let screenShot = document.createElement("div");
  screenShot.id = "screenshot";

  document.body.appendChild(screenBg);
  document.body.appendChild(screenShot);

  var selectArea = false;

  //마우스 누르는 이벤트 함수
  const mouseDown = function (e: any) {
    selectArea = true;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    console.log("mousedown", startX, startY);
    document.body.removeEventListener("mousedown", mouseDown);
  };

  function mouseMove(e: any) {
    let x = e.clientX;
    let y = e.clientY;
    screenShot.style.left = x;
    screenShot.style.top = y;
    if (selectArea) {
      let top = Math.min(y, startY);
      let right = width - Math.max(x, startX);
      let bottom = height - Math.max(y, startY);
      var left = Math.min(x, startX);
      screenBg.style.borderWidth = `${top}px ${right}px ${bottom}px ${left}px`;
      console.log("screenBg", screenBg.style.borderWidth);
    }
  }

  async function presignedUpload(file: any, preData: any) {
    try {
      const url = "https://dev-detaiez.s3.ap-northeast-2.amazonaws.com";

      const formData = new FormData();
      const list = Object.keys(preData);
      for (var i = 0; i < list.length; i++) {
        var k = list[i];
        var v = preData[k];
        formData.append(k, v);
      }
      formData.append("file", file);
      return await axios.post(url, formData, {
        onUploadProgress: (progressEvent) => {},
      });
    } catch (error) {
      console.log({ error });
    }
  }

  async function save(values: any) {
    try {
      const imgData = await getPresignedUrl({
        id: Number(tcId),
      });
      console.log({ imgData });
      if (!!imgData && !!imgData.formInput)
        presignedUpload(values, imgData.formInput);

      console.log("done");
      // await Promise.all(
      //   values.map(async (cur: any) => {
      //     const imgData = await getPresignedUrl({
      //       id: Number(tcId),
      //     });
      //     if (!!imgData && !!imgData.formInput)
      //       presignedUpload(cur, imgData.formInput);
      //   })
      // ).then(() => {
      //   console.log("done");
      //   // handleCloseDialog("upload");
      //   // load();
      // });
      // setLists(data.data);
    } catch (error) {
      console.log({ error });
    }
  }

  function mouseUp(e: any) {
    selectArea = false;
    //(초기화) 마우스 떼면서 마우스 무브 이벤트 삭제
    document.body.removeEventListener("mousemove", mouseMove);
    //(초기화) 스크린샷을 위해 생성한 객체 삭제
    //@ts-ignore
    screenShot.parentNode.removeChild(screenShot);
    //@ts-ignore
    screenBg.parentNode.removeChild(screenBg);
    let x = e.clientX;
    let y = e.clientY;
    let top = Math.min(y, startY);
    let left = Math.min(x, startX);
    let width = Math.max(x, startX) - left;
    let height = Math.max(y, startY) - top;
    console.log("mouseup", x, y, startX, startY, left, top, width, height);

    html2canvas(document.body).then(function (canvas) {
      //@ts-ignore
      let img = canvas.getContext("2d").getImageData(left, top, width, height);
      console.log(img);
      let c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      //@ts-ignore
      // c.getContext("2d").putImageData(img, 0, 0);
      save(c); // crop한 이미지 저장
    });
    document.body.removeEventListener("mouseup", mouseUp);
    document.body.classList.remove("edit_cursor");
  }
  document.body.addEventListener("mousedown", mouseDown);
  document.body.addEventListener("mousemove", mouseMove);
  document.body.addEventListener("mouseup", mouseUp);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log({ request });
  if (request.message === "screenshotAll") {
    html2canvas(document.body).then(function (canvas) {
      var dataURL = canvas.toDataURL("image/png", 1.0);
      console.log({ dataURL });
      chrome.downloads.download({
        url: dataURL,
        filename: "screenshot.png",
        saveAs: true,
      });
    });
    sendResponse({ message: "success" });
  } else if (request.message === "screenshotSection") {
    screenshot({ tcId: request.tcId });
  }
});