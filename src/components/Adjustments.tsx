import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { useImageContext } from '../contexts/ImageContext';
import ColorButton from './ColorButton';

export default function Adjustments() {
	const { data, setData } = useImageContext();
	return (
		<div className="flex-1 max-w-[300px] min-w-[300px]">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold">
					<span className="text-primary font-bold">03</span>{' '}
					Adjustments
				</h2>
				<button
					className="btn btn-xs btn-ghost"
					onClick={() => {
						setData((prevState: any) => {
							const newData = { ...prevState };
							newData.brightness = 100;
							newData.contrast = 100;
							newData.saturation = 100;
							return newData;
						});
					}}
				>
					RESET
				</button>
			</div>

			<div className="">
				<label className="block uppercase font-bold text-sm mb-4">
					Brightness:{' '}
					<span className="badge badge-primary badge-outline">
						{data?.brightness}%
					</span>
					<input
						type="range"
						min="0"
						max="200"
						value={data?.brightness}
						className="range range-sm mt-2"
						onChange={(e) => {
							setData((prevState: any) => {
								const newData = { ...prevState };
								newData.brightness = e.target.value;
								return newData;
							});
						}}
					/>
				</label>
				<label className="block uppercase font-bold text-sm mb-4">
					Contrast:{' '}
					<span className="badge badge-primary badge-outline">
						{data?.contrast}%
					</span>
					<input
						type="range"
						min="0"
						max="200"
						value={data?.contrast}
						className="range range-sm mt-2"
						onChange={(e) => {
							setData((prevState: any) => {
								const newData = { ...prevState };
								newData.contrast = e.target.value;
								return newData;
							});
						}}
					/>
				</label>
				<label className="block uppercase font-bold text-sm mb-4">
					Saturation:{' '}
					<span className="badge badge-primary badge-outline">
						{data?.saturation}%
					</span>
					<input
						type="range"
						min="0"
						max="200"
						value={data?.saturation}
						className="range range-sm mt-2"
						onChange={(e) => {
							setData((prevState: any) => {
								const newData = { ...prevState };
								newData.saturation = e.target.value;
								return newData;
							});
						}}
					/>
				</label>
				<label className="block uppercase font-bold text-sm mb-4">
					Customizations:
				</label>

				<div className="collapse collapse-arrow border-primary border-2 bg-base-100 rounded-box mb-4">
					<input type="checkbox" className="peer" />
					<div className="collapse-title font-medium flex items-center gap-2">
						<div className="avatar">
							<div
								className="w-8 rounded-full border-2 border-neutral"
								style={{
									backgroundColor: `${data?.bgColor}`,
								}}
							></div>
						</div>
						Background Color
					</div>
					<div className="collapse-content font-medium flex flex-col justify-center items-center bg-base-200">
						<div className="pt-4 border-t-2 border-t-primary w-full"></div>
						<div className="flex gap-1 pb-4">
							<ColorButton color="#FFF" />
							<ColorButton color="#fe0005" />
							<ColorButton color="#009ffe" />
							<ColorButton color="#fff500" />
							<ColorButton color="#20fd05" />
							<ColorButton color="#fe01c0" />
						</div>
						<HexColorPicker
							color={data?.bgColor}
							onChange={(color: string) => {
								setData((prevState: any) => {
									const newData = { ...prevState };
									newData.bgColor = color;
									return newData;
								});
							}}
						/>
					</div>
				</div>
				<div className="collapse collapse-arrow border-primary border-2 bg-base-100 rounded-box">
					<input type="checkbox" className="peer" />
					<div className="collapse-title font-medium flex items-center gap-2">
						<div className="avatar">
							<div
								className="w-8 rounded-full border-2 border-neutral"
								style={{
									backgroundColor: `${data?.borderColor}`,
								}}
							></div>
						</div>
						Border Color
					</div>
					<div className="collapse-content font-medium flex flex-col justify-center items-center bg-base-200">
						<div className="pt-4 border-t-2 border-t-primary w-full"></div>
						<div className="flex gap-1 pb-4">
							<ColorButton isBorder color="#FFF" />
							<ColorButton isBorder color="#bdbdbd" />
							<ColorButton isBorder color="#000" />
						</div>
						<HexColorPicker
							color={data?.borderColor}
							onChange={(color: string) => {
								setData((prevState: any) => {
									const newData = { ...prevState };
									newData.borderColor = color;
									return newData;
								});
							}}
						/>
					</div>
				</div>

        {/* PPI settings */}
				{/* <div className="flex gap-2 items-center mb-2">
					<label className="uppercase font-bold text-sm">
						Export PPI:
					</label>
					<input
						type="number"
						min="96"
						max="600"
						className="input input-sm w-24 input-bordered border-2"
						value={pixelDensityDL}
						onChange={(e) => {
							let value = Number(e.target.value);
							setPixelDensityDL(value);
						}}
						onBlur={(e) => {
							let value = Number(e.target.value);
							if (Number(e.target.value) < 96) {
								value = 96;
							}
							if (Number(e.target.value) > 600) {
								value = 600;
							}
							setPixelDensityDL(value);
						}}
						disabled
					/>

					<div
						className="tooltip"
						data-tip="PPI or Pixels Per Inch is the density of pixels in an image. 96 PPI is optimized for Microsoft Office. Make this 150 PPI and above for use in other programs"
					>
						<Icon.HelpCircle />
					</div>
				</div>
				<div className="flex gap-2 items-center">
					<label htmlFor="" className="uppercase font-bold text-sm">
						Clipboard PPI:
					</label>
					<input
						type="number"
						min="96"
						max="600"
						className="input input-sm w-24 input-bordered border-2"
						value={pixelDensityCopy}
						onChange={(e) => {
							let value = Number(e.target.value);
							setPixelDensityCopy(value);
						}}
						onBlur={(e) => {
							let value = Number(e.target.value);
							if (Number(e.target.value) < 96) {
								value = 96;
							}
							if (Number(e.target.value) > 600) {
								value = 600;
							}
							setPixelDensityCopy(value);
						}}
						disabled
					/>

					<div
						className="tooltip"
						data-tip="PPI or Pixels Per Inch is the density of pixels in an image. 96 PPI is optimized for pasting images into Microsoft Office programs."
					>
						<Icon.HelpCircle />
					</div>
				</div> */}
			</div>
		</div>
	);
}
