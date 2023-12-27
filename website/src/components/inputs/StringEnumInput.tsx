import { useState } from 'react'

interface Props {
  variable: string;
  choices: string[];
  value: string;
  setValue: (v: string) => void;
}

export default function StringEnumInput({ variable, choices, value, setValue }: Props) {
  return (
    <select
      name={variable}
      id={variable}
      onChange={(e) => { setValue(e.target.value); }}
      value={value}
      autoComplete="off"
      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-cyan-800 sm:max-w-xs sm:text-sm sm:leading-6 bg-white dark:bg-[#26242d]"

    >
      { choices.map((choice) => (
        <option key={choice} value={choice}>{choice}</option>
      )) }
    </select>
  );
}
