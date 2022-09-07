import classNames from 'classnames';
import React from 'react';
import { useImageContext } from '../contexts/ImageContext';


interface IColorButtonProps {
  color: string,
  isBorder?: boolean
}
export default function ColorButton(props: IColorButtonProps) {
	const { data, setData } = useImageContext();
  const propChange = props.isBorder ? 'borderColor' : 'bgColor';

	return (
		<button className="avatar" onClick={() => {
      setData((prevState: any) => {
        const newData = { ...prevState };
        newData[propChange] = props.color;
        return newData;
      });
    }}>
			<div
				className={
          classNames(
            "w-8 rounded-full border-[3px] border-white  shadow-neutral hover:scale-90 transition-transform",
            (data && props.color == data[propChange]) ? '-translate-y-2 shadow-xl' : 'shadow-md'

          )
        }
				style={{
					backgroundColor: `${props.color}`,
				}}
			></div>
		</button>
	);
}
