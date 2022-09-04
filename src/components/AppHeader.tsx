import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect } from 'react';
import * as Icon from 'react-feather';
import { useImageContext } from '../contexts/ImageContext';

interface IAppHeaderProps {
  print: Function;
}

export const AppHeader: React.FC<IAppHeaderProps> = ({ print }) => {

  const {data, setData} = useImageContext();

  useEffect(() => {
    function detectKeys(event: any) {
			if ((event.ctrlKey || event.metaKey) && event.keyCode == 80) {
				event.preventDefault();
				print();
			}
		}

		window.addEventListener('keydown', detectKeys);

		return () => {
			window.removeEventListener('keydown', detectKeys);
		};

  }, [])

	return (
		<header className="flex bg-primary px-8 pr-0 items-center justify-between gap-6">
			<a href="https://www.facebook.com/portalngprint" className="relative  w-[70px] self-end">
				<Image
					src="/paprintngapo.png"
					layout="responsive"
					height={504}
					width={650}
          alt="Paprint Nga Po"
				/>
			</a>
			<h1 className="text-primary-content text-xl font-semibold flex-1">
				ID Picture Print Layout Generator Tool
			</h1>
			{/* header */}
			<div className="flex items-center gap-2">
      
					<button
						className="btn btn-secondary gap-2 m-2"
            onClick={() => print()}
					>
						<Icon.FileText />
            Print Preview
					</button>
				<div className="dropdown dropdown-center dropdown-top fixed bottom-1 left-1  ">
					<label tabIndex={0} className="btn btn-sm btn-accent shadow-lg m-1 gap-2">
						<Icon.Droplet size={20} /> theme
					</label>
					<ul
						tabIndex={0}
						className="border-primary border dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 max-h-72 overflow-y-auto"
					>
						<div className="text-center py-2"> Choose a theme:</div>

						<hr />
						{themeData.map((val, i) => {
							return (
								<li
									key={i}
									onClick={() => {
										// setTheme(val);
										localStorage.setItem('theme', val);
                    setData((prevState: any) => {
                      const newData = { ...prevState };
                      newData.theme = val;
                      return newData;
                    });
									}}
								>
									<a>{val}</a>
								</li>
							);
						})}
						{/* <li><a>Item 2</a></li> */}
					</ul>
				</div>
				{/* <div
					className="tooltip tooltip-left"
					data-tip="Built with⚡by andrei 🔥. See source code on Github"
				>
					<a
						target="_blank"
						href="https://github.com/andreitrinidad/next-id-picture-layout-generator"
						className="btn btn-circle"
						rel="noreferrer"
					>
						<Icon.GitHub />
					</a>
				</div> */}
			</div>
		</header>
	);
};

const themeData = [
	'light',
	'dark',
	'cupcake',
	'bumblebee',
	'emerald',
	'corporate',
	'synthwave',
	'retro',
	'cyberpunk',
	'valentine',
	'halloween',
	'garden',
	'forest',
	'aqua',
	'lofi',
	'pastel',
	'fantasy',
	'wireframe',
	'black',
	'luxury',
	'dracula',
	'cmyk',
	'autumn',
	'business',
	'acid',
	'lemonade',
	'night',
	'coffee',
	'winter',
];
