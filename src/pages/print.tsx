import type { NextPage } from 'next';
import * as Icon from 'react-feather';
import Link from 'next/link';
import { useImageContext } from '../contexts/ImageContext';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import useImageDimensions from '../hooks/useImageDimensions';
import { useRouter } from 'next/router';

const PrintPreview: NextPage = () => {
	const { data } = useImageContext();
	const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
	const { height, width } = useImageDimensions();
	const [paperSize, setPaperSize] = useState({
		height: 7,
		width: 5,
		margin: 0.12,
	});
	const ppi = 220;

	const handlePrint = useReactToPrint({
		content: () => printRef.current,
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
			className="flex flex-col bg-base-100 min-h-screen"
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
			<main className="flex">
				{/* preview */}
				<div className="flex flex-1 justify-center p-8">
					<div
						ref={printRef}
						className=" bg-white overflow-hidden shadow-[0px_10px_60px_-15px_rgba(0,0,0,0.3)] print:bg-white print:shadow-none"
						style={{
							height: `${paperSize.height}in`,
							width: `${paperSize.width}in`,
						}}
					>
						<img
							style={{
								height: `${height}in`,
								width: `${width}in`,
								margin: `${paperSize.margin}in`,
							}}
							src={image}
						/>
					</div>
				</div>

				<div className="max-w-[300px] min-w-[300px] p-8 bg-base-200 h-screen">
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
								setPaperSize((prevState => {
                  const newData = {...prevState}
                  newData.width = value;
                  return newData
                }));
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
								setPaperSize((prevState => {
                  const newData = {...prevState}
                  newData.height = value;
                  return newData
                }));
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
								setPaperSize((prevState => {
                  const newData = {...prevState}
                  newData.margin = value;
                  return newData
                }));
							}}
						/>
            in
					</div>
         
				</div>
			</main>
		</div>
	);
};

export default PrintPreview;
