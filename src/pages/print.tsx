import type { NextPage } from 'next';
import * as Icon from 'react-feather';
import Link from 'next/link';
import { useImageContext } from '../contexts/ImageContext';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import useImageDimensions from '../hooks/useImageDimensions';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrintPreview: NextPage = () => {
	const { data } = useImageContext();
	const printRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
  const [images, setImages] = useState<{ height: number, width: number, printLayout: string, dateAdded: string}[]>([]);
  const [printImages, setPrintImages] = useState<{ height: number, width: number, printLayout: string, dateAdded: string}[]>([]);
  const [tempImage, setTempImage] = useState<{ height: number, width: number, printLayout: string, dateAdded: string}>();
	const { height: _height, width: _width } = useImageDimensions();
	const [paperSize, setPaperSize] = useState<{ height: number | string, width: number | string, margin: number, isLandscape: boolean}>();
	const ppi = 220;

  // @TODO Update this one
	let height = paperSize && paperSize.isLandscape ? _width : _height;
	let width = paperSize && paperSize.isLandscape ? _height : _width;

	const handlePrint = useReactToPrint({
		content: () => printRef.current,
		pageStyle: `
    @page {
      size: ${paperSize && paperSize.width}in ${paperSize && paperSize.height}in;
      margin: 0;
    }
    `,
		onAfterPrint() {
			router.back();
		},
	});

  // let images: { height: number, width: number, printLayout: string}[] = [];
  const addToPrintArea = (index: number) => {
    setPrintImages(
      (prevState: any) => {
        const newState = [...prevState];
        newState.push(images[index])
        return newState;
      }
    )
  }

  const removeFromPrintArea = (index: number) => {
    setPrintImages((prevState: any) => {
      const newState = [...prevState];
      newState.splice(index, 1);
      return newState;
    });
  }

  const removeImage = (index: number) => {
 
    if (confirm("Do you want to delete this image in stash?") == true) {
      const prevState = [...images];
      prevState.splice(index, 1);
      setImages(prevState);
      localStorage.setItem('images', JSON.stringify(prevState));
      toast.success('Image removed from stash!')
  } 
  


  }

  const removeTemp = () => {
    setTempImage(undefined);
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && paperSize !== undefined) {
      localStorage.setItem('print-settings', JSON.stringify(paperSize));
    }
  }, [paperSize])
  

	useEffect(() => {
    if (typeof window !== 'undefined') {
      const localImages = localStorage.getItem('images') || '[]';
      const tempImage = localStorage.getItem('tempImage') || '';
      const images = JSON.parse(localImages);
      const printSettings = localStorage.getItem('print-settings') || '';

      if (printSettings) {
        setPaperSize(JSON.parse(printSettings));
      }
      else {
        setPaperSize({
          height: 7,
          width: 5,
          margin: 0.12,
          isLandscape: false,
        })
      }
      setImages(images);

      if (tempImage) {

        setTempImage(JSON.parse(tempImage));
      }
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

  const isClipped = paperSize && paperSize.width < width || paperSize && paperSize.height < height; 

	return (
		<div
			data-theme={data?.theme || 'lofi'}
			className="flex flex-col h-screen max-h-screen"
		>
      		<ToastContainer
				hideProgressBar
				theme="dark"
				autoClose={1500}
				position="bottom-right"
			/>
      {
        isClipped && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 w-[500px] alert alert-warning shadow-lg">
          <div>
            <Icon.AlertTriangle/>
            <span>Clipping may occur. Check your paper size height and width</span>
          </div>
          {/* <div className="flex-none">
      <button className="btn btn-sm btn-ghost">Deny</button>
      <button className="btn btn-sm btn-primary" disabled>Auto-fix</button>
    </div> */}
        </div>
        )
      }
        


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

			<main className="flex h-full relative">

        {/* stashes */}
        <div className='flex flex-col bg-base-200 h-full'>
          <div className="flex justify-between items-center p-8 pb-0">
						<h2 className="text-lg font-semibold">
							{/* <span className="text-primary font-bold">03</span>{' '} */}
							Stash
						</h2>
					</div>
     
          <div className='flex-1 flex flex-col-reverse gap-4 overflow-auto px-6 pt-4'>
 
          {
            images.length > 0 && images.map(({printLayout, height, width}, i) => {
              return (
                <div key={i} className=" group p-2 relative shadow-lg shadow-black/80 first-of-type:mb-auto" style={{
                  height: `${height * 30}px`,
                  width: `${width * 30}px`,
                }}>
                  <div className="hidden absolute inset-0  items-center justify-center group-hover:flex bg-primary/30 text-primary-content z-10">
                    <button onClick={() => addToPrintArea(i)}>
                    <Icon.PlusCircle size={40}/>
                    </button>

                    <button className='absolute -top-2 -right-2 btn btn-circle btn-sm btn-warning' onClick={() => removeImage(i)}>
                    <Icon.Trash size={15}/>
                    </button>

                  </div>
                  <Image src={printLayout} layout='responsive' height={height} width={width} alt={`${i}`}/>
                </div>
              )
            })
          }

          {
            images.length <= 0 && (
              <>
              <p className='px-2 mb-auto'>No saved images</p>
              </>
            )
          }
          <button className='btn btn-primary gap-2' onClick={() => router.back()}>Add new <Icon.Plus/></button>
          </div>
     
          
        </div>
				{/* preview */}
				<div className="flex flex-1 flex-col justify-start items-center p-8 pb-24 bg-base-200 overflow-auto">
					<span className="badge badge-lg px-4 badge-neutral mb-4">
						Paper Size: {paperSize && paperSize.width} x {paperSize && paperSize.height}
					</span>
					{/* <span className="badge badge-lg badge-neutral mb-4">
						Image Size: {width} x {height}
					</span> */}
					<div
						ref={printRef}
						style={{
              height: `${paperSize && paperSize.height}in`,
              minHeight: `${paperSize && paperSize.height}in`,
							width: `${paperSize && paperSize.width}in`,
              padding: `${paperSize && paperSize.margin}in`,
						}}
            className=" bg-white overflow-hidden shadow-[0px_10px_60px_-15px_rgba(0,0,0,0.3)] print:bg-white print:shadow-none"
					>

            {
              tempImage && (
                <div
                style={{
                  height: `${tempImage.height}in`,
                  width: `${tempImage.width}in`,
              
                }}
                className="relative group inline-block"
              >
                <div className="group-hover:flex hidden absolute inset-0 bg-secondary/50 z-10">

                <button className='absolute -top-2 -right-2 btn btn-circle btn-sm btn-warning' onClick={() => removeTemp()}>
                    <Icon.X size={15}/>
                    </button>

                </div>
                <Image
                    className={classNames(
                      paperSize && paperSize.isLandscape && 'rotate-90'
                    )}
                    layout="fill"
                    src={tempImage.printLayout}
                    alt="tae"
                  />
              </div>
              )
            }
            {
              printImages.length > 0 && printImages.map((image, i) => {
                return (
                  <div
                   key={i}
                  style={{
                    height: `${image.height}in`,
                    width: `${image.width}in`,
                  }}
                  className="relative group inline-block leading-none"
                >
                  <div className="group-hover:flex hidden absolute inset-0 bg-secondary/50 z-10">
  
                  <button className='absolute -top-2 -right-2 btn btn-circle btn-sm btn-warning' onClick={() => removeFromPrintArea(i)}>
                      <Icon.X size={15}/>
                      </button>
  
                  </div>
                  <Image
                    className={classNames(
                      paperSize && paperSize.isLandscape && 'rotate-90'
                    )}
                    layout="fill"
                    src={image.printLayout}
                    alt="tae"
                  />
                </div>
                )
              })
            }
				
					</div>
				</div>

        {/* sidebar */}
				<div className="max-w-[300px] min-w-[300px] p-8 bg-base-100">
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
							value={paperSize && paperSize.width}
							onChange={(e) => {
								let value = Number(e.target.value);
								setPaperSize((prevState: any) => {
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
							value={paperSize &&paperSize.height}
							onChange={(e) => {
								let value = Number(e.target.value);
								setPaperSize((prevState : any) => {
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
							value={paperSize && paperSize.margin}
							onChange={(e) => {
								let value = Number(e.target.value);
								setPaperSize((prevState: any) => {
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
								setPaperSize((prevState: any) => {
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
								setPaperSize((prevState: any) => {
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
								setPaperSize((prevState: any) => {
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
