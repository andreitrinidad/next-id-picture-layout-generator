import type { NextPage } from 'next';
import 'react-image-crop/dist/ReactCrop.css';
import React, { useState, useRef, useEffect } from 'react';
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

const themeData = ["light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"];

const Home: NextPage = () => {
	const [imgSrc, setImgSrc] = useState('');
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const [scale, setScale] = useState(1);
	const [rotate, setRotate] = useState(0);
	const [aspect, setAspect] = useState<number | undefined>(1 / 1);
	const [imagePreviewSrc, setImagePreviewSrc] = useState('');
	const [bgColor, setBgColor] = useState('#FFF');
	const [borderColor, setBorderColor] = useState('#000');
	const [pixelDensity, setPixelDensity] = useState(220);
	const previewRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState('light')

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

	useDebounceEffect(
		async () => {
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
		},
		100,
		[completedCrop, scale, rotate]
	);

	function handleToggleAspectClick() {
		if (aspect) {
			setAspect(undefined);
		} else if (imgRef.current) {
			const { width, height } = imgRef.current;
			setAspect(1 / 1);
			setCrop(centerAspectCrop(width, height, 1 / 1));
		}
	}

	const renderControls = () => {
		if (!imgSrc) return null;
		return (
			<>
				{/* Image and Rotate slider */}
				{Boolean(imgSrc) && (
					<div className="flex flex-col items-center">
						<div className="border-accent border-2">
							<ReactCrop
								crop={crop}
								onChange={(_, percentCrop) =>
									setCrop(percentCrop)
								}
								onComplete={(c) => setCompletedCrop(c)}
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
						<span>Scale: </span>
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
								className="input input-bordered w-20 input-sm"
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
						<label>Rotate: </label>

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
								className="input input-bordered w-20 input-sm"
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
						<span className="">Toggle Aspect Ratio</span>
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

  useEffect(()=>{
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, [])

	return (
		<div className="bg-base-100 h-screen" data-theme={theme}>
      <Head>
      <title>ID Picture Print Layout Generator Tool</title>
      </Head>
			<header className="flex bg-primary  h-[90px] px-8 items-center justify-between">
				<h1 className="text-primary-content text-2xl font-bold">
					ID Picture Print Layout Generator Tool
				</h1>
        <div className="dropdown dropdown-left ">
  <label tabIndex={0} className="btn m-1 gap-2"><Icon.Droplet/> theme</label>
  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 max-h-72 overflow-y-auto">
    <div className="text-center py-2">    Choose a theme:</div>

    <hr/>
    {
      themeData.map((val, i) => {
        return (
          <li key={i} onClick={() => {
            setTheme(val);
            localStorage.setItem('theme', val);
          }}><a>{val}</a></li>
        )
      })
    }
    {/* <li><a>Item 2</a></li> */}
  </ul>
</div>
			</header>
			<section className="flex flex-1 p-8 gap-10 bg-base-100">
				<div className="flex-1 max-w-xl">
					<h2 className="text-lg font-semibold mb-4">
						<span className='text-secondary font-bold'>01</span> Choose your image
					</h2>
					{/* Controls */}

					{imgSrc ? (
						<button className="btn btn-primary btn-error btn-outline w-full mb-4 gap-2">
							<Icon.Trash />
							change image
						</button>
					) : (
						<div className="upload-control mb-4">
							<label className="flex justify-center w-full h-32 px-4 transition bg-base-200 border-2 border-accent border-dashed rounded-md appearance-none cursor-pointer hover:border-accent-focus focus:outline-none">
								<span className="flex items-center space-x-2">
									<Icon.Upload />
									<span className="font-medium">
										Drop files to Attach, or
										<a className="ml-4 btn btn-sm">
											browse
										</a>
										{/* <span className="color-base-content underline">
											browse
										</span> */}
									</span>
								</span>
								<input
									type="file"
									accept="image/*"
									onChange={onSelectFile}
									name="upload-file"
									className="hidden"
								/>
							</label>
						</div>
					)}

					{renderControls()}
				</div>
				<div className="flex-1">
					<h2 className="text-lg font-semibold mb-4">
            <span className='text-secondary font-bold'>02</span> Preview and Save
					</h2>
					<div className="flex gap-4 mb-4">
						<button
							className="btn btn-primary gap-2"
							onClick={() =>
								exportAsImage(
									previewRef.current,
									'image',
									pixelDensity
								)
							}
						>
							Download .png
							<Icon.Download />
						</button>
						<button
							className="btn btn-primary gap-2"
							onClick={() =>
								copyImage(
									previewRef.current,
									'image',
									pixelDensity
								)
							}
						>
							Copy to Clipboard
							<Icon.Clipboard />
						</button>
					</div>

					{/* PREVIEW */}
					<LayoutPreview
						imagePreviewSrc={imagePreviewSrc}
						bgColor={bgColor}
            borderColor={borderColor}
						ppi={100}
					/>

					{/* ACTUAL SIZE MOVE IT SOMEWHERE */}
					<div className="absolute -z-10 top-0 left-0 h-2 w-2 overflow-hidden ">
						<LayoutPreview
							ref={previewRef}
							imagePreviewSrc={imagePreviewSrc}
              borderColor={borderColor}
							bgColor={bgColor}
							ppi={pixelDensity}
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
					<div className="flex gap-2 items-center">
						<label htmlFor="">Pixels per inch:</label>
						<input
							type="number"
							min="96"
							max="600"
							className="input input-sm w-24"
							value={pixelDensity}
							onChange={(e) => {
								let value = Number(e.target.value);
								// if (Number(e.target.value) < 96) {
								// 	value = 96;
								// }
								// if (Number(e.target.value) > 600) {
								// 	value = 600;
								// }
								setPixelDensity(value);
							}}
							onBlur={(e) => {
								let value = Number(e.target.value);
								if (Number(e.target.value) < 96) {
									value = 96;
								}
								if (Number(e.target.value) > 600) {
									value = 600;
								}
								setPixelDensity(value);
							}}
						/>

						<div
							className="tooltip"
							data-tip="PPI or Pixels Per Inch is the density of pixels in an image. The web uses 96 PPI by default. For programs like Microsoft Word 220 PPI is the default."
						>
							<Icon.HelpCircle />
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
