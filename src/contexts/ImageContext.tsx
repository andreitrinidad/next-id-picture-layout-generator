import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';

interface IDataProps {
  brightness?: number,
  contrast?: number,
  saturation?: number,
}

interface IImageContextProps {
  data ?: IDataProps,
  setData: (data: object) => void
}

const ImageContext = createContext<IImageContextProps>({setData: () => {}});

const ImageContextProvider = (props: any) => {
  const [data, setData] = useState<IDataProps>({
    brightness: 100,
    contrast: 100,
    saturation: 100
  });
  return <ImageContext.Provider value={{data, setData}}>{props.children}</ImageContext.Provider>;
};

export const useImageContext = () => useContext(ImageContext);

export default ImageContextProvider;
