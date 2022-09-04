import html2canvas from "html2canvas";
// @ts-ignore: Unreachable code error
import screenshot from "image-screenshot"
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
// @ts-ignore: Unreachable code error
import {changeDpiDataUrl, changeDpiBlob} from "changedpi";

const exportAsImage = async (element: HTMLDivElement|null, imageFileName: string, ppi: number = 220, callback?: Function) => {
	if (element == null) return;
  // screenshot(element).download();
  htmlToImage.toPng(element)
  .then(function (dataUrl) {
    // var img = new Image();
    // img.src = dataUrl;
    // document.body.appendChild(img);
      const imageNewDpi = changeDpiDataUrl(dataUrl, ppi);
	    downloadImage(imageNewDpi, imageFileName);
  })
  .catch(function (error) {
    console.error('oops, something went wrong!', error);
  });
  // screenshot(element).then(data => console.log(data))
  // const canvas = await html2canvas(element);
	// const image = canvas.toDataURL('image/png', 1.0);

  // callback && callback();
};

export const copyImage = async (element: HTMLDivElement|null, ppi: number = 220, callback: Function) => {
	if (element == null) return;

  // screenshot(element).download();
  htmlToImage.toBlob(element)
  .then(function (data) {
    // var img = new Image();
    // img.src = dataUrl;
    console.log(data);
    // document.body.appendChild(img);
      const imageNewDpi = changeDpiBlob(data, ppi);
        try {
        navigator.clipboard.write([
          new ClipboardItem({
            // @ts-ignore: Unreachable code error
            [data.type]: imageNewDpi
          })
        ]);
        callback();
      } catch (error) {
        alert('unsupported browser!')
      }

      // downloadImage(imageNewDpi, imageFileName);
  })
  .catch(function (error) {
    console.error('oops, something went wrong!', error);
  });
};

export const printImage = async (element: HTMLDivElement|null, ppi: number = 220, callback: Function) => {
	if (element == null) return;
    htmlToImage.toPng(element)
    .then(function (dataUrl) {

        // const imageNewDpi = changeDpiDataUrl(dataUrl, ppi);
        // console.log('imageNewDpi', imageNewDpi)
        localStorage.setItem('image', dataUrl);
        callback();
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error);
    });
};

const downloadImage = (blob: string, fileName: string) => {
  const fakeLink = window.document.createElement("a");
  // @ts-ignore: Unreachable code error
  fakeLink.style = "display:none;";
  fakeLink.download = fileName;
  
  fakeLink.href = blob;
  
  document.body.appendChild(fakeLink);
  fakeLink.click();
  document.body.removeChild(fakeLink);
  
  fakeLink.remove();
  };


export default exportAsImage;
