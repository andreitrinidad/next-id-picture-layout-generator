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
import Meta from '../components/Meta';
import axios from 'axios';

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
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	const reactCropRef = useRef(null);
	const router = useRouter();
	const apiRef = useRef<HTMLInputElement>(null);
	const [pixelDensityCopy, setPixelDensityCopy] = useState(220);
	const [pixelDensityDL, setPixelDensityDL] = useState(220);
	const [loading, setLoading] = useState(false);
	const [removeBGAPI, setRemoveBGAPI] = useState(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const replaceBtnRef = useRef<HTMLButtonElement>(null);
	const [confirmModal, setConfirmModal] = useState(false);
	const { height, width } = useImageDimensions();
	const { data, setData } = useImageContext();
	const imagePreviewSrc = data?.imagePreviewSrc;
	const selectedLayout = data?.selectedLayout;
	const imgSrc = data?.imgSrc;
	const crop = data?.crop;
	const completedCrop = data?.completedCrop;
	const scale = data?.scale;
	const rotate = data?.rotate;
	const aspect = data?.aspect;
	const api = data?.api;

	function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length > 0) {
			// Makes crop preview update between images.
			setData((prevState: any) => {
				const newData = { ...prevState };
				newData.crop = undefined;
				return newData;
			});
			const reader = new FileReader();
			reader.addEventListener('load', () =>
				setData((prevState: any) => {
					const newData = { ...prevState };
					newData.imgSrc = reader?.result?.toString() || '';
					return newData;
				})
			);
			reader.readAsDataURL(e.target.files[0]);
		}
	}

	function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
		if (aspect) {
			const { width, height } = e.currentTarget;
			setData((prevState: any) => {
				const newData = { ...prevState };
				newData.crop = centerAspectCrop(width, height, aspect);
				return newData;
			});
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
				const src = URL.createObjectURL(blob);
				setData((prevState: any) => {
					const newData = { ...prevState };
					newData.imgSrc = `${src}`;
					newData.crop = undefined;
					return newData;
				});
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
			setData((prevState: any) => {
				const newData = { ...prevState };
				newData.aspect = undefined;
				return newData;
			});
		} else if (imgRef.current) {
			const { width, height } = imgRef.current;
			const activeLayoutIndex =
				layouts.findIndex((x) => x.name == selectedLayout) || 0;
			const h = layouts[activeLayoutIndex].aspectRatio[0];
			const w = layouts[activeLayoutIndex].aspectRatio[1];
			setData((prevState: any) => {
				const newData = { ...prevState };
				newData.aspect = h / w;
				newData.crop = centerAspectCrop(width, height, 1 / 1);
				return newData;
			});
			// generatePreviewImage()
		}
	}

	function handleToggleAspectClick() {
		setCropAndAspect();
	}

	function setApiLink() {
		const apiLink = apiRef.current as any;
		localStorage.setItem('bg-remove-api', apiLink.value);
		setData((prevState: any) => {
			const newData = { ...prevState };
			newData.api = apiLink.value;
			return newData;
		});
    toast.success('BG Remover link now set.');
    router.back();
	}

	const renderControls = () => {
		if (!imgSrc) return null;
		return (
			<>
				{/* Image and Rotate slider */}
				{Boolean(imgSrc) && (
					<div className="flex flex-col items-center">
						<div className="relative border-accent border-2 bg-checkered mb-4">
              {
                loading && (
                  <div className="absolute inset-0 bg-primary/70 z-10 flex items-center justify-center">
        
                  <h1 className='text-primary-content text-xl text-center'>    <Icon.Loader size={60} className='animate-spin mx-auto'/> <br /> Removing background... Please wait</h1>
                </div>
                )
              }
        
							{/* update: {forceUpdate} */}
							<ReactCrop
								// key={forceUpdate}
								ref={reactCropRef}
								crop={crop}
								onChange={(_, percentCrop) => {
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.crop = percentCrop;
										return newData;
									});
								}}
								onComplete={(c) => {
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.completedCrop = c;
										return newData;
									});
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
						<div className="btn-group w-full">
							<button
								className="btn btn-primary flex-1 mb-4 gap-2"
								onClick={removeBG}
								disabled={loading || api === ''}
							>
								<Icon.Zap />
								{loading
									? 'Removing Background...'
									: 'Remove Background'}
							</button>

							<a
								className="btn btn-primary mb-4 gap-2 border-l-white"
								// onClick={removeBG}
								// disabled={loading}
								href="#api-modal"
							>
								<Icon.Settings size={15} />
							</a>
						</div>
						<div className="modal" id="api-modal">
							<div className="modal-box">
								<h3 className="font-bold text-lg">
									BG Remover API settings
								</h3>
								<p className="py-4">
									Input the link to the API
								</p>
								<input
									type="text"
									placeholder="https://"
									defaultValue={api}
									ref={apiRef}
									className="input input-bordered w-full "
								/>
								<div className="modal-action">
									<a
										className="btn btn-link btn-warning"
										href="#"
									>
										Cancel
									</a>
									<button
										onClick={setApiLink}
										className="btn"
									>
										SET API LINK
									</button>
								</div>
							</div>
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
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.rotate = Math.min(
											180,
											Math.max(
												-180,
												Number(e.target.value)
											)
										);
										return newData;
									})
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
								onClick={() => {
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.scale = newData.scale - 0.1;
										return newData;
									});
								}}
							>
								<Icon.Minus size={18} />
							</button>
							<input
								// type="text"
								placeholder="0"
								className="input input-bordered border-2 w-20 input-sm"
								type="number"
								step="0.1"
								value={scale ? Math.round(scale * 10) / 10 : 1}
								// disabled
								onChange={(e) =>
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.scale = Number(e.target.value);
										return newData;
									})
								}
							/>
							<button
								className="btn btn-square btn-sm"
								onClick={() => {
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.scale = newData.scale + 0.1;
										return newData;
									});
								}}
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
								onClick={() => {
									// setRotate(rotate - 90)
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.rotate = newData.rotate - 90;
										return newData;
									});
								}}
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
								onChange={(e) => {
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.rotate = e.target.value;
										return newData;
									});
								}}
							/>
							<button
								className="btn btn-square btn-sm"
								onClick={() => {
									setData((prevState: any) => {
										const newData = { ...prevState };
										newData.rotate = newData.rotate + 90;
										return newData;
									});
								}}
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

	function saveImageLocally() {
		printImage(previewRef.current, height, width, () => {
			toast.info('Saved to images stash');
		});
	}

	function print() {
		printImage(
			previewRef.current,
			height,
			width,
			() => {
				toast.info('Generating print preview');
				router.push('/print');
			},
			true
		);
	}

	function downloadResult() {
		exportAsImage(previewRef.current, 'image', pixelDensityDL, () =>
			toast.success('Image downloaded!')
		);
	}

	async function removeBG() {
		setLoading(true);

		const blob = await fetch(imgSrc || '').then((res) => res.blob());
		const formData = new FormData();
		formData.append('image', blob);
		formData.append('alpha_matting_background', '0');
		formData.append('alpha_matting_foreground', '15');
		formData.append('method', 'u2net_human_seg');

		try {
			const res = await axios.post(
				api || '',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			console.log('res.data', res.data);
			setData((prevState: any) => {
				const newData = { ...prevState };
				// newData.imagePreviewSrc = 'data:image/png;base64,' + res.data.result;
				newData.imgSrc = 'data:image/png;base64,' + res.data.result;
				newData.crop = undefined;
				return newData;
			});
			toast.success('Background removed!');
		} catch (error) {
			toast.error('Something went wrong. Cannot reach BG Remover server');

			console.log('error :>> ', error);
		} finally {
			setLoading(false);
		}
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

	useEffect(() => {
		const theme = localStorage.getItem('bg-remove-api');
		// if (typeof window !== 'undefined') {

		if (!!theme) {
			setData((prevState: any) => {
				const newData = { ...prevState };
				newData.api = theme;
				return newData;
			});
		}

		// }
	}, [setData]);

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
		}

		// changes the aspect ratio I guess
		const h = layouts[activeLayoutIndex].aspectRatio[0];
		const w = layouts[activeLayoutIndex].aspectRatio[1];
		if (imgRef.current) {
			setData((prevState: any) => {
				const newData = { ...prevState };
				// newData.crop = undefined;
				// newData.aspect = h / w;
				if (h / w !== prevState.aspect) {
					newData.aspect = h / w;
					newData.crop = undefined;
					newData.imagePreviewSrc = '';
					newData.imgSrc = '';
				}
				return newData;
			});
			const _imgSrc = imgSrc;
			// if ((h / w) !== prevState.aspect) {
			//   removeImage();

			// }
			window.setTimeout(() => {
				setData((prevState: any) => {
					const newData = { ...prevState };
					newData.imgSrc = _imgSrc;
					return newData;
				});
			}, 100);
		} else {
			setData((prevState: any) => {
				const newData = { ...prevState };
				newData.aspect = h / w;
				return newData;
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeLayoutIndex, selectedLayout]);

	function removeImage() {
		setData((prevState: any) => {
			const newData = { ...prevState };
			newData.imagePreviewSrc = '';
			newData.imgSrc = '';
			return newData;
		});
	}

	return (
		<div
			className="flex flex-col bg-base-100 h-screen"
			data-theme={data?.theme || 'lofi'}
		>
			<ToastContainer
				hideProgressBar
				theme="dark"
				autoClose={1500}
				position="bottom-right"
			/>
			<Meta />
			<AppHeader print={print} />
 

			<section className="relative flex flex-1 p-8 gap-10 bg-base-100 overflow-auto">
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
				<div className="flex-1 min-w-[450px] flex flex-col">
					<h2 className="text-lg font-semibold mb-4">
						<span className="text-primary font-bold">02</span>{' '}
						Preview and Save
					</h2>

					<button
						className="btn btn-primary gap-2 w-[415px]"
						onClick={saveImageLocally}
					>
						Save to stash
						<Icon.Save />
					</button>
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

					<div className="flex gap-4 mt-4 flex-wrap">
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
				<Adjustments />
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
