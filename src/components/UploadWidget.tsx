import { useState, DragEvent } from 'react';
import * as Icon from 'react-feather';

interface IUploadWidgetProps {
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasteClick: () => void
}

export const UploadWidget: React.FC<IUploadWidgetProps> = ({onSelectFile, onPasteClick}) => {
  const [draggingOver, setDraggingOver] = useState(false);
	return (
    <>
		<div className="upload-control mb-4">
			<label className="relative flex justify-center w-full h-32 px-4 transition bg-base-200 border-2 border-accent border-dashed rounded-md appearance-none cursor-pointer hover:border-accent-focus hover:border-4 focus:outline-none">
				<span className="flex items-center space-x-2">
					<Icon.Upload />
					<span className="font-medium">
						Drop files to Attach or
						<a className="ml-2 btn btn-sm">browse</a>
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
					className="absolute inset-0 border-2 opacity-0 cursor-pointer"
				/>
			</label>
      <div className="divider">or simply</div>
      <button className="btn btn-secondary w-full gap-2 relative"
      onClick={onPasteClick}
    >
       <Icon.Clipboard />
       Paste from clipboard
    </button>
      <div className='mt-3 text-xs text-right'>
          You can also use <kbd className="kbd kbd-xs">CTRL</kbd> + <kbd className="kbd kbd-xs">V</kbd> to paste from clipboard
      </div>
      {/* <input
					type="file"
					accept="image/*"
					onChange={onSelectFile}
					name="upload-file"
					// className="absolute inset-0 border-2 opacity-0 cursor-pointer"
				/> */}
		</div>
 
    </>
	);
};
