import { useImageContext } from "../contexts/ImageContext";

import layouts from '../layouts';
const useImageDimensions = () => {
  const { data, setData } = useImageContext();
  const selectedLayout = data?.selectedLayout;
  const activeLayoutIndex =
  layouts.findIndex((x) => x.name == selectedLayout) || 0;


  function getTotalHeight() {
		if (!data?.selectedLayout) return;
		const height = Object.values(layouts[activeLayoutIndex].printLayout)
			.map((x: number) => Object.values(x)[0]?.height)
			.reduce((prev, cur) => prev + cur);
		return height;
	}

	function getTotalWidth() {
		if (!data?.selectedLayout) return;
		const width = Object.values(layouts[activeLayoutIndex].printLayout)
			.map((x: number) => Object.values(x))[1]
			.map((x) => x.width)
			.reduce((prev, cur) => prev + cur);
		return width;
	}

  return {
    height: getTotalHeight(),
    width: getTotalWidth(),
  }
}

export default useImageDimensions;