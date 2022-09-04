import type { NextPage } from 'next';
import * as Icon from 'react-feather';
import Link from 'next/link';
import LayoutPreview from '../components/LayoutPreview';
import { useImageContext } from '../contexts/ImageContext';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Image from 'next/image';

const PrintPreview: NextPage = () => {
  const { data, setData } = useImageContext();
  const printRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string>();
  const [theme, setTheme] = useState('');
  // const { imagePreviewSrc = '' } = data;
  const imagePreviewSrc = data?.imagePreviewSrc;
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  useEffect(() => {
    const image = localStorage.getItem('image');
    setImage(image || '');

    const savedTheme = localStorage.getItem('theme') || 'lofi';
    setTheme(savedTheme);
  }, [])
  
  

	return (
		<div data-theme={theme} className="flex flex-col bg-base-100" >
			<header className="flex bg-primary px-8 items-center justify-between gap-6">
         <Link href="/">
						<a className="btn btn-circle">
							<Icon.ArrowLeft />
						</a>
					</Link>
				<h1 className="text-primary-content text-2xl font-bold flex-1">
					Print Preview
				</h1>
				{/* header */}
				<div className="flex items-center gap-2">
						<button className="btn btn-secondary btn-lg gap-2" onClick={handlePrint}>
							<Icon.Printer />
							Print
						</button>
				</div>
			</header>
      <div ref={printRef} className='w-[1100px] h-[1540px] bg-white print:bg-black'>
        <div className=''>
          <img src={image}/>
        </div>
      </div>

		</div>
	);
};

export default PrintPreview;
