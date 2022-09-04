import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';

interface IDataProps {
  brightness: number,
  contrast: number,
  saturation: number,
  imagePreviewSrc: string,
  bgColor: string,
  borderColor: string,
  theme: string
  selectedLayout: string
}

interface IImageContextProps {
  data ?: IDataProps,
  setData: (data: any) => void
}

const ImageContext = createContext<IImageContextProps>({setData: () => Object});

const ImageContextProvider = (props: any) => {

  const initialData: IDataProps = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    imagePreviewSrc: '',
    bgColor: '#FFF',
    borderColor: '#000',
    theme: 'lofi',
    selectedLayout: ''
  }
  const [data, setData] = useState<IDataProps>(initialData);
  return <ImageContext.Provider value={{data, setData}}>{props.children}</ImageContext.Provider>;
};

export const useImageContext = () => useContext(ImageContext);

export default ImageContextProvider;
