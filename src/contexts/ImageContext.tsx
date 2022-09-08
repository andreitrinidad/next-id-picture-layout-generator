import React, {
	createContext,
	useContext,
	useEffect,
	useReducer,
	useState,
} from 'react';
import { Crop, PixelCrop } from 'react-image-crop';

interface IDataProps {
  // image related
  imgSrc: string,
  crop: Crop | undefined,
  completedCrop: PixelCrop | undefined,
  scale: number,
  rotate: number,
  aspect: number | undefined,
	imagePreviewSrc: string;
  // adjustments
	brightness: number;
	contrast: number;
	saturation: number;
	bgColor: string;
	borderColor: string;
  // global
	theme: string;
	selectedLayout: string;
}

interface IImageContextProps {
	data?: IDataProps;
	setData: (data: any) => void;
}

const ImageContext = createContext<IImageContextProps>({
	setData: () => Object,
});

const ImageContextProvider = (props: any) => {
	const initialData: IDataProps = {
    imgSrc: '',
    crop: undefined,
    completedCrop: undefined,
    scale: 1,
    rotate: 0,
    aspect: 1 / 1,
		brightness: 100,
		contrast: 100,
		saturation: 100,
		imagePreviewSrc: '',
		bgColor: '#FFF',
		borderColor: '#bdbdbd',
		theme: 'lofi',
		selectedLayout: '',
	};

	useEffect(() => {
    const theme = localStorage.getItem('theme');
		// if (typeof window !== 'undefined') {
      setData((prevState: any )=> {
        const newData = {...prevState};
        newData.theme =theme || 'lofi'
        return newData;
      });
		// }
	}, []);

	const [data, setData] = useState<IDataProps>(initialData);
	return (
		<ImageContext.Provider value={{ data, setData }}>
			{props.children}
		</ImageContext.Provider>
	);
};

export const useImageContext = () => useContext(ImageContext);

export default ImageContextProvider;
