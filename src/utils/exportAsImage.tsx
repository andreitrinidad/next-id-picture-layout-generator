import html2canvas from "html2canvas";
// @ts-ignore: Unreachable code error
import {changeDpiDataUrl} from "changedpi";

const exportAsImage = async (element: HTMLDivElement|null, imageFileName: string, ppi: number = 220) => {
	if (element == null) return;
  const canvas = await html2canvas(element);
	const image = canvas.toDataURL('image/png', 1.0);
  const image150 = changeDpiDataUrl(image, ppi);
	downloadImage(image150, imageFileName);
};

export const copyImage = async (element: HTMLDivElement|null, ppi: number = 220, callback: Function) => {
	if (element == null) return;
  const canvas = await html2canvas(element);
	const image = canvas.toDataURL('image/png', 1.0);
  const image150 = changeDpiDataUrl(image, ppi); //hard coded 
  const blob = await (await fetch(image150)).blob(); 
  navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob
    })
  ]);
  callback();
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
