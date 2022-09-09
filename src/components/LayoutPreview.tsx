/* eslint-disable react/display-name */
import Image from 'next/image';
import React from 'react';
import { useImageContext } from '../contexts/ImageContext';
import useImageDimensions from '../hooks/useImageDimensions';
import layouts from '../layouts';
import { useDebounce } from '../useDebounce';

interface ILayoutPreviewProps {
	imagePreviewSrc?: string;
	bgColor?: string;
	borderColor?: string;
	ppi?: number;
  selectedLayout?: string;
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
    const {height, width} = useImageDimensions();
    const debouncedData = useDebounce(data, 100);

		// in here we assume the 1 unit is 1 inches
		function unitToPixel(unit: number, ppi: number = 220): string {
			return `${unit * ppi}px`;
		}

		const renderColumn = (col: { height: number, width: number}, i: number) => {
			return (
				<td
          colSpan={col.width}
					className="relative"
					style={{
            borderColor: borderColor,
            borderWidth: unitToPixel(0.02, ppi),
						height: unitToPixel(col.height, ppi),
						width: unitToPixel(col.width, ppi),
            filter:  `brightness(${debouncedData?.brightness}%) contrast(${data?.contrast}%) saturate(${data?.saturation}%)`
					}}
				>
          <div className='h-full w-full'>
          {imagePreviewSrc && (
						<Image layout="fill" src={imagePreviewSrc} alt="" />
					)}
          </div>
				
				</td>
			);
		};

		const renderRow = (row: object, i: number) => {
			return (
				<tr key={i}>
					{Object.values(row).map((col, i) => renderColumn(col, i))}
				</tr>
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
				className="inline-block border-r-2 "
        style={{
          background: bgColor,
          // borderColor: borderColor,
          // borderRight: `solid ${unitToPixel(0.02, ppi)} borderColor`,
          width: width * ppi + 'px'}}
				ref={ref}
			>
        <table className='table-auto border-collapse' style={{
          borderColor: borderColor,
          width: width * ppi + 'px'}}>
        <tbody>
        {renderLayout(layouts[activeLayoutIndex < 0 ? 0 : activeLayoutIndex])}
        </tbody>
        </table>
			</div>
		);
	}
);

export default LayoutPreview;
