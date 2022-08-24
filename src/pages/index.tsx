import type { NextPage } from 'next';
import 'react-image-crop/dist/ReactCrop.css';
import React, { useState, useRef, useEffect, DragEvent } from 'react';
import * as Icon from 'react-feather';
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	Crop,
	PixelCrop,
} from 'react-image-crop';
import { useDebounceEffect } from '../useDebounceEffect';
import { canvasPreview } from '../canvasPreview';
import { imgPreview } from '../imgPreview';
import { HexColorPicker } from 'react-colorful';
import 'react-image-crop/dist/ReactCrop.css';
import Image from 'next/image';
import LayoutPreview from '../components/LayoutPreview';
import exportAsImage, { copyImage } from '../utils/exportAsImage';
import Head from 'next/head';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppHeader } from '../components/AppHeader';
import { UploadWidget } from '../components/UploadWidget';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { LayoutSelector } from '../components/LayoutSelector';
import layouts from '../layouts';
import { setTimeout } from 'timers/promises';
import { useImageContext } from '../contexts/ImageContext';

function centerAspectCrop(
	mediaWidth: number,
	mediaHeight: number,
	aspect: number
) {
	return centerCrop(
		makeAspectCrop(
			{
				unit: '%',
				width: 90,
			},
			aspect,
			mediaWidth,
			mediaHeight
		),
		mediaWidth,
		mediaHeight
	);
}

const Home: NextPage = () => {
	const [imgSrc, setImgSrc] = useState('');
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	const reactCropRef = useRef(null);
	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const [scale, setScale] = useState(1);
	const [rotate, setRotate] = useState(0);
	const [aspect, setAspect] = useState<number | undefined>(1 / 1);
	const [imagePreviewSrc, setImagePreviewSrc] = useState('');
	const [bgColor, setBgColor] = useState('#FFF');
	const [borderColor, setBorderColor] = useState('#000');
	const [pixelDensityCopy, setPixelDensityCopy] = useState(220);
	const [pixelDensityDL, setPixelDensityDL] = useState(220);
	const previewRef = useRef<HTMLDivElement>(null);
	const replaceBtnRef = useRef<HTMLButtonElement>(null);
	const [theme, setTheme] = useState('light');
	const [confirmModal, setConfirmModal] = useState(false);
	const [selectedLayout, setSelectedLayout] = useState(layouts[0].name);
	const [forceUpdate, setForceUpdate] = useState(0);
  // image modifcation related states
  const [brightness, setBrightness] = useState(100);
	const [contrast, setContrast] = useState(100);
  const {data, setData} = useImageContext();

	function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length > 0) {
			setCrop(undefined); // Makes crop preview update between images.
			const reader = new FileReader();
			reader.addEventListener('load', () =>
				setImgSrc(reader?.result?.toString() || '')
			);
			reader.readAsDataURL(e.target.files[0]);
		}
	}

	function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
		if (aspect) {
			const { width, height } = e.currentTarget;
			setCrop(centerAspectCrop(width, height, aspect));
		}
	}

	async function pasteFromClipboard() {
		try {
			const permission = await navigator.permissions.query({
				// @ts-ignore: Unreachable code error
				name: 'clipboard-read',
			});
			if (permission.state === 'denied') {
				toast.warning(
					'Woops. Permission denied. Please change clipboard permissions',
					{ autoClose: 5000 }
				);
			}
			const clipboardContents = await navigator.clipboard.read();
			for (const item of clipboardContents) {
				if (!item.types.includes('image/png')) {
					toast.error('Clipboard content is not an image.');
					return;
				}
				const blob = await item.getType('image/png');
				setCrop(undefined);
				const src = URL.createObjectURL(blob);
				setImgSrc(`${src}`);
			}
		} catch (error) {
			console.log(error);
			toast.error('Something went wrong.');
		} finally {
			setConfirmModal(false);
		}
	}

	const generatePreviewImage = async () => {
		if (
			completedCrop?.width &&
			completedCrop?.height &&
			imgRef.current &&
			previewCanvasRef.current
		) {
			// We use canvasPreview as it's much faster than imgPreview.
			canvasPreview(
				imgRef.current,
				previewCanvasRef.current,
				completedCrop,
				scale,
				rotate
			);
			// imgPreview()

			const imgUrl = await imgPreview(
				imgRef.current,
				previewCanvasRef.current,
				completedCrop,
				scale,
				rotate
			);
			setImagePreviewSrc(imgUrl);
		}
	};

	useDebounceEffect(generatePreviewImage, 100, [
		completedCrop,
		scale,
		rotate,
	]);

	function setCropAndAspect() {
		if (aspect) {
			setAspect(undefined);
		} else if (imgRef.current) {
			const { width, height } = imgRef.current;
			const activeLayoutIndex =
				layouts.findIndex((x) => x.name == selectedLayout) || 0;
			const h = layouts[activeLayoutIndex].aspectRatio[0];
			const w = layouts[activeLayoutIndex].aspectRatio[1];
			setAspect(h / w);
			setCrop(centerAspectCrop(width, height, 1 / 1));
			// generatePreviewImage()
		}
	}

	function handleToggleAspectClick() {
		setCropAndAspect();
	}

	const renderControls = () => {
		if (!imgSrc) return null;
		return (
			<>
				{/* Image and Rotate slider */}
				{Boolean(imgSrc) && (
					<div className="flex flex-col items-center">
						<div className="border-accent border-2 bg-checkered">
							{/* update: {forceUpdate} */}
							<ReactCrop
								// key={forceUpdate}
								ref={reactCropRef}
								crop={crop}
								onChange={(_, percentCrop) => {
									setCrop(percentCrop);
								}}
								onComplete={(c) => {
									setCompletedCrop(c);
								}}
								aspect={aspect}
								ruleOfThirds
							>
								<img
									ref={imgRef}
									alt="Crop me"
									src={imgSrc}
									style={{
										transform: `scale(${scale}) rotate(${rotate}deg)`,
									}}
									onLoad={onImageLoad}
									// crossOrigin="anonymous"
								/>
							</ReactCrop>
						</div>

						<div className="control w-full mt-4 px-10">
							<div className="flex justify-between text-xs">
								<span className="-translate-x-2">-180</span>
								<span className="-translate-x-1/2">-90</span>
								<span className="-translate-x-[5px]">0</span>
								<span className="">90</span>
								<span className="">180</span>
							</div>
							<input
								type="range"
								min="-180"
								max="180"
								value={rotate}
								disabled={!imgSrc}
								onChange={(e) =>
									setRotate(
										Math.min(
											180,
											Math.max(
												-180,
												Number(e.target.value)
											)
										)
									)
								}
								className="range range-xs"
							/>
							<div className="flex justify-between text-xs px-2">
								<span>|</span>
								<span>|</span>
								<span>|</span>
								<span>|</span>
								<span>|</span>
							</div>
						</div>
					</div>
				)}
				<div className="card bg-base-200 mt-8 p-4 px-8">
					<div className="flex items-center justify-between w-[300px] mb-3">
						<label className="uppercase font-bold text-sm">
							Scale:{' '}
						</label>
						<div className="input-group w-auto items-center">
							<button
								className="btn btn-square btn-sm"
								onClick={() => setScale(scale - 0.1)}
							>
								<Icon.Minus size={18} />
							</button>
							<input
								// type="text"
								placeholder="0"
								className="input input-bordered border-2 w-20 input-sm"
								type="number"
								step="0.1"
								value={Math.round(scale * 10) / 10}
								// disabled
								onChange={(e) =>
									setScale(Number(e.target.value))
								}
							/>
							<button
								className="btn btn-square btn-sm"
								onClick={() => setScale(scale + 0.1)}
							>
								<Icon.Plus size={18} />
							</button>
						</div>
					</div>
					<div className="flex items-center justify-between w-[300px] mb-3">
						<label className="uppercase font-bold text-sm">
							Rotate:{' '}
						</label>

						<div className="input-group w-auto items-center">
							<button
								className="btn btn-square btn-sm"
								onClick={() => setRotate(rotate - 90)}
							>
								<Icon.RotateCcw size={15} />
							</button>
							<input
								// type="text"
								placeholder="0"
								className="input input-bordered border-2 w-20 input-sm"
								type="number"
								// step="0.1"
								value={rotate}
								// disabled
								onChange={(e) =>
									setRotate(Number(e.target.value))
								}
							/>
							<button
								className="btn btn-square btn-sm"
								onClick={() => setRotate(rotate + 90)}
							>
								<Icon.RotateCw size={15} />
							</button>
						</div>
					</div>
					<label className="flex items-center justify-between w-[300px] mb-3 cursor-pointer">
						<span className="uppercase font-bold text-sm">
							Toggle Aspect Ratio:
						</span>
						<input
							type="checkbox"
							className="toggle"
							checked={!!aspect}
							onChange={handleToggleAspectClick}
						/>
					</label>
					{/* <button onClick={handleToggleAspectClick}>
								Toggle aspect ratio {aspect ? 'off' : 'on'}
							</button> */}
				</div>

				<div>
					{Boolean(completedCrop) && (
						<canvas
							ref={previewCanvasRef}
							style={{
								border: '1px solid black',
								objectFit: 'contain',
								width: completedCrop?.width,
								height: completedCrop?.height,
								opacity: 0,
								display: 'none',
							}}
						/>
					)}
				</div>
			</>
		);
	};

	function copyToClipboard() {
		copyImage(previewRef.current, pixelDensityCopy, () =>
			toast.success('Copied to Clipboard!')
		);
	}

	function downloadResult() {
		exportAsImage(previewRef.current, 'image', pixelDensityDL, () =>
			toast.success('Image downloaded!')
		);
	}

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme') || 'lofi';
		setTheme(savedTheme);
		setPixelDensityCopy(96);
		setPixelDensityDL(96);

		function detectKeys(event: any) {
			if ((event.ctrlKey || event.metaKey) && event.keyCode == 83) {
				event.preventDefault();
				downloadResult();
			}
			if ((event.ctrlKey || event.metaKey) && event.keyCode == 67) {
				event.preventDefault();
				copyToClipboard();
			}
			if ((event.ctrlKey || event.metaKey) && event.keyCode == 86) {
				if (!!imagePreviewSrc || imagePreviewSrc) {
					event.preventDefault();
					setConfirmModal(true);
					replaceBtnRef.current?.focus();
					return;
				}
				pasteFromClipboard();
			}
			if (event.keyCode == 27) {
				if (confirmModal) {
					event.preventDefault();
					setConfirmModal(false);
				}
			}
		}

		window.addEventListener('keydown', detectKeys);

		return () => {
			window.removeEventListener('keydown', detectKeys);
		};
	}, [confirmModal, copyToClipboard, downloadResult, imagePreviewSrc]);

	useEffect(() => {
		replaceBtnRef.current?.focus();
	}, [confirmModal]);

	const activeLayoutIndex =
		layouts.findIndex((x) => x.name == selectedLayout) || 0;

	useEffect(() => {
		if (selectedLayout === '') return;

		const h = layouts[activeLayoutIndex].aspectRatio[0];
		const w = layouts[activeLayoutIndex].aspectRatio[1];
		if (imgRef.current) {
			setAspect(h / w);
			setCrop(undefined);
			const _imgSrc = imgSrc;
			removeImage();
			window.setTimeout(() => {
				setImgSrc(_imgSrc);
			}, 100);
		} else {
			setAspect(h / w);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeLayoutIndex, selectedLayout]);

	function removeImage() {
		setImgSrc('');
		setImagePreviewSrc('');
	}

	function getTotalHeight() {
		const height = Object.values(layouts[activeLayoutIndex].printLayout)
			.map((x: number) => Object.values(x)[0]?.height)
			.reduce((prev, cur) => prev + cur);
		return height;
	}
	function getTotalWidth() {
		const width = Object.values(layouts[activeLayoutIndex].printLayout)
			.map((x: number) => Object.values(x))[1]
			.map((x) => x.width)
			.reduce((prev, cur) => prev + cur);
		return width;
	}

	return (
		<div className="flex flex-col bg-base-100 h-screen" data-theme={theme}>
			<ToastContainer
				hideProgressBar
				theme="dark"
				autoClose={1500}
				position="bottom-right"
			/>
			<Head>
				{/* <title>ID Picture Print Layout Generator Tool</title> */}
				<link
					rel="icon"
					href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌄</text></svg>"
				/>
				<meta
					property="og:image"
					content="https://og-image.vercel.app/ID%20Picture%20Print%20Layout%20Generator%20Tool%20by%20%40andreitrinidad.png?theme=dark&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-white-logo.svg&images=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fremojansen%2Flogo.ts%40master%2Fts.svg"
				/>
				{/* <!-- Primary Meta Tags --> */}
				<title>
					IDPPLG (ID Picture Print Layout Generator) Tool - by Andrei Trinidad
				</title>
				<meta
					name="title"
					content="IDPPLG (ID Picture Print Layout Generator) Tool - by Andrei Trinidad"
				/>
				<meta
					name="description"
					content="Create ID picture print layouts by simply copying and pasting your image."
				/>

				{/* <!-- Open Graph / Facebook --> */}
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://idpplg.vercel.app/" />
				<meta
					property="og:title"
					content="IDPPLG (ID Picture Print Layout Generator) Tool - by Andrei Trinidad"
				/>
				<meta
					property="og:description"
					content="Create ID picture print layouts by simply copying and pasting your image."
				/>
				<meta
					property="og:image"
					content="https://og-image.vercel.app/ID%20Picture%20Print%20Layout%20Generator%20Tool%20by%20%40andreitrinidad.png?theme=dark&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-white-logo.svg&images=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fremojansen%2Flogo.ts%40master%2Fts.svg"
				/>

				{/* <!-- Twitter --> */}
				<meta property="twitter:card" content="summary_large_image" />
				<meta
					property="twitter:url"
					content="https://idpplg.vercel.app/"
				/>
				<meta
					property="twitter:title"
					content="IDPPLG (ID Picture Print Layout Generator) Tool - by Andrei Trinidad"
				/>
				<meta
					property="twitter:description"
					content="Create ID picture print layouts by simply copying and pasting your image."
				/>
				<meta
					property="twitter:image"
					content="https://og-image.vercel.app/ID%20Picture%20Print%20Layout%20Generator%20Tool%20by%20%40andreitrinidad.png?theme=dark&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-white-logo.svg&images=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fremojansen%2Flogo.ts%40master%2Fts.svg"
				/>
			</Head>
			<AppHeader setTheme={setTheme} />

			<section className="flex flex-1 p-8 gap-10 bg-base-100 overflow-scroll">
				<LayoutSelector
					selectedLayout={selectedLayout}
					setSelectedLayout={setSelectedLayout}
				/>
				<div className="flex-1 max-w-xl min-w-[500px]">
					<h2 className="text-lg font-semibold mb-4">
						<span className="text-secondary font-bold">01</span>{' '}
						Choose your image
					</h2>
					{/* Controls */}

					{imgSrc !== '' ? (
						<button
							className="btn btn-primary btn-error btn-outline w-full mb-4 gap-2"
							onClick={removeImage}
						>
							<Icon.Trash />
							change image
						</button>
					) : (
						<UploadWidget
							onSelectFile={onSelectFile}
							onPasteClick={pasteFromClipboard}
						/>
					)}

					{renderControls()}
				</div>
				<div className="flex-1">
					<h2 className="text-lg font-semibold mb-4">
						<span className="text-secondary font-bold">02</span>{' '}
						Preview and Save
					</h2>
					<div className="flex gap-4 mb-4 flex-wrap">
						<button
							className="btn btn-primary gap-2"
							onClick={downloadResult}
						>
							Download .png
							<Icon.Download />
						</button>
						<button
							className="btn btn-primary gap-2"
							onClick={copyToClipboard}
						>
							Copy to Clipboard
							<Icon.Copy />
						</button>
						<div className="w-full text-xs">
							Use <kbd className="kbd kbd-xs">CTRL</kbd> +{' '}
							<kbd className="kbd kbd-xs">S</kbd> to download or{' '}
							<kbd className="kbd kbd-xs">CTRL</kbd> +{' '}
							<kbd className="kbd kbd-xs">C</kbd> to copy result
							to clipboard
						</div>
					</div>

					{/* PREVIEW */}
					<div className="inline-flex">
						<div className="flex flex-col">
							<div className="divider">{getTotalWidth()} in</div>
							<LayoutPreview
								imagePreviewSrc={imagePreviewSrc}
								bgColor={bgColor}
								borderColor={borderColor}
								ppi={100}
								selectedLayout={selectedLayout}
							/>
						</div>
						<div className="divider divider-horizontal border-base-content pt-12">
							<span className="[writing-mode:vertical-lr] rotate-180">
								{getTotalHeight()} in
							</span>
						</div>
					</div>
					{/* ACTUAL SIZE - HIDDEN */}
					<div className="absolute -z-10 top-0 left-0 h-2 w-2 overflow-hidden ">
						<LayoutPreview
							ref={previewRef}
							imagePreviewSrc={imagePreviewSrc}
							borderColor={borderColor}
							bgColor={bgColor}
							ppi={pixelDensityDL}
							selectedLayout={selectedLayout}
						/>
					</div>
					<div className="flex gap-2 items-center my-4">
						<label htmlFor="">Customize:</label>
						<a className="btn btn-accent btn-sm group relative no-animation">
							BG COLOR
							<div className="hidden flex-col gap-3 absolute bottom-full bg-neutral text-neutral-content shadow-xl p-4 rounded-2xl group-hover:flex">
								<p>Pick Color</p>
								<HexColorPicker
									color={bgColor}
									onChange={(color: string) =>
										setBgColor(color)
									}
								/>
								<p>{bgColor}</p>
							</div>
						</a>
						<a className="btn btn-accent btn-sm group relative no-animation">
							BORDER COLOR
							<div className="hidden flex-col gap-3 absolute bottom-full bg-neutral text-neutral-content shadow-xl p-4 rounded-2xl group-hover:flex">
								<p>Pick Color</p>
								<HexColorPicker
									color={borderColor}
									onChange={(color: string) =>
										setBorderColor(color)
									}
								/>
								<p>{bgColor}</p>
							</div>
						</a>
					</div>
					<div className="flex gap-2 items-center mb-2">
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
						<label
							htmlFor=""
							className="uppercase font-bold text-sm"
						>
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
					</div>
				</div>
        <div className="flex-1 max-w-[300px] min-w-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              <span className="text-secondary font-bold">03</span>{' '}
              Customize
            </h2>
            <button className="btn btn-xs btn-ghost" onClick={() => {
              setData({
                brightness: 100,
                contrast: 100
              })
            }}>RESET</button>
          </div>
			
					<div className="">
            <label className="block uppercase font-bold text-sm mb-4">
              Brightness: <span className="badge badge-primary badge-outline">{data?.brightness}%</span>
              <input type="range" min="-100" max="200" value={data?.brightness} className="range range-lg mt-2" onChange={(e) => {
                setData((prevState: any) => {
                  const newData = {...prevState};
                  newData.brightness = e.target.value
                  return newData;
                })
              }} />
            </label>
            <label className="block uppercase font-bold text-sm">
              Contrast: <span className="badge badge-primary badge-outline">{data?.contrast}%</span>
              <input type="range" min="-100" max="200" value={data?.contrast} className="range range-lg mt-2" onChange={(e) => {
                setData((prevState: any) => {
                  const newData = {...prevState};
                  newData.contrast = e.target.value
                  return newData;
                })
              }} />
            </label>
            
					</div>

				
				</div>
			</section>
			{/* modals */}
			{confirmModal && (
				<FocusTrap>
					<div className={classNames('modal modal-open')}>
						<div className="modal-box">
							<h3 className="font-bold text-lg">
								Confirm replace image
							</h3>
							<p className="py-4">
								You pressed <kbd className="kbd">CTRL</kbd> +{' '}
								<kbd className="kbd">V</kbd>. Are you sure you
								want to replace current image?
							</p>
							<div className="modal-action">
								<button
									className="btn btn-link"
									onClick={() => setConfirmModal(false)}
								>
									Cancel
								</button>
								<button
									ref={replaceBtnRef}
									className="btn btn-primary"
									onClick={(e) => {
										e.preventDefault();
										pasteFromClipboard();
									}}
								>
									Replace
								</button>
							</div>
						</div>
					</div>
				</FocusTrap>
			)}
		</div>
	);
};

export default Home;
