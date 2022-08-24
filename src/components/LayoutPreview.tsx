/* eslint-disable react/display-name */
import Image from 'next/image';
import React from 'react';
import { useImageContext } from '../contexts/ImageContext';
import layouts from '../layouts';
import { useDebounce } from '../useDebounce';

interface ILayoutPreviewProps {
	imagePreviewSrc: string;
	bgColor: string;
	borderColor: string;
	ppi?: number;
  selectedLayout: string;
}

interface ILayoutObject {
	name: string;
  description: string;
	aspectRatio: Array<number>;
	printLayout: {
		[key: string]: any;
	};
}



const LayoutPreview = React.forwardRef<HTMLDivElement, ILayoutPreviewProps>(
	({ imagePreviewSrc, bgColor, borderColor, ppi = 220, selectedLayout }, ref) => {

    const {data} = useImageContext();
    const debouncedData = useDebounce(data, 100);

		// in here we assume the 1 unit is 1 inches
		function unitToPixel(unit: number, ppi: number = 220): string {
			return `${unit * ppi}px`;
		}

		const renderColumn = (col: { height: number, width: number}, i: number) => {
			return (
				<div
					className="relative border"
					style={{
						borderColor: borderColor,
						height: unitToPixel(col.height, ppi),
						width: unitToPixel(col.width, ppi),
            filter:  `brightness(${debouncedData?.brightness}%) contrast(${data?.contrast}%) saturate(${data?.saturation}%)`
					}}
				>
					{imagePreviewSrc && (
						<Image layout="fill" src={imagePreviewSrc} alt="" />
					)}
				</div>
			);
		};

		const renderRow = (row: object, i: number) => {
			return (
				<div className="flex" key={i}>
					{Object.values(row).map((col, i) => renderColumn(col, i))}
				</div>
			);
		};

		const renderLayout = (layout: ILayoutObject) => {
			return (
				<>
					{Object.values(layout.printLayout).map((row, i) =>
						renderRow(row, i)
					)}
				</>
			);
		};

    const activeLayoutIndex = layouts.findIndex(x => x.name == selectedLayout) || 0;

		return (
			<div
				style={{ background: bgColor}}
				className="inline-block"
				ref={ref}
			>
				{renderLayout(layouts[activeLayoutIndex < 0 ? 0 : activeLayoutIndex])}
			</div>
		);
	}
);

export default LayoutPreview;
