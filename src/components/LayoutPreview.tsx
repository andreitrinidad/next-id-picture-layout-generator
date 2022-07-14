/* eslint-disable react/display-name */
import Image from "next/image";
import React from "react";

interface ILayoutPreviewProps {
  imagePreviewSrc: string,
  bgColor: string,
  borderColor: string,
  ppi?: number,
}

const LayoutPreview = React.forwardRef<HTMLDivElement, ILayoutPreviewProps>(({imagePreviewSrc, bgColor, borderColor, ppi = 220}, ref) => {
 
  // in here we assume the 1 unit is 1 inches
  function unitToPixel(unit: number, ppi: number = 220 ) : string {
    return `${unit * ppi}px`;
  }

  return (
    <div style={{background: bgColor}} className='inline-block' ref={ref}>
    <div className='flex'>
    <div className="relative border" style={{borderColor: borderColor, height: unitToPixel(2, ppi) ,width: unitToPixel(2, ppi)}}>
      { imagePreviewSrc && <Image layout='fill' src={imagePreviewSrc} alt=''/>}
    </div>
    <div className="relative border" style={{borderColor: borderColor, height: unitToPixel(2, ppi) ,width: unitToPixel(2, ppi)}}>
      { imagePreviewSrc && <Image layout='fill' src={imagePreviewSrc} alt=''/>}
    </div>
    </div>
    <div className='flex'>
    <div className="relative border" style={{borderColor: borderColor, height: unitToPixel(2, ppi) ,width: unitToPixel(2, ppi)}}>
      { imagePreviewSrc && <Image layout='fill' src={imagePreviewSrc} alt=''/>}
    </div>
    <div className="relative border" style={{borderColor: borderColor, height: unitToPixel(2, ppi) ,width: unitToPixel(2, ppi)}}>
      { imagePreviewSrc && <Image layout='fill' src={imagePreviewSrc} alt=''/>}
    </div>
    </div>
    <div className='flex'>
    <div className="relative border" style={{borderColor: borderColor, height: unitToPixel(1, ppi) ,width: unitToPixel(1, ppi)}}>
      { imagePreviewSrc && <Image layout='fill' src={imagePreviewSrc} alt=''/>}
    </div>
    <div className="relative border" style={{borderColor: borderColor, height: unitToPixel(1, ppi) ,width: unitToPixel(1, ppi)}}>
      { imagePreviewSrc && <Image layout='fill' src={imagePreviewSrc} alt=''/>}
    </div>
    <div className="relative border" style={{borderColor: borderColor, height: unitToPixel(1, ppi) ,width: unitToPixel(1, ppi)}}>
      { imagePreviewSrc && <Image layout='fill' src={imagePreviewSrc} alt=''/>}
    </div>
    <div className="relative border" style={{borderColor: borderColor, height: unitToPixel(1, ppi) ,width: unitToPixel(1, ppi)}}>
      { imagePreviewSrc && <Image layout='fill' src={imagePreviewSrc} alt=''/>}
    </div>
    </div>
   

  </div>
  )
});

export default LayoutPreview;
