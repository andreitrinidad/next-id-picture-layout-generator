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
import exportAsImage, { copyImage, printImage } from '../utils/exportAsImage';
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
import { useRouter } from 'next/router';
import useImageDimensions from '../hooks/useImageDimensions';
import Adjustments from '../components/Adjustments';

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
	const router = useRouter();
	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const [scale, setScale] = useState(1);
	const [rotate, setRotate] = useState(0);
	const [aspect, setAspect] = useState<number | undefined>(1 / 1);
	const [pixelDensityCopy, setPixelDensityCopy] = useState(220);
	const [pixelDensityDL, setPixelDensityDL] = useState(220);
	const previewRef = useRef<HTMLDivElement>(null);
	const replaceBtnRef = useRef<HTMLButtonElement>(null);
	const [theme, setTheme] = useState('lofi');
	const [confirmModal, setConfirmModal] = useState(false);
	// const [selectedLayout, setSelectedLayout] = useState(layouts[0].name);
	// image modifcation related states
  const { height, width } = useImageDimensions();
	const { data, setData } = useImageContext();
	// const { imagePreviewSrc = '' } = data;
	const imagePreviewSrc = data?.imagePreviewSrc;
	const selectedLayout = data?.selectedLayout;
	const bgColor = data?.bgColor;
	const borderColor = data?.borderColor;

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
			setData((prevState: any) => {
				const newData = { ...prevState };
				newData.imagePreviewSrc = imgUrl;
				return newData;
			});
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

	function printPreview() {
		printImage(previewRef.current, pixelDensityCopy, () => {
			toast.info('Generating print preview');
      router.push('/print');
		});
	}

	function downloadResult() {
		exportAsImage(previewRef.current, 'image', pixelDensityDL, () =>
			toast.success('Image downloaded!')
		);
	}

  let savedTheme = 'lofi';
  
	useEffect(() => {
    // savedTheme = 
    // setTheme(savedTheme);
    
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

  // state dependent variable
	const activeLayoutIndex =
		layouts.findIndex((x) => x.name == selectedLayout) || 0;

	useEffect(() => {
		if (selectedLayout === '') {
      
      setData((prevState: any) => {
        const newData = { ...prevState };
        newData.selectedLayout = layouts[0].name || '';
        return newData;
      });
      return;
    
    };

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
		// setImagePreviewSrc('');
		setData((prevState: any) => {
			const newData = { ...prevState };
			newData.imagePreviewSrc = '';
			return newData;
		});
	}




	return (
		<div className="flex flex-col bg-base-100 h-screen" data-theme={data?.theme || 'lofi'}>
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
					IDPPLG (ID Picture Print Layout Generator) Tool - by Andrei
					Trinidad
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
			<AppHeader print={printPreview} />

			<section className="flex flex-1 p-8 gap-10 bg-base-100 overflow-scroll">
				<LayoutSelector />
				<div className="flex-1 max-w-xl min-w-[500px]">
					<h2 className="text-lg font-semibold mb-4">
						<span className="text-primary font-bold">01</span>{' '}
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
						<span className="text-primary font-bold">02</span>{' '}
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
							<div className="divider">{width} in</div>
							<LayoutPreview
								imagePreviewSrc={imagePreviewSrc}
								bgColor={data?.bgColor}
								borderColor={data?.borderColor}
								ppi={100}
								selectedLayout={selectedLayout}
							/>
						</div>
						<div className="divider divider-horizontal border-base-content pt-12">
							<span className="[writing-mode:vertical-lr] rotate-180">
								{height} in
							</span>
						</div>
					</div>
					{/* ACTUAL SIZE - HIDDEN */}
					<div className="absolute -z-10 top-0 left-0 h-2 w-2 overflow-hidden ">
						<LayoutPreview
							ref={previewRef}
							imagePreviewSrc={data?.imagePreviewSrc}
							borderColor={data?.borderColor}
							bgColor={data?.bgColor}
							ppi={220}
							selectedLayout={selectedLayout}
						/>
					</div>
				
				
				</div>
        <Adjustments/>
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
