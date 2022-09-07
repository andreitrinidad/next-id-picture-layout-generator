import type { NextPage } from 'next';
import * as Icon from 'react-feather';
import Link from 'next/link';
import { useImageContext } from '../contexts/ImageContext';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import useImageDimensions from '../hooks/useImageDimensions';
import { useRouter } from 'next/router';
import classNames from 'classnames';

const PrintPreview: NextPage = () => {
	const { data } = useImageContext();
	const printRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const { height: _height, width: _width } = useImageDimensions();
	const [paperSize, setPaperSize] = useState({
		height: 7,
		width: 5,
		margin: 0.12,
		isLandscape: false,
	});
	const ppi = 220;

  let height = paperSize.isLandscape ? _width: _height;
  let width = paperSize.isLandscape ? _height: _width;

	const handlePrint = useReactToPrint({
		content: () => printRef.current,
		pageStyle: `
    @page {
      size: ${paperSize.width}in ${paperSize.height}in;
      margin: 0;
    }
    `,
	});

	let image = '';
	if (typeof window !== 'undefined') {
		image = localStorage.getItem('image') || '';
	}

	useEffect(() => {
		if (image === '') {
			router.back();
		}
		function detectKeys(event: any) {
			if ((event.ctrlKey || event.metaKey) && event.keyCode == 80) {
				event.preventDefault();
				handlePrint();
			}
			if (event.keyCode == 27) {
				event.preventDefault();
				router.back();
			}
		}

		window.addEventListener('keydown', detectKeys);

		return () => {
			window.removeEventListener('keydown', detectKeys);
		};
	}, []);

	return (
		<div
			data-theme={data?.theme || 'lofi'}
			className="flex flex-col h-screen min-h-screen"
		>
			<header className="flex bg-primary px-8 pr-0 items-center justify-between gap-6">
				<Link href="/">
					<a className="btn btn-circle btn-secondary">
						<Icon.ArrowLeft />
					</a>
				</Link>
				<h1 className="text-primary-content text-xl font-bold flex-1">
					Print Preview
				</h1>
				{/* header */}
				<div className="flex items-center gap-2">
					<button
						className="btn btn-secondary px-10 m-2 gap-2"
						onClick={handlePrint}
					>
						<Icon.Printer />
						Print
					</button>
				</div>
			</header>
			<main className="flex h-full border border-2">
				{/* preview */}
				<div className="flex flex-1 flex-col justify-start items-center p-8 bg-base-200 h-full">
        <div className="tooltip" data-tip="Orientation">
					{/* <button className={
            classNames("btn btn-square", 
              !paperSize.isLandscape && 'btn-outline'
            )
          } onClick={() => {
            	setPaperSize((prevState) => {
                const newData = { ...prevState };
                newData.isLandscape = !prevState.isLandscape;
                return newData;
              });
          }}>
						<Icon.RotateCw/>
					</button> */}
          </div>
					<span className="badge badge-lg badge-neutral mb-4">
						Paper Size: {paperSize.width} x {paperSize.height}
					</span>
					{/* <span className="badge badge-lg badge-neutral mb-4">
						Image Size: {width} x {height}
					</span> */}
					<div
						ref={printRef}
						className=" bg-white overflow-hidden shadow-[0px_10px_60px_-15px_rgba(0,0,0,0.3)] print:bg-white print:shadow-none"
						style={{
							height: `${paperSize.height}in`,
							width: `${paperSize.width}in`,
						}}
					>
						<div
            // className="border-8 border-red-600 "

							style={{
								height: `${height}in`,
								width: `${width}in`,
                margin: `${paperSize.margin}in`,
							}}
						>
							<img
              className={classNames(
                paperSize.isLandscape &&
                  'rotate-90',
                  //  'border-8 border-red-500 object-contain'
              )}
              // style={{
							// 	height: `${height}in`,
							// 	width: `${width}in`,
              //   margin: `${paperSize.margin}in`,
							// }}
								// className='object-cover'
								// className={classNames(
                //   paperSize.isLandscape &&
                //     'rotate-180',
                //      'border-8 border-red-500'
                // )}
								src={image}
							/>
						</div>
					</div>
				</div>

				<div className="max-w-[300px] min-w-[300px] p-8 bg-white h-full">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold">
							{/* <span className="text-primary font-bold">03</span>{' '} */}
							Print Settings
						</h2>
					</div>
					<div className="flex gap-2 justify-between">
						<h3 className="font-bold">Paper Size</h3>
						<span className="badge badge-primary badge-outline">
							Inches
						</span>
					</div>
					<div className="divider m-0"></div>
					<div className="flex gap-2 items-center justify-between mb-2">
						<label className="flex-1 uppercase font-bold text-sm">
							width
						</label>
						<input
							type="number"
							min="5"
							max="100"
							className="input input-sm w-16 input-bordered border-2"
							value={paperSize.width}
							onChange={(e) => {
								let value = Number(e.target.value);
								setPaperSize((prevState) => {
									const newData = { ...prevState };
									newData.width = value;
									return newData;
								});
							}}
						/>
						in
					</div>
					<div className="flex gap-2 items-center justify-between mb-2">
						<label className="flex-1 uppercase font-bold text-sm">
							Height
						</label>
						<input
							type="number"
							min="3.5"
							max="100"
							className="input input-sm w-16 input-bordered border-2"
							value={paperSize.height}
							onChange={(e) => {
								let value = Number(e.target.value);
								setPaperSize((prevState) => {
									const newData = { ...prevState };
									newData.height = value;
									return newData;
								});
							}}
						/>
						in
					</div>
					<div className="flex gap-2 items-center justify-between mb-2">
						<label className="flex-1 uppercase font-bold text-sm">
							margin
						</label>
						<input
							type="number"
							min="0.12"
							max="1"
							className="input input-sm w-16 input-bordered border-2"
							value={paperSize.margin}
							onChange={(e) => {
								let value = Number(e.target.value);
								setPaperSize((prevState) => {
									const newData = { ...prevState };
									newData.margin = value;
									return newData;
								});
							}}
						/>
						in
					</div>

					<div className="flex gap-2 justify-between mt-8">
						<h3 className="font-bold">Presets</h3>
					</div>
					<div className="divider m-0"></div>
					<div className="flex gap-2 flex-wrap">
						<button
							className="btn btn-neutral btn-outline gap-2"
							onClick={() => {
								setPaperSize((prevState) => {
									const newData = { ...prevState };
									newData.width = 5;
									newData.height = 7;
									return newData;
								});
							}}
						>
							5x7
							<span className="badge badge-neutral !text-neutral badge-outline">
								5R
							</span>
						</button>
						<button
							className="btn btn-neutral btn-outline gap-2"
							onClick={() => {
								setPaperSize((prevState) => {
									const newData = { ...prevState };
									newData.width = 4;
									newData.height = 6;
									return newData;
								});
							}}
						>
							4x6
							<span className="badge badge-neutral !text-neutral badge-outline">
								4R
							</span>
						</button>
						<button
							className="btn btn-neutral btn-outline gap-2"
							onClick={() => {
								setPaperSize((prevState) => {
									const newData = { ...prevState };
									newData.width = 3.5;
									newData.height = 5;
									return newData;
								});
							}}
						>
							3.5x5
							<span className="badge badge-neutral !text-neutral badge-outline">
								3R
							</span>
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default PrintPreview;
