import React from 'react';
import * as Icon from 'react-feather';

interface IAppHeaderProps {
  setTheme: Function
}

export const AppHeader: React.FC<IAppHeaderProps> = ({setTheme}) => {
  return (
    <header className="flex bg-primary h-[90px] px-8 items-center justify-between">
    <h1 className="text-primary-content text-2xl font-bold">
      ID Picture Print Layout Generator Tool
    </h1>
    {/* header */}
    <div className='flex items-center gap-2'>
      <div className="dropdown dropdown-left ">
        <label tabIndex={0} className="btn btn-accent m-1 gap-2">
          <Icon.Droplet /> theme
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 max-h-72 overflow-y-auto"
        >
          <div className="text-center py-2">
            {' '}
            Choose a theme:
          </div>

          <hr />
          {themeData.map((val, i) => {
            return (
              <li
                key={i}
                onClick={() => {
                  setTheme(val);
                  localStorage.setItem('theme', val);
                }}
              >
                <a>{val}</a>
              </li>
            );
          })}
          {/* <li><a>Item 2</a></li> */}
        </ul>
      </div>
      <div className="tooltip tooltip-left" data-tip="Built with⚡by andrei 🔥. See source code on Github">
      <a target="_blank" href="https://github.com/andreitrinidad/next-id-picture-layout-generator" className="btn btn-circle" rel="noreferrer"><Icon.GitHub/></a>
      </div>
    </div>
  </header>
  )
}


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