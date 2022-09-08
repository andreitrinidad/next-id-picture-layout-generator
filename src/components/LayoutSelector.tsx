import classNames from 'classnames';
import React from 'react';
import * as Icon from 'react-feather';
import { useImageContext } from '../contexts/ImageContext';
import layouts from '../layouts';



export const LayoutSelector: React.FC = () => {
	// const { selectedLayout, setSelectedLayout } = props;
	const { data, setData } = useImageContext();

  function setSelectedLayout(layout: string) {
    setData((prevState: any) => {
      const newData = {...prevState};
      newData.selectedLayout = layout
      return newData;
    });
  }


	return (
		<div className="
    group
      border-r-2 min-w-[300px] p-6
      h-full bg-base-100 z-10 shadow-md
      hover:translate-x-0
      hover:shadow-2xl hover:shadow-black
      fixed top-[64px] left-0 -translate-x-[290px] 
      xl:relative xl:p-0 xl:top-0 xl:h-full
      xl:translate-x-0 xl:shadow-none xl:hover:shadow-none
      transition-all ease-in-out
    ">
			
    <div className="xl:hidden tabs font-semibold absolute rotate-90 right-[-125px] top-1/3">
      <a className="tab tab-active flex gap-2 tab-lifted bg-base-100 tab-lg">
        <div className="rotate-0 group-hover:rotate-180 transition-transform duration-500 delay-200">

        <Icon.ChevronUp size={20}/>
        </div>
        00 Select Layout</a> 
        {/* <Icon.ChevronUp className='mr-2' size={20}/> */}
    </div>
      <h2 className="text-lg font-semibold mb-4">
				<span className="text-primary font-bold">00</span> Select
				Layout
			</h2>
			<ul className="menu">
				{Object.values(layouts).map((layout, i) => {
					const active = layout.name == data?.selectedLayout;

					return (
						<li key={i}>
							<a
								className={classNames({ 'bg-secondary text-secondary-content': active }, 'flex flex-col items-start gap-0')}
								onClick={() => setSelectedLayout(layout.name)}
							>
                <div className='leading-0 font-bold'>{layout.name}</div>
                <span className='text-xs leading-0'>{layout.description}</span>
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
