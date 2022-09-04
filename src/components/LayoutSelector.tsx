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
		<div className="border-r-2 min-w-[300px]">
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
